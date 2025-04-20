import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "firebase/auth";
import { auth, onAuthStateChanged, getUserData } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

type UserWithRole = User & {
  role?: string;
  permissions?: string[];
};

interface AuthContextType {
  user: UserWithRole | null;
  loading: boolean;
  error: Error | null;
  setUser: (user: UserWithRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get additional user data from Firestore
          const enrichedUser = await getUserData(firebaseUser);
          setUser(enrichedUser as UserWithRole);
        } else {
          setUser(null);
        }
      } catch (err) {
        setError(err as Error);
        toast({
          title: "Authentication Error",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  return (
    <AuthContext.Provider value={{ user, loading, error, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
