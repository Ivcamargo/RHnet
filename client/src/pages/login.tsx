import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import rhnetLogo from "@assets/rhnetp_1757765662344.jpg";
import loginLogo from "@assets/rhnetp_1758411296813.jpg";

const loginSchema = z.object({
  email: z.string().min(1, "Email ou CPF é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const initSchema = z.object({
  email: z.string().email("Email inválido"),
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type InitFormData = z.infer<typeof initSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInitForm, setShowInitForm] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const initForm = useForm<InitFormData>({
    resolver: zodResolver(initSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
    },
  });

  // Check if system has a superadmin on mount
  useEffect(() => {
    const checkSuperadmin = async () => {
      try {
        const response = await apiRequest("/api/auth/has-superadmin");
        const data = await response.json();
        setShowInitForm(!data.hasSuperadmin);
      } catch (error) {
        console.error("Error checking superadmin:", error);
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkSuperadmin();
  }, []);

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

  const onInitSubmit = async (data: InitFormData) => {
    setIsLoading(true);
    try {
      // Create first superadmin
      const initResponse = await apiRequest("/api/setup/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const initResult = await initResponse.json();

      if (!initResponse.ok) {
        throw new Error(initResult.message || "Erro na inicialização");
      }

      toast({
        title: "Sistema inicializado!",
        description: "Primeiro administrador criado com sucesso. Fazendo login...",
      });

      // Auto-login after creating superadmin
      const loginResponse = await apiRequest("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const loginResult = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginResult.message || "Erro no login");
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Login realizado!",
        description: `Bem-vindo(a), ${loginResult.user.firstName}!`,
      });

      setLocation("/");

    } catch (error) {
      console.error("Erro na inicialização:", error);
      toast({
        title: "Erro na inicialização",
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
          <img 
            src={loginLogo} 
            alt="RHNet Logo"
            className="mx-auto mb-4 max-w-[280px] h-auto"
          />
        </CardHeader>
        <CardContent>
          {checkingAdmin ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : showInitForm ? (
            <>
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription>
                  Sistema não inicializado. Crie o primeiro administrador do sistema abaixo.
                </AlertDescription>
              </Alert>
              
              <form onSubmit={initForm.handleSubmit(onInitSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="init-email">Email *</Label>
                  <Input
                    id="init-email"
                    type="email"
                    placeholder="admin@exemplo.com"
                    {...initForm.register("email")}
                    data-testid="input-init-email"
                  />
                  {initForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {initForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="init-firstName">Nome *</Label>
                    <Input
                      id="init-firstName"
                      type="text"
                      placeholder="João"
                      {...initForm.register("firstName")}
                      data-testid="input-init-firstName"
                    />
                    {initForm.formState.errors.firstName && (
                      <p className="text-sm text-destructive">
                        {initForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="init-lastName">Sobrenome *</Label>
                    <Input
                      id="init-lastName"
                      type="text"
                      placeholder="Silva"
                      {...initForm.register("lastName")}
                      data-testid="input-init-lastName"
                    />
                    {initForm.formState.errors.lastName && (
                      <p className="text-sm text-destructive">
                        {initForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="init-password">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="init-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...initForm.register("password")}
                      data-testid="input-init-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-init-password"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {initForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {initForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-init-system"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inicializando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Inicializar Sistema
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email ou CPF</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="seu@email.com ou 000.000.000-00"
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

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Esqueceu sua senha?{" "}
                  <Link href="/forgot-password">
                    <Button variant="link" className="p-0 h-auto text-primary" data-testid="link-forgot-password">
                      Clique aqui
                    </Button>
                  </Link>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}