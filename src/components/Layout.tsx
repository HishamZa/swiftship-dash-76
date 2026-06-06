import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Languages, Sun, Moon, LogOut, Bell, ArrowLeft, ArrowRight, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useAuth, signOut } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { fetchUnreadCount } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";

export function Layout({ children, showBack = true }: { children: ReactNode; showBack?: boolean }) {
  const { t, lang, setLang, dir } = useI18n();
  const { mode, toggle } = useTheme();
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  const pathname = router.state.location.pathname;
  const isHome = pathname === "/" || pathname === "/dashboard" || pathname === "/admin" || pathname === "/auth";

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    let active = true;
    fetchUnreadCount(user.id).then((n) => active && setUnread(n));
    const ch = supabase.channel(`unread:${user.id}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
      () => fetchUnreadCount(user.id).then((n) => active && setUnread(n)),
    ).subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;
  const homeTo = !user ? "/auth" : isStaff ? "/admin" : "/dashboard";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur bg-background/85 border-b">
        <div className="container mx-auto px-3 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {showBack && !isHome && (
              <Button variant="ghost" size="icon" onClick={() => router.history.back()} aria-label={t("back")}>
                <BackIcon className="w-4 h-4" />
              </Button>
            )}
            <Link to={homeTo} className="flex items-center gap-2 font-bold min-w-0">
              <Logo className="w-9 h-9" />
              <span className="text-sm sm:text-base truncate">{t("brand")}</span>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            {user && (
              <Link to="/notifications" className="relative inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent">
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
            )}
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="theme">
              {mode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")}>
              <Languages className="w-4 h-4" />
              <span className="ms-1 text-xs">{lang === "en" ? "AR" : "EN"}</span>
            </Button>
            {user && (
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label={t("signOut")}>
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-8">{children}</main>
    </div>
  );
}
