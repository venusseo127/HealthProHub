import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth, onAuthStateChanged, getUserData } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

type FirebaseUser = User & {
  role?: string;
  permissions?: string[];
};

export function useFirebaseAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get additional user data from Firestore
          const enrichedUser = await getUserData(firebaseUser);
          setUser(enrichedUser as FirebaseUser);
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

  return { user, loading, error };
}
