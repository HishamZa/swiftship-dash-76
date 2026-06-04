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

function AuthPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back!");
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName, phone },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created — check your email to verify.");
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
              <Input type="email" required placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" required minLength={6} placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" className="w-full" disabled={loading}>{t("signIn")}</Button>
            </form>
          </TabsContent>

          <TabsContent value="up">
            <form onSubmit={signUp} className="space-y-3 mt-4">
              <Input required placeholder={t("fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input placeholder={t("phone")} value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input type="email" required placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" required minLength={6} placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" className="w-full" disabled={loading}>{t("signUp")}</Button>
            </form>
          </TabsContent>
        </Tabs>
      </section>
    </Layout>
  );
}
