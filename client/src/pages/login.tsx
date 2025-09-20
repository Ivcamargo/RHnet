import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import rhnetLogo from "@assets/rhnetp_1757765662344.jpg";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erro no login");
      }

      // Login bem-sucedido - invalida cache de autenticação
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${result.user.firstName}!`,
      });

      // Verifica se precisa mudar senha
      if (result.user.mustChangePassword) {
        setLocation("/set-password");
      } else {
        // Redireciona para a página principal
        setLocation("/");
      }

    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-teal-700 p-4 relative">
      {/* Logo Watermark */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center"
      >
        <img 
          src={rhnetLogo} 
          alt="RHNet Logo Watermark"
          className="w-96 h-96 opacity-30"
          style={{
            filter: 'brightness(1.5) contrast(1.2)',
            mixBlendMode: 'overlay'
          }}
          onError={(e) => console.error('Erro carregando logo:', e)}
          onLoad={() => console.log('Logo carregada com sucesso')}
        />
      </div>
      
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">RHNet</CardTitle>
          <CardDescription>
            Sistema de Gestão de Recursos Humanos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...form.register("email")}
                data-testid="input-email"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...form.register("password")}
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Link para registro apenas se não houver superadmin */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/register">
                <Button variant="link" className="p-0 h-auto" data-testid="link-register">
                  Cadastre-se
                </Button>
              </Link>
            </p>
            
            <p className="text-sm text-muted-foreground">
              Esqueceu sua senha?{" "}
              <Link href="/forgot-password">
                <Button variant="link" className="p-0 h-auto text-primary" data-testid="link-forgot-password">
                  Clique aqui
                </Button>
              </Link>
            </p>
          </div>

          {/* Informação para admins */}
          <Alert className="mt-4">
            <AlertDescription className="text-sm">
              <strong>Para administradores:</strong> Se você foi criado pelo sistema, 
              use o email cadastrado e solicite uma senha ao superadmin.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}