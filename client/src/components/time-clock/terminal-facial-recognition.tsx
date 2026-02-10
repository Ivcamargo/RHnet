import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, User, X } from "lucide-react";

interface TerminalFacialRecognitionProps {
  isActive: boolean;
  onComplete: (photoDataUrl: string | null) => void;
  onCancel: () => void;
}

export default function TerminalFacialRecognition({ 
  isActive, 
  onComplete, 
  onCancel 
}: TerminalFacialRecognitionProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isActive && !stream) {
      startCamera();
    } else if (!isActive && stream) {
      stopCamera();
    }

    return () => {
      if (stream) {
        stopCamera();
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          videoRef.current.play().catch(err => {
            console.error("❌ Erro ao reproduzir vídeo:", err);
          });
        }
      };
    }
  }, [stream]);

  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);
    
    try {
      console.log("🎥 Tentando acessar a câmera...");
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Navegador não suporta acesso à câmera");
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      console.log("✅ Câmera acessada com sucesso");
      setStream(mediaStream);
      setIsInitializing(false);
    } catch (error) {
      console.error("❌ Erro ao acessar câmera:", error);
      setIsInitializing(false);
      
      let errorMessage = "Câmera não disponível";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Permissão de câmera negada. Clique no ícone de câmera na barra do navegador para permitir.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "Nenhuma câmera encontrada no dispositivo.";
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "Navegador não suporta acesso à câmera.";
        } else if (error.name === 'NotReadableError') {
          errorMessage = "Câmera está sendo usada por outro aplicativo.";
        }
      }
      
      setCameraError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !stream) {
      console.error("❌ Vídeo ou stream não disponível");
      return;
    }

    setIsCapturing(true);
    console.log("📸 Capturando foto...");
    
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error("❌ Não foi possível obter contexto do canvas");
        setIsCapturing(false);
        return;
      }
      
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      if (canvas.width === 0 || canvas.height === 0) {
        console.error("❌ Dimensões de vídeo inválidas");
        setIsCapturing(false);
        return;
      }
      
      context.drawImage(videoRef.current, 0, 0);
      console.log(`✅ Frame capturado: ${canvas.width}x${canvas.height}`);
      
      // Convert to data URL (JPEG format with 80% quality)
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      console.log(`✅ Foto convertida para data URL (${photoDataUrl.length} chars)`);
      
      // Complete with photo
      setIsCapturing(false);
      onComplete(photoDataUrl);
    } catch (error) {
      console.error("❌ Erro durante captura:", error);
      setIsCapturing(false);
    }
  };

  const handleWithoutPhoto = () => {
    console.log("📸 Registrando sem foto");
    onComplete(null);
  };

  const handleRetryCamera = () => {
    setCameraError(null);
    startCamera();
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Reconhecimento Facial
            </h3>
            <p className="text-sm text-gray-600">
              {isCapturing 
                ? "Capturando foto..." 
                : "Posicione seu rosto na área de captura"
              }
            </p>
          </div>

          {/* Camera Area */}
          <div className="relative mb-6">
            {stream ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-64 object-cover rounded-lg bg-gray-200"
                  data-testid="camera-video"
                />
                
                {/* Face detection overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-4 border-primary rounded-full opacity-50"></div>
                </div>
                
                {isCapturing && (
                  <div className="absolute inset-0 bg-white opacity-50 rounded-lg"></div>
                )}
              </div>
            ) : cameraError ? (
              <div className="w-full h-64 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center">
                <div className="text-center p-4">
                  <Camera className="h-12 w-12 text-red-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-red-700 mb-2">Câmera não disponível</p>
                  <p className="text-xs text-red-600 mb-4">{cameraError}</p>
                  <Button
                    onClick={handleRetryCamera}
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    data-testid="button-retry-camera"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  {isInitializing ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Inicializando câmera...</p>
                    </>
                  ) : (
                    <>
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Aguardando inicialização...</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isCapturing ? (
              <div className="flex-1 flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                <span className="text-sm text-gray-600">Processando...</span>
              </div>
            ) : cameraError ? (
              <>
                <Button
                  onClick={handleWithoutPhoto}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  data-testid="button-without-photo"
                >
                  <User className="h-4 w-4 mr-2" />
                  Registrar sem Foto
                </Button>
                
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </>
            ) : stream ? (
              <>
                <Button
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className="flex-1 bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] hover:from-[hsl(220,65%,25%)] hover:to-[hsl(175,65%,35%)]"
                  data-testid="button-capture-photo"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isCapturing ? "Capturando..." : "Capturar Foto"}
                </Button>
                
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleWithoutPhoto}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  data-testid="button-without-photo"
                >
                  <User className="h-4 w-4 mr-2" />
                  Registrar sem Foto
                </Button>
                
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            {stream ? (
              <p>Mantenha o rosto centralizado e bem iluminado. Clique em "Capturar Foto" quando estiver pronto.</p>
            ) : cameraError ? (
              <p>Você pode continuar registrando o ponto sem foto ou tentar acessar a câmera novamente.</p>
            ) : isInitializing ? (
              <p>Aguarde enquanto tentamos acessar sua câmera...</p>
            ) : (
              <p>Aguardando inicialização da câmera ou registre sem foto se preferir.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
