import { Book, Clock, Users, MapPin, FileText, MessageSquare, Calendar, GraduationCap, Briefcase, Shield, Settings, TrendingUp, Download, Upload, CheckCircle, AlertCircle, Tablet, Camera, DollarSign, Coins, FileDown, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TopBar from "@/components/layout/top-bar";
import Sidebar from "@/components/layout/sidebar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface ScreenshotData {
  [key: string]: string;
}

export default function Manual() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [screenshots, setScreenshots] = useState<ScreenshotData>({});
  const [capturing, setCapturing] = useState(false);

  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  // Funções de captura de screenshots
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
    
    await captureScreen("screen-legalfiles", "legalfiles");
    await new Promise(r => setTimeout(r, 500));
    
    await captureScreen("screen-terminal", "terminal");
    
    setCapturing(false);
    
    toast({
      title: "Screenshots capturadas!",
      description: "Todas as telas foram capturadas com sucesso.",
    });
  };

  // Salvar screenshots no localStorage sempre que mudarem
  useEffect(() => {
    if (Object.keys(screenshots).length > 0) {
      localStorage.setItem('rhnet-screenshots', JSON.stringify(screenshots));
    }
  }, [screenshots]);

  const handleExportPdf = () => {
    // Verificar se há screenshots salvos
    const savedScreenshots = localStorage.getItem('rhnet-screenshots');
    const screenshots = savedScreenshots ? JSON.parse(savedScreenshots) : null;
    
    if (!screenshots || Object.keys(screenshots).length === 0) {
      toast({
        title: "Screenshots não encontrados",
        description: "Acesse /screenshot-helper para capturar as telas primeiro.",
        variant: "destructive",
      });
      window.open('/screenshot-helper', '_blank');
      return;
    }
    
    setIsGeneratingPdf(true);
    toast({ title: "Gerando PDF...", description: "Por favor, aguarde enquanto criamos o documento." });

    // Usar setTimeout para permitir que o React atualize o UI antes de bloquear com a geração síncrona
    setTimeout(() => {
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

        // Função para adicionar screenshot real ao PDF
        const addScreenshot = (imageData: string, title: string) => {
          yPosition += 5;
          checkNewPage(90);
          
          // Título da screenshot
          pdf.setTextColor(26, 57, 96);
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.text(title, margin, yPosition);
          yPosition += 7;
          
          // Adicionar imagem
          try {
            const imgWidth = contentWidth;
            const imgHeight = 70; // Altura fixa para consistência
            pdf.addImage(imageData, 'PNG', margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 5;
          } catch (error) {
            console.error('Erro ao adicionar imagem:', error);
            pdf.setTextColor(200, 0, 0);
            pdf.setFontSize(9);
            pdf.text('[Erro ao carregar screenshot]', margin, yPosition);
            yPosition += 10;
          }
          
          pdf.setTextColor(0, 0, 0);
        };

        // Função para desenhar mockup de tela
        const drawScreenMockup = (title: string, elements: string[]) => {
          yPosition += 5;
          checkNewPage(70);
          
          // Borda externa (sombra)
          pdf.setFillColor(200, 200, 200);
          pdf.rect(margin + 2, yPosition + 2, contentWidth, 65, "F");
          
          // Fundo da tela
          pdf.setFillColor(255, 255, 255);
          pdf.rect(margin, yPosition, contentWidth, 65, "F");
          
          // Borda da tela
          pdf.setDrawColor(26, 57, 96);
          pdf.setLineWidth(0.5);
          pdf.rect(margin, yPosition, contentWidth, 65);
          
          // Header da tela (barra azul)
          pdf.setFillColor(26, 57, 96);
          pdf.rect(margin, yPosition, contentWidth, 10, "F");
          
          // Título do mockup
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.text(title, margin + 5, yPosition + 6.5);
          
          // Elementos da tela
          pdf.setTextColor(60, 60, 60);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          let elementY = yPosition + 18;
          elements.forEach((element, index) => {
            if (element.startsWith("BOTÃO:")) {
              // Desenhar botão
              pdf.setFillColor(45, 175, 130);
              pdf.roundedRect(margin + 40, elementY - 3, 100, 8, 2, 2, "F");
              pdf.setTextColor(255, 255, 255);
              pdf.setFont("helvetica", "bold");
              pdf.text(element.replace("BOTÃO:", "").trim(), margin + 90, elementY + 2, { align: "center" });
              pdf.setTextColor(60, 60, 60);
              pdf.setFont("helvetica", "normal");
              elementY += 12;
            } else if (element.startsWith("ÍCONE:")) {
              // Desenhar ícone simulado
              pdf.setDrawColor(100, 100, 100);
              pdf.circle(margin + 10, elementY, 2);
              pdf.text(element.replace("ÍCONE:", "").trim(), margin + 15, elementY + 1);
              elementY += 8;
            } else {
              // Texto normal
              pdf.text(element, margin + 5, elementY);
              elementY += 6;
            }
          });
          
          yPosition += 70;
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
        { title: "7. Arquivos Legais AFD/AEJ", page: 21 },
        { title: "8. Outros Recursos", page: 24 },
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
      ];

      pontoText.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Screenshot da página inicial
      if (screenshots.home) {
        addScreenshot(screenshots.home, "Tela: Página Inicial - Registrar Ponto");
      }

      const pontoText2 = [
        "",
        "VALIDAÇÕES DE SEGURANÇA:",
        "",
        "• Verificação Facial: Cada registro inclui uma foto para comprovar presença",
        "• Geolocalização: Valida se você está próximo ao local de trabalho",
        "• Geofencing: Sistema verifica se você está dentro do perímetro permitido",
        "• Registro de IP: Endereço IP é registrado para auditoria",
      ];

      pontoText2.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Nota sobre verificação facial (não temos screenshot específico dessa tela)
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text("* Durante o registro, o sistema solicita captura de foto facial para validação", margin, yPosition);
      yPosition += 10;
      pdf.setTextColor(0, 0, 0);

      const pontoText3 = [
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

      pontoText3.forEach(line => {
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
      ];

      terminalText.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Screenshot do terminal
      if (screenshots.terminal) {
        addScreenshot(screenshots.terminal, "Tela: Terminal de Ponto (Modo Tablet)");
      }

      const terminalText2 = [
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

      terminalText2.forEach(line => {
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
      ];

      gestaoText.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Screenshot gestão de funcionários
      if (screenshots.employees) {
        addScreenshot(screenshots.employees, "Tela: Admin - Gestão de Funcionários");
      }

      const gestaoText2 = [
        "",
        "GESTÃO DE SETORES E TURNOS:",
        "",
        "• Acesse Admin > Setores",
        "• Crie departamentos e configure geofencing (perímetro permitido)",
        "• Defina turnos com horários de entrada/saída",
        "• Configure tolerâncias e pausas automáticas",
        "• Atribua funcionários aos turnos",
      ];

      gestaoText2.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Screenshot setores
      if (screenshots.sectors) {
        addScreenshot(screenshots.sectors, "Tela: Admin - Setores e Geofencing");
      }

      const gestaoText3 = [
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

      gestaoText3.forEach(line => {
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
      ];

      relatoriosText.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Screenshot relatórios
      if (screenshots.reports) {
        addScreenshot(screenshots.reports, "Tela: Admin - Relatório de Ponto Mensal");
      }

      const relatoriosText2 = [
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

      relatoriosText2.forEach(line => {
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
      ];

      recrutamentoText.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Screenshot recrutamento
      if (screenshots.recruitment) {
        addScreenshot(screenshots.recruitment, "Tela: Admin - Recrutamento e Seleção");
      }

      const recrutamentoText2 = [
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

      recrutamentoText2.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Seção 7: Arquivos Legais AFD/AEJ
      addNewPage();
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 57, 96);
      pdf.text("7. Arquivos Legais AFD/AEJ", margin, yPosition);
      yPosition += 12;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      const legaisText = [
        "SOBRE OS ARQUIVOS LEGAIS:",
        "",
        "Os arquivos AFD e AEJ são documentos eletrônicos obrigatórios conforme Portaria 671/2021",
        "do Ministério do Trabalho para empresas que utilizam controle de ponto eletrônico.",
        "",
        "AFD - ARQUIVO FONTE DE DADOS:",
        "",
        "• Contém todas as marcações de ponto do período",
        "• Identificação do empregador (CNPJ/CEI)",
        "• Dados do equipamento REP",
        "• Validação CRC-16 por registro",
        "• Hash SHA-256 de integridade",
        "• Usado para auditorias e fiscalização",
        "",
        "AEJ - ARQUIVO ELETRÔNICO DE JORNADA:",
        "",
        "• Consolida horários contratuais e jornadas trabalhadas",
        "• Vínculos empregatícios",
        "• Horários contratuais por funcionário",
        "• Marcações consolidadas",
        "• Resumo de horas trabalhadas",
      ];

      legaisText.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Screenshot de arquivos legais se disponível
      if (screenshots.legalfiles) {
        addScreenshot(screenshots.legalfiles, "Tela: Admin - Arquivos Legais AFD/AEJ");
      }

      const legaisText2 = [
        "",
        "COMO EXPORTAR ARQUIVOS:",
        "",
        "1. Acesse Admin → Arquivos Legais",
        "2. Clique em 'Exportar AFD' ou 'Exportar AEJ'",
        "3. Selecione o período (data inicial e final)",
        "4. Clique em 'Exportar Arquivo'",
        "5. O arquivo será gerado em formato .txt",
        "6. Faça download na tabela de histórico",
        "",
        "COMO IMPORTAR AFD:",
        "",
        "1. Acesse Admin → Arquivos Legais",
        "2. Clique em 'Importar AFD'",
        "3. Selecione arquivo .txt no formato AFD",
        "4. Sistema valida CRC-16, NSR e estrutura",
        "5. Se válido, marcações são importadas",
        "",
        "QUANDO GERAR:",
        "",
        "• Mensalmente para histórico organizado",
        "• Quando solicitado em fiscalização",
        "• Como backup dos registros de ponto",
        "• Para análise interna de jornadas",
      ];

      legaisText2.forEach(line => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Seção 8: Outros Recursos
      addNewPage();
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 57, 96);
      pdf.text("8. Outros Recursos", margin, yPosition);
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
    }, 200); // Delay de 200ms para permitir atualização do UI
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Manual do Sistema" />
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-blue-50 via-teal-50 to-green-50"  data-testid="main-content">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Book className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Manual do Sistema RHNet</h1>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowScreenshotModal(true)}
                data-testid="button-capture-screens"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capturar Telas
              </Button>
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
          </div>
          <p className="text-muted-foreground text-lg">
            Guia completo para utilização de todas as funcionalidades do sistema
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            💡 Dica: Clique em "Capturar Telas" para capturar screenshots no modal antes de gerar o PDF
          </p>
        </div>

      <Tabs defaultValue="introducao" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-8 mb-6">
          <TabsTrigger value="introducao">Introdução</TabsTrigger>
          <TabsTrigger value="ponto">Ponto</TabsTrigger>
          <TabsTrigger value="terminal">Terminal</TabsTrigger>
          <TabsTrigger value="gestao">Gestão</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="recrutamento">Recrutamento</TabsTrigger>
          <TabsTrigger value="legais">Arquivos Legais</TabsTrigger>
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

                    <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-600" />
                          Exemplo Prático: Escala 4×2
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p className="text-purple-900 dark:text-purple-100">
                          <strong>Cenário:</strong> Equipe que trabalha 4 dias consecutivos e folga 2 dias.
                        </p>
                        
                        <div className="bg-white dark:bg-gray-900 p-4 rounded border border-purple-200">
                          <p className="text-xs font-semibold mb-2">Configuração:</p>
                          <ul className="space-y-1 text-xs ml-4">
                            <li>• <strong>Tipo de Rotação:</strong> Customizada</li>
                            <li>• <strong>Dias de Trabalho:</strong> 4 dias</li>
                            <li>• <strong>Dias de Folga:</strong> 2 dias</li>
                            <li>• <strong>Turno Associado:</strong> Comercial (08:00 - 17:00)</li>
                          </ul>
                          
                          <div className="mt-3 pt-3 border-t border-purple-200">
                            <p className="text-xs font-semibold mb-2">Resultado da Escala (12 dias):</p>
                            <div className="grid grid-cols-6 gap-1 text-center text-xs">
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D1<br/>✓</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D2<br/>✓</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D3<br/>✓</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D4<br/>✓</div>
                              <div className="bg-red-100 dark:bg-red-900 p-1 rounded">D5<br/>-</div>
                              <div className="bg-red-100 dark:bg-red-900 p-1 rounded">D6<br/>-</div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                              Repete a cada 6 dias...
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-600" />
                          Exemplo Prático: Escala 5×1 (Folga Rotativa)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p className="text-amber-900 dark:text-amber-100">
                          <strong>Cenário:</strong> Trabalha 5 dias consecutivos e folga 1 dia. A folga roda pelos dias da semana.
                        </p>
                        
                        <div className="bg-white dark:bg-gray-900 p-4 rounded border border-amber-200">
                          <p className="text-xs font-semibold mb-2">Configuração:</p>
                          <ul className="space-y-1 text-xs ml-4">
                            <li>• <strong>Tipo de Rotação:</strong> Customizada</li>
                            <li>• <strong>Dias de Trabalho:</strong> 5 dias consecutivos</li>
                            <li>• <strong>Folga:</strong> 1 dia rotativo</li>
                            <li>• <strong>Turno Associado:</strong> Comercial (08:00 - 17:00)</li>
                          </ul>
                          
                          <div className="mt-3 pt-3 border-t border-amber-200">
                            <p className="text-xs font-semibold mb-2">Exemplo de Rotação (12 dias):</p>
                            <div className="space-y-2">
                              <div className="grid grid-cols-6 gap-1 text-center text-xs">
                                <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D1<br/>✓</div>
                                <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D2<br/>✓</div>
                                <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D3<br/>✓</div>
                                <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D4<br/>✓</div>
                                <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D5<br/>✓</div>
                                <div className="bg-red-100 dark:bg-red-900 p-1 rounded">D6<br/>-</div>
                              </div>
                              <div className="grid grid-cols-6 gap-1 text-center text-xs">
                                <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D7<br/>✓</div>
                                <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D8<br/>✓</div>
                                <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D9<br/>✓</div>
                                <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D10<br/>✓</div>
                                <div className="bg-green-100 dark:bg-green-900 p-1 rounded">D11<br/>✓</div>
                                <div className="bg-red-100 dark:bg-red-900 p-1 rounded">D12<br/>-</div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                              A folga cai em um dia diferente da semana a cada ciclo
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-indigo-600" />
                          Exemplo Prático: Escala 6×1 (Folga Fixa Semanal)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p className="text-indigo-900 dark:text-indigo-100">
                          <strong>Cenário:</strong> Trabalho de segunda a sábado com folga fixa aos domingos (varejo).
                        </p>
                        
                        <div className="bg-white dark:bg-gray-900 p-4 rounded border border-indigo-200">
                          <p className="text-xs font-semibold mb-2">Configuração:</p>
                          <ul className="space-y-1 text-xs ml-4">
                            <li>• <strong>Tipo de Rotação:</strong> Semanal Fixa</li>
                            <li>• <strong>Dias de Trabalho:</strong> 6 dias (Segunda a Sábado)</li>
                            <li>• <strong>Folga:</strong> 1 dia fixo (Domingo)</li>
                            <li>• <strong>Turno Associado:</strong> Comercial (09:00 - 18:00)</li>
                          </ul>
                          
                          <div className="mt-3 pt-3 border-t border-indigo-200">
                            <p className="text-xs font-semibold mb-2">Resultado da Escala:</p>
                            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">Seg<br/>✓</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">Ter<br/>✓</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">Qua<br/>✓</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">Qui<br/>✓</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">Sex<br/>✓</div>
                              <div className="bg-green-100 dark:bg-green-900 p-1 rounded">Sáb<br/>✓</div>
                              <div className="bg-red-100 dark:bg-red-900 p-1 rounded">Dom<br/>-</div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                              Folga sempre no mesmo dia (domingo)
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

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    DISC Assessment - Análise de Perfil Comportamental
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      O RHNet integra a metodologia DISC para análise de perfil comportamental dos candidatos, 
                      permitindo avaliar a compatibilidade entre o perfil do candidato e os requisitos da vaga.
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">O que é DISC?</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        DISC é uma ferramenta de avaliação comportamental que mede quatro dimensões principais 
                        da personalidade no ambiente de trabalho.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="h-4 w-4 text-red-600" />
                            D - Dominância
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Características:</strong></p>
                          <ul className="ml-4 space-y-1 text-xs">
                            <li>• Foco em resultados e conquistas</li>
                            <li>• Decisivo, direto e objetivo</li>
                            <li>• Gosta de desafios e competição</li>
                            <li>• Assume riscos calculados</li>
                          </ul>
                          <p className="text-xs text-red-700 dark:text-red-400 mt-2">
                            <strong>Ideal para:</strong> Liderança, vendas, gestão de projetos
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4 text-yellow-600" />
                            I - Influência
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Características:</strong></p>
                          <ul className="ml-4 space-y-1 text-xs">
                            <li>• Comunicativo e persuasivo</li>
                            <li>• Otimista e entusiasta</li>
                            <li>• Foca em relacionamentos</li>
                            <li>• Criativo e inovador</li>
                          </ul>
                          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                            <strong>Ideal para:</strong> Atendimento, marketing, relações públicas
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            S - Estabilidade
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Características:</strong></p>
                          <ul className="ml-4 space-y-1 text-xs">
                            <li>• Paciente e colaborativo</li>
                            <li>• Leal e confiável</li>
                            <li>• Prefere rotinas estabelecidas</li>
                            <li>• Bom ouvinte e empático</li>
                          </ul>
                          <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                            <strong>Ideal para:</strong> Suporte, administrativo, recursos humanos
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            C - Conformidade
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Características:</strong></p>
                          <ul className="ml-4 space-y-1 text-xs">
                            <li>• Analítico e detalhista</li>
                            <li>• Segue procedimentos e normas</li>
                            <li>• Preciso e organizado</li>
                            <li>• Focado em qualidade</li>
                          </ul>
                          <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                            <strong>Ideal para:</strong> Análise, qualidade, contabilidade, TI
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3">Como Configurar DISC em uma Vaga</h4>
                      <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                        <li>
                          Ao criar/editar uma vaga, acesse a seção <strong>"Requisitos DISC"</strong>
                        </li>
                        <li>
                          Para cada dimensão (D, I, S, C), selecione o nível desejado:
                          <ul className="ml-8 mt-1 space-y-1 text-xs">
                            <li>• <strong>Não relevante:</strong> Essa característica não é importante para a vaga</li>
                            <li>• <strong>Baixo (25%):</strong> Prefere candidatos com baixo nível nessa dimensão</li>
                            <li>• <strong>Médio (50%):</strong> Nível moderado é adequado</li>
                            <li>• <strong>Alto (75%):</strong> Requer nível elevado nessa característica</li>
                            <li>• <strong>Muito Alto (100%):</strong> Essencial ter nível máximo</li>
                          </ul>
                        </li>
                        <li>
                          Escolha quando aplicar o teste:
                          <ul className="ml-8 mt-1 space-y-1 text-xs">
                            <li>• <strong>Na candidatura:</strong> Candidato responde ao se inscrever na vaga</li>
                            <li>• <strong>Durante seleção:</strong> RH envia o teste posteriormente</li>
                          </ul>
                        </li>
                        <li>
                          O sistema calcula automaticamente a <strong>compatibilidade</strong> entre o perfil 
                          do candidato e os requisitos da vaga
                        </li>
                      </ol>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3">Interpretando os Resultados</h4>
                      <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Score de Compatibilidade</p>
                          <p className="text-xs text-muted-foreground">
                            O sistema calcula um percentual de compatibilidade baseado na proximidade entre 
                            o perfil DISC do candidato e os requisitos da vaga.
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Indicadores Direcionais</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• <strong>Seta para cima (↑):</strong> Candidato tem nível superior ao desejado</li>
                            <li>• <strong>Seta para baixo (↓):</strong> Candidato tem nível inferior ao desejado</li>
                            <li>• <strong>Check (✓):</strong> Perfil alinhado com os requisitos</li>
                          </ul>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded border border-amber-200">
                          <p className="text-xs text-amber-900 dark:text-amber-100">
                            <strong>💡 Dica:</strong> Use o DISC como uma ferramenta complementar na avaliação. 
                            Considere também experiência, habilidades técnicas e adequação cultural.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Arquivos Legais (AFD/AEJ) */}
        <TabsContent value="legais">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileDown className="h-5 w-5" />
                  Arquivos Legais AFD e AEJ
                </CardTitle>
                <CardDescription>
                  Sistema de geração e importação de arquivos conforme Portaria 671/2021
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3">O que são Arquivos Legais?</h3>
                  <p className="text-muted-foreground mb-4">
                    Os arquivos AFD e AEJ são documentos eletrônicos obrigatórios exigidos pelo Ministério do Trabalho
                    para empresas que utilizam sistemas de controle de ponto eletrônico. Eles servem para fiscalização
                    e garantem a integridade dos registros de jornada de trabalho.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileDown className="h-4 w-4 text-blue-600" />
                          AFD - Arquivo Fonte de Dados
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p><strong>O que é:</strong> Arquivo que contém todas as marcações de ponto registradas no período.</p>
                        <p><strong>Conteúdo:</strong></p>
                        <ul className="ml-4 space-y-1 text-xs">
                          <li>• Identificação do empregador (CNPJ/CEI)</li>
                          <li>• Dados do equipamento (REP)</li>
                          <li>• Todas as marcações de entrada/saída</li>
                          <li>• Validação CRC-16 por registro</li>
                          <li>• Assinatura digital SHA-256</li>
                        </ul>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                          ✓ Usado para auditorias e fiscalização
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          AEJ - Arquivo Eletrônico de Jornada
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p><strong>O que é:</strong> Arquivo consolidado com horários contratuais e jornadas trabalhadas.</p>
                        <p><strong>Conteúdo:</strong></p>
                        <ul className="ml-4 space-y-1 text-xs">
                          <li>• Identificação do empregador</li>
                          <li>• Vínculos empregatícios</li>
                          <li>• Horários contratuais por funcionário</li>
                          <li>• Marcações de ponto consolidadas</li>
                          <li>• Resumo de horas trabalhadas</li>
                        </ul>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                          ✓ Facilita análise de jornadas
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Como Exportar Arquivos (Administrador)
                  </h3>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>📍 Acesso:</strong> Menu Admin → Arquivos Legais
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Exportar AFD (Marcações)</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <ol className="space-y-2 list-decimal list-inside text-xs">
                          <li>Acesse <strong>Admin → Arquivos Legais</strong></li>
                          <li>Clique no card <strong>"Exportar AFD"</strong></li>
                          <li>Selecione o período desejado (data inicial e final)</li>
                          <li>Clique em <strong>"Exportar Arquivo"</strong></li>
                          <li>O sistema gera o arquivo no formato texto (.txt)</li>
                          <li>O arquivo aparecerá na tabela de histórico com link para download</li>
                        </ol>
                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200">
                          <p className="text-xs text-amber-900 dark:text-amber-100">
                            <strong>⚠ Atenção:</strong> O arquivo AFD inclui validação CRC-16 e hash SHA-256
                            conforme Portaria 671. Não altere o conteúdo manualmente.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Exportar AEJ (Jornadas)</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <ol className="space-y-2 list-decimal list-inside text-xs">
                          <li>Acesse <strong>Admin → Arquivos Legais</strong></li>
                          <li>Clique no card <strong>"Exportar AEJ"</strong></li>
                          <li>Selecione o período desejado (normalmente mensal)</li>
                          <li>Clique em <strong>"Exportar Arquivo"</strong></li>
                          <li>O sistema consolida horários contratuais e marcações</li>
                          <li>Faça download do arquivo gerado</li>
                        </ol>
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 rounded border border-green-200">
                          <p className="text-xs text-green-900 dark:text-green-100">
                            <strong>💡 Dica:</strong> O AEJ é útil para análise interna de jornadas antes da
                            fiscalização. Ele mostra divergências entre horas contratadas e trabalhadas.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Como Importar Arquivo AFD
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Você pode importar arquivos AFD gerados por outros sistemas de ponto para consolidar
                    dados no RHNet.
                  </p>

                  <ol className="space-y-3 list-decimal list-inside text-sm text-muted-foreground">
                    <li>Acesse <strong>Admin → Arquivos Legais</strong></li>
                    <li>Clique no card <strong>"Importar AFD"</strong></li>
                    <li>Clique em <strong>"Escolher Arquivo"</strong> e selecione um arquivo .txt no formato AFD</li>
                    <li>Clique em <strong>"Importar Arquivo"</strong></li>
                    <li>
                      O sistema fará validações automáticas:
                      <ul className="ml-6 mt-2 space-y-1 list-disc text-xs">
                        <li>Verificação de CRC-16 em cada registro</li>
                        <li>Validação de sequência NSR (número sequencial)</li>
                        <li>Conferência de estrutura do arquivo</li>
                        <li>Validação de CPF/PIS dos funcionários</li>
                      </ul>
                    </li>
                    <li>Se houver erros, o sistema mostrará uma lista detalhada</li>
                    <li>Se tudo estiver correto, as marcações serão importadas para o banco de dados</li>
                  </ol>

                  <div className="mt-4 bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-900 dark:text-red-100">
                      <strong>⚠ Cuidado:</strong> A importação cria registros novos no sistema. Certifique-se
                      de que os funcionários do arquivo AFD já estão cadastrados no RHNet para evitar erros
                      de vinculação.
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">Histórico de Arquivos</h3>
                  <p className="text-muted-foreground mb-3">
                    Na página de Arquivos Legais, você encontra uma tabela com todos os arquivos gerados:
                  </p>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <Card className="bg-muted/20">
                      <CardContent className="pt-4 text-xs space-y-1">
                        <p><strong>• Tipo:</strong> AFD ou AEJ</p>
                        <p><strong>• Período:</strong> Data inicial e final dos registros</p>
                        <p><strong>• NSR:</strong> Números sequenciais usados</p>
                        <p><strong>• Registros:</strong> Quantidade total de linhas no arquivo</p>
                        <p><strong>• Gerado em:</strong> Data e hora da criação</p>
                        <p><strong>• Download:</strong> Link para baixar o arquivo</p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">Quando Gerar os Arquivos?</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Rotina Mensal</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        <p>Gere os arquivos mensalmente para manter um histórico organizado.
                        Isso facilita auditorias internas e preparação para fiscalização.</p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Fiscalização</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        <p>Quando solicitado pelo Ministério do Trabalho durante fiscalização,
                        gere os arquivos do período específico requisitado.</p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Backup</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        <p>Use os arquivos AFD como backup adicional dos registros de ponto.
                        Eles podem ser reimportados em caso de necessidade.</p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Análise</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        <p>O arquivo AEJ é excelente para análises de conformidade interna,
                        mostrando divergências entre jornadas contratadas e realizadas.</p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>📚 Conformidade Legal:</strong> Os arquivos gerados pelo RHNet seguem rigorosamente
                    o formato estabelecido pela Portaria 671/2021 do Ministério do Trabalho, incluindo validação
                    CRC-16/KERMIT, encoding ISO 8859-1, e sequenciamento NSR monotônico por empresa.
                  </p>
                </div>
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

      {/* Modal de Captura de Screenshots */}
      <Dialog open={showScreenshotModal} onOpenChange={setShowScreenshotModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Capturar Screenshots do Sistema
            </DialogTitle>
            <DialogDescription>
              Capture as telas do sistema para incluir screenshots reais no PDF do manual
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Capturas realizadas: {Object.keys(screenshots).length}/7</p>
                <p className="text-sm text-muted-foreground">
                  Clique em "Capturar Todas" para capturar as 7 telas principais do sistema
                </p>
              </div>
              <Button 
                onClick={captureAllScreens} 
                disabled={capturing}
                className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)]"
              >
                {capturing ? "Capturando..." : "Capturar Todas"}
              </Button>
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

              {/* Arquivos Legais */}
              <div id="screen-legalfiles" className="bg-white p-8 rounded-lg shadow-sm border">
                <div className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] text-white p-4 rounded-t-lg -mx-8 -mt-8 mb-6">
                  <h2 className="text-2xl font-bold">Admin - Arquivos Legais AFD/AEJ</h2>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="p-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileDown className="h-4 w-4" />
                      Exportar AFD
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2">Arquivo Fonte de Dados</p>
                    <Button size="sm" className="mt-3 w-full">Exportar</Button>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Exportar AEJ
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2">Arquivo Eletrônico de Jornada</p>
                    <Button size="sm" className="mt-3 w-full">Exportar</Button>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Importar AFD
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2">Importar arquivo externo</p>
                    <Button size="sm" variant="outline" className="mt-3 w-full">Importar</Button>
                  </Card>
                </div>

                <h3 className="font-semibold mb-3">Histórico de Arquivos Gerados</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Período</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">NSR</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Gerado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">AFD</span></td>
                        <td className="px-4 py-3 text-sm">01/01/2025 - 31/01/2025</td>
                        <td className="px-4 py-3 text-sm">1000-1523</td>
                        <td className="px-4 py-3 text-sm">05/02/2025 10:30</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-3"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">AEJ</span></td>
                        <td className="px-4 py-3 text-sm">01/01/2025 - 31/01/2025</td>
                        <td className="px-4 py-3 text-sm">-</td>
                        <td className="px-4 py-3 text-sm">05/02/2025 10:35</td>
                      </tr>
                    </tbody>
                  </table>
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
              <Card className="mt-8 p-4 bg-green-50 border-green-200">
                <h3 className="font-semibold mb-2 text-green-800">Screenshots Capturadas:</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(screenshots).map(key => (
                    <span key={key} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      ✓ {key}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-green-700 mt-3">
                  As screenshots foram salvas. Feche este modal e clique em "Baixar PDF" para gerar o manual com as imagens reais.
                </p>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
