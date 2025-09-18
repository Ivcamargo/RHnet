import { Switch, Route } from "wouter";
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
import Sectors from "@/pages/sectors";

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
      
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/messages" component={Messages} />
          <Route path="/documents" component={Documents} />
          <Route path="/training" component={Training} />
          <Route path="/time-clock" component={TimeClock} />
          <Route path="/departments" component={Departments} />
          <Route path="/holidays" component={Holidays} />
          <Route path="/superadmin" component={SuperAdmin} />
          <Route path="/reports" component={Reports} />
          <Route path="/employees" component={Employees} />
          <Route path="/sectors" component={Sectors} />
        </>
      )}
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
