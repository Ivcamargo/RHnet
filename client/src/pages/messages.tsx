import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Plus, Send, Clock, Eye, Filter, Search, MessageCircle, Users, Edit, Trash2, Archive } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

// Form schemas
const messageFormSchema = z.object({
  recipientId: z.string().optional(),
  categoryId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  subject: z.string().min(1, "Assunto é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  isMassMessage: z.boolean().default(false),
  targetType: z.enum(["individual", "all", "department", "sector", "position"]).optional(),
  targetId: z.number().optional(),
  targetValue: z.string().optional(),
  relatedDocumentId: z.number().optional()
});

const categoryFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().default("#EA580C")
});

type MessageFormData = z.infer<typeof messageFormSchema>;
type CategoryFormData = z.infer<typeof categoryFormSchema>;

export default function Messages() {
  const [selectedTab, setSelectedTab] = useState("inbox");
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showEditMessageDialog, setShowEditMessageDialog] = useState(false);
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false);
  const [selectedTargetType, setSelectedTargetType] = useState<string>("individual");

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Fetch messages based on current tab  
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: [`/api/messages/${selectedTab}`],
  });

  // Fetch message categories
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["/api/message-categories"],
  });

  // Fetch users for recipient selection
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });

  // Fetch departments for message targeting
  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  // Fetch sectors for message targeting
  const { data: sectors = [] } = useQuery({
    queryKey: ["/api/sectors"],
  });

  // Fetch positions for message targeting
  const { data: positions = [] } = useQuery({
    queryKey: ["/api/positions"],
  });

  // Message form
  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      priority: "normal",
      isMassMessage: false
    }
  });

  // Check for document context from localStorage on component mount
  useEffect(() => {
    const docContext = localStorage.getItem('message-doc-context');
    if (docContext) {
      try {
        const context = JSON.parse(docContext);
        if (context.documentId && context.documentTitle) {
          setShowNewMessageDialog(true);
          messageForm.setValue('subject', `Dúvida sobre documento: ${context.documentTitle}`);
          messageForm.setValue('relatedDocumentId', Number(context.documentId));
          localStorage.removeItem('message-doc-context');
        }
      } catch (e) {
        console.error('Error parsing document context:', e);
        localStorage.removeItem('message-doc-context');
      }
    }
  }, []);

  // Category form
  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      color: "#EA580C"
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: MessageFormData) => 
      apiRequest("/api/messages", { 
        method: "POST", 
        body: JSON.stringify({
          ...data,
          companyId: user?.companyId,
          senderId: user?.id,
          isMassMessage: data.recipientId === "all" || data.isMassMessage || data.targetType === "all"
        }) 
      }),
    onSuccess: () => {
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/inbox"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/sent"] });
      setShowNewMessageDialog(false);
      messageForm.reset();
      setSelectedTargetType("individual");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Ocorreu um erro ao enviar a mensagem.",
        variant: "destructive",
      });
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormData) =>
      apiRequest("/api/message-categories", { 
        method: "POST", 
        body: JSON.stringify({
          ...data,
          companyId: user?.companyId
        }) 
      }),
    onSuccess: () => {
      toast({
        title: "Categoria criada",
        description: "Nova categoria de mensagem foi criada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/message-categories"] });
      setShowCategoryDialog(false);
      categoryForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message || "Ocorreu um erro ao criar a categoria.",
        variant: "destructive",
      });
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) =>
      apiRequest(`/api/messages/${messageId}/read`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${selectedTab}`] });
    },
  });

  // Update message mutation
  const updateMessageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MessageFormData> }) =>
      apiRequest(`/api/messages/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({
        title: "Mensagem atualizada",
        description: "A mensagem foi atualizada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${selectedTab}`] });
      setShowEditMessageDialog(false);
      setEditingMessage(null);
      messageForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar mensagem",
        description: error.message || "Ocorreu um erro ao atualizar a mensagem.",
        variant: "destructive",
      });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) =>
      apiRequest(`/api/messages/${messageId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({
        title: "Mensagem excluída",
        description: "A mensagem foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${selectedTab}`] });
      setSelectedMessage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir mensagem",
        description: error.message || "Ocorreu um erro ao excluir a mensagem.",
        variant: "destructive",
      });
    },
  });

  // Archive message mutation
  const archiveMessageMutation = useMutation({
    mutationFn: (messageId: string) =>
      apiRequest(`/api/messages/${messageId}/archive`, { method: "PATCH" }),
    onSuccess: () => {
      toast({
        title: "Mensagem arquivada",
        description: "A mensagem foi arquivada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${selectedTab}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/archived"] });
      setSelectedMessage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao arquivar mensagem",
        description: error.message || "Ocorreu um erro ao arquivar a mensagem.",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryFormData> }) =>
      apiRequest(`/api/message-categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/message-categories"] });
      setShowEditCategoryDialog(false);
      setEditingCategory(null);
      categoryForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message || "Ocorreu um erro ao atualizar a categoria.",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: number) =>
      apiRequest(`/api/message-categories/${categoryId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/message-categories"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message || "Ocorreu um erro ao excluir a categoria.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  const handleCreateCategory = (data: CategoryFormData) => {
    createCategoryMutation.mutate(data);
  };

  const handleEditMessage = (message: any) => {
    setEditingMessage(message);
    messageForm.reset({
      recipientId: message.recipientId || "",
      categoryId: message.categoryId?.toString() || "",
      subject: message.subject || "",
      content: message.content || "",
      priority: message.priority || "normal",
      isMassMessage: message.isMassMessage || false
    });
    setShowEditMessageDialog(true);
  };

  const handleUpdateMessage = (data: MessageFormData) => {
    if (!editingMessage) return;
    updateMessageMutation.mutate({ id: editingMessage.id, data });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm("Tem certeza que deseja excluir esta mensagem?")) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  const handleArchiveMessage = (messageId: string) => {
    archiveMessageMutation.mutate(messageId);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name || "",
      description: category.description || "",
      color: category.color || "#EA580C"
    });
    setShowEditCategoryDialog(true);
  };

  const handleUpdateCategory = (data: CategoryFormData) => {
    if (!editingCategory) return;
    updateCategoryMutation.mutate({ id: editingCategory.id, data });
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleMessageClick = (message: any) => {
    setSelectedMessage(message);
    if (!message?.isRead && selectedTab === 'inbox') {
      markAsReadMutation.mutate(message?.id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-orange-100 text-orange-800";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMessages = Array.isArray(messages) ? messages.filter((message: any) =>
    message?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loadingMessages || loadingCategories || loadingUsers) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar title="Mensagens" />
          <main className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Mensagens" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-orange-800">
                  <MessageCircle className="inline-block h-8 w-8 mr-3 text-orange-600" />
                  Mensageria Corporativa
                </h1>
                <p className="text-gray-600">Gerencie suas mensagens e comunicações</p>
              </div>
            <div className="flex gap-2">
              <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-new-category">
                    <Filter className="h-4 w-4 mr-2" />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Categoria</DialogTitle>
                    <DialogDescription>
                      Crie uma nova categoria para organizar suas mensagens.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...categoryForm}>
                    <form onSubmit={categoryForm.handleSubmit(handleCreateCategory)} className="space-y-4">
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da categoria" {...field} data-testid="input-category-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Descrição da categoria" {...field} data-testid="textarea-category-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor</FormLabel>
                            <FormControl>
                              <Input type="color" {...field} data-testid="input-category-color" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowCategoryDialog(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createCategoryMutation.isPending} data-testid="button-save-category">
                          {createCategoryMutation.isPending ? "Criando..." : "Criar"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-message">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Mensagem
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nova Mensagem</DialogTitle>
                    <DialogDescription>
                      Envie uma mensagem para funcionários ou grupos específicos.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...messageForm}>
                    <form onSubmit={messageForm.handleSubmit(handleSendMessage)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={messageForm.control}
                          name="targetType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Enviar para</FormLabel>
                              <Select onValueChange={(value) => { field.onChange(value); setSelectedTargetType(value); }} value={field.value || "individual"}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-target-type">
                                    <SelectValue placeholder="Tipo de destinatário" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="individual">Pessoa específica</SelectItem>
                                  <SelectItem value="all">Todos os funcionários</SelectItem>
                                  <SelectItem value="department">Departamento</SelectItem>
                                  <SelectItem value="sector">Setor</SelectItem>
                                  <SelectItem value="position">Função/Cargo</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {selectedTargetType === "individual" && (
                          <FormField
                            control={messageForm.control}
                            name="recipientId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Funcionário</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-recipient">
                                      <SelectValue placeholder="Selecione a pessoa" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Array.isArray(users) ? users.map((user: any) => (
                                      <SelectItem key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName}
                                      </SelectItem>
                                    )) : null}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        
                        {selectedTargetType === "department" && (
                          <FormField
                            control={messageForm.control}
                            name="targetId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Departamento</FormLabel>
                                <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-department">
                                      <SelectValue placeholder="Selecione o departamento" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Array.isArray(departments) ? departments.map((dept: any) => (
                                      <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.name}
                                      </SelectItem>
                                    )) : null}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        
                        {selectedTargetType === "sector" && (
                          <FormField
                            control={messageForm.control}
                            name="targetId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Setor</FormLabel>
                                <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-sector">
                                      <SelectValue placeholder="Selecione o setor" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Array.isArray(sectors) ? sectors.map((sector: any) => (
                                      <SelectItem key={sector.id} value={sector.id.toString()}>
                                        {sector.name}
                                      </SelectItem>
                                    )) : null}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        
                        {selectedTargetType === "position" && (
                          <FormField
                            control={messageForm.control}
                            name="targetValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Função/Cargo</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-position">
                                      <SelectValue placeholder="Selecione o cargo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Array.isArray(positions) ? positions.map((position: string) => (
                                      <SelectItem key={position} value={position}>
                                        {position}
                                      </SelectItem>
                                    )) : null}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        
                        {selectedTargetType !== "all" && (
                          <FormField
                            control={messageForm.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Categoria</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-category">
                                      <SelectValue placeholder="Selecione a categoria" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Array.isArray(categories) ? categories.map((category: any) => (
                                      <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                      </SelectItem>
                                    )) : null}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={messageForm.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assunto</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite o assunto" {...field} data-testid="input-subject" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={messageForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prioridade</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-priority">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Baixa</SelectItem>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="high">Alta</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={messageForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conteúdo</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Digite o conteúdo da mensagem" 
                                rows={6} 
                                {...field} 
                                data-testid="textarea-content" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowNewMessageDialog(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={sendMessageMutation.isPending} data-testid="button-send-message">
                          <Send className="h-4 w-4 mr-2" />
                          {sendMessageMutation.isPending ? "Enviando..." : "Enviar"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              {/* Edit Message Dialog */}
              <Dialog open={showEditMessageDialog} onOpenChange={setShowEditMessageDialog}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Editar Mensagem</DialogTitle>
                    <DialogDescription>
                      Atualize as informações da mensagem.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...messageForm}>
                    <form onSubmit={messageForm.handleSubmit(handleUpdateMessage)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={messageForm.control}
                          name="recipientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Destinatário</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-recipient-edit">
                                    <SelectValue placeholder="Selecione o destinatário" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="all">
                                    <Users className="h-4 w-4 mr-2" />
                                    Todos os funcionários
                                  </SelectItem>
                                  {Array.isArray(users) ? users.map((user: any) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.firstName} {user.lastName}
                                    </SelectItem>
                                  )) : null}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={messageForm.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categoria</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-category-edit">
                                    <SelectValue placeholder="Selecione a categoria" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.isArray(categories) ? categories.map((category: any) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
                                    </SelectItem>
                                  )) : null}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={messageForm.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assunto</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite o assunto" {...field} data-testid="input-subject-edit" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={messageForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prioridade</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-priority-edit">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Baixa</SelectItem>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="high">Alta</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={messageForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conteúdo</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Digite o conteúdo da mensagem" 
                                rows={6} 
                                {...field} 
                                data-testid="textarea-content-edit" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowEditMessageDialog(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={updateMessageMutation.isPending} data-testid="button-update-message">
                          {updateMessageMutation.isPending ? "Atualizando..." : "Atualizar"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              {/* Edit Category Dialog */}
              <Dialog open={showEditCategoryDialog} onOpenChange={setShowEditCategoryDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Categoria</DialogTitle>
                    <DialogDescription>
                      Atualize as informações da categoria.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...categoryForm}>
                    <form onSubmit={categoryForm.handleSubmit(handleUpdateCategory)} className="space-y-4">
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da categoria" {...field} data-testid="input-category-name-edit" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Descrição da categoria" {...field} data-testid="textarea-category-description-edit" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor</FormLabel>
                            <FormControl>
                              <Input type="color" {...field} data-testid="input-category-color-edit" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowEditCategoryDialog(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={updateCategoryMutation.isPending} data-testid="button-update-category">
                          {updateCategoryMutation.isPending ? "Atualizando..." : "Atualizar"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left Column - Message List */}
            <div className="col-span-5 space-y-4">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        placeholder="Pesquisar mensagens..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-messages"
                      />
                    </div>
                  </div>
                  
                  <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="inbox" data-testid="tab-inbox">Recebidas</TabsTrigger>
                      <TabsTrigger value="sent" data-testid="tab-sent">Enviadas</TabsTrigger>
                      <TabsTrigger value="archived" data-testid="tab-archived">Arquivadas</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Message List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma mensagem encontrada</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredMessages.map((message: any) => (
                    <Card 
                      key={message.id} 
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedMessage?.id === message.id ? 'ring-2 ring-blue-500' : ''
                      } ${!message.isRead ? 'bg-orange-50 border-orange-200' : ''}`}
                      onClick={() => handleMessageClick(message)}
                      data-testid={`card-message-${message.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">
                              {message.sender?.name || "Sistema"}
                            </h4>
                            {!message.isRead && (
                              <div className="w-2 h-2 bg-orange-600 rounded-full" />
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge className={getPriorityColor(message.priority)}>
                              {message.priority === 'high' ? 'Alta' : 
                               message.priority === 'low' ? 'Baixa' : 'Normal'}
                            </Badge>
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="font-medium text-sm mb-1">{message.subject}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{message.content}</p>
                        {message.category && (
                          <Badge 
                            variant="outline" 
                            className="mt-2"
                            style={{ borderColor: message.category.color, color: message.category.color }}
                          >
                            {message.category.name}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Right Column - Message Details */}
            <div className="col-span-7">
              {selectedMessage ? (
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {selectedMessage.subject}
                          <Badge className={getPriorityColor(selectedMessage.priority)}>
                            {selectedMessage.priority === 'high' ? 'Alta' : 
                             selectedMessage.priority === 'low' ? 'Baixa' : 'Normal'}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          De: {selectedMessage.sender?.name || "Sistema"} • 
                          {formatDate(selectedMessage.createdAt)}
                          {selectedMessage.category && (
                            <>
                              {' • '}
                              <Badge 
                                variant="outline"
                                style={{ borderColor: selectedMessage.category.color, color: selectedMessage.category.color }}
                              >
                                {selectedMessage.category.name}
                              </Badge>
                            </>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedMessage.isRead ? (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Lida
                          </Badge>
                        ) : (
                          <Badge className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            Nova
                          </Badge>
                        )}
                        <div className="flex gap-1">
                          {/* Botão Editar: apenas para mensagens recebidas (inbox) */}
                          {selectedTab === "inbox" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditMessage(selectedMessage)}
                              data-testid="button-edit-message"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                          )}
                          
                          {/* Botão Arquivar: apenas para inbox e sent */}
                          {(selectedTab === "inbox" || selectedTab === "sent") && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleArchiveMessage(selectedMessage.id)}
                              data-testid="button-archive-message"
                            >
                              <Archive className="h-3 w-3 mr-1" />
                              Arquivar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none" data-testid="message-content">
                      <p className="whitespace-pre-wrap text-gray-700">
                        {selectedMessage.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full">
                  <CardContent className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Selecione uma mensagem</p>
                      <p>Clique em uma mensagem para visualizar seu conteúdo</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}