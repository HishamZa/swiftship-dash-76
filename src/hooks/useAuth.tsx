import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyRoles, type AppRole } from "@/lib/db";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  isStaff: boolean;
  isAdmin: boolean;
  loading: boolean;
};

const Ctx = createContext<AuthCtx>({
  session: null, user: null, roles: [], isStaff: false, isAdmin: false, loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) {
        setTimeout(() => {
          fetchMyRoles(s.user.id).then(setRoles).catch(() => setRoles([]));
        }, 0);
      } else {
        setRoles([]);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        fetchMyRoles(data.session.user.id).then(setRoles).catch(() => setRoles([]));
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const isAdmin = roles.includes("admin");
  const isStaff = isAdmin || roles.includes("employee");

  return (
    <Ctx.Provider value={{ session, user, roles, isStaff, isAdmin, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}

export async function signOut() {
  await supabase.auth.signOut();
}
