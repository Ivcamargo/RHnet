import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Download, Calendar, Loader2, Edit, Trash2, Search, Filter, MessageCircle } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Document } from "@shared/schema";
import { useLocation } from "wouter";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema for document form validation
const documentFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  assignedTo: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentFormSchema>;

// Schema for upload form
const uploadFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  assignedTo: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;

export default function Documents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch documents from API
  const { data: documents = [], isLoading, error } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Fetch users for assignment dropdown
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Form for editing documents
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      assignedTo: "",
    },
  });

  // Form for uploading documents
  const uploadForm = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      assignedTo: "none",
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, title, assignedTo }: { file: File; title: string; assignedTo?: string | null }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('mimeType', file.type);
      if (assignedTo && assignedTo !== 'none') {
        formData.append('assignedTo', assignedTo);
      }
      
      return fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      }).then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setShowUploadDialog(false);
      setSelectedFile(null);
      uploadForm.reset();
      toast({
        title: "Sucesso!",
        description: "Documento enviado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao enviar documento. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DocumentFormData> }) =>
      apiRequest(`/api/documents/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setShowEditDialog(false);
      setEditingDocument(null);
      form.reset();
      toast({
        title: "Documento atualizado",
        description: "O documento foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar documento",
        description: error.message || "Ocorreu um erro ao atualizar o documento.",
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) =>
      apiRequest(`/api/documents/${documentId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir documento",
        description: error.message || "Ocorreu um erro ao excluir o documento.",
        variant: "destructive",
      });
    },
  });

  // Calculate stats from real data
  const pendingDocs = documents.filter(doc => !doc.assignedTo).length;
  const receivedDocs = documents.filter(doc => doc.assignedTo).length;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      uploadForm.setValue('title', file.name);
      setShowUploadDialog(true);
    }
  };

  const handleUploadSubmit = (data: UploadFormData) => {
    if (!selectedFile) return;
    uploadMutation.mutate({
      file: selectedFile,
      title: data.title,
      assignedTo: data.assignedTo === 'none' ? null : data.assignedTo
    });
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    form.reset({
      title: document.title || "",
      assignedTo: document.assignedTo || "none",
    });
    setShowEditDialog(true);
  };

  const handleUpdateDocument = (data: DocumentFormData) => {
    if (!editingDocument) return;
    const updateData = {
      ...data,
      assignedTo: data.assignedTo === "none" ? null : data.assignedTo
    };
    updateDocumentMutation.mutate({ id: editingDocument.id, data: updateData });
  };

  const handleDeleteDocument = (documentId: string) => {
    if (confirm("Tem certeza que deseja excluir este documento?")) {
      deleteDocumentMutation.mutate(documentId);
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.title;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o documento.",
        variant: "destructive",
      });
    }
  };

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Gestão de Documentos" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">
              Documentos
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus documentos e arquivos de forma segura
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enviar Documento</CardTitle>
                <Upload className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <label htmlFor="file-upload" className="w-full">
                      <Button 
                        className="w-full" 
                        data-testid="button-upload-document"
                        disabled={uploadMutation.isPending}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Fazer Upload
                        </span>
                      </Button>
                    </label>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enviar Documento</DialogTitle>
                    </DialogHeader>
                    <Form {...uploadForm}>
                      <form onSubmit={uploadForm.handleSubmit(handleUploadSubmit)} className="space-y-4">
                        <FormField
                          control={uploadForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome do documento" {...field} data-testid="input-upload-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={uploadForm.control}
                          name="assignedTo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Enviar para</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-upload-assigned-to">
                                    <SelectValue placeholder="Selecione um destinatário" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">Todos da empresa</SelectItem>
                                  {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.firstName} {user.lastName} ({user.role})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={uploadMutation.isPending} data-testid="button-submit-upload">
                            {uploadMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              'Enviar'
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos Pendentes</CardTitle>
                <FileText className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <div className="text-2xl font-bold">{pendingDocs}</div>
                )}
                <p className="text-xs text-muted-foreground">Para enviar</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos Recebidos</CardTitle>
                <Download className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <div className="text-2xl font-bold">{receivedDocs}</div>
                )}
                <p className="text-xs text-muted-foreground">Do RH</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Pesquisar documentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-documents"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Documentos ({filteredDocuments.length})
                </div>
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Documento</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleUpdateDocument)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título</FormLabel>
                              <FormControl>
                                <Input placeholder="Título do documento" {...field} data-testid="input-document-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="assignedTo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Atribuído para</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-assigned-to">
                                    <SelectValue placeholder="Selecione um usuário" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">Nenhum</SelectItem>
                                  {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.firstName} {user.lastName} ({user.role})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={updateDocumentMutation.isPending} data-testid="button-update-document">
                            {updateDocumentMutation.isPending ? "Atualizando..." : "Atualizar"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3">
                      <Skeleton className="h-5 w-5" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Erro ao carregar documentos</p>
                  <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                    Tentar novamente
                  </Button>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum documento encontrado</p>
                  <p className="text-sm text-muted-foreground mt-1">Comece fazendo upload do seu primeiro documento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDocuments.map((doc, index) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`document-item-${index}`}>
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.mimeType} • {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          doc.assignedTo 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.assignedTo ? 'Atribuído' : 'Pendente'}
                        </span>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              localStorage.setItem('message-doc-context', JSON.stringify({
                                documentId: doc.id,
                                documentTitle: doc.title
                              }));
                              setLocation('/messages');
                            }}
                            title="Tirar dúvida sobre este documento"
                            data-testid={`button-ask-${index}`}
                          >
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDownloadDocument(doc)}
                            data-testid={`button-download-${index}`}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditDocument(doc)}
                            data-testid={`button-edit-${index}`}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteDocument(doc.id)}
                            data-testid={`button-delete-${index}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}