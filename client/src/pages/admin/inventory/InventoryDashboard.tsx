import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, AlertTriangle, Calendar, Plus, Search, FileDown, X } from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo } from "react";
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

type FilterType = "all" | "active" | "low" | "expiring" | "inactive";

export default function InventoryDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

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

  // Get stock for item
  const getStockForItem = (itemId: number) => {
    const itemStock = stock.find((s) => s.itemId === itemId);
    return itemStock?.quantity ?? 0;
  };

  // Create set of item IDs that have stock > 0
  const itemsWithStock = useMemo(() => {
    return new Set(stock.map((s) => s.itemId));
  }, [stock]);

  // Create set of expiring item IDs
  const expiringItemIds = useMemo(() => {
    return new Set(expiringItems.map((ei) => ei.itemId));
  }, [expiringItems]);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = (item.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) || 
                         (item.code?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.categoryId.toString() === categoryFilter;
    
    // Apply card filter
    let matchesCardFilter = true;
    if (activeFilter === "active") {
      matchesCardFilter = item.isActive;
    } else if (activeFilter === "low") {
      const currentStock = getStockForItem(item.id);
      matchesCardFilter = currentStock <= item.minStock;
    } else if (activeFilter === "expiring") {
      matchesCardFilter = expiringItemIds.has(item.id);
    } else if (activeFilter === "inactive") {
      // Item is inactive if it doesn't have stock (not in stock table = quantity 0)
      matchesCardFilter = !itemsWithStock.has(item.id);
    }
    
    return matchesSearch && matchesCategory && matchesCardFilter;
  });

  // Calculate stats
  const totalItems = items.filter(item => item.isActive).length;
  const lowStockCount = lowStockItems.length;
  const expiringCount = expiringItems.length;
  // Items without stock are those not in the stock table (quantity = 0)
  const inactiveCount = items.filter(item => !itemsWithStock.has(item.id)).length;

  const isLoading = itemsLoading || stockLoading || lowStockLoading || expiringLoading;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Dashboard de Estoque" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Dashboard de Estoque</h1>
                <p className="text-muted-foreground mt-1">
                  Visão geral de materiais e equipamentos de proteção
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === "active" ? "ring-2 ring-blue-500 shadow-md" : ""
          }`}
          onClick={() => setActiveFilter(activeFilter === "active" ? "all" : "active")}
          data-testid="card-filter-active"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-items">
              {isLoading ? "..." : totalItems}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeFilter === "active" ? "🔍 Filtrando itens ativos" : "Itens cadastrados no sistema"}
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === "low" ? "ring-2 ring-yellow-500 shadow-md" : ""
          }`}
          onClick={() => setActiveFilter(activeFilter === "low" ? "all" : "low")}
          data-testid="card-filter-low"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="text-low-stock">
              {isLoading ? "..." : lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeFilter === "low" ? "🔍 Filtrando estoque baixo" : "Itens abaixo do estoque mínimo"}
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === "expiring" ? "ring-2 ring-red-500 shadow-md" : ""
          }`}
          onClick={() => setActiveFilter(activeFilter === "expiring" ? "all" : "expiring")}
          data-testid="card-filter-expiring"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencimentos Próximos</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-expiring">
              {isLoading ? "..." : expiringCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeFilter === "expiring" ? "🔍 Filtrando vencimentos próximos" : "EPIs vencendo em 30 dias"}
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === "inactive" ? "ring-2 ring-gray-500 shadow-md" : ""
          }`}
          onClick={() => setActiveFilter(activeFilter === "inactive" ? "all" : "inactive")}
          data-testid="card-filter-inactive"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Inativos</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600" data-testid="text-inactive">
              {isLoading ? "..." : inactiveCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeFilter === "inactive" ? "🔍 Filtrando itens sem estoque" : "Itens com estoque zerado"}
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
            {activeFilter !== "all" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveFilter("all")}
                data-testid="button-clear-filter"
                className="whitespace-nowrap"
              >
                <X className="mr-2 h-4 w-4" />
                Limpar Filtro
              </Button>
            )}
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
                        <Link href="/admin/inventory/items">
                          <Button variant="ghost" size="sm" data-testid={`button-view-item-${item.id}`}>
                            Gerenciar
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
