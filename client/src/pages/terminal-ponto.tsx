import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Clock, User, LogOut } from "lucide-react";
import TerminalFacialRecognition from "@/components/time-clock/terminal-facial-recognition";
import loginLogo from "@assets/rhnetp_1758411296813.jpg";

type Device = {
  id: number;
  deviceName: string;
  location: string;
  companyId: number;
  companyName: string;
};

type Employee = {
  token: string;
  userId: string;
  name: string;
  cpf: string | null;
  email: string | null;
  departmentId: number | null;
  deviceId: number;
};

export default function TerminalPonto() {
  const { toast } = useToast();
  const [step, setStep] = useState<'device' | 'login' | 'clock'>('device');
  const [deviceCode, setDeviceCode] = useState('');
  const [device, setDevice] = useState<Device | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [showFacialRecognition, setShowFacialRecognition] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);

  // Validate device
  const validateDevice = async () => {
    if (!deviceCode.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite o código do dispositivo",
      });
      return;
    }

    try {
      const response = await fetch(`/api/terminals/${deviceCode}/validate`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setDevice(data.device);
        setStep('login');
        toast({
          title: "Dispositivo validado",
          description: `${data.device.deviceName} - ${data.device.location}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: data.message || "Dispositivo não autorizado",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao validar dispositivo",
      });
    }
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/terminals/${deviceCode}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha no login');
      }

      return response.json();
    },
    onSuccess: (data: Employee) => {
      setEmployee(data);
      setIdentifier(''); // Limpa identifier
      setPassword(''); // Limpa password
      setStep('clock');
      toast({
        title: "Login realizado",
        description: `Bem-vindo, ${data.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error.message,
      });
      setPassword('');
    }
  });

  // Handle facial recognition complete
  const handleFacialRecognitionComplete = (photoDataUrl: string | null) => {
    setShowFacialRecognition(false);
    setCapturedPhotoUrl(photoDataUrl);
    
    // After photo capture, proceed with clock
    clockMutation.mutate();
  };

  // Handle facial recognition cancel
  const handleFacialRecognitionCancel = () => {
    setShowFacialRecognition(false);
  };

  // Clock in/out mutation
  const clockMutation = useMutation({
    mutationFn: async () => {
      if (!employee) throw new Error('Employee not found');

      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocalização não suportada'));
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(new Error(`Erro ao obter localização: ${err.message}`)),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      const response = await fetch(`/api/terminals/${deviceCode}/clock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: employee.token,
          location: device?.location || 'Terminal',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          photoUrl: capturedPhotoUrl
        })
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Display validation messages if present
        if (error.validationMessages && error.validationMessages.length > 0) {
          error.validationMessages.forEach((msg: string) => {
            toast({
              variant: "destructive",
              title: "Validação de Localização",
              description: msg,
              duration: 5000,
            });
          });
        }
        
        throw new Error(error.message || 'Falha ao registrar ponto');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Display validation messages (success)
      if (data.validationMessages && data.validationMessages.length > 0) {
        data.validationMessages.forEach((msg: string) => {
          toast({
            title: "Validação",
            description: msg,
            duration: 3000,
          });
        });
      }

      toast({
        title: data.action === 'clock_in' ? '✓ Entrada registrada' : '✓ Saída registrada',
        description: data.message,
        duration: 3000,
      });
      
      // Logout imediato e retorna para tela de login
      handleLogout();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
        duration: 5000,
      });
    }
  });

  const handleLogout = () => {
    setEmployee(null);
    setIdentifier('');
    setPassword('');
    setStep('login');
  };

  const handleClock = () => {
    // Show facial recognition modal
    setShowFacialRecognition(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo Header */}
        <div className="text-center mb-3">
          <img 
            src={loginLogo} 
            alt="RHNet Logo"
            className="mx-auto max-w-[180px] h-auto"
          />
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-8 w-8" />
              {step === 'device' && 'Identificar Dispositivo'}
              {step === 'login' && 'Login do Funcionário'}
              {step === 'clock' && 'Registrar Ponto'}
            </CardTitle>
            {device && (
              <CardDescription className="text-blue-100 text-base">
                {device.companyName} - {device.deviceName} - {device.location}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="p-8">
            {/* Step 1: Device Code */}
            {step === 'device' && (
              <div className="space-y-6">
                <div>
                  <label className="text-lg font-medium mb-3 block">Código do Dispositivo</label>
                  <Input
                    type="text"
                    placeholder="Ex: TERM-001"
                    value={deviceCode}
                    onChange={(e) => setDeviceCode(e.target.value.toUpperCase())}
                    className="text-xl h-16"
                    data-testid="input-device-code"
                    onKeyDown={(e) => e.key === 'Enter' && validateDevice()}
                  />
                </div>
                <Button
                  onClick={validateDevice}
                  size="lg"
                  className="w-full h-16 text-xl bg-[hsl(220,65%,18%)] hover:bg-[hsl(220,65%,25%)]"
                  data-testid="button-validate-device"
                >
                  <LogIn className="mr-2 h-6 w-6" />
                  Validar Dispositivo
                </Button>
              </div>
            )}

            {/* Step 2: Employee Login */}
            {step === 'login' && (
              <div className="space-y-6">
                <div>
                  <label className="text-lg font-medium mb-3 block">CPF, E-mail ou Registro Interno</label>
                  <Input
                    type="text"
                    placeholder="Digite seu CPF, e-mail ou registro"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="text-xl h-16"
                    data-testid="input-identifier"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-lg font-medium mb-3 block">Senha</label>
                  <Input
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-xl h-16"
                    data-testid="input-password"
                    autoComplete="new-password"
                    onKeyDown={(e) => e.key === 'Enter' && loginMutation.mutate()}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setStep('device');
                      setDevice(null);
                      setDeviceCode('');
                      setIdentifier('');
                      setPassword('');
                    }}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-16 text-lg"
                    data-testid="button-back-device"
                  >
                    SAIR
                  </Button>
                  <Button
                    onClick={() => loginMutation.mutate()}
                    disabled={!identifier || !password || loginMutation.isPending}
                    size="lg"
                    className="flex-1 h-16 text-xl bg-[hsl(175,65%,45%)] hover:bg-[hsl(175,65%,35%)]"
                    data-testid="button-login"
                  >
                    <User className="mr-2 h-6 w-6" />
                    {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Clock In/Out */}
            {step === 'clock' && employee && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{employee.name}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {employee.cpf || employee.email}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleClock}
                  disabled={clockMutation.isPending}
                  size="lg"
                  className="w-full h-24 text-2xl bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] hover:from-[hsl(220,65%,25%)] hover:to-[hsl(175,65%,35%)]"
                  data-testid="button-clock"
                >
                  <Clock className="mr-3 h-10 w-10" />
                  {clockMutation.isPending ? 'Registrando...' : 'Registrar Ponto'}
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="lg"
                  className="w-full h-16 text-lg"
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sair
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-white/80 text-sm">
          <p>Sistema de Registro de Ponto - RHNet</p>
        </div>
      </div>

      {/* Facial Recognition Modal */}
      <TerminalFacialRecognition
        isActive={showFacialRecognition}
        onComplete={handleFacialRecognitionComplete}
        onCancel={handleFacialRecognitionCancel}
      />
    </div>
  );
}
