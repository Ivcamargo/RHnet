import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Clock, Home, Building, BarChart3, Users, Settings, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const isAdmin = user?.role === 'admin';

  // Base navigation for all users
  const baseNavigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Controle de Ponto", href: "/time-clock", icon: Clock },
    { name: "Relatórios", href: "/reports", icon: BarChart3 },
    { name: "Funcionários", href: "/employees", icon: Users },
  ];

  // Admin-only navigation items
  const adminNavigation = [
    { name: "Departamentos", href: "/departments", icon: Building },
  ];

  // Combine navigation based on user role
  const navigation = isAdmin 
    ? [...baseNavigation.slice(0, 2), ...adminNavigation, ...baseNavigation.slice(2)]
    : baseNavigation;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 point-primary">
        <h1 className="text-xl font-bold text-white">
          <Clock className="inline-block h-6 w-6 mr-2" />
          PointControl
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
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg group transition-colors cursor-pointer ${
                  isActive
                    ? "text-white point-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900"
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
