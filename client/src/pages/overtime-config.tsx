import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import TopBar from "@/components/layout/top-bar";
import Sidebar from "@/components/layout/sidebar";

type Department = {
  id: number;
  name: string;
  sectorId: number;
};

type Shift = {
  id: number;
  departmentId: number;
  name: string;
};

type OvertimeRule = {
  id: number;
  departmentId: number;
  shiftId: number | null;
  name: string;
  overtimeType: "paid" | "time_bank";
  applyToWeekdays: boolean;
  applyToWeekends: boolean;
  applyToHolidays: boolean;
  isActive: boolean;
  priority: number;
};

type OvertimeTier = {
  id: number;
  overtimeRuleId: number;
  minHours: string;
  maxHours: string | null;
  percentage: number;
  description: string | null;
  orderIndex: number | null;
};

export default function OvertimeConfig() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedRule, setSelectedRule] = useState<OvertimeRule | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<OvertimeRule | null>(null);
  const [editingTier, setEditingTier] = useState<OvertimeTier | null>(null);

  // Fetch departments
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  // Fetch shifts for selected department
  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: selectedDepartment ? ["/api/departments", selectedDepartment, "shifts"] : [],
    enabled: !!selectedDepartment,
  });

  // Fetch overtime rules for selected department
  const { data: rules = [] } = useQuery<OvertimeRule[]>({
    queryKey: selectedDepartment ? ["/api/overtime-rules", selectedDepartment] : [],
    enabled: !!selectedDepartment,
    queryFn: async () => {
      const response = await fetch(`/api/overtime-rules/${selectedDepartment}`);
      if (!response.ok) throw new Error('Failed to fetch overtime rules');
      return response.json();
    },
  });

  // Fetch tiers for selected rule
  const { data: tiers = [] } = useQuery<OvertimeTier[]>({
    queryKey: selectedRule ? ["/api/overtime-tiers", selectedRule.id] : [],
    enabled: !!selectedRule,
    queryFn: async () => {
      const response = await fetch(`/api/overtime-tiers/${selectedRule?.id}`);
      if (!response.ok) throw new Error('Failed to fetch overtime tiers');
      return response.json();
    },
  });

  // Create/Update rule mutation
  const saveRuleMutation = useMutation({
    mutationFn: async (rule: Partial<OvertimeRule>) => {
      if (rule.id) {
        return await apiRequest(`/api/overtime-rules/${rule.id}`, {
          method: "PUT",
          body: JSON.stringify(rule),
        });
      } else {
        return await apiRequest("/api/overtime-rules", {
          method: "POST",
          body: JSON.stringify(rule),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime-rules"] });
      setShowRuleDialog(false);
      setEditingRule(null);
      toast({ title: "Regra salva com sucesso!" });
    },
    onError: (error: any) => {
      console.error("Error saving rule:", error);
      toast({ 
        title: "Erro ao salvar regra", 
        description: error.message || "Verifique os dados e tente novamente",
        variant: "destructive" 
      });
    },
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/overtime-rules/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime-rules"] });
      toast({ title: "Regra excluída com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir regra", variant: "destructive" });
    },
  });

  // Create/Update tier mutation
  const saveTierMutation = useMutation({
    mutationFn: async (tier: Partial<OvertimeTier>) => {
      if (tier.id) {
        return await apiRequest(`/api/overtime-tiers/${tier.id}`, {
          method: "PUT",
          body: JSON.stringify(tier),
        });
      } else {
        return await apiRequest("/api/overtime-tiers", {
          method: "POST",
          body: JSON.stringify({
            ...tier,
            overtimeRuleId: selectedRule?.id,
          }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime-tiers"] });
      setShowTierDialog(false);
      setEditingTier(null);
      toast({ title: "Faixa salva com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar faixa", variant: "destructive" });
    },
  });

  // Delete tier mutation
  const deleteTierMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/overtime-tiers/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime-tiers"] });
      toast({ title: "Faixa excluída com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir faixa", variant: "destructive" });
    },
  });

  const handleSaveRule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const shiftValue = formData.get("shiftId") as string;
    const shiftId = shiftValue && shiftValue !== "all" ? Number(shiftValue) : null;
    
    const rule = {
      id: editingRule?.id,
      departmentId: selectedDepartment!,
      shiftId: shiftId,
      name: formData.get("name") as string,
      overtimeType: formData.get("overtimeType") as "paid" | "time_bank",
      applyToWeekdays: formData.get("applyToWeekdays") === "on",
      applyToWeekends: formData.get("applyToWeekends") === "on",
      applyToHolidays: formData.get("applyToHolidays") === "on",
      isActive: formData.get("isActive") === "on",
      priority: Number(formData.get("priority")),
    };

    console.log("[OVERTIME] Saving rule:", rule);
    saveRuleMutation.mutate(rule);
  };

  const handleSaveTier = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const tier = {
      id: editingTier?.id,
      minHours: formData.get("minHours") as string,
      maxHours: formData.get("maxHours") as string || null,
      percentage: Number(formData.get("percentage")),
      description: formData.get("description") as string,
      orderIndex: Number(formData.get("orderIndex")),
    };

    saveTierMutation.mutate(tier);
  };

  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar title="Configuração de Horas Extras" />
          <main className="flex-1 p-6">
            <div className="container py-8 text-center">
              <p>Acesso restrito a administradores.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Configuração de Horas Extras" />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] bg-clip-text text-transparent">
            Configuração de Horas Extras
          </h1>
          <p className="text-muted-foreground mt-2">
            Defina regras e percentuais de horas extras por departamento e turno
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Department Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Departamento</CardTitle>
              <CardDescription>Escolha o departamento para configurar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map((dept) => (
                  <Button
                    key={dept.id}
                    variant={selectedDepartment === dept.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedDepartment(dept.id);
                      setSelectedRule(null);
                    }}
                    data-testid={`button-select-department-${dept.id}`}
                  >
                    {dept.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overtime Rules */}
          <Card className={!selectedDepartment ? "opacity-50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Regras de HE</CardTitle>
                  <CardDescription>Gerencie as regras de horas extras</CardDescription>
                </div>
                <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      disabled={!selectedDepartment}
                      onClick={() => setEditingRule(null)}
                      data-testid="button-add-rule"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nova
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingRule ? "Editar Regra" : "Nova Regra"}</DialogTitle>
                      <DialogDescription>
                        Configure os parâmetros da regra de horas extras
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveRule}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Nome da Regra</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={editingRule?.name}
                            placeholder="Ex: HE Dias Úteis"
                            required
                            data-testid="input-rule-name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="shiftId">Turno (Opcional)</Label>
                          <Select name="shiftId" defaultValue={editingRule?.shiftId?.toString() || "all"}>
                            <SelectTrigger data-testid="select-shift">
                              <SelectValue placeholder="Todos os turnos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos os turnos</SelectItem>
                              {shifts.map((shift) => (
                                <SelectItem key={shift.id} value={shift.id.toString()}>
                                  {shift.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="overtimeType">Tipo de HE</Label>
                          <Select name="overtimeType" defaultValue={editingRule?.overtimeType || "paid"}>
                            <SelectTrigger data-testid="select-overtime-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paid">Pago</SelectItem>
                              <SelectItem value="time_bank">Banco de Horas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="applyToWeekdays"
                              name="applyToWeekdays"
                              defaultChecked={editingRule?.applyToWeekdays ?? true}
                              data-testid="switch-weekdays"
                            />
                            <Label htmlFor="applyToWeekdays">Dias Úteis</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="applyToWeekends"
                              name="applyToWeekends"
                              defaultChecked={editingRule?.applyToWeekends ?? false}
                              data-testid="switch-weekends"
                            />
                            <Label htmlFor="applyToWeekends">Fins de Semana</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="applyToHolidays"
                              name="applyToHolidays"
                              defaultChecked={editingRule?.applyToHolidays ?? false}
                              data-testid="switch-holidays"
                            />
                            <Label htmlFor="applyToHolidays">Feriados</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="isActive"
                              name="isActive"
                              defaultChecked={editingRule?.isActive ?? true}
                              data-testid="switch-active"
                            />
                            <Label htmlFor="isActive">Regra Ativa</Label>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="priority">Prioridade</Label>
                          <Input
                            id="priority"
                            name="priority"
                            type="number"
                            defaultValue={editingRule?.priority || 0}
                            min="0"
                            data-testid="input-priority"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Regras com maior prioridade são aplicadas primeiro
                          </p>
                        </div>
                      </div>

                      <DialogFooter className="mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowRuleDialog(false)}
                          data-testid="button-cancel-rule"
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" data-testid="button-save-rule">
                          Salvar Regra
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRule?.id === rule.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedRule(rule)}
                    data-testid={`rule-item-${rule.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {rule.overtimeType === "paid" ? "Pago" : "Banco de Horas"} •{" "}
                          Prioridade: {rule.priority}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRule(rule);
                            setShowRuleDialog(true);
                          }}
                          data-testid={`button-edit-rule-${rule.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Excluir esta regra?")) {
                              deleteRuleMutation.mutate(rule.id);
                            }
                          }}
                          data-testid={`button-delete-rule-${rule.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {selectedDepartment && rules.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma regra configurada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Overtime Tiers */}
          <Card className={!selectedRule ? "opacity-50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Faixas de Percentuais</CardTitle>
                  <CardDescription>Configure os percentuais por faixa de horas</CardDescription>
                </div>
                <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      disabled={!selectedRule}
                      onClick={() => setEditingTier(null)}
                      data-testid="button-add-tier"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nova
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTier ? "Editar Faixa" : "Nova Faixa"}</DialogTitle>
                      <DialogDescription>
                        Configure os parâmetros da faixa de percentual
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveTier}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="description">Descrição</Label>
                          <Input
                            id="description"
                            name="description"
                            defaultValue={editingTier?.description || ""}
                            placeholder="Ex: Primeiras 2 horas"
                            data-testid="input-tier-description"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="minHours">Horas Mínimas</Label>
                            <Input
                              id="minHours"
                              name="minHours"
                              type="number"
                              step="0.01"
                              defaultValue={editingTier?.minHours || "0"}
                              required
                              data-testid="input-min-hours"
                            />
                          </div>
                          <div>
                            <Label htmlFor="maxHours">Horas Máximas</Label>
                            <Input
                              id="maxHours"
                              name="maxHours"
                              type="number"
                              step="0.01"
                              defaultValue={editingTier?.maxHours || ""}
                              placeholder="Sem limite"
                              data-testid="input-max-hours"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="percentage">Percentual (%)</Label>
                          <Input
                            id="percentage"
                            name="percentage"
                            type="number"
                            defaultValue={editingTier?.percentage || 50}
                            required
                            data-testid="input-percentage"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Ex: 50 = 50% adicional, 100 = 100% adicional (dobro)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="orderIndex">Ordem</Label>
                          <Input
                            id="orderIndex"
                            name="orderIndex"
                            type="number"
                            defaultValue={editingTier?.orderIndex || tiers.length}
                            min="0"
                            data-testid="input-order-index"
                          />
                        </div>
                      </div>

                      <DialogFooter className="mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowTierDialog(false)}
                          data-testid="button-cancel-tier"
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" data-testid="button-save-tier">
                          Salvar Faixa
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {selectedRule && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faixa</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tiers.map((tier) => (
                      <TableRow key={tier.id} data-testid={`tier-row-${tier.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {tier.minHours}h - {tier.maxHours ? `${tier.maxHours}h` : "∞"}
                            </p>
                            {tier.description && (
                              <p className="text-xs text-muted-foreground">{tier.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">+{tier.percentage}%</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingTier(tier);
                                setShowTierDialog(true);
                              }}
                              data-testid={`button-edit-tier-${tier.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Excluir esta faixa?")) {
                                  deleteTierMutation.mutate(tier.id);
                                }
                              }}
                              data-testid={`button-delete-tier-${tier.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {tiers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhuma faixa configurada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
              {!selectedRule && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Selecione uma regra para configurar as faixas
                </p>
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
