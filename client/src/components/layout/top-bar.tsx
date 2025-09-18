import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Menu, Bell, MapPin } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-teal-50 shadow-sm border-b border-blue-200">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <h2 className="text-xl font-semibold text-blue-800">{title}</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Geolocation Status */}
        <div className={`flex items-center space-x-2 px-3 py-1 text-white rounded-full text-sm ${locationStatus.color}`}>
          <MapPin className="h-4 w-4" />
          <span>{locationStatus.text}</span>
        </div>
        
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-500 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            0
          </span>
        </Button>
        
        {/* User Profile */}
        {user && (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={(user as any).profileImageUrl} alt={`${(user as any).firstName} ${(user as any).lastName}`} />
              <AvatarFallback>
                {(user as any).firstName?.[0]}{(user as any).lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700">
                {(user as any).firstName} {(user as any).lastName}
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant={(user as any).role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {(user as any).role === 'admin' || (user as any).role === 'superadmin' ? 'Admin' : 'Funcionário'}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
