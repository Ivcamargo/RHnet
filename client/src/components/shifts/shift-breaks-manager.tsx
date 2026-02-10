import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Clock, Coffee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ShiftBreak {
  id: number;
  shiftId: number;
  name: string;
  durationMinutes: number;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  isPaid: boolean;
  autoDeduct: boolean;
  isActive: boolean;
  minWorkMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface ShiftBreaksManagerProps {
  shiftId: number;
  shiftName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShiftBreaksManager({ shiftId, shiftName, open, onOpenChange }: ShiftBreaksManagerProps) {
  const { toast } = useToast();
  const [isAddingBreak, setIsAddingBreak] = useState(false);
  const [editingBreak, setEditingBreak] = useState<ShiftBreak | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    durationMinutes: 60,
    scheduledStart: "",
    scheduledEnd: "",
    isPaid: false,
    autoDeduct: true,
    isActive: true,
    minWorkMinutes: 360, // 6 hours default
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      durationMinutes: 60,
      scheduledStart: "",
      scheduledEnd: "",
      isPaid: false,
      autoDeduct: true,
      isActive: true,
      minWorkMinutes: 360,
    });
    setEditingBreak(null);
    setIsAddingBreak(false);
  };

  // Fetch breaks for this shift
  const { data: breaks = [], isLoading } = useQuery<ShiftBreak[]>({
    queryKey: [`/api/department-shifts/${shiftId}/breaks`],
    enabled: open && !!shiftId,
  });

  // Create break mutation
  const createBreakMutation = useMutation({
    mutationFn: async (data: Partial<ShiftBreak>) => {
      return await apiRequest(`/api/department-shifts/${shiftId}/breaks`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/department-shifts/${shiftId}/breaks`] });
      toast({
        title: "Intervalo criado",
        description: "O intervalo automático foi criado com sucesso.",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar intervalo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update break mutation
  const updateBreakMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ShiftBreak> }) => {
      return await apiRequest(`/api/shift-breaks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/department-shifts/${shiftId}/breaks`] });
      toast({
        title: "Intervalo atualizado",
        description: "O intervalo foi atualizado com sucesso.",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar intervalo.",
        variant: "destructive",
      });
    },
  });

  // Delete break mutation
  const deleteBreakMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/shift-breaks/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/department-shifts/${shiftId}/breaks`] });
      toast({
        title: "Intervalo removido",
        description: "O intervalo foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover intervalo.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (breakItem: ShiftBreak) => {
    setEditingBreak(breakItem);
    setFormData({
      name: breakItem.name,
      durationMinutes: breakItem.durationMinutes,
      scheduledStart: breakItem.scheduledStart || "",
      scheduledEnd: breakItem.scheduledEnd || "",
      isPaid: breakItem.isPaid,
      autoDeduct: breakItem.autoDeduct,
      isActive: breakItem.isActive,
      minWorkMinutes: breakItem.minWorkMinutes || 360,
    });
    setIsAddingBreak(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      durationMinutes: formData.durationMinutes,
      scheduledStart: formData.scheduledStart || null,
      scheduledEnd: formData.scheduledEnd || null,
      isPaid: formData.isPaid,
      autoDeduct: formData.autoDeduct,
      isActive: formData.isActive,
      minWorkMinutes: formData.minWorkMinutes || null,
    };

    if (editingBreak) {
      updateBreakMutation.mutate({ id: editingBreak.id, data });
    } else {
      createBreakMutation.mutate(data);
    }
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h${mins}min`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Intervalos Automáticos - {shiftName}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Configure os intervalos que serão descontados automaticamente das horas trabalhadas
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add/Edit Form */}
          {isAddingBreak && (
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="break-name">Nome do Intervalo</Label>
                    <Input
                      id="break-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Almoço, Intervalo da Manhã"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duração (minutos)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={formData.durationMinutes}
                        onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="min-work">Tempo Mínimo Trabalhado (minutos)</Label>
                      <Input
                        id="min-work"
                        type="number"
                        min="0"
                        value={formData.minWorkMinutes}
                        onChange={(e) => setFormData({ ...formData, minWorkMinutes: parseInt(e.target.value) || 0 })}
                        placeholder="Ex: 360 (6 horas)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Tempo necessário para deduzir este intervalo</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduled-start">Início Agendado (opcional)</Label>
                      <Input
                        id="scheduled-start"
                        type="time"
                        value={formData.scheduledStart}
                        onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduled-end">Fim Agendado (opcional)</Label>
                      <Input
                        id="scheduled-end"
                        type="time"
                        value={formData.scheduledEnd}
                        onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="is-paid" className="font-medium">Intervalo Pago</Label>
                        <p className="text-xs text-gray-500">Se marcado, não será descontado das horas</p>
                      </div>
                      <Switch
                        id="is-paid"
                        checked={formData.isPaid}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-deduct" className="font-medium">Dedução Automática</Label>
                        <p className="text-xs text-gray-500">Descontar automaticamente das horas trabalhadas</p>
                      </div>
                      <Switch
                        id="auto-deduct"
                        checked={formData.autoDeduct}
                        onCheckedChange={(checked) => setFormData({ ...formData, autoDeduct: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="is-active" className="font-medium">Ativo</Label>
                        <p className="text-xs text-gray-500">Intervalo ativo e em uso</p>
                      </div>
                      <Switch
                        id="is-active"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="submit"
                      disabled={createBreakMutation.isPending || updateBreakMutation.isPending}
                    >
                      {editingBreak ? "Atualizar" : "Adicionar"} Intervalo
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* List of breaks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Intervalos Configurados</h3>
              {!isAddingBreak && (
                <Button size="sm" onClick={() => setIsAddingBreak(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Intervalo
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : breaks.length === 0 ? (
              <Card className="bg-gray-50">
                <CardContent className="py-8 text-center text-gray-500">
                  <Coffee className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Nenhum intervalo configurado</p>
                  <p className="text-sm">Adicione intervalos automáticos para serem descontados das horas trabalhadas</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {breaks.map((breakItem) => (
                  <Card key={breakItem.id} className={!breakItem.isActive ? "opacity-60" : ""}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{breakItem.name}</h4>
                          {breakItem.isPaid && <Badge variant="secondary">Pago</Badge>}
                          {!breakItem.isPaid && <Badge>Não Pago</Badge>}
                          {breakItem.autoDeduct && <Badge variant="outline">Auto-Desconto</Badge>}
                          {!breakItem.isActive && <Badge variant="destructive">Inativo</Badge>}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Duração: <span className="font-medium">{formatMinutes(breakItem.durationMinutes)}</span></div>
                          {breakItem.scheduledStart && breakItem.scheduledEnd && (
                            <div>Horário: {breakItem.scheduledStart} - {breakItem.scheduledEnd}</div>
                          )}
                          {breakItem.minWorkMinutes && (
                            <div>Tempo mínimo trabalhado: {formatMinutes(breakItem.minWorkMinutes)}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(breakItem)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja remover o intervalo "${breakItem.name}"?`)) {
                              deleteBreakMutation.mutate(breakItem.id);
                            }
                          }}
                          disabled={deleteBreakMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
