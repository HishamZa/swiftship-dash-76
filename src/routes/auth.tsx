import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Languages, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Almwanaa Company" }] }),
  component: AuthPage,
});

// Convert a phone or username into a synthetic email Supabase will accept.
export function identityToEmail(identity: string) {
  const id = identity.trim();
  if (id.toLowerCase() === "admin") return "admin@almwanaa.app";
  const clean = id.replace(/[^a-zA-Z0-9]/g, "");
  return `${clean || "user"}@almwanaa.local`;
}

function AuthPage() {
  const { t, lang, setLang } = useI18n();
  const { mode, toggle } = useTheme();
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // sign in
  const [identity, setIdentity] = useState("");
  const [passwordIn, setPasswordIn] = useState("");

  // sign up
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [area, setArea] = useState("");
  const [passwordUp, setPasswordUp] = useState("");

  useEffect(() => {
    if (user) navigate({ to: isStaff ? "/admin" : "/dashboard", replace: true });
  }, [user, isStaff, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: identityToEmail(identity),
      password: passwordIn,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success(t("welcome"));
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{11}$/.test(phone)) {
      toast.error(lang === "ar" ? "يجب أن يحتوي رقم الهاتف على 11 رقماً بالضبط." : "Phone number must contain exactly 11 digits.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: identityToEmail(phone),
      password: passwordUp,
      options: { data: { full_name: fullName, phone, governorate, area } },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success(t("welcome"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="absolute top-3 end-3 flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggle}>
          {mode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")}>
          <Languages className="w-4 h-4" />
          <span className="ms-1 text-xs">{lang === "en" ? "AR" : "EN"}</span>
        </Button>
      </div>

      <section className="flex-1 px-5 pt-10 pb-6 max-w-md w-full mx-auto flex flex-col">
        <div className="flex flex-col items-center mb-6">
          <Logo className="w-24 h-24 mb-3" />
          <h1 className="text-xl font-bold text-center">{t("brand")}</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">{t("tagline")}</p>
        </div>

        <Tabs defaultValue="in">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="in">{t("signIn")}</TabsTrigger>
            <TabsTrigger value="up">{t("signUp")}</TabsTrigger>
          </TabsList>

          <TabsContent value="in">
            <form onSubmit={signIn} className="space-y-3 mt-4">
              <Input
                required
                placeholder={t("phone")}
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
              />
              <Input
                type="password"
                required
                minLength={6}
                placeholder={t("password")}
                value={passwordIn}
                onChange={(e) => setPasswordIn(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={loading}>{t("signIn")}</Button>
              <p className="text-center text-xs text-muted-foreground/70">
                {lang === "ar" ? "نسيت كلمة السر ؟ تواصل مع الشركة لمساعدتك" : "Forgot your password? Contact us for assistance."}
              </p>
            </form>
          </TabsContent>

          <TabsContent value="up">
            <form onSubmit={signUp} className="space-y-3 mt-4">
              <Input required placeholder={t("fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input required placeholder={t("governorate")} value={governorate} onChange={(e) => setGovernorate(e.target.value)} />
              <Input required placeholder={t("area")} value={area} onChange={(e) => setArea(e.target.value)} />
              <Input required inputMode="numeric" pattern="\d{11}" maxLength={11} minLength={11} title={lang === "ar" ? "11 رقماً" : "Exactly 11 digits"} placeholder={t("phone")} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} />
              <Input type="password" required minLength={6} placeholder={t("password")} value={passwordUp} onChange={(e) => setPasswordUp(e.target.value)} />
              <Button type="submit" className="w-full" disabled={loading}>{t("signUp")}</Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-xs text-muted-foreground/70 leading-relaxed">
          {lang === "ar" ? (
            <>
              عند استخدامك لهذا التطبيق فأنت توافق على{" "}
              <Link to="/terms" className="underline hover:text-foreground">الشروط والأحكام</Link>
              {" "}و{" "}
              <Link to="/privacy" className="underline hover:text-foreground">سياسة الخصوصية</Link>
            </>
          ) : (
            <>
              By using this application, you agree to the{" "}
              <Link to="/terms" className="underline hover:text-foreground">Terms &amp; Conditions</Link>
              {" "}and{" "}
              <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
            </>
          )}
        </p>
      </section>
    </div>
  );
}
