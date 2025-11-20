import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SignaturePad, SignaturePadRef } from "@/components/ui/signature-pad";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, UserCheck, Calendar, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { format, addMonths } from "date-fns";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: number;
  internalId: string;
}

interface InventoryItem {
  id: number;
  code: string;
  name: string;
  unit: string;
  hasValidity: boolean;
  validityMonths: number | null;
}

interface Category {
  id: number;
  name: string;
}

interface DistributionItem {
  itemId: number;
  itemName: string;
  quantity: number;
  expiryDate: Date | null;
}

const distributionSchema = z.object({
  employeeId: z.string().min(1, "Selecione um funcionário"),
  deliveryDate: z.string().min(1, "Data de entrega obrigatória"),
});

type DistributionFormValues = z.infer<typeof distributionSchema>;

export default function InventoryDistribution() {
  const { user } = useAuth();
  const { toast } = useToast();
  const signaturePadRef = useRef<SignaturePadRef>(null);
  
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [distributionItems, setDistributionItems] = useState<DistributionItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [employeeComboboxOpen, setEmployeeComboboxOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSupervisor = user?.role === 'supervisor';

  if (!isAdmin && !isSupervisor) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores e supervisores podem acessar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
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

  const { data: items = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/items", { isActive: true }],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/inventory/categories"],
  });

  const form = useForm<DistributionFormValues>({
    resolver: zodResolver(distributionSchema),
    defaultValues: {
      employeeId: "",
      deliveryDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const distributeMutation = useMutation({
    mutationFn: async (data: {
      employeeId: string;
      itemId: number;
      quantity: number;
      deliveryDate: string;
      expiryDate: string | null;
      signature: string;
    }) => {
      return apiRequest("/api/inventory/employee-items", {
        method: "POST",
        body: JSON.stringify({
          employeeId: data.employeeId,
          itemId: data.itemId,
          quantity: data.quantity,
          deliveryDate: data.deliveryDate,
          expiryDate: data.expiryDate,
          deliverySignature: data.signature,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/employee-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/movements"] });
    },
  });

  const handleAddItem = () => {
    if (!selectedItemId || itemQuantity <= 0) {
      toast({
        title: "Erro",
        description: "Selecione um item e quantidade válida",
        variant: "destructive",
      });
      return;
    }

    const item = items.find((i) => i.id.toString() === selectedItemId);
    if (!item) return;

    // Check if item already added
    if (distributionItems.some((di) => di.itemId === item.id)) {
      toast({
        title: "Erro",
        description: "Este item já foi adicionado à lista",
        variant: "destructive",
      });
      return;
    }

    // Calculate expiry date if item has validity
    const deliveryDate = new Date(form.getValues("deliveryDate"));
    const expiryDate = item.hasValidity && item.validityMonths
      ? addMonths(deliveryDate, item.validityMonths)
      : null;

    setDistributionItems([
      ...distributionItems,
      {
        itemId: item.id,
        itemName: `${item.code} - ${item.name}`,
        quantity: itemQuantity,
        expiryDate,
      },
    ]);

    setSelectedItemId("");
    setItemQuantity(1);
  };

  const handleRemoveItem = (itemId: number) => {
    setDistributionItems(distributionItems.filter((item) => item.itemId !== itemId));
  };

  const onSubmit = async (data: DistributionFormValues) => {
    if (distributionItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item para distribuir",
        variant: "destructive",
      });
      return;
    }

    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      toast({
        title: "Erro",
        description: "Assinatura do funcionário obrigatória",
        variant: "destructive",
      });
      return;
    }

    const signature = signaturePadRef.current.toDataURL();

    try {
      // Distribute each item
      for (const item of distributionItems) {
        await distributeMutation.mutateAsync({
          employeeId: data.employeeId,
          itemId: item.itemId,
          quantity: item.quantity,
          deliveryDate: data.deliveryDate,
          expiryDate: item.expiryDate ? format(item.expiryDate, "yyyy-MM-dd") : null,
          signature,
        });
      }

      toast({
        title: "Distribuição realizada",
        description: `${distributionItems.length} item(ns) distribuído(s) com sucesso para ${selectedEmployee?.firstName}!`,
      });

      // Reset form
      form.reset();
      setDistributionItems([]);
      setSelectedEmployee(null);
      signaturePadRef.current?.clear();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao distribuir itens",
        variant: "destructive",
      });
    }
  };

  const handleEmployeeChange = (employeeId: string, fieldOnChange?: (value: string) => void) => {
    const employee = employees.find((e) => e.id === employeeId);
    setSelectedEmployee(employee || null);
    
    // Call field.onChange to properly update react-hook-form state
    if (fieldOnChange) {
      fieldOnChange(employeeId);
    } else {
      form.setValue("employeeId", employeeId, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Distribuição de EPIs" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Distribuição de EPIs</h1>
              <p className="text-muted-foreground mt-1">
                Distribua materiais e EPIs para os funcionários
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribution Form */}
        <Card>
          <CardHeader>
            <CardTitle>Nova Distribuição</CardTitle>
            <CardDescription>Preencha os dados para distribuir EPIs</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Employee Selection */}
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Funcionário</FormLabel>
                      <Popover open={employeeComboboxOpen} onOpenChange={setEmployeeComboboxOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={employeeComboboxOpen}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="select-employee"
                            >
                              {field.value
                                ? (() => {
                                    const emp = employees.find((e) => e.id === field.value);
                                    return emp ? `${emp.internalId ? `${emp.internalId} - ` : ''}${emp.firstName} ${emp.lastName}` : "Selecione o funcionário";
                                  })()
                                : "Selecione o funcionário"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Digite o nome ou ID do funcionário..." />
                            <CommandList>
                              <CommandEmpty>Nenhum funcionário encontrado.</CommandEmpty>
                              <CommandGroup>
                                {employees.map((employee) => (
                                  <CommandItem
                                    key={employee.id}
                                    value={`${employee.internalId} ${employee.firstName} ${employee.lastName}`}
                                    onSelect={() => {
                                      handleEmployeeChange(employee.id, field.onChange);
                                      setEmployeeComboboxOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === employee.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {employee.internalId ? `${employee.internalId} - ` : ''}{employee.firstName} {employee.lastName}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Delivery Date */}
                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Entrega</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-delivery-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Add Items Section */}
                <div className="space-y-4 border-t pt-4">
                  <Label>Adicionar Itens</Label>
                  
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                    <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                      <SelectTrigger data-testid="select-item">
                        <SelectValue placeholder="Selecione o item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.code} - {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                      className="w-20"
                      placeholder="Qtd"
                      data-testid="input-quantity"
                    />

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddItem}
                      data-testid="button-add-item"
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Items List */}
                {distributionItems.length > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    <Label>Itens Selecionados</Label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Qtd</TableHead>
                          <TableHead>Validade</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {distributionItems.map((item) => (
                          <TableRow key={item.itemId} data-testid={`row-distribution-item-${item.itemId}`}>
                            <TableCell className="font-medium">{item.itemName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              {item.expiryDate ? (
                                <Badge variant="outline">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  {format(item.expiryDate, "dd/MM/yyyy")}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">Sem validade</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.itemId)}
                                data-testid={`button-remove-item-${item.itemId}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Signature */}
                <div className="space-y-2 border-t pt-4">
                  <Label>Assinatura do Funcionário</Label>
                  <FormDescription>
                    Solicite que o funcionário assine digitalmente para confirmar o recebimento
                  </FormDescription>
                  <SignaturePad
                    ref={signaturePadRef}
                    placeholder="Funcionário deve assinar aqui"
                    height={150}
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={distributeMutation.isPending || distributionItems.length === 0}
                  data-testid="button-submit-distribution"
                >
                  {distributeMutation.isPending ? "Processando..." : "Registrar Distribuição"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
            <CardDescription>Resumo da distribuição</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedEmployee ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <UserCheck className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground">Funcionário</Label>
                    <p className="font-semibold">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedEmployee.email}</p>
                    <p className="text-sm text-muted-foreground">ID: {selectedEmployee.internalId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground">Data de Entrega</Label>
                    <p className="font-semibold">
                      {form.watch("deliveryDate")
                        ? format(new Date(form.watch("deliveryDate")), "dd/MM/yyyy")
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Package className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground">Itens a Distribuir</Label>
                    {distributionItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground mt-1">Nenhum item adicionado</p>
                    ) : (
                      <div className="space-y-2 mt-2">
                        {distributionItems.map((item) => (
                          <div
                            key={item.itemId}
                            className="flex justify-between items-center text-sm"
                          >
                            <span>{item.itemName}</span>
                            <Badge variant="secondary">{item.quantity}x</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Selecione um funcionário para começar</p>
              </div>
            )}
          </CardContent>
        </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
