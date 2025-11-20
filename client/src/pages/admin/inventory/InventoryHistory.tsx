import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SignaturePad, SignaturePadRef } from "@/components/ui/signature-pad";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, RotateCcw, Download, Calendar, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { format, differenceInDays } from "date-fns";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  internalId: string;
  departmentId: number;
}

interface EmployeeItem {
  id: number;
  employeeId: string;
  itemId: number;
  quantity: number;
  deliveryDate: Date;
  expiryDate: Date | null;
  returnDate: Date | null;
  returnReason: string | null;
  status: string;
}

interface ItemDetails {
  id: number;
  name: string;
  code: string;
}

type FilterType = "all" | "active" | "returned";

export default function InventoryHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const signaturePadRef = useRef<SignaturePadRef>(null);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [returnDialog, setReturnDialog] = useState<{ open: boolean; item: EmployeeItem | null }>({
    open: false,
    item: null,
  });
  const [returnReason, setReturnReason] = useState("");

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSupervisor = user?.role === 'supervisor';

  if (!isAdmin && !isSupervisor) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar title="Histórico de EPIs" />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <Card>
              <CardHeader>
                <CardTitle>Acesso Negado</CardTitle>
                <CardDescription>
                  Apenas administradores e supervisores podem acessar esta página.
                </CardDescription>
              </CardHeader>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const { data: allEmployees = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter employees by department for supervisors
  const employees = isSupervisor && user?.departmentId
    ? allEmployees.filter(emp => emp.departmentId === user.departmentId)
    : allEmployees;

  // Filter employees by search term
  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (emp.firstName?.toLowerCase() ?? '').includes(searchLower) ||
      (emp.lastName?.toLowerCase() ?? '').includes(searchLower) ||
      (emp.internalId?.toLowerCase() ?? '').includes(searchLower)
    );
  });

  // Auto-select when only one result
  useEffect(() => {
    if (filteredEmployees.length === 1 && searchTerm) {
      setSelectedEmployeeId(filteredEmployees[0].id);
    }
  }, [filteredEmployees, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-testid="input-search-employee"]') && 
          !target.closest('.absolute.z-50')) {
        setComboboxOpen(false);
      }
    };

    if (comboboxOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [comboboxOpen]);

  const { data: employeeItems = [], isLoading } = useQuery<EmployeeItem[]>({
    queryKey: ["/api/inventory/employee-items", selectedEmployeeId],
    enabled: !!selectedEmployeeId,
  });

  const { data: items = [] } = useQuery<ItemDetails[]>({
    queryKey: ["/api/inventory/items"],
  });

  const returnMutation = useMutation({
    mutationFn: async (data: { id: number; returnReason: string; signature: string }) => {
      return apiRequest(`/api/inventory/employee-items/${data.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "returned",
          returnDate: new Date().toISOString(),
          returnReason: data.returnReason,
          returnSignature: data.signature,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/employee-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/movements"] });
      toast({
        title: "Devolução registrada",
        description: "Item devolvido com sucesso!",
      });
      setReturnDialog({ open: false, item: null });
      setReturnReason("");
      signaturePadRef.current?.clear();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar devolução",
        variant: "destructive",
      });
    },
  });

  const handleReturn = () => {
    if (!returnDialog.item) return;

    if (!returnReason.trim()) {
      toast({
        title: "Erro",
        description: "Informe o motivo da devolução",
        variant: "destructive",
      });
      return;
    }

    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      toast({
        title: "Erro",
        description: "Assinatura obrigatória",
        variant: "destructive",
      });
      return;
    }

    const signature = signaturePadRef.current.toDataURL();
    returnMutation.mutate({
      id: returnDialog.item.id,
      returnReason,
      signature,
    });
  };

  const handleOpenReturnDialog = (item: EmployeeItem) => {
    setReturnDialog({ open: true, item });
    setReturnReason("");
    signaturePadRef.current?.clear();
  };

  const getItemDetails = (itemId: number) => {
    return items.find((i) => i.id === itemId);
  };

  const getStatusBadge = (item: EmployeeItem) => {
    if (item.status === "returned") {
      return <Badge variant="secondary">Devolvido</Badge>;
    }

    if (item.expiryDate) {
      const daysUntilExpiry = differenceInDays(new Date(item.expiryDate), new Date());
      
      if (daysUntilExpiry < 0) {
        return <Badge variant="destructive">Vencido</Badge>;
      }
      
      if (daysUntilExpiry <= 7) {
        return <Badge className="bg-red-600">Vence em {daysUntilExpiry} dia(s)</Badge>;
      }
      
      if (daysUntilExpiry <= 30) {
        return <Badge className="bg-yellow-600">Vence em {daysUntilExpiry} dia(s)</Badge>;
      }
    }

    return <Badge variant="success">Em uso</Badge>;
  };

  const activeItems = employeeItems.filter((item) => item.status === "active");
  const returnedItems = employeeItems.filter((item) => item.status === "returned");

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Histórico de EPIs" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Histórico de EPIs</h1>
              <p className="text-muted-foreground mt-1">
                Consulte o histórico de distribuição de EPIs por funcionário
              </p>
            </div>

            {/* Employee Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Funcionário</CardTitle>
                <CardDescription>Escolha o funcionário para visualizar o histórico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Input
                      placeholder={selectedEmployeeId 
                        ? (() => {
                            const employee = employees.find((e) => e.id === selectedEmployeeId);
                            return employee
                              ? `${employee.internalId ? `${employee.internalId} - ` : ''}${employee.firstName} ${employee.lastName}`
                              : "Selecione um funcionário ou digite para buscar";
                          })()
                        : "Selecione um funcionário ou digite para buscar"
                      }
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setComboboxOpen(true);
                      }}
                      onFocus={() => setComboboxOpen(true)}
                      data-testid="input-search-employee"
                      className="w-full"
                    />
                    {comboboxOpen && searchTerm && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredEmployees.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Nenhum funcionário encontrado
                          </div>
                        ) : (
                          <div className="py-1">
                            {filteredEmployees.map((employee) => (
                              <div
                                key={employee.id}
                                className={cn(
                                  "px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2",
                                  selectedEmployeeId === employee.id && "bg-gray-100 dark:bg-gray-700"
                                )}
                                onClick={() => {
                                  setSelectedEmployeeId(employee.id);
                                  setSearchTerm("");
                                  setComboboxOpen(false);
                                }}
                                data-testid={`employee-${employee.id}`}
                              >
                                <Check
                                  className={cn(
                                    "h-4 w-4",
                                    selectedEmployeeId === employee.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="text-sm">
                                  {employee.internalId ? `${employee.internalId} - ` : ''}{employee.firstName} {employee.lastName}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {selectedEmployeeId && (
              <>
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      activeFilter === "active" ? "ring-2 ring-green-500 shadow-md" : ""
                    }`}
                    onClick={() => setActiveFilter(activeFilter === "active" ? "all" : "active")}
                    data-testid="card-filter-active-items"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">EPIs em Uso</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600" data-testid="text-active-items">
                        {isLoading ? "..." : activeItems.length}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activeFilter === "active" ? "🔍 Mostrando EPIs em uso" : "Clique para filtrar"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      activeFilter === "returned" ? "ring-2 ring-blue-500 shadow-md" : ""
                    }`}
                    onClick={() => setActiveFilter(activeFilter === "returned" ? "all" : "returned")}
                    data-testid="card-filter-returned-items"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">EPIs Devolvidos</CardTitle>
                      <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600" data-testid="text-returned-items">
                        {isLoading ? "..." : returnedItems.length}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activeFilter === "returned" ? "🔍 Mostrando EPIs devolvidos" : "Clique para filtrar"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-total-items">
                        {isLoading ? "..." : employeeItems.length}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Histórico completo
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Items Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {activeFilter === "active" ? "EPIs em Uso" : 
                       activeFilter === "returned" ? "Histórico de Devoluções" : 
                       "Todos os EPIs"}
                    </CardTitle>
                    <CardDescription>
                      {activeFilter === "active" ? `EPIs atualmente com ${selectedEmployee?.firstName}` :
                       activeFilter === "returned" ? "EPIs já devolvidos" :
                       `Histórico completo de ${selectedEmployee?.firstName}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                    ) : (() => {
                      const displayItems = activeFilter === "all" ? employeeItems :
                                          activeFilter === "active" ? activeItems : returnedItems;
                      
                      if (displayItems.length === 0) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>
                              {activeFilter === "active" ? "Nenhum EPI em uso no momento" :
                               activeFilter === "returned" ? "Nenhum EPI devolvido" :
                               "Nenhum EPI registrado"}
                            </p>
                          </div>
                        );
                      }
                      
                      return (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Quantidade</TableHead>
                              <TableHead>Data Entrega</TableHead>
                              {activeFilter !== "active" && <TableHead>Devolução</TableHead>}
                              {activeFilter !== "active" && <TableHead>Motivo</TableHead>}
                              {activeFilter === "active" && <TableHead>Validade</TableHead>}
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {displayItems.map((item) => {
                              const itemDetails = getItemDetails(item.itemId);
                              return (
                                <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
                                  <TableCell className="font-medium">
                                    {itemDetails ? `${itemDetails.code} - ${itemDetails.name}` : `Item #${item.itemId}`}
                                  </TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>{format(new Date(item.deliveryDate), "dd/MM/yyyy")}</TableCell>
                                  {activeFilter !== "active" && (
                                    <TableCell>
                                      {item.returnDate ? format(new Date(item.returnDate), "dd/MM/yyyy") : "-"}
                                    </TableCell>
                                  )}
                                  {activeFilter !== "active" && (
                                    <TableCell>
                                      <span className="text-sm text-muted-foreground">
                                        {item.returnReason || "-"}
                                      </span>
                                    </TableCell>
                                  )}
                                  {activeFilter === "active" && (
                                    <TableCell>
                                      {item.expiryDate ? (
                                        format(new Date(item.expiryDate), "dd/MM/yyyy")
                                      ) : (
                                        <span className="text-muted-foreground">N/A</span>
                                      )}
                                    </TableCell>
                                  )}
                                  <TableCell>{getStatusBadge(item)}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      {item.status === "active" && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleOpenReturnDialog(item)}
                                          data-testid={`button-return-${item.id}`}
                                        >
                                          <RotateCcw className="mr-2 h-4 w-4" />
                                          Devolver
                                        </Button>
                                      )}
                                      <Button variant="ghost" size="sm" data-testid={`button-download-${item.id}`}>
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      );
                    })()}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Return Dialog */}
            <Dialog open={returnDialog.open} onOpenChange={(open) => setReturnDialog({ open, item: null })}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Devolução</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para registrar a devolução do EPI
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {returnDialog.item && (
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-sm text-muted-foreground">Item</Label>
                      <p className="font-semibold">
                        {getItemDetails(returnDialog.item.itemId)?.name || `Item #${returnDialog.item.itemId}`}
                      </p>
                      <p className="text-sm text-muted-foreground">Quantidade: {returnDialog.item.quantity}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Motivo da Devolução</Label>
                    <Textarea
                      placeholder="Ex: Troca por desgaste, Término do contrato, Dano ao equipamento..."
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      rows={3}
                      data-testid="textarea-return-reason"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Assinatura do Funcionário</Label>
                    <SignaturePad
                      ref={signaturePadRef}
                      placeholder="Funcionário deve assinar aqui"
                      height={150}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReturnDialog({ open: false, item: null })}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleReturn}
                    disabled={returnMutation.isPending}
                    data-testid="button-confirm-return"
                  >
                    {returnMutation.isPending ? "Processando..." : "Confirmar Devolução"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
