import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { icons } from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
}

type NavItem = {
  name: string;
  path: string;
  icon: string;
  roles: string[];
};

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: "Home", roles: ["doctor", "nurse", "staff", "affiliate","admin"] },
  { name: "Patients", path: "/patients", icon: "UserRound", roles: ["doctor", "nurse", "staff","admin"] },
  { name: "OPD/IPD", path: "/admissions", icon: "Bed", roles: ["doctor", "nurse", "staff","admin"] },
  { name: "Treatment", path: "/treatment", icon: "Stethoscope", roles: ["doctor", "nurse","admin"] },
  { name: "Billing", path: "/billing", icon: "Receipt", roles: ["doctor", "nurse", "staff","admin"] },
  { name: "Inventory", path: "/inventory", icon: "Tablets", roles: ["nurse", "staff","admin"] },
  { name: "Diet", path: "/diet", icon: "Utensils", roles: ["nurse","admin"] },
  { name: "Staff", path: "/staff", icon: "Users", roles: ["doctor","admin"] },
  { name: "Accounts", path: "/accounts", icon: "Building2", roles: ["affiliate","admin"] },
  { name: "Commission", path: "/commission", icon: "Wallet", roles: ["affiliate","admin"] },
  { name: "Reports", path: "/reports", icon: "BarChartBig", roles: ["doctor", "nurse", "staff", "affiliate","admin"] },
  { name: "Settings", path: "/settings", icon: "Settings", roles: ["doctor", "nurse", "staff", "affiliate","admin"] },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, onLogout }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState(user?.role || "doctor");
  const [currentView, setCurrentView] = useState(location.split('/')[1] || "dashboard");

  useEffect(() => {
    // Update currentView when location changes
    const path = location.split('/')[1] || "dashboard";
    setCurrentView(path);
  }, [location]);

  // Update the role in localStorage for demo purposes
  useEffect(() => {
    if (user?.role) {
      setCurrentRole(user.role);
    }
  }, [user]);

  const handleNavigation = (path: string) => {
    setLocation(path);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const LucideIcon = ({ name }: { name: string }) => {
    const Icon = icons[name as keyof typeof icons] || icons.CircleDot;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full">
      {/* Sidebar header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center">
          <img className="h-8 w-auto" src="https://cdn-icons-png.flaticon.com/512/3481/3481061.png" alt="Healthcare Logo" />
          <span className="ml-2 text-lg font-semibold text-primary dark:text-primary-foreground">HealthPro</span>
        </div>
        <button 
          className="md:hidden rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <LucideIcon name="X" />
        </button>
      </div>
      
      {/* User info */}
      <div className="flex flex-col items-center p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Avatar className="h-16 w-16 border-2 border-primary">
            {user?.photoURL ? (
              <AvatarImage src={user.photoURL} alt={user.displayName || "User"} />
            ) : (
              <AvatarFallback>{getInitials(user?.displayName || "User")}</AvatarFallback>
            )}
          </Avatar>
          <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></span>
        </div>
        <div className="mt-2 text-center">
          <h3 className="font-medium">{user?.displayName || "User"}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{currentRole}</p>
        </div>
        
        {/* Role selector - normally this would be removed in a production app */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 flex">
            <select 
              className="text-xs rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1"
              value={currentRole}
              onChange={(e) => {
                setCurrentRole(e.target.value);
                localStorage.setItem('currentRole', e.target.value);
              }}
            >
              <option value="doctor">Switch to Doctor</option>
              <option value="nurse">Switch to Nurse</option>
              <option value="staff">Switch to Staff</option>
              <option value="affiliate">Switch to Affiliate</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Sidebar navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.filter(item => item.roles.includes(currentRole)).map((item) => (
            <li key={item.path}>
              <button 
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                  currentView === item.path.substring(1)
                    ? 'bg-primary-50 text-primary dark:bg-slate-700 dark:text-primary'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <LucideIcon name={item.icon} />
                <span className="ml-3">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Sidebar footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <Button 
          className="w-full"
          onClick={onLogout}
        >
          <LucideIcon name="LogOut" />
          <span className="ml-2">Logout</span>
        </Button>
        <div className="mt-2 flex justify-center">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
