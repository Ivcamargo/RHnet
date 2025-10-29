import { Book, Clock, Users, MapPin, FileText, MessageSquare, Calendar, GraduationCap, Briefcase, Shield, Settings, TrendingUp, Download, Upload, CheckCircle, AlertCircle, Home, LogIn, Tablet, Camera, DollarSign, Coins, FileDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import rhnetLogo from "@assets/rhnetp_1757765662344.jpg";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Manual() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    toast({ title: "Gerando PDF...", description: "Por favor, aguarde enquanto criamos o documento." });

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Função para adicionar nova página
      const addNewPage = () => {
        pdf.addPage();
        yPosition = margin;
      };

      // Função para verificar se precisa de nova página
      const checkNewPage = (heightNeeded: number) => {
        if (yPosition + heightNeeded > pageHeight - margin) {
          addNewPage();
        }
      };

      // Capa
      pdf.setFillColor(26, 57, 96); // Navy blue
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont("helvetica", "bold");
      pdf.text("Manual do Sistema", pageWidth / 2, 80, { align: "center" });
      
      pdf.setFontSize(48);
      pdf.text("RHNet", pageWidth / 2, 120, { align: "center" });
      
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "normal");
      pdf.text("Guia Completo de Utilização", pageWidth / 2, 150, { align: "center" });
      
      pdf.setFontSize(12);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, pageHeight - 30, { align: "center" });

      // Sumário
      addNewPage();
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("Sumário", margin, yPosition);
      yPosition += 15;

      const sections = [
        { title: "1. Introdução", page: 3 },
        { title: "2. Controle de Ponto", page: 5 },
        { title: "3. Terminal de Ponto", page: 8 },
        { title: "4. Gestão de Recursos", page: 11 },
        { title: "5. Relatórios", page: 15 },
        { title: "6. Recrutamento e Seleção", page: 18 },
        { title: "7. Outros Recursos", page: 21 },
      ];

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      sections.forEach(section => {
        checkNewPage(10);
        pdf.text(section.title, margin, yPosition);
        pdf.text(`Pág. ${section.page}`, pageWidth - margin - 20, yPosition);
        yPosition += 8;
      });

      // Seção 1: Introdução
      addNewPage();
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 57, 96);
      pdf.text("1. Introdução", margin, yPosition);
      yPosition += 12;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      
      const introText = [
        "O RHNet é um sistema completo de gestão de recursos humanos que integra controle de ponto",
        "eletrônico, mensagens corporativas, gestão de documentos, treinamentos e processos de",
        "recrutamento e seleção. Tudo em uma única plataforma moderna e fácil de usar.",
        "",
        "NÍVEIS DE ACESSO:",
        "",
        "Superadministrador:",
        "Acesso completo ao sistema, incluindo gestão de múltiplas empresas, configurações globais",
        "e todas as funcionalidades administrativas.",
        "",
        "Administrador:",
        "Gerencia sua empresa, incluindo cadastro de funcionários, departamentos, turnos,",
        "visualização de relatórios e gestão de processos seletivos.",
        "",
        "Funcionário:",
        "Registra ponto, visualiza histórico pessoal, acessa mensagens, documentos e treinamentos.",
      ];

      introText.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Seção 2: Controle de Ponto
      addNewPage();
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 57, 96);
      pdf.text("2. Controle de Ponto", margin, yPosition);
      yPosition += 12;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      const pontoText = [
        "COMO REGISTRAR PONTO:",
        "",
        "1. Acesse a página inicial após fazer login",
        "2. Clique no botão 'Registrar Ponto' (verde para entrada, vermelho para saída)",
        "3. Autorize o acesso à câmera e localização quando solicitado",
        "4. Tire uma foto do seu rosto (para verificação facial)",
        "5. O sistema validará sua localização automaticamente",
        "6. Confirme o registro",
        "",
        "VALIDAÇÕES DE SEGURANÇA:",
        "",
        "• Verificação Facial: Cada registro inclui uma foto para comprovar presença",
        "• Geolocalização: Valida se você está próximo ao local de trabalho",
        "• Geofencing: Sistema verifica se você está dentro do perímetro permitido",
        "• Registro de IP: Endereço IP é registrado para auditoria",
        "",
        "HORÁRIOS E TOLERÂNCIA:",
        "",
        "• Cada turno possui horários de entrada e saída definidos",
        "• Tolerância configurável para chegadas antecipadas ou atrasadas",
        "• Irregularidades são marcadas automaticamente",
        "",
        "PAUSAS E INTERVALOS:",
        "",
        "• Pausas automáticas podem ser configuradas por turno",
        "• Pausas manuais podem ser registradas durante o expediente",
        "• Sistema diferencia pausas pagas e não-pagas",
      ];

      pontoText.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Seção 3: Terminal de Ponto
      addNewPage();
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 57, 96);
      pdf.text("3. Terminal de Ponto", margin, yPosition);
      yPosition += 12;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      const terminalText = [
        "O Terminal de Ponto é um modo especial do sistema otimizado para tablets e dispositivos",
        "fixos instalados na empresa.",
        "",
        "CONFIGURAÇÃO DO TERMINAL:",
        "",
        "1. Acesse /terminal-ponto em um tablet",
        "2. O sistema solicitará registro do dispositivo na primeira utilização",
        "3. Após registro, o terminal ficará pronto para uso por todos os funcionários",
        "",
        "USO DO TERMINAL:",
        "",
        "1. Na tela inicial, clique em 'Registrar Ponto'",
        "2. Digite seu e-mail e senha",
        "3. Tire a foto facial",
        "4. Confirme o registro",
        "5. O sistema fará logout automático após alguns segundos",
        "",
        "CARACTERÍSTICAS:",
        "",
        "• Interface simplificada e otimizada para toque",
        "• Logout automático por segurança",
        "• Não exige geolocalização (usa localização do dispositivo registrado)",
        "• Identifica o dispositivo usado em cada registro",
        "• Ideal para pontos de registro fixos na empresa",
      ];

      terminalText.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Seção 4: Gestão de Recursos (Admin)
      addNewPage();
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 57, 96);
      pdf.text("4. Gestão de Recursos (Administradores)", margin, yPosition);
      yPosition += 12;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      const gestaoText = [
        "CADASTRO DE FUNCIONÁRIOS:",
        "",
        "• Acesse Admin > Funcionários",
        "• Preencha dados pessoais, cargo, departamento e turno",
        "• Configure permissões de acesso",
        "• Importe múltiplos funcionários via CSV",
        "",
        "GESTÃO DE SETORES E TURNOS:",
        "",
        "• Acesse Admin > Setores",
        "• Crie departamentos e configure geofencing (perímetro permitido)",
        "• Defina turnos com horários de entrada/saída",
        "• Configure tolerâncias e pausas automáticas",
        "• Atribua funcionários aos turnos",
        "",
        "CONFIGURAÇÃO DE HORAS EXTRAS:",
        "",
        "• Acesse Controle de Ponto > Horas Extras",
        "• Crie regras por departamento ou turno",
        "• Defina percentuais de acréscimo (50%, 100%, 200%, etc.)",
        "• Configure se é pago ou banco de horas",
        "• Aplique regras diferentes para dias úteis, finais de semana e feriados",
        "",
        "IMPORTAÇÃO/EXPORTAÇÃO CSV:",
        "",
        "• Baixe o modelo CSV na página de funcionários",
        "• Preencha os dados conforme o modelo",
        "• Faça upload do arquivo",
        "• Sistema valida e reporta erros",
        "• Exporte dados atuais a qualquer momento",
      ];

      gestaoText.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Seção 5: Relatórios
      addNewPage();
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 57, 96);
      pdf.text("5. Relatórios", margin, yPosition);
      yPosition += 12;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      const relatoriosText = [
        "RELATÓRIO DE PONTO:",
        "",
        "• Acesse Admin > Relatórios de Ponto",
        "• Selecione mês e ano",
        "• Visualize registros de todos os funcionários",
        "• Identifique irregularidades (atrasos, faltas, horas insuficientes)",
        "• Veja detalhes de cada registro (foto, localização, IP)",
        "• Exporte dados para análise externa",
        "",
        "INDICADORES DE IRREGULARIDADE:",
        "",
        "• Círculo Amarelo: Chegada atrasada",
        "• Círculo Vermelho: Falta ou horas insuficientes",
        "• Ícone de Câmera: Indica que há foto de verificação facial",
        "",
        "RELATÓRIO DE INCONSISTÊNCIAS:",
        "",
        "• Lista todas as irregularidades detectadas",
        "• Mostra motivo de cada inconsistência",
        "• Permite identificar padrões e tomar ações",
        "",
        "DASHBOARDS:",
        "",
        "• Visualize estatísticas gerais da empresa",
        "• Acompanhe métricas de presença",
        "• Monitore tendências ao longo do tempo",
      ];

      relatoriosText.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Seção 6: Recrutamento e Seleção
      addNewPage();
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 57, 96);
      pdf.text("6. Recrutamento e Seleção", margin, yPosition);
      yPosition += 12;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      const recrutamentoText = [
        "GESTÃO DE VAGAS:",
        "",
        "• Acesse Admin > Recrutamento > Vagas",
        "• Crie novas oportunidades de emprego",
        "• Defina cargo, departamento, salário e requisitos",
        "• Publique ou mantenha como rascunho",
        "• Acompanhe status de cada vaga",
        "",
        "CADASTRO DE CANDIDATOS:",
        "",
        "• Acesse Admin > Recrutamento > Candidatos",
        "• Registre informações completas dos candidatos",
        "• Anexe currículos e documentos",
        "• Gerencie banco de talentos",
        "",
        "PROCESSO SELETIVO:",
        "",
        "• Acesse Admin > Recrutamento > Candidaturas",
        "• Vincule candidatos às vagas abertas",
        "• Acompanhe status: Em Análise, Entrevista, Aprovado, Reprovado",
        "• Atualize etapas conforme o processo avança",
        "• Gere links de onboarding digital para aprovados",
        "",
        "ONBOARDING DIGITAL:",
        "",
        "• Sistema gera link único para cada candidato aprovado",
        "• Candidato preenche dados pessoais e documentos",
        "• Upload seguro de documentação",
        "• Integração automática com cadastro de funcionários",
      ];

      recrutamentoText.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Seção 7: Outros Recursos
      addNewPage();
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 57, 96);
      pdf.text("7. Outros Recursos", margin, yPosition);
      yPosition += 12;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      const outrosText = [
        "MENSAGENS:",
        "",
        "• Comunicação interna entre funcionários",
        "• Envie e receba mensagens",
        "• Arquive conversas importantes",
        "• Exclusão independente (não afeta destinatário)",
        "",
        "DOCUMENTOS:",
        "",
        "• Armazene e compartilhe documentos corporativos",
        "• Organize por categorias",
        "• Controle de acesso por perfil",
        "",
        "TREINAMENTOS:",
        "",
        "• Acesse cursos disponibilizados pela empresa",
        "• Complete módulos e avaliações",
        "• Acompanhe seu progresso",
        "• Obtenha certificados de conclusão",
        "",
        "CONFIGURAÇÕES DE CONTA:",
        "",
        "• Altere sua senha regularmente",
        "• Atualize informações de perfil",
        "• Configure preferências do sistema",
        "",
        "BANCO DE HORAS:",
        "",
        "• Visualize seu saldo de horas extras",
        "• Acompanhe créditos e débitos",
        "• Consulte histórico de transações",
        "",
        "SUPORTE:",
        "",
        "• Em caso de dúvidas, entre em contato com o RH",
        "• E-mail: infosis@infosis.com.br",
        "• Consulte este manual sempre que necessário",
      ];

      outrosText.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Rodapé em todas as páginas
      const totalPages = pdf.internal.pages.length - 1; // -1 porque o array inclui uma página vazia no início
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        if (i > 1) { // Não adiciona rodapé na capa
          pdf.setFontSize(9);
          pdf.setTextColor(128, 128, 128);
          pdf.text(`RHNet - Manual do Sistema`, margin, pageHeight - 10);
          pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 30, pageHeight - 10);
        }
      }

      // Salvar PDF
      pdf.save(`Manual_RHNet_${new Date().toISOString().split("T")[0]}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "O manual foi baixado para seu dispositivo.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao criar o documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      {/* Header Público */}
      <header className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/landing">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
                <img src={rhnetLogo} alt="RHNet" className="h-12 w-12 rounded-lg" />
                <h1 className="text-2xl font-bold text-white">RHNet</h1>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              <Link href="/landing">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <Home className="h-4 w-4 mr-2" />
                  Início
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary">
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Book className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Manual do Sistema RHNet</h1>
            </div>
            <Button
              onClick={handleExportPdf}
              disabled={isGeneratingPdf}
              className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)]"
              data-testid="button-export-pdf"
            >
              <FileDown className="h-4 w-4 mr-2" />
              {isGeneratingPdf ? "Gerando PDF..." : "Baixar PDF"}
            </Button>
          </div>
          <p className="text-muted-foreground text-lg">
            Guia completo para utilização de todas as funcionalidades do sistema
          </p>
        </div>

      <Tabs defaultValue="introducao" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-6">
          <TabsTrigger value="introducao">Introdução</TabsTrigger>
          <TabsTrigger value="ponto">Ponto</TabsTrigger>
          <TabsTrigger value="terminal">Terminal</TabsTrigger>
          <TabsTrigger value="gestao">Gestão</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="recrutamento">Recrutamento</TabsTrigger>
          <TabsTrigger value="outros">Outros</TabsTrigger>
        </TabsList>

        {/* Introdução */}
        <TabsContent value="introducao">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Bem-vindo ao RHNet
              </CardTitle>
              <CardDescription>
                Sistema integrado de gestão de recursos humanos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-3">O que é o RHNet?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  O RHNet é um sistema completo de gestão de recursos humanos que integra controle de ponto eletrônico,
                  mensagens corporativas, gestão de documentos, treinamentos e processos de recrutamento e seleção.
                  Tudo em uma única plataforma moderna e fácil de usar.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">Níveis de Acesso</h3>
                <div className="space-y-3">
                  <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Superadministrador
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Acesso completo ao sistema, incluindo gestão de múltiplas empresas, configurações globais
                        e todas as funcionalidades administrativas.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-secondary">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Administrador
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Gerencia sua empresa, incluindo cadastro de funcionários, departamentos, turnos,
                        visualização de relatórios e gestão de processos seletivos.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-muted">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Funcionário
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Registra ponto, visualiza seus relatórios mensais, acessa documentos, mensagens e cursos de treinamento.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">Navegação no Sistema</h3>
                <p className="text-muted-foreground mb-3">
                  Use o menu lateral à esquerda para navegar entre as diferentes seções do sistema.
                  As opções disponíveis variam de acordo com seu nível de acesso.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Dashboard:</strong> Visão geral com estatísticas e informações importantes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Registrar Ponto:</strong> Marque entrada, saída e intervalos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Relatórios:</strong> Consulte seus registros de ponto mensais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Áreas Administrativas:</strong> Gestão de funcionários, setores, recrutamento (apenas admin)</span>
                  </li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registro de Ponto */}
        <TabsContent value="ponto">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Registro de Ponto Eletrônico
                </CardTitle>
                <CardDescription>
                  Como registrar entrada, saída e intervalos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3">Como Registrar Ponto</h3>
                  <ol className="space-y-3 list-decimal list-inside">
                    <li className="text-muted-foreground">
                      Acesse o menu <strong>"Registrar Ponto"</strong>
                    </li>
                    <li className="text-muted-foreground">
                      Clique no botão correspondente:
                      <ul className="ml-6 mt-2 space-y-1 list-disc">
                        <li><strong>Registrar Entrada:</strong> Ao chegar no trabalho</li>
                        <li><strong>Iniciar Intervalo:</strong> Ao sair para almoço/pausa</li>
                        <li><strong>Finalizar Intervalo:</strong> Ao retornar do intervalo</li>
                        <li><strong>Registrar Saída:</strong> Ao terminar o expediente</li>
                      </ul>
                    </li>
                    <li className="text-muted-foreground">
                      O sistema pode solicitar permissão para:
                      <ul className="ml-6 mt-2 space-y-1 list-disc">
                        <li><strong>Localização:</strong> Para verificar se você está no local permitido (geofencing)</li>
                        <li><strong>Câmera:</strong> Para captura de foto facial (verificação de identidade)</li>
                      </ul>
                    </li>
                    <li className="text-muted-foreground">
                      Após a confirmação, o registro será salvo com data, hora, localização e foto
                    </li>
                  </ol>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Geofencing (Validação de Localização)
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    O sistema verifica se você está dentro da área permitida para registro de ponto.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span><strong>✓ Dentro da área:</strong> Registro permitido normalmente</span>
                    </p>
                    <p className="text-sm flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
                      <span><strong>⚠ Fora da área:</strong> Registro é permitido, mas fica marcado como "fora da geofence" para revisão posterior</span>
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">Validações do Sistema</h3>
                  <div className="space-y-3">
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Validação de Turno</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        O sistema compara o horário do seu registro com o turno configurado.
                        Se houver diferença significativa, será marcado para revisão.
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Detecção de Irregularidades</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        O sistema identifica automaticamente: atrasos (mais de 5 minutos), horas insuficientes (tolerância de 15 minutos),
                        faltas e registros incompletos. Essas informações aparecem nos relatórios mensais.
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Registro de IP</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        O endereço IP é registrado para fins de auditoria e segurança.
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Terminal/Modo Kiosk */}
        <TabsContent value="terminal">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tablet className="h-5 w-5" />
                  Modo Terminal (Kiosk)
                </CardTitle>
                <CardDescription>
                  Sistema de registro de ponto em terminais fixos (tablets/totens)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3">O que é o Modo Terminal?</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    O Modo Terminal é uma interface dedicada para registro de ponto em dispositivos fixos,
                    como tablets instalados na entrada da empresa. Ele funciona de forma independente,
                    sem necessidade de login permanente, permitindo que múltiplos funcionários registrem
                    ponto no mesmo dispositivo de forma rápida e segura.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>💡 Importante:</strong> O terminal deve ser configurado previamente por um
                      administrador na seção "Gerenciar Terminais" antes de poder ser utilizado.
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">Como Configurar um Terminal (Administrador)</h3>
                  <ol className="space-y-3 list-decimal list-inside">
                    <li className="text-muted-foreground">
                      Acesse o menu <strong>"Gerenciar Terminais"</strong> no painel administrativo
                    </li>
                    <li className="text-muted-foreground">
                      Clique em <strong>"Adicionar Terminal"</strong>
                    </li>
                    <li className="text-muted-foreground">
                      Preencha as informações:
                      <ul className="ml-6 mt-2 space-y-1 list-disc">
                        <li><strong>Código do Dispositivo:</strong> Identificador único (ex: TERM-0001)</li>
                        <li><strong>Nome:</strong> Descrição amigável (ex: "Entrada Principal")</li>
                        <li><strong>Localização:</strong> Onde o terminal está instalado</li>
                        <li><strong>Geofencing:</strong> Configure a área permitida no mapa interativo</li>
                        <li><strong>Raio:</strong> Distância máxima permitida (em metros)</li>
                      </ul>
                    </li>
                    <li className="text-muted-foreground">
                      Salve e anote o <strong>código do dispositivo</strong> - será necessário para acessar o terminal
                    </li>
                    <li className="text-muted-foreground">
                      Configure o terminal como ativo/inativo conforme necessário
                    </li>
                  </ol>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">Como Usar o Terminal (Funcionário)</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                        Validar o Dispositivo
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-8">
                        <li>Acesse a interface do terminal: <code className="bg-muted px-2 py-0.5 rounded text-xs">/terminal-ponto</code></li>
                        <li>Digite o código do dispositivo fornecido pelo administrador</li>
                        <li>Clique em <strong>"Validar Dispositivo"</strong></li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                        Fazer Login
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-8">
                        <li>Digite seu CPF, email ou Registro Interno</li>
                        <li>Digite sua senha</li>
                        <li>Clique em <strong>"ENTRAR"</strong></li>
                        <li className="text-xs text-amber-600 dark:text-amber-400">⚠ Seu login é válido por 10 minutos no terminal</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                        Registrar Ponto
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-8">
                        <li>Clique em <strong>"REGISTRAR ENTRADA"</strong> ou <strong>"REGISTRAR SAÍDA"</strong></li>
                        <li>O sistema solicitará captura de foto facial (opcional)</li>
                        <li>Aguarde a confirmação do registro</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
                        Logout Automático
                      </h4>
                      <p className="text-sm text-muted-foreground ml-8">
                        Após registrar o ponto, o sistema faz logout automaticamente e retorna
                        para a tela de validação do dispositivo, permitindo que o próximo funcionário
                        possa usar o terminal.
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Reconhecimento Facial no Terminal
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    O terminal oferece captura de foto facial para verificação de identidade.
                  </p>
                  <div className="space-y-3">
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Captura de Foto</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>Ao clicar para registrar o ponto, o sistema abrirá a câmera automaticamente.</p>
                        <ul className="ml-4 space-y-1 list-disc">
                          <li>Posicione seu rosto centralizado na área de captura</li>
                          <li>Aguarde a câmera carregar (se necessário, permita o acesso)</li>
                          <li>Clique em <strong>"Capturar Foto"</strong> quando estiver pronto</li>
                          <li>A foto será enviada junto com o registro de ponto</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Registro sem Foto</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Se a câmera não estiver disponível ou você preferir, pode clicar em
                        <strong> "Registrar sem Foto"</strong>. O registro será salvo normalmente,
                        mas sem a verificação facial.
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Problemas com Câmera</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-1">
                        <p>Se a câmera não funcionar:</p>
                        <ul className="ml-4 space-y-1 list-disc">
                          <li>Verifique se o navegador tem permissão para acessar a câmera</li>
                          <li>Certifique-se de que nenhum outro aplicativo está usando a câmera</li>
                          <li>Clique em "Tentar Novamente" se aparecer erro</li>
                          <li>Como alternativa, use "Registrar sem Foto"</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Validação de Geolocalização no Terminal
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    O terminal possui um sistema de validação de localização em duas camadas:
                  </p>
                  
                  <div className="space-y-3">
                    <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Validação do Terminal (Bloqueante)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p className="font-semibold text-green-900 dark:text-green-100">
                          Esta validação BLOQUEIA o registro se não for atendida.
                        </p>
                        <p>
                          O sistema compara a localização ATUAL do funcionário com a localização
                          REGISTRADA DO TERMINAL (configurada pelo administrador).
                        </p>
                        <div className="bg-white dark:bg-gray-900 p-3 rounded border border-green-200 dark:border-green-800">
                          <p className="text-xs">
                            <strong>✓ Dentro da área:</strong> "Terminal dentro da área autorizada (XXm)"
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            <strong>❌ Fora da área:</strong> "Registro bloqueado: terminal fora da área autorizada"
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          Validação do Setor (Informativa)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p className="font-semibold text-blue-900 dark:text-blue-100">
                          Esta validação NÃO bloqueia o registro, apenas informa.
                        </p>
                        <p>
                          O sistema também compara com a localização do setor/departamento do funcionário,
                          mas apenas para fins informativos.
                        </p>
                        <div className="bg-white dark:bg-gray-900 p-3 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-xs">
                            <strong>✓ Dentro do setor:</strong> "Funcionário dentro do setor autorizado (XXm)"
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            <strong>⚠ Fora do setor:</strong> "Funcionário fora do setor autorizado (XXm)" 
                            <span className="block mt-1">(registro permitido, mas marcado para revisão)</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-4 bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>💡 Resumo:</strong> O registro só é bloqueado se o terminal estiver fora
                      da área configurada. A validação do setor do funcionário é apenas um aviso adicional
                      que aparece nos relatórios.
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">Recursos de Segurança</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Autenticação Stateless</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        Cada login gera um token temporário de 10 minutos. Não há sessões permanentes no terminal.
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Logout Automático</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        Após cada registro de ponto, o sistema faz logout automaticamente para proteger a privacidade.
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Rastreamento de IP</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        O endereço IP é registrado para auditoria e segurança.
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Registro do Terminal</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        Cada ponto registra qual terminal foi usado, facilitando auditoria.
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Validação em Tempo Real</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        Geofencing e verificações de turno são processadas imediatamente.
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Foto Facial Opcional</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        A captura facial aumenta a segurança, mas pode ser ignorada se necessário.
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">Visualização dos Registros</h3>
                  <p className="text-muted-foreground mb-3">
                    Todos os registros feitos pelo terminal ficam disponíveis:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Para funcionários:</strong> No menu "Relatórios Mensais", com detalhes de data, hora, foto e validações</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Para administradores:</strong> Em "Registros de Ponto", com informações completas incluindo terminal usado, IP, e todas as validações</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Fotos capturadas:</strong> Podem ser visualizadas clicando no ícone de câmera nos relatórios</span>
                    </li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gestão */}
        <TabsContent value="gestao">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Gestão Administrativa
                </CardTitle>
                <CardDescription>
                  Funcionalidades disponíveis para administradores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Gestão de Funcionários
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Cadastre, edite e gerencie todos os funcionários da sua empresa.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Cadastro Completo:</strong> Nome, CPF, email, cargo, departamento, turno, salário</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Importação CSV:</strong> Importe múltiplos funcionários de uma vez usando planilha</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Exportação CSV:</strong> Exporte dados dos funcionários para análise externa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Registro Interno:</strong> Campo para integração com sistemas externos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Atribuição de Turnos:</strong> Configure turnos específicos por período para cada funcionário</span>
                    </li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Gestão de Setores e Turnos
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Setores/Departamentos</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Organize sua empresa em setores e configure geofencing para cada um.
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Defina nome, descrição e supervisor</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Configure área geográfica permitida (mapa interativo)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Busque endereço por CEP ou clique no mapa</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Ajuste o raio de tolerância (10-1000 metros)</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Turnos de Trabalho</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Configure horários de trabalho, intervalos e dias da semana.
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Horário de início e fim (suporta turnos noturnos)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Configure intervalos pagos e não pagos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Selecione dias da semana ativos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>Atribua turnos específicos a funcionários com datas de vigência</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Sistema de Horas Extras e Banco de Horas
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    O sistema calcula automaticamente as horas extras quando um funcionário trabalha além do
                    esperado para seu turno. As horas extras podem ser pagas ou creditadas em banco de horas.
                  </p>

                  <div className="space-y-4">
                    <Card className="bg-primary/5 border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Configuração de Regras (Administrador)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p><strong>Acesse: Menu Admin → Configurar Horas Extras</strong></p>
                        <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                          <p className="font-semibold text-primary mb-2">Crie regras personalizadas por:</p>
                          <ul className="ml-4 space-y-1 text-xs">
                            <li>• <strong>Departamento:</strong> Diferentes setores podem ter regras diferentes</li>
                            <li>• <strong>Turno:</strong> Configure percentuais específicos por horário de trabalho</li>
                            <li>• <strong>Tipo de Dia:</strong> Dias úteis, finais de semana ou feriados</li>
                            <li>• <strong>Modo:</strong> Pago (💰) ou Banco de Horas (🏦)</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200">
                          <p className="text-xs text-blue-900 dark:text-blue-100">
                            <strong>💡 Exemplo de Configuração:</strong>
                          </p>
                          <ul className="mt-2 ml-4 space-y-1 text-xs text-blue-800 dark:text-blue-200">
                            <li>• 0h - 2h extras: +50% (Banco de Horas)</li>
                            <li>• 2h - 4h extras: +100% (Banco de Horas)</li>
                            <li>• Mais de 4h: +200% (Pago)</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-secondary/5 border-l-4 border-l-secondary">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Coins className="h-4 w-4" />
                          Cálculo Automático
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>O sistema calcula automaticamente as horas extras quando você registra a saída:</p>
                        <ol className="ml-4 space-y-1 list-decimal text-xs">
                          <li>Compara as horas trabalhadas com as horas esperadas do turno</li>
                          <li>Identifica se há horas além do esperado</li>
                          <li>Aplica a regra configurada para seu departamento/turno</li>
                          <li>Calcula o valor considerando os diferentes percentuais por faixa</li>
                          <li>Credita no banco de horas ou marca para pagamento</li>
                        </ol>
                        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded border border-green-200 mt-3">
                          <p className="text-xs text-green-900 dark:text-green-100">
                            ✅ <strong>Exemplo:</strong> Trabalhou 10 horas em um turno de 8 horas = 2 horas extras.
                            Com regra de +50%, você ganha crédito de 3 horas no banco de horas (2h × 1.5).
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Consulta do Banco de Horas (Funcionário)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Acesse: Menu → Banco de Horas</strong></p>
                        <p>Veja seu saldo atual e todo o histórico de movimentações:</p>
                        <ul className="ml-4 space-y-1 text-xs">
                          <li>• <strong>Saldo Atual:</strong> Total de horas creditadas disponíveis</li>
                          <li>• <strong>Histórico de Transações:</strong> Cada crédito com data, valor e origem</li>
                          <li>• <strong>Detalhes:</strong> Regra aplicada, percentual e observações</li>
                        </ul>
                        <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded border border-amber-200 mt-3">
                          <p className="text-xs text-amber-900 dark:text-amber-100">
                            ⚠️ <strong>Importante:</strong> O uso das horas do banco (para folgas) deve ser autorizado
                            pelo RH. O sistema registra os créditos, mas a utilização depende de aprovação.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Diferença: Pago vs. Banco de Horas</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded border border-green-200">
                            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">💰 Modo Pago</p>
                            <p>Horas extras serão pagas na folha de pagamento seguinte, com os percentuais aplicados.</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200">
                            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">🏦 Banco de Horas</p>
                            <p>Horas são creditadas e podem ser usadas para folgas compensatórias no futuro.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Gestão de Escalas e Rotações
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crie escalas de trabalho automáticas com rotações personalizadas para diferentes departamentos.
                  </p>

                  <div className="space-y-4">
                    <Card className="bg-primary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">O que são Escalas e Rotações?</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          Escalas e rotações permitem criar padrões automáticos de trabalho onde funcionários
                          alternam entre períodos de trabalho e folga de forma programada.
                        </p>
                        <ul className="ml-4 space-y-1 text-xs">
                          <li>✅ Configure rotações diárias, semanais, mensais ou customizadas</li>
                          <li>✅ Defina segmentos de trabalho e folga</li>
                          <li>✅ Geração automática de escala para qualquer período</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-secondary/5 border-l-4 border-l-secondary">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Tipos de Rotação Disponíveis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <div className="space-y-2">
                          <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                            <p className="font-semibold text-primary text-xs mb-1">📅 Rotação Diária</p>
                            <p className="text-xs">Alterna dia a dia. Exemplo: 1 dia trabalha, 1 dia folga</p>
                          </div>
                          
                          <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                            <p className="font-semibold text-primary text-xs mb-1">📆 Rotação Semanal</p>
                            <p className="text-xs">Alterna por semanas. Exemplo: 1 semana trabalha, 1 semana folga</p>
                          </div>
                          
                          <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                            <p className="font-semibold text-primary text-xs mb-1">🗓️ Rotação Mensal</p>
                            <p className="text-xs">Alterna por meses. Exemplo: 1 mês trabalha, 1 mês folga</p>
                          </div>
                          
                          <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                            <p className="font-semibold text-primary text-xs mb-1">⚙️ Rotação Customizada</p>
                            <p className="text-xs">Define número exato de dias. Exemplo: 5 dias trabalha, 2 dias folga</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          Exemplo Prático: Escala 5×2
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p className="text-blue-900 dark:text-blue-100">
                          <strong>Cenário:</strong> Equipe que trabalha 5 dias seguidos e folga 2 dias.
                        </p>
                        
                        <div className="bg-white dark:bg-gray-900 p-4 rounded border border-blue-200">
                          <p className="text-xs font-semibold mb-2">Configuração:</p>
                          <ul className="space-y-1 text-xs ml-4">
                            <li>• <strong>Tipo de Rotação:</strong> Customizada</li>
                            <li>• <strong>Dias de Trabalho:</strong> 5 dias</li>
                            <li>• <strong>Dias de Folga:</strong> 2 dias</li>
                            <li>• <strong>Turno Associado:</strong> Comercial (08:00 - 17:00)</li>
                          </ul>
                          
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-xs font-semibold mb-2">Resultado da Escala:</p>
                            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">Seg<br/>✓</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">Ter<br/>✓</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">Qua<br/>✓</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">Qui<br/>✓</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">Sex<br/>✓</div>
                              <div className="bg-red-100 dark:bg-red-900 p-1 rounded">Sáb<br/>-</div>
                              <div className="bg-red-100 dark:bg-red-900 p-1 rounded">Dom<br/>-</div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                              (Verde = Trabalho | Vermelho = Folga)
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Exemplo Prático: Escala 12×36
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p className="text-green-900 dark:text-green-100">
                          <strong>Cenário:</strong> Plantão de 12 horas com 36 horas de descanso (comum em saúde e segurança).
                        </p>
                        
                        <div className="bg-white dark:bg-gray-900 p-4 rounded border border-green-200">
                          <p className="text-xs font-semibold mb-2">Configuração:</p>
                          <ul className="space-y-1 text-xs ml-4">
                            <li>• <strong>Tipo de Rotação:</strong> Customizada</li>
                            <li>• <strong>Dias de Trabalho:</strong> 1 dia (12 horas)</li>
                            <li>• <strong>Dias de Folga:</strong> 1 dia (36 horas de descanso)</li>
                            <li>• <strong>Turno Associado:</strong> Plantão Diurno (07:00 - 19:00)</li>
                          </ul>
                          
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs font-semibold mb-2">Resultado da Escala (15 dias):</p>
                            <div className="grid grid-cols-8 gap-1 text-center text-xs">
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D1<br/>✓</div>
                              <div className="bg-red-100 dark:bg-red-900 p-1 rounded">D2<br/>-</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D3<br/>✓</div>
                              <div className="bg-red-100 dark:bg-red-900 p-1 rounded">D4<br/>-</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D5<br/>✓</div>
                              <div className="bg-red-100 dark:bg-red-900 p-1 rounded">D6<br/>-</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D7<br/>✓</div>
                              <div className="bg-red-100 dark:bg-red-900 p-1 rounded">D8<br/>-</div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                              E assim sucessivamente...
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Como Criar uma Escala de Rotação</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <ol className="space-y-2 list-decimal list-inside text-xs">
                          <li>Acesse o menu <strong>"Gestão de Escalas"</strong> (administrador)</li>
                          <li>Clique em <strong>"Criar Nova Escala"</strong></li>
                          <li>Preencha:
                            <ul className="ml-6 mt-1 space-y-1 list-disc">
                              <li>Nome da escala (ex: "Equipe Comercial 5×2")</li>
                              <li>Tipo de rotação (diária, semanal, mensal ou customizada)</li>
                              <li>Segmentos de trabalho e folga</li>
                              <li>Turno padrão para os dias de trabalho</li>
                            </ul>
                          </li>
                          <li>Salve a configuração</li>
                          <li>Gere a escala para o período desejado (mensal, trimestral, etc.)</li>
                          <li>Atribua funcionários à escala criada</li>
                        </ol>
                      </CardContent>
                    </Card>

                    <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-900 dark:text-amber-100">
                        <strong>💡 Dica:</strong> As escalas e rotações são especialmente úteis para equipes que trabalham
                        em turnos alternados, plantões ou regimes especiais de trabalho. Uma vez configurada, a escala
                        pode ser reutilizada mensalmente sem necessidade de reconfiguração.
                      </p>
                    </div>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="relatorios">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Relatórios e Análises
                </CardTitle>
                <CardDescription>
                  Visualize e analise dados de ponto e desempenho
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3">Relatório Mensal de Ponto</h3>
                  <p className="text-muted-foreground mb-3">
                    Consulte todos os registros de ponto do mês selecionado.
                  </p>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Acesse o menu <strong>"Relatórios Mensais"</strong></li>
                    <li>Selecione o mês e ano desejado</li>
                    <li>Clique em <strong>"Gerar Relatório"</strong></li>
                    <li>Visualize a lista com todos os registros do período</li>
                  </ol>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">Informações do Relatório</h3>
                  <p className="text-muted-foreground mb-3">
                    Cada registro exibe as seguintes informações:
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Horários</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        Entrada, saída, início e fim de intervalos
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Horas Trabalhadas</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        Total de horas do dia (descontando intervalos)
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Localização</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        Coordenadas GPS e validação de geofence
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Irregularidades</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        Atrasos, faltas, horas insuficientes
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    Sistema de Detecção de Irregularidades
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    O sistema analisa automaticamente cada registro e identifica:
                  </p>
                  <div className="space-y-2">
                    <Card className="border-l-4 border-l-red-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Falta</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        Quando não há registro de entrada no dia
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Registro Incompleto</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        Quando falta registro de saída
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Atraso</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        Entrada mais de 5 minutos após o horário do turno
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-yellow-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Horas Insuficientes</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        Trabalhou menos que o esperado (tolerância de 15 minutos)
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-4 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>💡 Dica:</strong> Clique em "Ver detalhes" em qualquer registro marcado como "Irregular"
                      para ver a lista completa de motivos e informações sobre horas esperadas vs. trabalhadas.
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Recursos Interativos do Relatório
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    O relatório mensal possui recursos visuais interativos para facilitar a análise:
                  </p>
                  
                  <div className="space-y-3">
                    <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Camera className="h-4 w-4 text-green-600" />
                          Ícone de Câmera Verde
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>
                          Quando você vê o ícone de câmera verde com o texto "Verificado" na coluna de verificação,
                          significa que o registro foi feito com reconhecimento facial bem-sucedido.
                        </p>
                        <div className="bg-white dark:bg-gray-900 p-3 rounded border border-green-200">
                          <p className="text-xs flex items-center gap-2">
                            <Camera className="h-4 w-4 text-green-600" />
                            <strong>Passe o mouse sobre o ícone</strong> para ver a confirmação de verificação facial.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          Triângulo Amarelo de Aviso
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>
                          O triângulo amarelo ao lado da data indica que foram detectados <strong>problemas de validação</strong>
                          no registro (como geofence fora da área ou horário fora do turno).
                        </p>
                        <div className="bg-white dark:bg-gray-900 p-3 rounded border border-amber-200 space-y-2">
                          <p className="text-xs">
                            <strong>⚠️ Clique no triângulo</strong> para abrir automaticamente o modal de detalhes
                            e ver exatamente quais validações falharam.
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-400">
                            Ao passar o mouse, aparece a mensagem: "Problemas de validação detectados - Clique para ver detalhes"
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          Botão "Ver Detalhes"
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>
                          Clique no link "Ver detalhes" ou "⚠ Ver detalhes" em qualquer registro para abrir
                          um modal completo com:
                        </p>
                        <ul className="ml-4 space-y-1 text-xs">
                          <li>• Validações de entrada e saída (geofence, horário de turno)</li>
                          <li>• Endereço IP registrado</li>
                          <li>• Coordenadas de localização GPS</li>
                          <li>• Fotos faciais (quando disponíveis)</li>
                          <li>• Irregularidades detectadas com descrição detalhada</li>
                          <li>• Resumo de horas trabalhadas (regulares e extras)</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-4 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>💡 Dica:</strong> Todos os elementos com informações adicionais possuem tooltips (mensagens
                      que aparecem ao passar o mouse). Experimente passar o mouse sobre os ícones e indicadores para
                      descobrir mais informações!
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">Relatórios Administrativos</h3>
                  <p className="text-muted-foreground mb-3">
                    Administradores têm acesso a visualizações adicionais:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Registros de Todos os Funcionários:</strong> Visualize ponto de qualquer colaborador</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Dashboard com Estatísticas:</strong> Visão geral de presença, ausências e irregularidades</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Filtros Avançados:</strong> Por departamento, período, funcionário</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Exportação de Dados:</strong> Exporte relatórios em CSV para análise externa</span>
                    </li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recrutamento */}
        <TabsContent value="recrutamento">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Recrutamento e Seleção
                </CardTitle>
                <CardDescription>
                  Gestão completa do processo de contratação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3">Módulo de Recrutamento</h3>
                  <p className="text-muted-foreground mb-4">
                    Sistema completo para gerenciar vagas, candidatos e processo seletivo.
                  </p>

                  <div className="space-y-4">
                    <Card className="bg-primary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          1. Vagas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Crie e publique vagas de emprego:</strong></p>
                        <ul className="ml-4 space-y-1">
                          <li>• Título, descrição completa e requisitos</li>
                          <li>• Localização e tipo de contrato</li>
                          <li>• Faixa salarial e nível de experiência</li>
                          <li>• Status: Rascunho → Publicada → Fechada</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-secondary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          2. Candidatos
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Banco de talentos centralizado:</strong></p>
                        <ul className="ml-4 space-y-1">
                          <li>• Cadastro com informações de contato</li>
                          <li>• Upload de currículo (PDF, DOC, DOCX)</li>
                          <li>• Histórico de candidaturas</li>
                          <li>• Busca e filtros avançados</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-primary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          3. Candidaturas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Acompanhe o processo seletivo:</strong></p>
                        <ul className="ml-4 space-y-1">
                          <li>• Vincule candidatos às vagas</li>
                          <li>• Fluxo: Candidatado → Triagem → Entrevista → Teste → Aprovado → Contratado</li>
                          <li>• Notas e observações em cada etapa</li>
                          <li>• Botões de ação rápida para mudança de status</li>
                          <li>• Badges coloridos para identificação visual</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-secondary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          4. Admissão Digital
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Onboarding digital de novos funcionários:</strong></p>
                        <ul className="ml-4 space-y-1">
                          <li>• Gere links seguros para candidatos aprovados</li>
                          <li>• Controle de expiração (7 dias)</li>
                          <li>• Status: Pendente → Em Andamento → Concluído</li>
                          <li>• Copie e envie o link com um clique</li>
                          <li>• Coleta de documentos e informações</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">Fluxo Completo</h3>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">1.</span>
                        <span>Crie uma vaga e publique</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">2.</span>
                        <span>Cadastre candidatos ou receba candidaturas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">3.</span>
                        <span>Vincule candidatos às vagas na seção Candidaturas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">4.</span>
                        <span>Acompanhe o processo mudando status e adicionando notas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">5.</span>
                        <span>Aprove o candidato e gere link de admissão digital</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">6.</span>
                        <span>Envie o link para o candidato preencher documentação</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">7.</span>
                        <span>Após conclusão, cadastre como funcionário no sistema</span>
                      </li>
                    </ol>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Outros Recursos */}
        <TabsContent value="outros">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mensagens Corporativas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Sistema interno de mensagens para comunicação entre funcionários.</p>
                <ul className="ml-4 space-y-1">
                  <li>• Envie e receba mensagens privadas</li>
                  <li>• Notificações de novas mensagens</li>
                  <li>• Arquive ou exclua conversas</li>
                  <li>• Busca por remetente ou conteúdo</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Central de documentos da empresa.</p>
                <ul className="ml-4 space-y-1">
                  <li>• Acesse políticas, manuais e comunicados</li>
                  <li>• Download de formulários e modelos</li>
                  <li>• Documentos organizados por categoria</li>
                  <li>• Upload de documentos (administradores)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Cursos e Treinamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Plataforma de capacitação e desenvolvimento.</p>
                <ul className="ml-4 space-y-1">
                  <li>• Acesse cursos disponíveis para você</li>
                  <li>• Assista vídeos e leia materiais</li>
                  <li>• Responda questionários de avaliação</li>
                  <li>• Acompanhe seu progresso e certificados</li>
                  <li>• Gestão de cursos e questões (administradores)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações de Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Gerencie sua conta e preferências.</p>
                <ul className="ml-4 space-y-1">
                  <li>• Altere sua senha a qualquer momento</li>
                  <li>• Atualize foto de perfil</li>
                  <li>• Configure notificações</li>
                  <li>• Revise suas informações pessoais</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  <Download className="h-5 w-5" />
                  Importação e Exportação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p><strong>Importação de Funcionários (CSV):</strong></p>
                <ol className="ml-4 space-y-1 list-decimal">
                  <li>Baixe o modelo CSV na página de funcionários</li>
                  <li>Preencha com os dados (use ponto e vírgula como separador)</li>
                  <li>Salve como UTF-8 para evitar problemas de acentuação</li>
                  <li>Faça upload do arquivo - erros serão reportados linha por linha</li>
                </ol>
                <p className="mt-3"><strong>Exportação de Dados:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Exporte lista de funcionários</li>
                  <li>• Exporte relatórios de ponto</li>
                  <li>• Formato CSV compatível com Excel</li>
                  <li>• Dados filtrados por sua empresa</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

        {/* Rodapé */}
        <Card className="mt-8 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Precisa de Ajuda?</h3>
              <p className="text-sm text-muted-foreground">
                Entre em contato com o departamento de RH ou TI da sua empresa para suporte técnico e dúvidas sobre o sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
