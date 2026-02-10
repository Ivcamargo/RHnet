import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Tablet, Plus, Edit, Trash2, Copy, CheckCircle, XCircle, AlertCircle, MapPin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { format } from "date-fns";
import { LocationMap } from "@/components/ui/location-map";
import "leaflet/dist/leaflet.css";

type Terminal = {
  id: number;
  companyId: number;
  deviceCode: string;
  deviceName: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  radius: number;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const terminalSchema = z.object({
  deviceCode: z.string().min(1, "Código obrigatório").max(50),
  deviceName: z.string().min(1, "Nome obrigatório").max(100),
  location: z.string().min(1, "Local obrigatório").max(100),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  radius: z.number().min(10).max(1000).default(100),
  isActive: z.boolean().default(true),
});

type TerminalFormData = z.infer<typeof terminalSchema>;

export default function Terminals() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState<Terminal | null>(null);

  // Fetch terminals
  const { data: terminals = [], isLoading } = useQuery<Terminal[]>({
    queryKey: ['/api/terminals'],
  });

  // Create form
  const createForm = useForm<TerminalFormData>({
    resolver: zodResolver(terminalSchema),
    defaultValues: {
      deviceCode: '',
      deviceName: '',
      location: '',
      latitude: -23.5505,
      longitude: -46.6333,
      radius: 100,
      isActive: true,
    },
  });

  // Edit form
  const editForm = useForm<TerminalFormData>({
    resolver: zodResolver(terminalSchema),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TerminalFormData) =>
      apiRequest('/api/terminals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Terminal criado",
        description: "Terminal criado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/terminals'] });
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TerminalFormData> }) =>
      apiRequest(`/api/terminals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Terminal atualizado",
        description: "Terminal atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/terminals'] });
      setEditingTerminal(null);
      editForm.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/terminals/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast({
        title: "Terminal removido",
        description: "Terminal removido com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/terminals'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  const handleCreate = (data: TerminalFormData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (terminal: Terminal) => {
    setEditingTerminal(terminal);
    editForm.reset({
      deviceCode: terminal.deviceCode,
      deviceName: terminal.deviceName,
      location: terminal.location,
      latitude: terminal.latitude ?? -23.5505,
      longitude: terminal.longitude ?? -46.6333,
      radius: terminal.radius ?? 100,
      isActive: terminal.isActive,
    });
  };

  const handleUpdate = (data: TerminalFormData) => {
    if (editingTerminal) {
      updateMutation.mutate({ id: editingTerminal.id, data });
    }
  };

  const handleDelete = (terminal: Terminal) => {
    if (confirm(`Tem certeza que deseja excluir o terminal "${terminal.deviceName}"?`)) {
      deleteMutation.mutate(terminal.id);
    }
  };

  const toggleActive = (terminal: Terminal) => {
    updateMutation.mutate({
      id: terminal.id,
      data: { isActive: !terminal.isActive }
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado",
      description: "Código do dispositivo copiado para a área de transferência",
    });
  };

  const generateCode = () => {
    const prefix = "TERM";
    const number = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    const code = `${prefix}-${number}`;
    createForm.setValue('deviceCode', code);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Terminais de Ponto" />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Terminais de Ponto</h1>
            <p className="text-muted-foreground">Gerencie dispositivos autorizados para registro de ponto</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-terminal">
                <Plus className="mr-2 h-4 w-4" />
                Novo Terminal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Terminal</DialogTitle>
                <DialogDescription>
                  Configure um novo dispositivo autorizado para registro de ponto
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="deviceCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código do Dispositivo</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="TERM-0001" 
                                  data-testid="input-create-device-code"
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={generateCode}
                                data-testid="button-generate-code"
                              >
                                Gerar
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="deviceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Terminal</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Tablet Recepção" 
                                data-testid="input-create-device-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Local</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Recepção - 1º Andar" 
                                data-testid="input-create-location"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="radius"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Raio de Validação (metros): {field.value}m</FormLabel>
                            <FormControl>
                              <Slider
                                min={10}
                                max={1000}
                                step={10}
                                value={[field.value ?? 100]}
                                onValueChange={(value) => field.onChange(value[0])}
                                data-testid="slider-create-radius"
                              />
                            </FormControl>
                            <FormDescription>
                              Distância máxima permitida do ponto central (10-1000 metros)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <LocationMap
                        latitude={createForm.watch('latitude') ?? -23.5505}
                        longitude={createForm.watch('longitude') ?? -46.6333}
                        radius={createForm.watch('radius') ?? 100}
                        onLocationChange={(lat, lng) => {
                          createForm.setValue('latitude', lat);
                          createForm.setValue('longitude', lng);
                        }}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      data-testid="button-submit-create"
                    >
                      {createMutation.isPending ? 'Criando...' : 'Criar Terminal'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tablet className="h-5 w-5" />
              Dispositivos Autorizados
            </CardTitle>
            <CardDescription>
              Lista de todos os terminais de ponto cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : terminals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tablet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum terminal cadastrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {terminals.map((terminal) => (
                    <TableRow key={terminal.id} data-testid={`row-terminal-${terminal.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                            {terminal.deviceCode}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCode(terminal.deviceCode)}
                            data-testid={`button-copy-${terminal.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{terminal.deviceName}</TableCell>
                      <TableCell>{terminal.location}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={terminal.isActive ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleActive(terminal)}
                          data-testid={`badge-status-${terminal.id}`}
                        >
                          {terminal.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativo
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {terminal.lastUsedAt ? (
                          <span className="text-sm">
                            {format(new Date(terminal.lastUsedAt), "dd/MM/yyyy HH:mm")}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Nunca usado</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(terminal)}
                            data-testid={`button-edit-${terminal.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(terminal)}
                            data-testid={`button-delete-${terminal.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingTerminal} onOpenChange={(open) => !open && setEditingTerminal(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Terminal</DialogTitle>
              <DialogDescription>
                Atualize as informações do terminal
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="deviceCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código do Dispositivo</FormLabel>
                          <FormControl>
                            <Input {...field} disabled data-testid="input-edit-device-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="deviceName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Terminal</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-edit-device-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Local</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-edit-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="radius"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raio de Validação (metros): {field.value}m</FormLabel>
                          <FormControl>
                            <Slider
                              min={10}
                              max={1000}
                              step={10}
                              value={[field.value ?? 100]}
                              onValueChange={(value) => field.onChange(value[0])}
                              data-testid="slider-edit-radius"
                            />
                          </FormControl>
                          <FormDescription>
                            Distância máxima permitida do ponto central (10-1000 metros)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <LocationMap
                      latitude={editForm.watch('latitude') ?? -23.5505}
                      longitude={editForm.watch('longitude') ?? -46.6333}
                      radius={editForm.watch('radius') ?? 100}
                      onLocationChange={(lat, lng) => {
                        editForm.setValue('latitude', lat);
                        editForm.setValue('longitude', lng);
                      }}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    data-testid="button-submit-edit"
                  >
                    {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
