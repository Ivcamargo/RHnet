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
  ArrowRight
} from "lucide-react";
import rhnetLogo from "@assets/rhnetp_1757765662344.jpg";
import peopleUsingApp from "@assets/generated_images/Happy_people_using_smartphones_professionally_2c92555f.png";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-blue-50 text-gray-800 relative">
      {/* Logo Watermark */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${rhnetLogo})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: '280px 280px',
          opacity: 0.675,
          filter: 'brightness(1.5)'
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
          opacity: 0.29,
          filter: 'brightness(1.2)'
        }}
      ></div>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-xl border-b border-orange-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img src={rhnetLogo} alt="RHNet" className="h-16 w-16 mr-3 rounded-lg" />
              <h1 className="text-2xl font-bold text-orange-800">Sistema de gestão de recursos humanos</h1>
            </div>
            <Button 
              onClick={handleLogin} 
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2"
              data-testid="button-login"
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center mb-20">
          <p className="text-xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
            Sistema de gestão de recursos humanos que integra <strong>controle de ponto eletrônico</strong>, 
            <strong> mensageria corporativa</strong>, <strong>gestão de documentos</strong> e 
            <strong> capacitação de funcionários</strong>. Uma solução unificada para comunicação entre RH e colaboradores, 
            com funcionalidades avançadas de geolocalização, reconhecimento facial e relatórios abrangentes.
          </p>
        </div>

        {/* Core Features - Sistema Integrado */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-orange-900 mb-12">
            Principais Funcionalidades
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:bg-white/90 transition-all shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-orange-800 text-xl">Mensageria Corporativa Integrada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Sistema de comunicação entre RH e funcionários com mensagens instantâneas, 
                  notificações push, e histórico de conversas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-green-200 hover:bg-white/90 transition-all shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-green-800 text-xl">Gestão de Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Upload, armazenamento e compartilhamento seguro de documentos com controle de acesso, 
                  versionamento e notificações automáticas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white/90 transition-all shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-purple-800 text-xl">Capacitação e Certificação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Sistema de treinamento e capacitação com controle de progresso, certificações 
                  e acompanhamento do desenvolvimento profissional.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Advanced Features Grid */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-orange-900 mb-12">
            Funcionalidades Avançadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white/70 backdrop-blur-sm border-orange-200 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-orange-800 text-lg leading-tight">Controle de Ponto Eletrônico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Registro digital com validação de localização e reconhecimento facial.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-red-200 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-red-800 text-lg leading-tight">Geolocalização Avançada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Cercas virtuais personalizadas e validação automática de presença.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-yellow-200 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-yellow-800 text-lg leading-tight">Reconhecimento Facial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Autenticação biométrica para máxima segurança nos registros.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-green-200 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-green-800 text-lg leading-tight">Relatórios Abrangentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Análises detalhadas e dashboards com métricas em tempo real.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>


        {/* Security & Compliance */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-orange-900 mb-12">
            Segurança e Conformidade
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/70 backdrop-blur-sm border-red-200 shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <Lock className="h-12 w-12 text-red-500 mb-4" />
                <CardTitle className="text-red-800">Segurança Avançada</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-600 space-y-2">
                  <li>• Criptografia de dados</li>
                  <li>• Autenticação multifator</li>
                  <li>• Sessões seguras</li>
                  <li>• Auditoria</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-orange-200 shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <Shield className="h-12 w-12 text-orange-500 mb-4" />
                <CardTitle className="text-orange-800">Proteção de Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-600 space-y-2">
                  <li>• Conformidade LGPD</li>
                  <li>• Backup automático</li>
                  <li>• Controle de acesso</li>
                  <li>• Logs de segurança</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-green-200 shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <UserCheck className="h-12 w-12 text-green-500 mb-4" />
                <CardTitle className="text-green-800">Controles de Acesso</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-600 space-y-2">
                  <li>• Roles hierárquicos</li>
                  <li>• Permissões granulares</li>
                  <li>• Isolamento por empresa</li>
                  <li>• Auditoria de acessos</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para revolucionar o RH da sua empresa?
          </h3>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Transforme a gestão de recursos humanos com nossa plataforma completa. 
            Sistema integrado, seguro e fácil de usar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin} 
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-3 font-semibold"
            >
              Acessar Sistema Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-orange-600 text-lg px-8 py-3"
            >
              Solicitar Demonstração
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t border-orange-200 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src={rhnetLogo} alt="RHNet" className="h-11 w-11 mr-3 rounded" />
              <span className="text-xl font-bold text-orange-800">Sistema de gestão de recursos humanos</span>
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