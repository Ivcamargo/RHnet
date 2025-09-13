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

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 dark:bg-gray-800 shadow-xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img src={rhnetLogo} alt="RHNet" className="h-10 w-10 mr-3 rounded-lg" />
              <h1 className="text-2xl font-bold text-white">RHNet - A Rede do RH</h1>
            </div>
            <Button 
              onClick={handleLogin} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              data-testid="button-login"
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
            Sistema Completo de Gestão de RH
          </Badge>
          <h2 className="text-5xl font-bold text-white mb-6">
            RHNet - "A Rede do RH"
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Sistema completo de gestão de recursos humanos que integra <strong>controle de ponto eletrônico</strong>, 
            <strong> mensageria corporativa</strong>, <strong>gestão de documentos</strong> e 
            <strong> capacitação de funcionários</strong>. Uma solução unificada para comunicação entre RH e colaboradores, 
            com funcionalidades avançadas de geolocalização, reconhecimento facial e relatórios abrangentes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3"
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 text-lg px-8 py-3"
            >
              Ver Demonstração
            </Button>
          </div>
        </div>

        {/* Core Features - Sistema Integrado */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-white mb-12">
            Sistema Integrado de RH
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Mensageria Corporativa Integrada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  Sistema completo de comunicação entre RH e funcionários com mensagens instantâneas, 
                  notificações push, e histórico completo de conversas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Gestão Completa de Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  Upload, armazenamento e compartilhamento seguro de documentos com controle de acesso, 
                  versionamento e notificações automáticas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Capacitação e Certificação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  Sistema de treinamento e capacitação com controle de progresso, certificações 
                  e acompanhamento do desenvolvimento profissional.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Advanced Features Grid */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-white mb-12">
            Funcionalidades Avançadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white text-lg">Controle de Ponto Eletrônico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  Registro digital com validação de localização e reconhecimento facial.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-3">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white text-lg">Geolocalização Avançada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  Cercas virtuais personalizadas e validação automática de presença.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-3">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white text-lg">Reconhecimento Facial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  Autenticação biométrica para máxima segurança nos registros.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-3">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white text-lg">Relatórios Abrangentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  Análises detalhadas e dashboards com métricas em tempo real.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Architecture & Technology */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-white mb-12">
            Arquitetura e Tecnologia
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h4 className="text-2xl font-bold text-white mb-6">Frontend Moderno</h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-semibold">React 18 com TypeScript</span>
                    <p className="text-gray-300 text-sm">Interface moderna e responsiva</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-semibold">TanStack Query</span>
                    <p className="text-gray-300 text-sm">Gerenciamento de estado do servidor</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-semibold">Tailwind CSS + shadcn/ui</span>
                    <p className="text-gray-300 text-sm">Design system profissional</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-semibold">PWA Ready</span>
                    <p className="text-gray-300 text-sm">Funcionamento offline e notificações</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-white mb-6">Backend Robusto</h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-semibold">Express.js com TypeScript</span>
                    <p className="text-gray-300 text-sm">API RESTful com validação Zod</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-semibold">PostgreSQL com Drizzle ORM</span>
                    <p className="text-gray-300 text-sm">Banco de dados type-safe</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-semibold">Replit OIDC</span>
                    <p className="text-gray-300 text-sm">Autenticação segura e sessões</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-semibold">Controle de Acesso</span>
                    <p className="text-gray-300 text-sm">Roles baseados em empresa</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security & Compliance */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-white mb-12">
            Segurança e Conformidade
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <Lock className="h-12 w-12 text-red-500 mb-4" />
                <CardTitle className="text-white">Segurança Avançada</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-300 space-y-2">
                  <li>• Criptografia de dados</li>
                  <li>• Autenticação multifator</li>
                  <li>• Sessões seguras</li>
                  <li>• Auditoria completa</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-500 mb-4" />
                <CardTitle className="text-white">Proteção de Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-300 space-y-2">
                  <li>• Conformidade LGPD</li>
                  <li>• Backup automático</li>
                  <li>• Controle de acesso</li>
                  <li>• Logs de segurança</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <UserCheck className="h-12 w-12 text-green-500 mb-4" />
                <CardTitle className="text-white">Controles de Acesso</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-300 space-y-2">
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
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para revolucionar o RH da sua empresa?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Transforme a gestão de recursos humanos com nossa plataforma completa. 
            Sistema integrado, seguro e fácil de usar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin} 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3 font-semibold"
            >
              Acessar Sistema Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
            >
              Solicitar Demonstração
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src={rhnetLogo} alt="RHNet" className="h-8 w-8 mr-3 rounded" />
              <span className="text-xl font-bold text-white">RHNet - A Rede do RH</span>
            </div>
            <div className="text-gray-400">
              <p>&copy; 2025 RHNet. Sistema completo de gestão de recursos humanos.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}