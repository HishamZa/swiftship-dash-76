import { Link, useNavigate } from "@tanstack/react-router";
import { Anchor, Languages, Sun, Moon, Home, Search, Newspaper, User, LayoutDashboard, Package, Bell, LogOut, PlusCircle, Users, Send } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useAuth, signOut } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { mode, toggle } = useTheme();
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();

  const publicNav = [
    { to: "/", label: t("nav_home"), icon: Home },
    { to: "/track", label: t("nav_track"), icon: Search },
    { to: "/announcements", label: t("nav_news"), icon: Newspaper },
    { to: user ? "/dashboard" : "/auth", label: user ? t("nav_account") : t("signIn"), icon: User },
  ] as const;

  const customerNav = [
    { to: "/dashboard", label: t("nav_dashboard"), icon: LayoutDashboard },
    { to: "/shipments", label: t("nav_shipments"), icon: Package },
    { to: "/notifications", label: t("nav_notifications"), icon: Bell },
    { to: "/track", label: t("nav_track"), icon: Search },
  ] as const;

  const adminNav = [
    { to: "/admin", label: t("nav_dashboard"), icon: LayoutDashboard },
    { to: "/admin-add", label: t("nav_add"), icon: PlusCircle },
    { to: "/admin-customers", label: t("nav_customers"), icon: Users },
    { to: "/admin-shipments", label: t("nav_shipments"), icon: Package },
    { to: "/admin-notify", label: t("nav_notify"), icon: Send },
  ] as const;

  const bottomNav = !user ? publicNav : isStaff ? adminNav : customerNav;
  const gridCols = bottomNav.length === 5 ? "grid-cols-5" : "grid-cols-4";

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pb-20">
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <Link to={user ? (isStaff ? "/admin" : "/dashboard") : "/"} className="flex items-center gap-2 font-bold">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
              <Anchor className="w-4.5 h-4.5" />
            </span>
            <span className="text-base">{t("brand")}</span>
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="theme">
              {mode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")}>
              <Languages className="w-4 h-4" />
              <span className="ms-1 text-xs">{lang === "en" ? "AR" : "EN"}</span>
            </Button>
            {user && (
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur">
        <ul className={`container mx-auto grid ${gridCols} max-w-md`}>
          {bottomNav.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground"
                activeProps={{ className: "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold text-primary" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                <l.icon className="w-5 h-5" />
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
