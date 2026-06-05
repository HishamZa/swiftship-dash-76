import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Anchor } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Almwanaa" }] }),
  component: AuthPage,
});

// Convert a phone or username into a synthetic email Supabase will accept.
function identityToEmail(identity: string) {
  const id = identity.trim();
  if (id.toLowerCase() === "admin") return "admin@almwanaa.app";
  // Strip non-alphanumerics for stable email local-part.
  const clean = id.replace(/[^a-zA-Z0-9]/g, "");
  return `${clean || "user"}@almwanaa.local`;
}

function AuthPage() {
  const { t } = useI18n();
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
    else toast.success("Welcome back!");
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error(t("phone"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: identityToEmail(phone),
      password: passwordUp,
      options: {
        data: { full_name: fullName, phone, governorate, area },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created. Signing you in…");
  };

  return (
    <Layout>
      <section className="px-5 py-8 max-w-md mx-auto">
        <div className="flex flex-col items-center mb-6">
          <span className="grid place-items-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-3">
            <Anchor className="w-7 h-7" />
          </span>
          <h1 className="text-xl font-bold">{t("brand")}</h1>
          <p className="text-sm text-muted-foreground">{t("tagline")}</p>
        </div>

        <Tabs defaultValue="in">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="in">{t("signIn")}</TabsTrigger>
            <TabsTrigger value="up">{t("signUp")}</TabsTrigger>
          </TabsList>

          <TabsContent value="in">
            <form onSubmit={signIn} className="space-y-3 mt-4">
              <Input required placeholder={t("phone") + " / " + t("username")} value={identity} onChange={(e) => setIdentity(e.target.value)} />
              <Input type="password" required minLength={6} placeholder={t("password")} value={passwordIn} onChange={(e) => setPasswordIn(e.target.value)} />
              <Button type="submit" className="w-full" disabled={loading}>{t("signIn")}</Button>
              <p className="text-[11px] text-muted-foreground text-center">{t("loginWithPhone")}</p>
            </form>
          </TabsContent>

          <TabsContent value="up">
            <form onSubmit={signUp} className="space-y-3 mt-4">
              <Input required placeholder={t("fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input required placeholder={t("governorate")} value={governorate} onChange={(e) => setGovernorate(e.target.value)} />
              <Input required placeholder={t("area")} value={area} onChange={(e) => setArea(e.target.value)} />
              <Input required placeholder={t("phone")} value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input type="password" required minLength={6} placeholder={t("password")} value={passwordUp} onChange={(e) => setPasswordUp(e.target.value)} />
              <Button type="submit" className="w-full" disabled={loading}>{t("signUp")}</Button>
            </form>
          </TabsContent>
        </Tabs>
      </section>
    </Layout>
  );
}
