import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Upload, Download, Calendar, Loader2 } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { useQuery } from "@tanstack/react-query";
import { Document } from "@shared/schema";

export default function Documents() {
  // Fetch documents from API
  const { data: documents = [], isLoading, error } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Calculate stats from real data
  const pendingDocs = documents.filter(doc => !doc.assignedTo).length;
  const receivedDocs = documents.filter(doc => doc.assignedTo).length;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Gestão de Documentos" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
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
                <Upload className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <Button className="w-full" data-testid="button-upload-document">
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
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

          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Documentos Recentes
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
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum documento encontrado</p>
                  <p className="text-sm text-muted-foreground mt-1">Comece fazendo upload do seu primeiro documento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc, index) => (
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
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        doc.assignedTo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {doc.assignedTo ? 'Atribuído' : 'Pendente'}
                      </span>
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