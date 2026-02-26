import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Bell, MapPin, LogOut, KeyRound } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { ThemeToggle } from "@/components/theme-toggle";

interface TopBarProps {
  title: string;
  hideTitle?: boolean;
}

export default function TopBar({ title, hideTitle = false }: TopBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const { location, error: locationError } = useGeolocation();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getLocationStatus = () => {
    if (locationError) {
      return { text: "Localização Negada", color: "point-error" };
    }
    if (location) {
      return { text: "Localização Ativa", color: "point-success" };
    }
    return { text: "Obtendo Localização...", color: "point-warning" };
  };

  const locationStatus = getLocationStatus();

  const handleLogout = async () => {
    try {
      queryClient.clear();
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/landing";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/landing";
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] shadow-sm gap-4">
      <div className="flex items-center min-w-0 flex-1">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex flex-col min-w-0">
          {!hideTitle && (
            <h2 className="text-xl font-semibold text-white truncate" data-testid="page-title">{title}</h2>
          )}
          {user && (user as any).company && (
            <p
              className="text-base md:text-lg font-black italic uppercase tracking-tight leading-none text-[#ffdd00] truncate"
              style={{
                color: "#ffdd00",
                textShadow:
                  "1px 0 #000, -1px 0 #000, 0 1px #000, 0 -1px #000, 1px 1px #000, -1px -1px #000",
              }}
              data-testid="company-name"
            >
              {(user as any).company.name}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4 shrink-0">
        {/* Geolocation Status */}
        <div className={`flex items-center space-x-2 px-3 py-1 text-white rounded-full text-sm ${locationStatus.color}`}>
          <MapPin className="h-4 w-4" />
          <span>{locationStatus.text}</span>
        </div>
        
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="p-2 text-white/80 hover:text-white hover:bg-white/10 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            0
          </span>
        </Button>
        
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* User Profile */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center space-x-3 rounded-md px-2 py-1 hover:bg-white/10 transition-colors"
                data-testid="button-user-menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(user as any).profileImageUrl} alt={`${(user as any).firstName} ${(user as any).lastName}`} />
                  <AvatarFallback>
                    {(user as any).firstName?.[0]}{(user as any).lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">
                    {(user as any).firstName} {(user as any).lastName}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={(user as any).role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                      {(user as any).role === 'admin' || (user as any).role === 'superadmin' ? 'Admin' : 'Funcionário'}
                    </Badge>
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild data-testid="button-change-password">
                <Link href="/change-password">
                  <KeyRound className="h-4 w-4 mr-2" />
                  Alterar Senha
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="text-white/90 hover:text-white hover:bg-white/10"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </header>
  );
}
