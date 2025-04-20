import { Bell, HelpCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const [location] = useLocation();
  
  // Get page title based on current path
  const getPageTitle = (): string => {
    const path = location.split('/')[1] || 'dashboard';
    
    switch (path) {
      case 'dashboard': return 'Dashboard';
      case 'patients': return 'Patient Management';
      case 'admissions': return 'OPD/IPD Admissions';
      case 'treatment': return 'Treatment Logs';
      case 'billing': return 'Billing';
      case 'inventory': return 'Inventory Management';
      case 'diet': return 'Diet Plans';
      case 'staff': return 'Staff Management';
      case 'accounts': return 'Accounts';
      case 'commission': return 'Commission Tracking';
      case 'reports': return 'Reports';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {getPageTitle()}
          </h1>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 bg-red-500 rounded-full h-2 w-2"></span>
            <span className="sr-only">View notifications</span>
          </Button>
          
          {/* Help */}
          <Button variant="ghost" size="icon" className="ml-2">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
