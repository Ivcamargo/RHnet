import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Minus, TrendingUp, TrendingDown, Package, Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: number;
  code: string;
  name: string;
  unit: string;
  isActive?: boolean;
}

interface InventoryStock {
  itemId: number;
  quantity: number;
}

interface InventoryMovement {
  id: number;
  itemId: number;
  type: string;
  quantity: number;
  reason: string | null;
  notes: string | null;
  transactionDate: string;
  createdAt: string;
  createdBy: string;
  itemName?: string;
}

export default function InventoryMovements() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [movementType, setMovementType] = useState<string>("in");
  const [quantity, setQuantity] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  
  // Combobox states
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[hsl(220,20%,8%)]">
        <TopBar title="Estoque e EPIs" />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card>
              <CardHeader>
                <CardTitle>Acesso Negado</CardTitle>
                <CardDescription>
                  Apenas administradores podem acessar esta página.
                </CardDescription>
              </CardHeader>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const { data: items = [], isLoading: itemsLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/items"],
  });

  const { data: stock = [], isLoading: stockLoading } = useQuery<InventoryStock[]>({
    queryKey: ["/api/inventory/stock"],
  });

  const { data: movements = [], isLoading: movementsLoading } = useQuery<InventoryMovement[]>({
    queryKey: ["/api/inventory/movements"],
  });

  useEffect(() => {
    setReason("");
  }, [movementType]);

  const createMovementMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/inventory/movements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stock"] });
      toast({
        title: "Movimentação registrada",
        description: "Estoque atualizado com sucesso!",
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar movimentação",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedItemId(null);
    setMovementType("in");
    setQuantity("");
    setReason("");
    setNotes("");
    setTransactionDate(new Date());
    setSearchValue("");
  };

  const handleSubmit = () => {
    if (!selectedItemId) {
      toast({
        title: "Erro de validação",
        description: "Por favor, selecione um item da lista",
        variant: "destructive",
      });
      return;
    }
    
    if (!quantity || parseInt(quantity) <= 0) {
      toast({
        title: "Erro de validação",
        description: "Informe uma quantidade válida maior que zero",
        variant: "destructive",
      });
      return;
    }

    if (!reason) {
      toast({
        title: "Erro de validação",
        description: "Selecione um motivo para a movimentação",
        variant: "destructive",
      });
      return;
    }

    const dateAtNoon = new Date(transactionDate);
    dateAtNoon.setHours(12, 0, 0, 0);
    
    createMovementMutation.mutate({
      itemId: selectedItemId,
      type: movementType,
      quantity: parseInt(quantity),
      reason: reason || null,
      notes: notes || null,
      transactionDate: dateAtNoon.toISOString(),
    });
  };

  const getStockForItem = (itemId: number) => {
    const itemStock = stock.find((s) => s.itemId === itemId);
    return itemStock?.quantity ?? 0;
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case "in":
        return <Badge className="bg-green-500"><TrendingUp className="w-3 h-3 mr-1" />Entrada</Badge>;
      case "out":
        return <Badge variant="destructive"><TrendingDown className="w-3 h-3 mr-1" />Saída</Badge>;
      case "adjustment":
        return <Badge variant="secondary">Ajuste</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(220,20%,8%)]">
      <TopBar title="Movimentações de Estoque" />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Movimentações de Estoque</h1>
                <p className="text-muted-foreground mt-1">
                  Registre entradas e saídas de materiais
                </p>
              </div>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-new-movement">
                <Plus className="mr-2 h-4 w-4" />
                Nova Movimentação
              </Button>
            </div>

            {/* Current Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Estoque Atual
                </CardTitle>
                <CardDescription>Quantidade disponível de cada item</CardDescription>
              </CardHeader>
              <CardContent>
                {itemsLoading || stockLoading ? (
                  <p>Carregando...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.filter(item => item.isActive !== false).map((item) => {
                        const currentStock = getStockForItem(item.id);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.code}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell className="text-right font-bold">
                              {currentStock}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Movement History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Histórico de Movimentações
                </CardTitle>
                <CardDescription>Últimas entradas e saídas registradas</CardDescription>
              </CardHeader>
              <CardContent>
                {movementsLoading ? (
                  <p>Carregando...</p>
                ) : movements.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma movimentação registrada</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.slice(0, 20).map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {format(new Date(movement.transactionDate), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>{getMovementTypeBadge(movement.type)}</TableCell>
                          <TableCell>
                            {items.find(i => i.id === movement.itemId)?.name || `Item #${movement.itemId}`}
                          </TableCell>
                          <TableCell className={movement.type === 'in' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                          </TableCell>
                          <TableCell>{movement.reason || '-'}</TableCell>
                          <TableCell>{movement.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* New Movement Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
                  <DialogDescription>
                    Registre uma entrada ou saída de material
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Movimentação</Label>
                    <Select value={movementType} onValueChange={setMovementType}>
                      <SelectTrigger data-testid="select-movement-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Entrada (Compra/Devolução)</SelectItem>
                        <SelectItem value="out">Saída (Estravio/Perda)</SelectItem>
                        <SelectItem value="adjustment">Ajuste de Estoque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Item</Label>
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboboxOpen}
                          className="w-full justify-between"
                          data-testid="button-select-item"
                        >
                          {selectedItemId
                            ? (() => {
                                const selectedItem = items.find((item) => item.id === selectedItemId);
                                return selectedItem
                                  ? `${selectedItem.code} - ${selectedItem.name}`
                                  : "Selecione um item";
                              })()
                            : "Selecione um item ou digite para buscar"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Buscar por código ou nome..." 
                            value={searchValue}
                            onValueChange={setSearchValue}
                          />
                          <CommandList>
                            <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
                            <CommandGroup>
                              {items
                                .filter((item) => item.isActive !== false)
                                .filter((item) => {
                                  const search = searchValue.toLowerCase();
                                  return (
                                    item.code.toLowerCase().includes(search) ||
                                    item.name.toLowerCase().includes(search)
                                  );
                                })
                                .map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    value={`${item.code}-${item.name}-${item.id}`}
                                    onSelect={() => {
                                      setSelectedItemId(item.id);
                                      setComboboxOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedItemId === item.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {item.code} - {item.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        Estoque: {getStockForItem(item.id)} {item.unit}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Digite a quantidade"
                      data-testid="input-quantity"
                    />
                  </div>

                  <div>
                    <Label>Data da Movimentação</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !transactionDate && "text-muted-foreground"
                          )}
                          data-testid="button-select-date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {transactionDate ? (
                            format(transactionDate, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={transactionDate}
                          onSelect={(date) => setTransactionDate(date || new Date())}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ex: Data da nota fiscal ou quando a movimentação ocorreu
                    </p>
                  </div>

                  <div>
                    <Label>Motivo</Label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger data-testid="select-reason">
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {movementType === 'in' && (
                          <>
                            <SelectItem value="purchase">Compra</SelectItem>
                            <SelectItem value="return">Devolução</SelectItem>
                            <SelectItem value="donation">Doação</SelectItem>
                          </>
                        )}
                        {movementType === 'out' && (
                          <>
                            <SelectItem value="loss">Estravio/Perda</SelectItem>
                            <SelectItem value="damage">Dano/Avaria</SelectItem>
                            <SelectItem value="expired">Vencimento</SelectItem>
                            <SelectItem value="disposal">Descarte</SelectItem>
                          </>
                        )}
                        {movementType === 'adjustment' && (
                          <>
                            <SelectItem value="correction">Correção de Inventário</SelectItem>
                            <SelectItem value="recount">Recontagem</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Observações (opcional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Detalhes adicionais sobre esta movimentação"
                      data-testid="input-notes"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={createMovementMutation.isPending}
                    data-testid="button-submit-movement"
                  >
                    {createMovementMutation.isPending ? "Salvando..." : "Registrar Movimentação"}
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
