import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, AuthProvider } from "./context/AuthContext";

// Pages
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients/index";
import AddPatient from "@/pages/patients/add";
import PatientDetails from "@/pages/patients/[id]";
import Admissions from "@/pages/admissions/index";
import AddAdmission from "@/pages/admissions/add";
import Treatment from "@/pages/treatment/index";
import Billing from "@/pages/billing/index";
import Inventory from "@/pages/inventory/index";
import Diet from "@/pages/diet/index";
import Staff from "@/pages/staff/index";
import Accounts from "@/pages/accounts/index";
import Commission from "@/pages/commission/index";
import Reports from "@/pages/reports/index";
import Settings from "@/pages/settings/index";
import NotFound from "@/pages/not-found";
import Activity from "@/pages/activity/index";

// Components
import AppShell from "@/components/AppShell";
import { useEffect } from "react";

function Router() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user && location !== "/login" && location !== "/register") {
      setLocation("/login");
    }
  }, [user, loading, location, setLocation]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected Routes */}
      {user && (
        <AppShell>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/patients" component={Patients} />
            <Route path="/patients/add" component={AddPatient} />
            <Route path="/patients/:id" component={PatientDetails} />
            <Route path="/admissions" component={Admissions} />
            <Route path="/admissions/add" component={AddAdmission} />
            <Route path="/treatment" component={Treatment} />
            <Route path="/billing" component={Billing} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/diet" component={Diet} />
            <Route path="/staff" component={Staff} />
            <Route path="/accounts" component={Accounts} />
            <Route path="/commission" component={Commission} />
            <Route path="/reports" component={Reports} />
            <Route path="/settings" component={Settings} />
            <Route path="/activity" component={Activity} />
            <Route component={NotFound} />
          </Switch>
        </AppShell>
      )}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <Router />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
