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
  Briefcase
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-blue-50 text-gray-800 relative">
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
      <header className="bg-white/90 backdrop-blur-sm shadow-xl border-b border-orange-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img src={rhnetLogo} alt="RHNet" className="h-16 w-16 mr-3 rounded-lg" />
              <h1 className="text-2xl font-bold text-[hsl(215,80%,25%)]">Sistema de gestão de recursos humanos</h1>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleJobsPage} 
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-50 px-6 py-2"
                data-testid="button-jobs"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Trabalhe Conosco
              </Button>
              <Button 
                onClick={handleLogin} 
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2"
                data-testid="button-login"
              >
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t border-orange-200 py-12 relative z-10">
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
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                data-testid="button-jobs-footer"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Trabalhe Conosco
              </Button>
              <Button 
                onClick={handleLogin}
                variant="ghost"
                className="text-[hsl(215,80%,25%)] hover:bg-blue-50"
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