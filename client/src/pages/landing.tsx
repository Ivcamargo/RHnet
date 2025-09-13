import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, Shield, MessageCircle, FileText, GraduationCap, BarChart3, Building, Calendar } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">RHNet - A Rede do RH</h1>
            </div>
            <Button onClick={handleLogin} className="point-primary">
              Fazer Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            RHNet - Sistema Completo de Gestão de RH
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plataforma unificada que integra controle de ponto, mensageria corporativa, gestão de documentos, capacitação e muito mais para transformar o RH da sua empresa.
          </p>
          <Button onClick={handleLogin} size="lg" className="point-primary text-lg px-8 py-3">
            Começar Agora
          </Button>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="material-shadow">
            <CardHeader>
              <div className="w-12 h-12 point-primary rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <CardTitle>Controle de Ponto Eletrônico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Registro inteligente com geolocalização, reconhecimento facial e validação automática de horários.
              </p>
            </CardContent>
          </Card>

          <Card className="material-shadow">
            <CardHeader>
              <div className="w-12 h-12 point-secondary rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <CardTitle>Mensageria Corporativa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comunicação direta entre RH e funcionários com mensagens categorizadas e rastreamento de leitura.
              </p>
            </CardContent>
          </Card>

          <Card className="material-shadow">
            <CardHeader>
              <div className="w-12 h-12 point-accent rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <CardTitle>Gestão de Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Upload, versionamento e organização de documentos corporativos com controle de acesso.
              </p>
            </CardContent>
          </Card>

          <Card className="material-shadow">
            <CardHeader>
              <div className="w-12 h-12 point-success rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6" />
              </div>
              <CardTitle>Capacitação & Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Trilhas de treinamento personalizadas por cargo com certificados e acompanhamento de progresso.
              </p>
            </CardContent>
          </Card>

          <Card className="material-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-500 text-white rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <CardTitle>Relatórios Avançados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Análises detalhadas de frequência, produtividade e desenvolvimento por funcionário e departamento.
              </p>
            </CardContent>
          </Card>

          <Card className="material-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center mb-4">
                <Building className="h-6 w-6" />
              </div>
              <CardTitle>Multi-Empresas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Isolamento completo por empresa com hierarquia de permissões e gestão centralizada.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que escolher o RHNet?
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 point-success rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Solução Completa</h4>
                    <p className="text-gray-600">Tudo que o RH precisa integrado em uma única plataforma</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 point-success rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Comunicação Eficiente</h4>
                    <p className="text-gray-600">Mensageria integrada para comunicação direta com funcionários</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 point-success rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Desenvolvimento Profissional</h4>
                    <p className="text-gray-600">Sistema completo de cursos e certificações por cargo</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 point-success rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Gestão Documental</h4>
                    <p className="text-gray-600">Organização e controle total de documentos corporativos</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 point-success rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Análises Avançadas</h4>
                    <p className="text-gray-600">Relatórios detalhados de performance e desenvolvimento</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 point-success rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Segurança Enterprise</h4>
                    <p className="text-gray-600">Isolamento por empresa e controle granular de permissões</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Users className="h-20 w-20 text-primary mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Transforme seu RH</h4>
              <p className="text-gray-600 mb-6">
                Modernize a gestão de pessoas da sua empresa com o RHNet - A Rede do RH.
              </p>
              <Button onClick={handleLogin} size="lg" className="point-primary">
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
