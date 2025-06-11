import { Link, useLocation } from "wouter";
import { Clock, Home, Building, BarChart3, Users, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Controle de Ponto", href: "/time-clock", icon: Clock },
  { name: "Departamentos", href: "/departments", icon: Building },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
  { name: "Funcionários", href: "/employees", icon: Users },
];

export default function Sidebar() {
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <aside className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white material-shadow-lg">
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
                <a className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg group transition-colors ${
                  isActive
                    ? "text-white point-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
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
    </aside>
  );
}
