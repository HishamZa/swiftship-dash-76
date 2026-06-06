import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyRoles, type AppRole, roleRank } from "@/lib/db";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  role: AppRole; // highest role, defaults to "customer"
  isAdmin: boolean;
  isManager: boolean; // admin or manager
  isStaff: boolean;   // admin, manager, or employee
  canManage: (target: AppRole) => boolean; // can act on a user with target role
  loading: boolean;
};

const Ctx = createContext<AuthCtx>({
  session: null, user: null, roles: [], role: "customer",
  isAdmin: false, isManager: false, isStaff: false,
  canManage: () => false, loading: true,
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
  const role: AppRole = roles.length
    ? (roles.slice().sort((a, b) => roleRank(b) - roleRank(a))[0] as AppRole)
    : "customer";
  const isAdmin = role === "admin";
  const isManager = role === "admin" || role === "manager";
  const isStaff = role === "admin" || role === "manager" || role === "employee";
  // A user can manage another user only when strictly higher rank.
  const canManage = (target: AppRole) => roleRank(role) > roleRank(target);

  return (
    <Ctx.Provider value={{ session, user, roles, role, isAdmin, isManager, isStaff, canManage, loading }}>
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
