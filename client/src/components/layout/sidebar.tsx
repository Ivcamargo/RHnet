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

  const isAdmin = user && 'role' in user && (user.role === 'admin' || user.role === 'superadmin');
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
    // Superadmin gets all base features plus admin features plus system management
    navigation = [...baseNavigation, ...adminNavigation, ...superAdminNavigation];
  } else if (isAdmin) {
    // Admin gets all base features plus admin-specific ones
    navigation = [...baseNavigation, ...adminNavigation];
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-orange-50 to-red-50 border-r border-orange-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-orange-600 to-red-600">
        <h1 className="text-xl font-bold text-white">
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
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-orange-100 hover:text-orange-800"
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
      <div className="p-4 border-t border-orange-200 space-y-2">
        {user && (
          <div className="text-xs text-gray-600 px-2">
            <p className="font-medium">{(user as any).firstName} {(user as any).lastName}</p>
            <p className="uppercase">{(user as any).role}</p>
          </div>
        )}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-orange-800 hover:bg-orange-100"
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
