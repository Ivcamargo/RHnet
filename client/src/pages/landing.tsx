import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  MapPin, 
  Users, 
  Shield, 
  MessageSquare, 
  FileText, 
  GraduationCap,
  Building2,
  UserCheck,
  Camera,
  BarChart3,
  Globe,
  Lock,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Briefcase,
  Book
} from "lucide-react";
import rhnetLogo from "@assets/rhnetp_1757765662344.jpg";
import peopleUsingApp from "@assets/generated_images/Happy_people_using_smartphones_professionally_2c92555f.png";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleJobsPage = () => {
    window.location.href = "/vagas";
  };

  const handleManual = () => {
    window.location.href = "/manual";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 text-gray-800 relative">
      {/* Logo Watermark */}
      <div 
        className="fixed inset-0 pointer-events-none z-5"
        style={{
          backgroundImage: `url(${rhnetLogo})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: '350px 350px',
          opacity: 0.15,
          filter: 'brightness(1.6) contrast(1.1) saturate(0.8)'
        }}
      ></div>
      {/* People Using App Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-1"
        style={{
          backgroundImage: `url(${peopleUsingApp})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          opacity: 0.35,
          filter: 'brightness(1.2) contrast(1.05)'
        }}
      ></div>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-xl border-b border-[hsl(175,65%,45%)]/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img src={rhnetLogo} alt="RHNet" className="h-16 w-16 mr-3 rounded-lg" />
              <h1 className="text-2xl font-bold text-[hsl(215,80%,25%)]">Sistema de gestão de recursos humanos</h1>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleManual} 
                variant="ghost"
                className="text-gray-700 hover:bg-gray-100 px-6 py-2"
                data-testid="button-manual"
              >
                <Book className="mr-2 h-4 w-4" />
                Manual
              </Button>
              <Button 
                onClick={handleJobsPage} 
                variant="ghost"
                className="text-gray-700 hover:bg-gray-100 px-6 py-2"
                data-testid="button-jobs"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Trabalhe Conosco
              </Button>
              <Button 
                onClick={handleLogin} 
                variant="ghost"
                className="text-gray-700 hover:bg-gray-100 px-6 py-2"
                data-testid="button-login"
              >
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-extrabold text-[hsl(215,80%,25%)] mb-6">
            Gestão de RH Completa e Inteligente
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            RHNet é a solução completa para gerenciar sua equipe com eficiência. 
            Controle de ponto com geolocalização, mensagens corporativas, gestão de documentos, 
            treinamentos e muito mais, tudo em um único sistema.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleLogin} 
              size="lg"
              variant="ghost"
              className="text-gray-700 hover:bg-gray-100 px-8 py-6 text-lg"
            >
              Começar Agora
            </Button>
            <Button 
              onClick={handleJobsPage} 
              size="lg"
              variant="ghost"
              className="text-gray-700 hover:bg-gray-100 px-8 py-6 text-lg"
            >
              Ver Vagas Disponíveis
            </Button>
          </div>
        </div>
      </section>
      {/* Features Grid */}
      <section className="relative z-10 py-16 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-[hsl(215,80%,25%)] mb-12">
            Recursos Principais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ponto Eletrônico */}
            <Card className="border-[hsl(220,65%,18%)]/20 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-[hsl(220,65%,18%)]/10 rounded-lg">
                    <Clock className="h-6 w-6 text-[hsl(220,65%,18%)]" />
                  </div>
                  <CardTitle className="text-xl">Ponto Eletrônico</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Registro de ponto com verificação por geolocalização e reconhecimento facial. 
                  Controle preciso de jornada de trabalho.
                </p>
              </CardContent>
            </Card>

            {/* Geolocalização */}
            <Card className="border-[hsl(175,65%,45%)]/20 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-[hsl(175,65%,45%)]/10 rounded-lg">
                    <MapPin className="h-6 w-6 text-[hsl(175,65%,45%)]" />
                  </div>
                  <CardTitle className="text-xl">Geolocalização</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Valide a presença dos funcionários no local de trabalho com precisão GPS 
                  e cercas virtuais configuráveis.
                </p>
              </CardContent>
            </Card>

            {/* Mensagens Corporativas */}
            <Card className="border-[hsl(220,65%,18%)]/20 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-[hsl(220,65%,18%)]/10 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-[hsl(220,65%,18%)]" />
                  </div>
                  <CardTitle className="text-xl">Mensagens</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sistema de mensagens interno para comunicação eficiente entre equipes 
                  e departamentos.
                </p>
              </CardContent>
            </Card>

            {/* Gestão de Documentos */}
            <Card className="border-[hsl(175,65%,45%)]/20 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-[hsl(175,65%,45%)]/10 rounded-lg">
                    <FileText className="h-6 w-6 text-[hsl(175,65%,45%)]" />
                  </div>
                  <CardTitle className="text-xl">Documentos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Gerencie e compartilhe documentos com controle de acesso hierárquico 
                  e versionamento completo.
                </p>
              </CardContent>
            </Card>

            {/* Treinamento */}
            <Card className="border-[hsl(220,65%,18%)]/20 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-[hsl(220,65%,18%)]/10 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-[hsl(220,65%,18%)]" />
                  </div>
                  <CardTitle className="text-xl">Capacitação</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Cursos online com quizzes, certificados e acompanhamento do 
                  desenvolvimento profissional.
                </p>
              </CardContent>
            </Card>

            {/* Recrutamento */}
            <Card className="border-[hsl(175,65%,45%)]/20 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-[hsl(175,65%,45%)]/10 rounded-lg">
                    <Briefcase className="h-6 w-6 text-[hsl(175,65%,45%)]" />
                  </div>
                  <CardTitle className="text-xl">Recrutamento</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Portal de vagas público, gestão de candidatos, entrevistas e 
                  onboarding digital via WhatsApp.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Security & Analytics */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-[hsl(220,65%,18%)]/20 bg-[hsl(220,65%,18%)]/5">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-8 w-8 text-[hsl(220,65%,18%)]" />
                  <CardTitle className="text-2xl">Segurança Avançada</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Lock className="h-5 w-5 text-[hsl(220,65%,18%)] mt-1" />
                  <p className="text-gray-700">Autenticação segura com controle de acesso baseado em funções</p>
                </div>
                <div className="flex items-start gap-2">
                  <Camera className="h-5 w-5 text-[hsl(220,65%,18%)] mt-1" />
                  <p className="text-gray-700">Reconhecimento facial para validação de identidade</p>
                </div>
                <div className="flex items-start gap-2">
                  <UserCheck className="h-5 w-5 text-[hsl(220,65%,18%)] mt-1" />
                  <p className="text-gray-700">Controle hierárquico de permissões e acessos</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[hsl(175,65%,45%)]/20 bg-[hsl(175,65%,45%)]/5">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-8 w-8 text-[hsl(175,65%,45%)]" />
                  <CardTitle className="text-2xl">Relatórios & Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[hsl(175,65%,45%)] mt-1" />
                  <p className="text-gray-700">Dashboards intuitivos com métricas em tempo real</p>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="h-5 w-5 text-[hsl(175,65%,45%)] mt-1" />
                  <p className="text-gray-700">Relatórios por departamento e setor</p>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-[hsl(175,65%,45%)] mt-1" />
                  <p className="text-gray-700">Análise de desempenho e produtividade</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Mobile Access */}
      <section className="relative z-10 py-16 bg-gradient-to-r from-[hsl(220,65%,18%)]/5 to-[hsl(175,65%,45%)]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Smartphone className="h-16 w-16 text-[hsl(175,65%,45%)] mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-[hsl(215,80%,25%)] mb-4">
            Acesso Mobile
          </h3>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Acesse o RHNet de qualquer lugar, a qualquer momento. 
            Nossa plataforma é totalmente responsiva e otimizada para dispositivos móveis, 
            permitindo que sua equipe registre ponto, visualize documentos e se comunique em movimento.
          </p>
          <Badge variant="outline" className="text-lg px-6 py-2 border-[hsl(220,65%,18%)] text-[hsl(220,65%,18%)]">
            <Globe className="mr-2 h-5 w-5" />
            Progressive Web App (PWA)
          </Badge>
        </div>
      </section>
      {/* Call to Action */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold mb-6 text-[#2a2c37]">
            Pronto para Transformar sua Gestão de RH?
          </h3>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Junte-se às empresas que já otimizaram seus processos de RH com o RHNet
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleLogin} 
              size="lg"
              className="bg-white text-[hsl(220,65%,18%)] hover:bg-gray-100 px-8 py-6 text-lg"
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              Acessar Sistema
            </Button>
            <Button 
              onClick={handleJobsPage} 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
            >
              <Briefcase className="mr-2 h-5 w-5" />
              Ver Oportunidades
            </Button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t border-[hsl(175,65%,45%)]/30 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <img src={rhnetLogo} alt="RHNet" className="h-11 w-11 mr-3 rounded" />
              <span className="text-xl font-bold text-[hsl(215,80%,25%)]">Sistema de gestão de recursos humanos</span>
            </div>
            <div className="flex items-center gap-6">
              <Button 
                onClick={handleJobsPage}
                variant="ghost"
                className="text-gray-700 hover:bg-gray-100"
                data-testid="button-jobs-footer"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Trabalhe Conosco
              </Button>
              <Button 
                onClick={handleLogin}
                variant="ghost"
                className="text-gray-700 hover:bg-gray-100"
                data-testid="button-login-footer"
              >
                Login
              </Button>
            </div>
            <div className="text-gray-600">
              <p>&copy; 2025 RHNet. Sistema de gestão de recursos humanos.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}