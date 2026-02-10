import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileText, Download, Upload, FileCheck, Calendar } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

export default function ArquivosLegais() {
  const { toast } = useToast();
  const [showExportAFDDialog, setShowExportAFDDialog] = useState(false);
  const [showExportAEJDialog, setShowExportAEJDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [afdPeriodStart, setAfdPeriodStart] = useState("");
  const [afdPeriodEnd, setAfdPeriodEnd] = useState("");
  const [aejPeriodStart, setAejPeriodStart] = useState("");
  const [aejPeriodEnd, setAejPeriodEnd] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);

  // Fetch legal files
  const { data: legalFiles = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/legal-files"],
  });

  // Export AFD mutation
  const exportAFDMutation = useMutation({
    mutationFn: async (data: { periodStart: string; periodEnd: string }) =>
      apiRequest("/api/legal-files/afd/export", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "AFD Gerado",
        description: "Arquivo AFD gerado com sucesso",
      });
      setShowExportAFDDialog(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar AFD",
        variant: "destructive",
      });
    },
  });

  // Export AEJ mutation
  const exportAEJMutation = useMutation({
    mutationFn: async (data: { periodStart: string; periodEnd: string }) =>
      apiRequest("/api/legal-files/aej/export", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "AEJ Gerado",
        description: "Arquivo AEJ gerado com sucesso",
      });
      setShowExportAEJDialog(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar AEJ",
        variant: "destructive",
      });
    },
  });

  // Import AFD mutation
  const importAFDMutation = useMutation({
    mutationFn: async (fileContent: string) =>
      apiRequest("/api/legal-files/afd/import", {
        method: "POST",
        body: JSON.stringify({ fileContent }),
      }),
    onSuccess: (data: any) => {
      toast({
        title: "AFD Importado",
        description: `${data.imported} registros importados com sucesso`,
      });
      setShowImportDialog(false);
      setImportFile(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao importar AFD",
        variant: "destructive",
      });
    },
  });

  const handleExportAFD = () => {
    if (!afdPeriodStart || !afdPeriodEnd) {
      toast({
        title: "Erro",
        description: "Período obrigatório",
        variant: "destructive",
      });
      return;
    }

    exportAFDMutation.mutate({
      periodStart: afdPeriodStart,
      periodEnd: afdPeriodEnd,
    });
  };

  const handleExportAEJ = () => {
    if (!aejPeriodStart || !aejPeriodEnd) {
      toast({
        title: "Erro",
        description: "Período obrigatório",
        variant: "destructive",
      });
      return;
    }

    exportAEJMutation.mutate({
      periodStart: aejPeriodStart,
      periodEnd: aejPeriodEnd,
    });
  };

  const handleImportAFD = async () => {
    if (!importFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await importFile.text();
      importAFDMutation.mutate(text);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao ler arquivo",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (fileId: number) => {
    try {
      window.open(`/api/legal-files/${fileId}/download`, '_blank');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao baixar arquivo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Arquivos Legais" />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Arquivos Legais</h1>
            <p className="text-muted-foreground">
              Geração e importação de arquivos AFD e AEJ conforme Portaria 671/2021
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Export AFD */}
            <Dialog open={showExportAFDDialog} onOpenChange={setShowExportAFDDialog}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" data-testid="card-export-afd">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Exportar AFD
                    </CardTitle>
                    <CardDescription>
                      Arquivo Fonte de Dados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Gerar AFD com todas as marcações de ponto do período
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exportar AFD</DialogTitle>
                  <DialogDescription>
                    Selecione o período para gerar o Arquivo Fonte de Dados
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="afd-start">Data Início</Label>
                    <Input
                      id="afd-start"
                      type="date"
                      value={afdPeriodStart}
                      onChange={(e) => setAfdPeriodStart(e.target.value)}
                      data-testid="input-afd-start"
                    />
                  </div>
                  <div>
                    <Label htmlFor="afd-end">Data Fim</Label>
                    <Input
                      id="afd-end"
                      type="date"
                      value={afdPeriodEnd}
                      onChange={(e) => setAfdPeriodEnd(e.target.value)}
                      data-testid="input-afd-end"
                    />
                  </div>
                  <Button
                    onClick={handleExportAFD}
                    disabled={exportAFDMutation.isPending}
                    className="w-full"
                    data-testid="button-export-afd"
                  >
                    {exportAFDMutation.isPending ? "Gerando..." : "Gerar AFD"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Export AEJ */}
            <Dialog open={showExportAEJDialog} onOpenChange={setShowExportAEJDialog}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" data-testid="card-export-aej">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5" />
                      Exportar AEJ
                    </CardTitle>
                    <CardDescription>
                      Arquivo Eletrônico de Jornada
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Gerar AEJ com jornadas consolidadas do período
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exportar AEJ</DialogTitle>
                  <DialogDescription>
                    Selecione o período para gerar o Arquivo Eletrônico de Jornada
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="aej-start">Data Início</Label>
                    <Input
                      id="aej-start"
                      type="date"
                      value={aejPeriodStart}
                      onChange={(e) => setAejPeriodStart(e.target.value)}
                      data-testid="input-aej-start"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aej-end">Data Fim</Label>
                    <Input
                      id="aej-end"
                      type="date"
                      value={aejPeriodEnd}
                      onChange={(e) => setAejPeriodEnd(e.target.value)}
                      data-testid="input-aej-end"
                    />
                  </div>
                  <Button
                    onClick={handleExportAEJ}
                    disabled={exportAEJMutation.isPending}
                    className="w-full"
                    data-testid="button-export-aej"
                  >
                    {exportAEJMutation.isPending ? "Gerando..." : "Gerar AEJ"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Import AFD */}
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" data-testid="card-import-afd">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Importar AFD
                    </CardTitle>
                    <CardDescription>
                      Importar arquivo externo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Importar marcações de arquivo AFD externo
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importar AFD</DialogTitle>
                  <DialogDescription>
                    Selecione um arquivo AFD para importar as marcações
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="import-file">Arquivo AFD</Label>
                    <Input
                      id="import-file"
                      type="file"
                      accept=".txt"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      data-testid="input-import-file"
                    />
                  </div>
                  <Button
                    onClick={handleImportAFD}
                    disabled={importAFDMutation.isPending || !importFile}
                    className="w-full"
                    data-testid="button-import-afd"
                  >
                    {importAFDMutation.isPending ? "Importando..." : "Importar AFD"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Files History */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Arquivos</CardTitle>
              <CardDescription>
                Arquivos AFD e AEJ gerados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : legalFiles.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum arquivo gerado ainda</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comece exportando um arquivo AFD ou AEJ
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Registros</TableHead>
                      <TableHead>Data Geração</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {legalFiles.map((file) => (
                      <TableRow key={file.id} data-testid={`file-row-${file.id}`}>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            file.type === 'AFD' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {file.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(file.periodStart).toLocaleDateString('pt-BR')} - {new Date(file.periodEnd).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{file.totalRecords || 0}</TableCell>
                        <TableCell>
                          {new Date(file.generatedAt).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            {file.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(file.id)}
                            data-testid={`button-download-${file.id}`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Baixar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
