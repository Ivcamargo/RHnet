import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, FileText, Upload, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const manualEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  clockInTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Horário de entrada inválido"),
  clockOutTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Horário de saída inválido").optional(),
  justification: z.string().min(10, "Justificativa deve ter pelo menos 10 caracteres"),
  supportDocumentUrl: z.string().optional(),
});

type ManualEntryForm = z.infer<typeof manualEntrySchema>;

export default function ManualTimeEntry() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{url: string, filename: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ManualEntryForm>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      clockInTime: '',
      clockOutTime: '',
      justification: '',
      supportDocumentUrl: '',
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('certificate', file);
      
      const response = await fetch('/api/time-clock/upload-certificate', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Falha no upload do arquivo');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedFile({ url: data.url, filename: data.originalName });
      form.setValue('supportDocumentUrl', data.url);
      toast({
        title: "Arquivo enviado",
        description: "Atestado médico enviado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no upload",
        description: error.message || "Falha ao enviar o arquivo.",
        variant: "destructive",
      });
    },
  });

  const createManualEntryMutation = useMutation({
    mutationFn: (data: ManualEntryForm) => 
      apiRequest('/api/time-clock/manual-entry', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Entrada manual criada",
        description: "Sua solicitação foi enviada para aprovação do supervisor.",
      });
      form.reset();
      setUploadedFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
    },
    onError: (error: any) => {
      const isPeriodClosed = error.code === "PERIOD_CLOSED";
      toast({
        title: isPeriodClosed ? "Período Fechado" : "Erro ao criar entrada manual",
        description: isPeriodClosed 
          ? "Este período foi fechado pelo administrador. Não é possível registrar ponto para esta data."
          : error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Apenas arquivos JPG, PNG ou PDF são permitidos.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    form.setValue('supportDocumentUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ManualEntryForm) => {
    setIsSubmitting(true);
    try {
      await createManualEntryMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <FileText className="h-5 w-5" />
          Inclusão Manual de Horário
        </CardTitle>
        <p className="text-sm text-orange-600">
          Preencha os dados para solicitar uma inclusão manual de horário. Esta solicitação será enviada para aprovação do supervisor.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="w-full"
                      data-testid="input-manual-entry-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clockInTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horário de Entrada
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        className="w-full"
                        data-testid="input-manual-entry-clock-in"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clockOutTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horário de Saída (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        className="w-full"
                        data-testid="input-manual-entry-clock-out"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justificativa *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o motivo da inclusão manual (esquecimento, problemas técnicos, etc.)"
                      className="min-h-[100px]"
                      {...field}
                      data-testid="textarea-manual-entry-justification"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Atestado Médico (Opcional)
              </FormLabel>
              
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="input-certificate-file"
                  />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm text-orange-600 mb-2">
                    Envie o atestado médico ou documento justificativo
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    data-testid="button-select-certificate"
                  >
                    {isUploading ? "Enviando..." : "Selecionar Arquivo"}
                  </Button>
                  <p className="text-xs text-orange-500 mt-2">
                    Formatos aceitos: JPG, PNG, PDF (máx. 5MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      {uploadedFile.filename}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={removeFile}
                    data-testid="button-remove-certificate"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const now = getCurrentDateTime();
                  form.setValue('clockInTime', now);
                }}
                className="flex-1"
                data-testid="button-set-current-time-in"
              >
                <Clock className="h-4 w-4 mr-2" />
                Entrada Agora
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const now = getCurrentDateTime();
                  form.setValue('clockOutTime', now);
                }}
                className="flex-1"
                data-testid="button-set-current-time-out"
              >
                <Clock className="h-4 w-4 mr-2" />
                Saída Agora
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={isSubmitting || createManualEntryMutation.isPending}
              data-testid="button-submit-manual-entry"
            >
              {isSubmitting || createManualEntryMutation.isPending ? (
                "Enviando..."
              ) : (
                "Enviar para Aprovação"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}