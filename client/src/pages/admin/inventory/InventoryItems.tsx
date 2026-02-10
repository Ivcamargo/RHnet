import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

interface InventoryItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  hasValidity: boolean;
  validityMonths: number | null;
  minStock: number;
  isActive: boolean;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
  description: string | null;
}

const itemSchema = z.object({
  code: z.string().min(1, "Código obrigatório"),
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  categoryId: z.number({ required_error: "Categoria obrigatória" }),
  unit: z.string().min(1, "Unidade obrigatória"),
  hasValidity: z.boolean().default(false),
  validityMonths: z.number().optional(),
  minStock: z.number().min(0, "Estoque mínimo não pode ser negativo"),
  isActive: z.boolean().default(true),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export default function InventoryItems() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("epi");

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  if (!isAdmin) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar title="Gestão de Itens" />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
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

  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/items"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/inventory/categories"],
  });

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      unit: "UN",
      hasValidity: false,
      minStock: 0,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ItemFormValues) => apiRequest("/api/inventory/items", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stock"] });
      toast({
        title: "Item criado",
        description: "Item cadastrado com sucesso!",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar item",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ItemFormValues }) => 
      apiRequest(`/api/inventory/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      toast({
        title: "Item atualizado",
        description: "Item atualizado com sucesso!",
      });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar item",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/inventory/items/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stock"] });
      toast({
        title: "Item excluído",
        description: "Item removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir item",
        variant: "destructive",
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; type: string }) => apiRequest("/api/inventory/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/categories"] });
      toast({
        title: "Categoria criada",
        description: "Categoria criada com sucesso!",
      });
      setCategoryDialogOpen(false);
      setNewCategoryName("");
      setNewCategoryType("epi");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message || "Ocorreu um erro ao criar a categoria. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ItemFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    form.reset({
      code: item.code,
      name: item.name,
      description: item.description || "",
      categoryId: item.categoryId,
      unit: item.unit,
      hasValidity: item.hasValidity,
      validityMonths: item.validityMonths || undefined,
      minStock: item.minStock,
      isActive: item.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewItem = () => {
    setEditingItem(null);
    form.reset();
    setIsDialogOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Gestão de Itens" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Gestão de Itens</h1>
                <p className="text-muted-foreground mt-1">
                  Cadastre e gerencie materiais e EPIs
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCategoryDialogOpen(true)} data-testid="button-add-category">
                  Adicionar Categoria
                </Button>
                <Button onClick={handleNewItem} data-testid="button-add-item">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Item
                </Button>
              </div>
            </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Itens Cadastrados</CardTitle>
          <CardDescription>Lista de todos os materiais e EPIs do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum item cadastrado</p>
              <Button onClick={handleNewItem} className="mt-4">
                Cadastrar primeiro item
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Estoque Mín</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const category = categories.find((c) => c.id === item.categoryId);
                  return (
                    <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category?.name || "Sem categoria"}</Badge>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        {item.hasValidity ? (
                          <Badge>{item.validityMonths} meses</Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{item.minStock}</TableCell>
                      <TableCell>
                        {item.isActive ? (
                          <Badge variant="success">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            data-testid={`button-edit-${item.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            data-testid={`button-delete-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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

      {/* Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Item" : "Novo Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Atualize as informações do item" : "Cadastre um novo item de estoque"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="EPI-001" {...field} data-testid="input-code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Capacete de Segurança" {...field} data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição do item..." {...field} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-unit">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="UN">Unidade (UN)</SelectItem>
                          <SelectItem value="CX">Caixa (CX)</SelectItem>
                          <SelectItem value="PC">Peça (PC)</SelectItem>
                          <SelectItem value="KG">Quilograma (KG)</SelectItem>
                          <SelectItem value="L">Litro (L)</SelectItem>
                          <SelectItem value="M">Metro (M)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Mínimo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-min-stock"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validityMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validade (meses)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="12"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          disabled={!form.watch("hasValidity")}
                          data-testid="input-validity-months"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="hasValidity"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-has-validity"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Possui validade</FormLabel>
                        <FormDescription>Item tem prazo de validade</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-is-active"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Ativo</FormLabel>
                        <FormDescription>Item ativo no sistema</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>Criar uma nova categoria para organizar os itens</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Categoria</label>
              <Input
                placeholder="Nome da categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                data-testid="input-category-name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select value={newCategoryType} onValueChange={setNewCategoryType}>
                <SelectTrigger data-testid="select-category-type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="epi">EPI (Equipamento de Proteção Individual)</SelectItem>
                  <SelectItem value="uniform">Uniformes</SelectItem>
                  <SelectItem value="material">Materiais</SelectItem>
                  <SelectItem value="tool">Ferramentas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createCategoryMutation.mutate({ name: newCategoryName, type: newCategoryType })}
              disabled={!newCategoryName || createCategoryMutation.isPending}
              data-testid="button-create-category"
            >
              Criar
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
