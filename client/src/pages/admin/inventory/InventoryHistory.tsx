import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SignaturePad, SignaturePadRef } from "@/components/ui/signature-pad";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Package, RotateCcw, Download, Calendar, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { format, differenceInDays } from "date-fns";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  internalId: string;
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

export default function InventoryHistory() {
  const { toast } = useToast();
  const signaturePadRef = useRef<SignaturePadRef>(null);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [returnDialog, setReturnDialog] = useState<{ open: boolean; item: EmployeeItem | null }>({
    open: false,
    item: null,
  });
  const [returnReason, setReturnReason] = useState("");

  const { data: employees = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/inventory">
            <Button variant="ghost" size="sm" className="mb-2">
              ← Voltar ao Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Histórico de EPIs</h1>
          <p className="text-muted-foreground mt-1">
            Consulte o histórico de distribuição de EPIs por funcionário
          </p>
        </div>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Funcionário</CardTitle>
          <CardDescription>Escolha o funcionário para visualizar o histórico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger data-testid="select-employee">
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.internalId} - {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {selectedEmployeeId && (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">EPIs em Uso</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-active-items">
                  {isLoading ? "..." : activeItems.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">EPIs Devolvidos</CardTitle>
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-returned-items">
                  {isLoading ? "..." : returnedItems.length}
                </div>
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
              </CardContent>
            </Card>
          </div>

          {/* Active Items */}
          <Card>
            <CardHeader>
              <CardTitle>EPIs em Uso</CardTitle>
              <CardDescription>
                EPIs atualmente com {selectedEmployee?.firstName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : activeItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhum EPI em uso no momento</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Data Entrega</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeItems.map((item) => {
                      const itemDetails = getItemDetails(item.itemId);
                      return (
                        <TableRow key={item.id} data-testid={`row-active-item-${item.id}`}>
                          <TableCell className="font-medium">
                            {itemDetails ? `${itemDetails.code} - ${itemDetails.name}` : `Item #${item.itemId}`}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{format(new Date(item.deliveryDate), "dd/MM/yyyy")}</TableCell>
                          <TableCell>
                            {item.expiryDate ? (
                              format(new Date(item.expiryDate), "dd/MM/yyyy")
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(item)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenReturnDialog(item)}
                                data-testid={`button-return-${item.id}`}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Devolver
                              </Button>
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
              )}
            </CardContent>
          </Card>

          {/* Returned Items */}
          {returnedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Devoluções</CardTitle>
                <CardDescription>EPIs já devolvidos</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Entrega</TableHead>
                      <TableHead>Devolução</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnedItems.map((item) => {
                      const itemDetails = getItemDetails(item.itemId);
                      return (
                        <TableRow key={item.id} data-testid={`row-returned-item-${item.id}`}>
                          <TableCell className="font-medium">
                            {itemDetails ? `${itemDetails.code} - ${itemDetails.name}` : `Item #${item.itemId}`}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{format(new Date(item.deliveryDate), "dd/MM/yyyy")}</TableCell>
                          <TableCell>
                            {item.returnDate ? format(new Date(item.returnDate), "dd/MM/yyyy") : "-"}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {item.returnReason || "-"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" data-testid={`button-download-return-${item.id}`}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
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
  );
}
