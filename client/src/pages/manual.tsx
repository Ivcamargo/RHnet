import { Book, Clock, Users, MapPin, FileText, MessageSquare, Calendar, GraduationCap, Briefcase, Shield, Settings, TrendingUp, Download, Upload, CheckCircle, AlertCircle, Home, LogIn, Tablet, Camera } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import rhnetLogo from "@assets/rhnetp_1757765662344.jpg";

export default function Manual() {
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
          <div className="flex items-center gap-3 mb-2">
            <Book className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Manual do Sistema RHNet</h1>
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
                    <Calendar className="h-5 w-5 text-primary" />
                    Gestão de Escalas e Rotações
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Crie escalas de trabalho automáticas com rotações personalizadas.
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>Configure rotações diárias, semanais, mensais ou customizadas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>Defina segmentos de trabalho e folga</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>Geração automática de escala para qualquer período</span>
                    </li>
                  </ul>
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
