import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Clock, 
  LayoutDashboard, 
  Building2, 
  TrendingUp, 
  UsersRound, 
  Menu, 
  ShieldCheck, 
  MessageSquare,
  FileText,
  GraduationCap,
  CalendarDays,
  Timer,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Tablet,
  Briefcase,
  TrendingUp as TrendingUpIcon,
  Percent,
  Book,
  UserPlus,
  Package,
  History,
  ArrowLeftRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import rhnetLogo from "@assets/rhnetp_1757765662344.jpg";

type MenuItem = {
  name: string;
  href?: string;
  icon: any;
  submenu?: MenuItem[];
  adminOnly?: boolean;
};

export default function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const isAdmin = user && typeof user === 'object' && 'role' in user && (user.role === 'admin' || user.role === 'superadmin');
  const isSuperAdmin = user && typeof user === 'object' && 'role' in user && user.role === 'superadmin';

  const toggleMenu = (menuName: string) => {
    setExpandedMenu((prev) => (prev === menuName ? null : menuName));
  };

  // Navigation structure with submenus
  const baseNavigation: MenuItem[] = [
    { name: "Dashboard RH", href: "/", icon: LayoutDashboard },
    { name: "Mensagens", href: "/messages", icon: MessageSquare },
    { name: "Documentos", href: "/documents", icon: FileText },
    { name: "Capacitação", href: "/training", icon: GraduationCap },
    { name: "Minhas Ausências", href: "/my-absences", icon: CalendarDays },
    { 
      name: "Estoque e EPIs", 
      icon: Package,
      submenu: [
        { name: "Dashboard", href: "/admin/inventory", icon: LayoutDashboard },
        { name: "Gestão de Itens", href: "/admin/inventory/items", icon: Package, adminOnly: true },
        { name: "Movimentações", href: "/admin/inventory/movements", icon: ArrowLeftRight, adminOnly: true },
        { name: "Distribuir EPIs", href: "/admin/inventory/distribute", icon: UserPlus },
        { name: "Histórico", href: "/admin/inventory/history", icon: History },
      ]
    },
    { 
      name: "Controle de Ponto", 
      icon: Clock,
      submenu: [
        { name: "Registro de Ponto", href: "/time-clock", icon: Clock },
        { name: "Relatórios", href: "/reports", icon: TrendingUp },
        { name: "Banco de Horas", href: "/banco-horas", icon: Briefcase },
        { name: "Administrar Pontos", href: "/admin/time-entries", icon: Clock, adminOnly: true },
        { name: "Períodos de Ponto", href: "/admin/time-periods", icon: Timer, adminOnly: true },
        { name: "Terminais", href: "/admin/terminals", icon: Tablet, adminOnly: true },
        { name: "Feriados", href: "/holidays", icon: CalendarDays, adminOnly: true },
        { name: "Horas Extras", href: "/admin/overtime-config", icon: Percent, adminOnly: true },
      ]
    },
  ];

  // Admin-only navigation items
  const adminNavigation: MenuItem[] = [
    { name: "Funcionários", href: "/employees", icon: UsersRound },
    { name: "Recrutamento", href: "/recruitment", icon: BriefcaseBusiness },
    { name: "Leads", href: "/admin/leads", icon: UserPlus },
    { name: "Gestão de Ausências", href: "/admin/absences", icon: CalendarDays },
    { name: "Departamentos", href: "/departments", icon: Building2 },
    { name: "Setores", href: "/sectors", icon: Building2 },
    { name: "Arquivos Legais (AFD/AEJ)", href: "/admin/arquivos-legais", icon: FileText },
  ];

  // Superadmin-only navigation items
  const superAdminNavigation: MenuItem[] = [
    { name: "Gerenciar Sistema", href: "/superadmin", icon: ShieldCheck },
  ];

  // Manual sempre como último item (separado para ficar ao final)
  const manualItem: MenuItem = { name: "Manual do Sistema", href: "/manual", icon: Book };

  // Combine navigation based on user role
  let navigation = baseNavigation;
  
  if (isSuperAdmin) {
    navigation = [...baseNavigation, ...adminNavigation, ...superAdminNavigation, manualItem];
  } else if (isAdmin) {
    navigation = [...baseNavigation, ...adminNavigation, manualItem];
  } else {
    navigation = [...baseNavigation, manualItem];
  }

  const expandedMenuItem = navigation.find(
    (item) => item.submenu && item.name === expandedMenu
  );
  const expandedVisibleSubmenu = expandedMenuItem?.submenu?.filter(
    (subItem) => !subItem.adminOnly || isAdmin
  ) || [];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-[hsl(220,20%,98%)] to-[hsl(175,20%,98%)] dark:from-[hsl(220,20%,12%)] dark:to-[hsl(220,20%,10%)] border-r border-[hsl(220,15%,88%)] dark:border-[hsl(220,15%,25%)]">
      {/* Logo - Clicável para voltar ao início */}
      <Link href="/">
        <div className="flex items-center justify-center h-20 px-4 bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] cursor-pointer hover:from-[hsl(220,70%,22%)] hover:to-[hsl(175,70%,50%)] transition-all duration-200">
          <div className="flex items-center">
            <img src={rhnetLogo} alt="RHNet" className="h-12 w-12 mr-3 rounded-lg" />
            <h1 className="text-xl font-bold text-white">
              RHNet
            </h1>
          </div>
        </div>
      </Link>
      
      {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedMenu === item.name;
          
          // Menu with submenu
          if (item.submenu) {
            const visibleSubmenu = item.submenu.filter((subItem) => !subItem.adminOnly || isAdmin);
            const hasActiveSubmenu = visibleSubmenu.some((subItem) => location === subItem.href);
            
            return (
              <div key={item.name} className="space-y-1">
                {/* Parent Menu Item */}
                <div 
                  className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg group transition-all duration-200 cursor-pointer ${
                    hasActiveSubmenu
                      ? "bg-[hsl(220,65%,18%)] dark:bg-[hsl(175,65%,45%)] text-white shadow-md"
                      : "text-[hsl(220,15%,40%)] dark:text-[hsl(220,15%,75%)] hover:bg-[hsl(175,40%,92%)] dark:hover:bg-[hsl(220,15%,18%)] hover:text-[hsl(220,65%,18%)] dark:hover:text-[hsl(175,65%,45%)]"
                  }`}
                  onClick={() => toggleMenu(item.name)}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </div>

                {/* Submenu Items */}
                {isExpanded && (
                  <div className="ml-4 space-y-1 lg:hidden">
                    {item.submenu.map((subItem) => {
                      // Skip admin-only items for non-admin users
                      if (subItem.adminOnly && !isAdmin) return null;
                      
                      const isActive = location === subItem.href;
                      const SubIcon = subItem.icon;
                      
                      return (
                        <Link key={subItem.name} href={subItem.href!}>
                          <div 
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg group transition-all duration-200 cursor-pointer ${
                              isActive
                                ? "bg-[hsl(220,65%,18%)] dark:bg-[hsl(175,65%,45%)] text-white shadow-md"
                                : "text-[hsl(220,15%,40%)] dark:text-[hsl(220,15%,75%)] hover:bg-[hsl(175,40%,92%)] dark:hover:bg-[hsl(220,15%,18%)] hover:text-[hsl(220,65%,18%)] dark:hover:text-[hsl(175,65%,45%)]"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <SubIcon className="mr-3 h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{subItem.name}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          // Regular menu item (no submenu)
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href!}>
              <div 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg group transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[hsl(220,65%,18%)] dark:bg-[hsl(175,65%,45%)] text-white shadow-md"
                    : "text-[hsl(220,15%,40%)] dark:text-[hsl(220,15%,75%)] hover:bg-[hsl(175,40%,92%)] dark:hover:bg-[hsl(220,15%,18%)] hover:text-[hsl(220,65%,18%)] dark:hover:text-[hsl(175,65%,45%)]"
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex material-shadow-lg">
          <div className="flex flex-col w-64">
            <SidebarContent />
          </div>

          {expandedMenuItem && expandedVisibleSubmenu.length > 0 && (
            <div className="w-60 bg-gradient-to-b from-[hsl(220,20%,98%)] to-[hsl(175,20%,98%)] dark:from-[hsl(220,20%,12%)] dark:to-[hsl(220,20%,10%)] border-r border-[hsl(220,15%,88%)] dark:border-[hsl(220,15%,25%)]">
              <div className="px-4 py-4 border-b border-[hsl(220,15%,88%)] dark:border-[hsl(220,15%,25%)]">
                <p className="text-sm font-semibold text-[hsl(220,65%,18%)] dark:text-[hsl(175,65%,45%)]">
                  {expandedMenuItem.name}
                </p>
              </div>

              <nav className="px-2 py-3 space-y-1">
                {expandedVisibleSubmenu.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isActive = location === subItem.href;

                  return (
                    <Link key={subItem.name} href={subItem.href!}>
                      <div
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg group transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-[hsl(220,65%,18%)] dark:bg-[hsl(175,65%,45%)] text-white shadow-md"
                            : "text-[hsl(220,15%,40%)] dark:text-[hsl(220,15%,75%)] hover:bg-[hsl(175,40%,92%)] dark:hover:bg-[hsl(220,15%,18%)] hover:text-[hsl(220,65%,18%)] dark:hover:text-[hsl(175,65%,45%)]"
                        }`}
                      >
                        <SubIcon className="mr-3 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{subItem.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
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
