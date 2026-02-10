import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Form schema matching backend insertLeadSchema
const leadCaptureSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  message: z.string().optional(),
});

type LeadCaptureForm = z.infer<typeof leadCaptureSchema>;

interface LeadCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LeadCaptureDialog({ open, onOpenChange, onSuccess: onSuccessCallback }: LeadCaptureDialogProps) {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<LeadCaptureForm>({
    resolver: zodResolver(leadCaptureSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      companyName: "",
      message: "",
    },
  });

  const submitLeadMutation = useMutation({
    mutationFn: async (data: LeadCaptureForm) => {
      return apiRequest("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();

      // Close dialog after 2 seconds
      setTimeout(() => {
        onOpenChange(false);
        setIsSubmitted(false);
        
        // Call parent success callback after dialog closes
        if (onSuccessCallback) {
          onSuccessCallback();
        }
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao enviar contato",
        description: error.message || "Por favor, tente novamente.",
      });
    },
  });

  const onSubmit = (data: LeadCaptureForm) => {
    submitLeadMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] bg-clip-text text-transparent">
            Novo Cliente
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Preencha seus dados e entraremos em contato para apresentar o RHNet e agendar uma demonstração personalizada.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-8 text-center">
            <div className="mb-4 text-6xl">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Obrigado pelo seu interesse!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Recebemos seu contato e retornaremos em breve.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Seu nome completo" 
                        {...field} 
                        data-testid="input-lead-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="seu@email.com" 
                          {...field} 
                          data-testid="input-lead-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(11) 98765-4321" 
                          {...field} 
                          data-testid="input-lead-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome da sua empresa" 
                        {...field} 
                        data-testid="input-lead-company"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Conte-nos um pouco sobre suas necessidades de RH..." 
                        className="min-h-[100px]" 
                        {...field} 
                        data-testid="input-lead-message"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={submitLeadMutation.isPending}
                  data-testid="button-cancel-lead"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitLeadMutation.isPending}
                  className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] text-white hover:opacity-90"
                  data-testid="button-submit-lead"
                >
                  {submitLeadMutation.isPending ? "Enviando..." : "Enviar Contato"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
