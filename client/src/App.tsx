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
import InventoryDashboard from "@/pages/admin/inventory/InventoryDashboard";
import InventoryItems from "@/pages/admin/inventory/InventoryItems";
import InventoryDistribution from "@/pages/admin/inventory/InventoryDistribution";
import InventoryHistory from "@/pages/admin/inventory/InventoryHistory";
import InventoryMovements from "@/pages/admin/inventory/InventoryMovements";
import PublicJobs from "@/pages/public-jobs";
import JobApply from "@/pages/job-apply";
import Manual from "@/pages/manual";
import TerminalPonto from "@/pages/terminal-ponto";
import OvertimeConfig from "@/pages/overtime-config";
import TimeBank from "@/pages/time-bank";
import ScreenshotHelper from "@/pages/screenshot-helper";
import DISCAssessment from "@/pages/disc-assessment";
import MyAbsences from "@/pages/my-absences";
import AdminAbsences from "@/pages/admin-absences";

// Protected route component that redirects to login if not authenticated
function ProtectedRoute({ 
  component: Component, 
  isAuthenticated, 
  isLoading,
  ...props 
}: any) {
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
      <Route path="/trabalhe-conosco/:jobId" component={JobApply} />
      
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
      <Route path="/" component={(routeProps) => <ProtectedRoute component={Dashboard} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/change-password" component={(routeProps) => <ProtectedRoute component={ChangePassword} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/messages" component={(routeProps) => <ProtectedRoute component={Messages} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/documents" component={(routeProps) => <ProtectedRoute component={Documents} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/training" component={(routeProps) => <ProtectedRoute component={Training} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/course/:id" component={(routeProps) => <ProtectedRoute component={CourseView} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/certificate/:id" component={(routeProps) => <ProtectedRoute component={CertificateView} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/time-clock" component={(routeProps) => <ProtectedRoute component={TimeClock} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/departments" component={(routeProps) => <ProtectedRoute component={Departments} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/holidays" component={(routeProps) => <ProtectedRoute component={Holidays} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/superadmin" component={(routeProps) => <ProtectedRoute component={SuperAdmin} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/reports" component={(routeProps) => <ProtectedRoute component={Reports} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/employees" component={(routeProps) => <ProtectedRoute component={Employees} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/banco-horas" component={(routeProps) => <ProtectedRoute component={TimeBank} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/sectors" component={(routeProps) => <ProtectedRoute component={Sectors} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/admin/time-periods" component={(routeProps) => <ProtectedRoute component={TimePeriods} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/admin/time-entries" component={(routeProps) => <ProtectedRoute component={AdminTimeEntries} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/admin/terminals" component={(routeProps) => <ProtectedRoute component={Terminals} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/admin/rotation-management" component={(routeProps) => <ProtectedRoute component={RotationManagement} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/admin/overtime-config" component={(routeProps) => <ProtectedRoute component={OvertimeConfig} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/admin/arquivos-legais" component={(routeProps) => <ProtectedRoute component={ArquivosLegais} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/admin/leads" component={(routeProps) => <ProtectedRoute component={AdminLeads} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/admin/inventory" component={(routeProps) => <ProtectedRoute component={InventoryDashboard} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/admin/inventory/items" component={(routeProps) => <ProtectedRoute component={InventoryItems} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/admin/inventory/movements" component={(routeProps) => <ProtectedRoute component={InventoryMovements} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/admin/inventory/distribute" component={(routeProps) => <ProtectedRoute component={InventoryDistribution} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/admin/inventory/history" component={(routeProps) => <ProtectedRoute component={InventoryHistory} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/recruitment" component={(routeProps) => <ProtectedRoute component={Recruitment} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/my-absences" component={(routeProps) => <ProtectedRoute component={MyAbsences} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/admin/absences" component={(routeProps) => <ProtectedRoute component={AdminAbsences} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      <Route path="/manual" component={(routeProps) => <ProtectedRoute component={Manual} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />} />
      
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
