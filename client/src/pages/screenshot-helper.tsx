import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, Building2, FileText, Briefcase, Download } from "lucide-react";
import html2canvas from "html2canvas";

interface ScreenshotData {
  [key: string]: string;
}

export default function ScreenshotHelper() {
  const [screenshots, setScreenshots] = useState<ScreenshotData>({});
  const [capturing, setCapturing] = useState(false);

  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const captureScreen = async (elementId: string, name: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });
      
      const imageData = canvas.toDataURL("image/png");
      setScreenshots(prev => ({ ...prev, [name]: imageData }));
    } catch (error) {
      console.error(`Erro ao capturar ${name}:`, error);
    }
  };

  const captureAllScreens = async () => {
    setCapturing(true);
    
    await captureScreen("screen-home", "home");
    await new Promise(r => setTimeout(r, 500));
    
    await captureScreen("screen-employees", "employees");
    await new Promise(r => setTimeout(r, 500));
    
    await captureScreen("screen-sectors", "sectors");
    await new Promise(r => setTimeout(r, 500));
    
    await captureScreen("screen-reports", "reports");
    await new Promise(r => setTimeout(r, 500));
    
    await captureScreen("screen-recruitment", "recruitment");
    await new Promise(r => setTimeout(r, 500));
    
    await captureScreen("screen-terminal", "terminal");
    
    setCapturing(false);
  };

  // Salvar screenshots no localStorage sempre que mudarem
  useEffect(() => {
    if (Object.keys(screenshots).length > 0) {
      localStorage.setItem('rhnet-screenshots', JSON.stringify(screenshots));
    }
  }, [screenshots]);

  const downloadScreenshots = () => {
    const data = JSON.stringify(screenshots);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rhnet-screenshots.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Captura de Screenshots para Manual</h1>
            <p className="text-muted-foreground mt-2">
              Use esta página para capturar screenshots das principais telas do sistema
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={captureAllScreens} disabled={capturing}>
              {capturing ? "Capturando..." : "Capturar Todas"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Home / Dashboard */}
          <div id="screen-home" className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] text-white p-4 rounded-t-lg -mx-8 -mt-8 mb-6">
              <h2 className="text-2xl font-bold">RHNet - Página Inicial</h2>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <Clock className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Bem-vindo, {user?.name || "Usuário"}</h3>
                <p className="text-sm text-muted-foreground">Último registro: Hoje às 08:00</p>
              </div>
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6">
              <Clock className="h-5 w-5 mr-2" />
              Registrar Ponto (Entrada)
            </Button>
            
            <div className="mt-6 grid grid-cols-3 gap-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-bold text-green-600">Trabalhando</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Horas Hoje</p>
                <p className="text-xl font-bold">2h 30m</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Banco de Horas</p>
                <p className="text-xl font-bold">+5h 15m</p>
              </Card>
            </div>
          </div>

          {/* Gestão de Funcionários */}
          <div id="screen-employees" className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] text-white p-4 rounded-t-lg -mx-8 -mt-8 mb-6">
              <h2 className="text-2xl font-bold">Admin - Gestão de Funcionários</h2>
            </div>

            <div className="flex gap-3 mb-4">
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Novo Funcionário
              </Button>
              <Button variant="outline">Importar CSV</Button>
              <Button variant="outline">Exportar</Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Cargo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Departamento</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-3">João Silva</td>
                    <td className="px-4 py-3">Vendedor</td>
                    <td className="px-4 py-3">Vendas</td>
                    <td className="px-4 py-3"><span className="text-green-600">●</span> Ativo</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3">Ana Costa</td>
                    <td className="px-4 py-3">Gerente</td>
                    <td className="px-4 py-3">Administração</td>
                    <td className="px-4 py-3"><span className="text-green-600">●</span> Ativo</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3">Pedro Santos</td>
                    <td className="px-4 py-3">Analista</td>
                    <td className="px-4 py-3">TI</td>
                    <td className="px-4 py-3"><span className="text-green-600">●</span> Ativo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Setores e Geofencing */}
          <div id="screen-sectors" className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] text-white p-4 rounded-t-lg -mx-8 -mt-8 mb-6">
              <h2 className="text-2xl font-bold">Admin - Setores e Geofencing</h2>
            </div>

            <div className="flex gap-3 mb-4">
              <Button>
                <Building2 className="h-4 w-4 mr-2" />
                Novo Setor
              </Button>
            </div>

            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-2">Vendas</h3>
              <div className="bg-gray-100 h-32 rounded flex items-center justify-center text-muted-foreground">
                [Mapa Interativo - Área permitida com raio de 100m]
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-sm"><strong>Turnos configurados:</strong></p>
                <p className="text-sm">• Manhã: 08:00 - 12:00 (Tolerância: 5 min)</p>
                <p className="text-sm">• Tarde: 13:00 - 17:00 (Tolerância: 5 min)</p>
              </div>
            </Card>
          </div>

          {/* Relatórios */}
          <div id="screen-reports" className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] text-white p-4 rounded-t-lg -mx-8 -mt-8 mb-6">
              <h2 className="text-2xl font-bold">Admin - Relatório de Ponto Mensal</h2>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Mês: Janeiro/2025</p>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Funcionário</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Entrada</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Saída</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-3">João Silva</td>
                    <td className="px-4 py-3">08:05</td>
                    <td className="px-4 py-3">17:00</td>
                    <td className="px-4 py-3"><span className="text-yellow-600">⚠</span> Atraso</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3">Ana Costa</td>
                    <td className="px-4 py-3">08:00</td>
                    <td className="px-4 py-3">17:00</td>
                    <td className="px-4 py-3"><span className="text-green-600">✓</span> OK</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3">Pedro Santos</td>
                    <td className="px-4 py-3">-</td>
                    <td className="px-4 py-3">-</td>
                    <td className="px-4 py-3"><span className="text-red-600">●</span> Falta</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex gap-4 text-sm">
              <span><span className="text-yellow-600">⚠</span> Atraso</span>
              <span><span className="text-red-600">●</span> Falta</span>
              <span><span className="text-green-600">✓</span> Normal</span>
            </div>
          </div>

          {/* Recrutamento */}
          <div id="screen-recruitment" className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] text-white p-4 rounded-t-lg -mx-8 -mt-8 mb-6">
              <h2 className="text-2xl font-bold">Admin - Recrutamento e Seleção</h2>
            </div>

            <div className="flex gap-3 mb-4">
              <Button>
                <Briefcase className="h-4 w-4 mr-2" />
                Nova Vaga
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold">Vendedor - Vendas</h3>
                <p className="text-sm text-muted-foreground mt-2">Salário: R$ 2.500,00</p>
                <p className="text-sm text-muted-foreground">Candidatos: 15</p>
                <p className="text-sm mt-2"><span className="text-green-600">●</span> Aberta</p>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold">Analista de TI</h3>
                <p className="text-sm text-muted-foreground mt-2">Salário: R$ 4.500,00</p>
                <p className="text-sm text-muted-foreground">Candidatos: 23</p>
                <p className="text-sm mt-2"><span className="text-green-600">●</span> Aberta</p>
              </Card>
            </div>
          </div>

          {/* Terminal */}
          <div id="screen-terminal" className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] text-white p-4 rounded-t-lg -mx-8 -mt-8 mb-6 text-center">
              <h2 className="text-2xl font-bold">Terminal de Ponto</h2>
              <p className="text-sm opacity-90 mt-1">Modo Tablet</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="text-sm font-medium">E-mail</label>
                <input type="email" className="w-full mt-1 px-4 py-3 border rounded-lg" placeholder="seu@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Senha</label>
                <input type="password" className="w-full mt-1 px-4 py-3 border rounded-lg" placeholder="••••••••" />
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6">
                <Clock className="h-5 w-5 mr-2" />
                Registrar Ponto
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Interface otimizada para toque
              </p>
            </div>
          </div>
        </div>

        {/* Status das Capturas */}
        {Object.keys(screenshots).length > 0 && (
          <Card className="mt-8 p-4">
            <h3 className="font-semibold mb-2">Screenshots Capturadas:</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(screenshots).map(key => (
                <span key={key} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  ✓ {key}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
