import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, Shield } from "lucide-react";

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
              <h1 className="text-2xl font-bold text-gray-900">PointControl</h1>
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
            Sistema de Controle de Ponto Eletrônico
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Controle de ponto moderno com geolocalização, reconhecimento facial e gestão inteligente de turnos para sua empresa.
          </p>
          <Button onClick={handleLogin} size="lg" className="point-primary text-lg px-8 py-3">
            Começar Agora
          </Button>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="material-shadow">
            <CardHeader>
              <div className="w-12 h-12 point-primary rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <CardTitle>Controle de Ponto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Sistema intuitivo para registro de entrada e saída com interface moderna e responsiva.
              </p>
            </CardContent>
          </Card>

          <Card className="material-shadow">
            <CardHeader>
              <div className="w-12 h-12 point-secondary rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <CardTitle>Geolocalização</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Validação automática de localização com cercas virtuais personalizadas por departamento.
              </p>
            </CardContent>
          </Card>

          <Card className="material-shadow">
            <CardHeader>
              <div className="w-12 h-12 point-accent rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <CardTitle>Reconhecimento Facial</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Autenticação biométrica avançada para garantir a segurança e autenticidade dos registros.
              </p>
            </CardContent>
          </Card>

          <Card className="material-shadow">
            <CardHeader>
              <div className="w-12 h-12 point-success rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle>Gestão de Turnos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Controle inteligente de horários por departamento com relatórios detalhados e análises.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que escolher o PointControl?
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 point-success rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Precisão Total</h4>
                    <p className="text-gray-600">Registros precisos com validação de localização e biometria</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 point-success rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Relatórios Inteligentes</h4>
                    <p className="text-gray-600">Análises detalhadas de frequência e produtividade</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 point-success rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Interface Moderna</h4>
                    <p className="text-gray-600">Design intuitivo e responsivo para todos os dispositivos</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 point-success rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Segurança Avançada</h4>
                    <p className="text-gray-600">Proteção de dados e autenticação multifator</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Clock className="h-20 w-20 text-primary mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Pronto para começar?</h4>
              <p className="text-gray-600 mb-6">
                Transforme o controle de ponto da sua empresa hoje mesmo.
              </p>
              <Button onClick={handleLogin} size="lg" className="point-primary">
                Acessar Sistema
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
