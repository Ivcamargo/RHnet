import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, AlertTriangle, Calendar, Plus, Search, FileDown } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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

interface InventoryStock {
  itemId: number;
  quantity: number;
  location: string;
}

interface LowStockItem extends InventoryItem {
  currentStock: number;
}

interface Category {
  id: number;
  name: string;
}

export default function InventoryDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSupervisor = user?.role === 'supervisor';

  const { data: items = [], isLoading: itemsLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/items"],
  });

  const { data: stock = [], isLoading: stockLoading } = useQuery<InventoryStock[]>({
    queryKey: ["/api/inventory/stock"],
  });

  const { data: lowStockItems = [], isLoading: lowStockLoading } = useQuery<LowStockItem[]>({
    queryKey: ["/api/inventory/stock/low"],
  });

  const { data: expiringItems = [], isLoading: expiringLoading } = useQuery<any[]>({
    queryKey: ["/api/inventory/employee-items/expiring/30"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/inventory/categories"],
  });

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.categoryId.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get stock for item
  const getStockForItem = (itemId: number) => {
    const itemStock = stock.find((s) => s.itemId === itemId);
    return itemStock?.quantity ?? 0;
  };

  // Calculate stats
  const totalItems = items.filter(item => item.isActive).length;
  const lowStockCount = lowStockItems.length;
  const expiringCount = expiringItems.length;

  const isLoading = itemsLoading || stockLoading || lowStockLoading || expiringLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(220,20%,8%)]">
      <TopBar title="Gestão de Estoque e EPIs" />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Gestão de Estoque e EPIs</h1>
                <p className="text-muted-foreground mt-1">
                  Controle completo de materiais e equipamentos de proteção
                </p>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <Link href="/admin/inventory/items">
                    <Button data-testid="button-manage-items">
                      <Package className="mr-2 h-4 w-4" />
                      Gerenciar Itens
                    </Button>
                  </Link>
                )}
                {(isAdmin || isSupervisor) && (
                  <Link href="/admin/inventory/distribute">
                    <Button variant="outline" data-testid="button-distribute">
                      <Plus className="mr-2 h-4 w-4" />
                      Distribuir EPIs
                    </Button>
                  </Link>
                )}
              </div>
            </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-items">
              {isLoading ? "..." : totalItems}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Itens cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="text-low-stock">
              {isLoading ? "..." : lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Itens abaixo do estoque mínimo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencimentos Próximos</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-expiring">
              {isLoading ? "..." : expiringCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              EPIs vencendo em 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Items List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Itens de Estoque</CardTitle>
              <CardDescription>Lista completa de materiais e EPIs cadastrados</CardDescription>
            </div>
            <Button variant="outline" size="sm" data-testid="button-export">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-items"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]" data-testid="select-category-filter">
                <SelectValue placeholder="Todas categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum item encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Mín</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const currentStock = getStockForItem(item.id);
                  const isLowStock = currentStock <= item.minStock;
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
                        <span className={isLowStock ? "text-red-600 font-bold" : ""}>
                          {currentStock}
                        </span>
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
                        <Link href={`/admin/inventory/items/${item.id}`}>
                          <Button variant="ghost" size="sm" data-testid={`button-view-item-${item.id}`}>
                            Ver detalhes
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
