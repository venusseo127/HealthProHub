import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "doctor" | "nurse" | "staff" | "affiliate";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      // Set role from user data
      if (
        user.role === "doctor" ||
        user.role === "nurse" ||
        user.role === "staff" ||
        user.role === "affiliate"
      ) {
        setRole(user.role);
        setPermissions(user.permissions || []);
      } else {
        // Default role if none found
        setRole("staff");
        setPermissions([]);
        toast({
          title: "Role Warning",
          description: "Your account doesn't have a valid role. Contact administrator.",
          variant: "destructive",
        });
      }
      setLoading(false);
    } else {
      setRole(null);
      setPermissions([]);
      setLoading(false);
    }
  }, [user, toast]);

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false;
    return permissions.includes(permission);
  };

  // Check if user has a specific role
  const hasRole = (checkRole: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    
    if (Array.isArray(checkRole)) {
      return checkRole.includes(role);
    }
    
    return role === checkRole;
  };

  return { 
    role, 
    permissions, 
    loading,
    hasPermission,
    hasRole
  };
}
