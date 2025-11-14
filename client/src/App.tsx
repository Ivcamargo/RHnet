import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import SetPassword from "@/pages/set-password";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import ChangePassword from "@/pages/change-password";
import Dashboard from "@/pages/dashboard";
import TimeClock from "@/pages/time-clock";
import Departments from "@/pages/departments";
import Reports from "@/pages/reports";
import Employees from "@/pages/employees";
import Holidays from "@/pages/holidays";
import SuperAdmin from "@/pages/superadmin";
import Messages from "@/pages/messages";
import Documents from "@/pages/documents";
import Training from "@/pages/training";
import CourseView from "@/pages/course-view";
import CertificateView from "@/pages/certificate-view";
import Sectors from "@/pages/sectors";
import TimePeriods from "@/pages/admin/time-periods";
import AdminTimeEntries from "@/pages/admin/time-entries";
import Terminals from "@/pages/admin/terminals";
import ArquivosLegais from "@/pages/admin/arquivos-legais";
import RotationManagement from "@/pages/rotation-management";
import Recruitment from "@/pages/recruitment";
import AdminLeads from "@/pages/admin-leads";
import PublicJobs from "@/pages/public-jobs";
import JobApply from "@/pages/job-apply";
import Manual from "@/pages/manual";
import TerminalPonto from "@/pages/terminal-ponto";
import OvertimeConfig from "@/pages/overtime-config";
import TimeBank from "@/pages/time-bank";
import ScreenshotHelper from "@/pages/screenshot-helper";
import DISCAssessment from "@/pages/disc-assessment";

// Protected route component that redirects to login if not authenticated
function ProtectedRoute({ component: Component, ...props }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...props} />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Rotas públicas (não requer autenticação) */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/set-password" component={SetPassword} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* Rotas públicas de vagas - acessíveis para todos */}
      <Route path="/vagas/:id" component={PublicJobs} />
      <Route path="/vagas" component={PublicJobs} />
      <Route path="/apply/:jobId" component={JobApply} />
      
      {/* DISC Assessment - acessível para candidatos via token */}
      <Route path="/disc-assessment" component={DISCAssessment} />
      
      {/* Screenshot Helper - ferramenta para capturar telas */}
      <Route path="/screenshot-helper" component={ScreenshotHelper} />
      
      {/* Terminal de ponto - acessível para todos (autenticação própria) */}
      <Route path="/terminal-ponto" component={TerminalPonto} />
      
      {/* Landing page - acessível para todos */}
      <Route path="/landing" component={Landing} />
      
      {/* Landing page para usuários não autenticados */}
      {!isAuthenticated && <Route path="/" component={Landing} />}
      
      {/* Rotas protegidas - redirecionam para login se não autenticado */}
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/change-password" component={() => <ProtectedRoute component={ChangePassword} />} />
      <Route path="/messages" component={() => <ProtectedRoute component={Messages} />} />
      <Route path="/documents" component={() => <ProtectedRoute component={Documents} />} />
      <Route path="/training" component={() => <ProtectedRoute component={Training} />} />
      <Route path="/course/:id" component={() => <ProtectedRoute component={CourseView} />} />
      <Route path="/certificate/:id" component={() => <ProtectedRoute component={CertificateView} />} />
      <Route path="/time-clock" component={() => <ProtectedRoute component={TimeClock} />} />
      <Route path="/departments" component={() => <ProtectedRoute component={Departments} />} />
      <Route path="/holidays" component={() => <ProtectedRoute component={Holidays} />} />
      <Route path="/superadmin" component={() => <ProtectedRoute component={SuperAdmin} />} />
      <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
      <Route path="/employees" component={() => <ProtectedRoute component={Employees} />} />
      <Route path="/banco-horas" component={() => <ProtectedRoute component={TimeBank} />} />
      <Route path="/sectors" component={() => <ProtectedRoute component={Sectors} />} />
      <Route path="/admin/time-periods" component={() => <ProtectedRoute component={TimePeriods} />} />
      <Route path="/admin/time-entries" component={() => <ProtectedRoute component={AdminTimeEntries} />} />
      <Route path="/admin/terminals" component={() => <ProtectedRoute component={Terminals} />} />
      <Route path="/admin/rotation-management" component={() => <ProtectedRoute component={RotationManagement} />} />
      <Route path="/admin/overtime-config" component={() => <ProtectedRoute component={OvertimeConfig} />} />
      <Route path="/admin/arquivos-legais" component={() => <ProtectedRoute component={ArquivosLegais} />} />
      <Route path="/admin/leads" component={() => <ProtectedRoute component={AdminLeads} />} />
      <Route path="/recruitment" component={() => <ProtectedRoute component={Recruitment} />} />
      <Route path="/manual" component={() => <ProtectedRoute component={Manual} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="rhnet-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
