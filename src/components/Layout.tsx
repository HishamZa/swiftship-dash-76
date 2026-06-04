import { Link } from "@tanstack/react-router";
import { Ship, Languages, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: t("nav_home") },
    { to: "/track", label: t("nav_track") },
    { to: "/addresses", label: t("nav_addresses") },
    { to: "/announcements", label: t("nav_announcements") },
    { to: "/customer", label: t("nav_customer") },
    { to: "/admin", label: t("nav_admin") },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <Ship className="w-5 h-5" />
            </span>
            <span>{t("brand")}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
                activeProps={{ className: "px-3 py-2 rounded-md text-sm font-semibold text-foreground bg-muted" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")}>
              <Languages className="w-4 h-4 mr-1.5" />
              {lang === "en" ? "العربية" : "English"}
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t bg-background">
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                  activeProps={{ className: "px-3 py-2 rounded-md text-sm font-semibold bg-muted" }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-2">
          <span>{t("footer")}</span>
          <span className="flex items-center gap-2">
            <Ship className="w-4 h-4" />
            {t("brand")}
          </span>
        </div>
      </footer>
    </div>
  );
}
