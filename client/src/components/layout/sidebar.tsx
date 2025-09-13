import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Clock, 
  Home, 
  Building, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  Shield, 
  MessageCircle,
  FileText,
  GraduationCap,
  Calendar,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const isAdmin = user && 'role' in user && user.role === 'admin';
  const isSuperAdmin = user && 'role' in user && user.role === 'superadmin';

  // Base navigation for all users - prioritizing HR and messaging features
  const baseNavigation = [
    { name: "Dashboard RH", href: "/", icon: Home },
    { name: "Mensagens", href: "/messages", icon: MessageCircle },
    { name: "Documentos", href: "/documents", icon: FileText },
    { name: "Capacitação", href: "/training", icon: GraduationCap },
    { name: "Controle de Ponto", href: "/time-clock", icon: Clock },
    { name: "Relatórios", href: "/reports", icon: BarChart3 },
  ];

  // Admin-only navigation items
  const adminNavigation = [
    { name: "Funcionários", href: "/employees", icon: Users },
    { name: "Departamentos", href: "/departments", icon: Building },
    { name: "Feriados", href: "/holidays", icon: Calendar },
  ];

  // Superadmin-only navigation items
  const superAdminNavigation = [
    { name: "Gerenciar Sistema", href: "/superadmin", icon: Shield },
  ];

  // Combine navigation based on user role
  let navigation = baseNavigation;
  
  if (isSuperAdmin) {
    // Superadmin gets system management plus all core HR features
    navigation = [
      baseNavigation[0], // Dashboard RH
      ...superAdminNavigation,
      baseNavigation[1], // Mensagens
      baseNavigation[2], // Documentos
      baseNavigation[3], // Capacitação
      baseNavigation[5], // Relatórios
      ...adminNavigation, // All admin features
    ];
  } else if (isAdmin) {
    // Admin gets all base features plus admin-specific ones
    navigation = [...baseNavigation, ...adminNavigation];
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-primary">
        <h1 className="text-xl font-bold text-primary-foreground">
          <MessageCircle className="inline-block h-6 w-6 mr-2" />
          RHNet
        </h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg group transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* User Info & Logout */}
      <div className="p-4 border-t border-border space-y-2">
        {user && (
          <div className="text-xs text-muted-foreground px-2">
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="uppercase">{user.role}</p>
          </div>
        )}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 material-shadow-lg">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white shadow-md">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
