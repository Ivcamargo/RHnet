import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Printer, Building2 } from "lucide-react";
import { Certificate, User, Company } from "@shared/schema";

export default function CertificateView() {
  const params = useParams();
  const certificateId = params.id;

  const { data: certificate, isLoading } = useQuery<Certificate>({
    queryKey: [`/api/certificates/${certificateId}`],
    enabled: !!certificateId,
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: company } = useQuery<Company>({
    queryKey: [`/api/companies/${certificate?.companyId}`],
    enabled: !!certificate?.companyId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando certificado...</p>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Certificado não encontrado</p>
      </div>
    );
  }

  const metadata = certificate.metadata as any;
  const score = metadata?.score || null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>

        {/* Certificate */}
        <Card className="bg-white border-8 border-double border-primary/20">
          <CardContent className="p-12">
            <div className="text-center space-y-8">
              {/* Header */}
              <div className="space-y-3">
                <Award className="h-16 w-16 text-primary mx-auto" />
                {company && (
                  <h2 className="text-3xl font-bold text-foreground">
                    {company.name}
                  </h2>
                )}
                <h1 className="text-4xl font-serif font-bold text-primary">
                  Certificado de Conclusão
                </h1>
              </div>

              {/* Divider */}
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />

              {/* Content */}
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground">
                  Certificamos que
                </p>
                
                <p className="text-3xl font-bold text-foreground">
                  {user ? `${user.firstName} ${user.lastName}` : "Aluno"}
                </p>

                <p className="text-lg text-muted-foreground">
                  concluiu com êxito o curso
                </p>

                <p className="text-2xl font-bold text-primary">
                  {certificate.title}
                </p>

                {score && (
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-lg text-muted-foreground">
                      com aproveitamento de
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(score)}%
                    </p>
                  </div>
                )}

                {metadata?.correctAnswers && metadata?.totalQuestions && (
                  <p className="text-sm text-muted-foreground">
                    ({metadata.correctAnswers} de {metadata.totalQuestions} questões corretas)
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />

              {/* Footer */}
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Data de Emissão</p>
                  <p className="font-semibold">
                    {new Date(certificate.issuedDate).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Validade</p>
                  <p className="font-semibold">
                    {certificate.expiryDate 
                      ? new Date(certificate.expiryDate).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'Permanente'
                    }
                  </p>
                </div>
              </div>

              {/* Certificate Number */}
              <div className="pt-8">
                <p className="text-xs text-muted-foreground">
                  Certificado Nº: {certificate.certificateNumber}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-8 print:hidden">
          <Button variant="outline" onClick={() => window.close()}>
            Fechar
          </Button>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
