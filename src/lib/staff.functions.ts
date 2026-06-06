import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Synthetic-email mapping mirrors src/routes/auth.tsx identityToEmail.
function usernameToEmail(username: string) {
  const id = username.trim();
  if (id.toLowerCase() === "admin") return "admin@almwanaa.app";
  const clean = id.replace(/[^a-zA-Z0-9]/g, "");
  return `${clean || "user"}@almwanaa.local`;
}

const ROLE_RANK: Record<string, number> = { admin: 4, manager: 3, employee: 2, customer: 1 };

async function getMaxRole(userId: string): Promise<"admin" | "manager" | "employee" | "customer"> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("manager")) return "manager";
  if (roles.includes("employee")) return "employee";
  return "customer";
}

// Create a staff account (manager or employee). Admin or manager only.
export const createStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    username: z.string().min(2).max(60),
    password: z.string().min(6).max(128),
    role: z.enum(["manager", "employee"]),
    full_name: z.string().max(120).optional(),
  }))
  .handler(async ({ data, context }) => {
    const callerRole = await getMaxRole(context.userId);
    if (ROLE_RANK[callerRole] < ROLE_RANK.manager) {
      throw new Error("Forbidden: managers or admins only");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = usernameToEmail(data.username);
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name ?? data.username, username: data.username },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create user");
    // The handle_new_user trigger inserts a customer role; override.
    await supabaseAdmin.from("user_roles").delete().eq("user_id", created.user.id);
    const { error: rErr } = await supabaseAdmin.from("user_roles")
      .insert({ user_id: created.user.id, role: data.role });
    if (rErr) throw new Error(rErr.message);
    return { id: created.user.id };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    userId: z.string().uuid(),
    newPassword: z.string().min(6).max(128),
  }))
  .handler(async ({ data, context }) => {
    const callerRole = await getMaxRole(context.userId);
    const targetRole = await getMaxRole(data.userId);
    if (ROLE_RANK[callerRole] <= ROLE_RANK[targetRole] && callerRole !== "admin") {
      throw new Error("Forbidden: insufficient rank to reset this user's password");
    }
    if (targetRole === "admin" && callerRole !== "admin") {
      throw new Error("Forbidden: admin password can only be reset by admin");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    if (data.userId === context.userId) throw new Error("Cannot delete your own account");
    const callerRole = await getMaxRole(context.userId);
    const targetRole = await getMaxRole(data.userId);
    if (ROLE_RANK[callerRole] <= ROLE_RANK[targetRole]) {
      throw new Error("Forbidden: cannot delete a user with equal or higher rank");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    userId: z.string().uuid(),
    role: z.enum(["admin", "manager", "employee", "customer"]),
  }))
  .handler(async ({ data, context }) => {
    const callerRole = await getMaxRole(context.userId);
    const targetRole = await getMaxRole(data.userId);
    if (ROLE_RANK[callerRole] <= ROLE_RANK[targetRole]) {
      throw new Error("Forbidden: cannot modify a user with equal or higher rank");
    }
    if (data.role === "admin" && callerRole !== "admin") {
      throw new Error("Forbidden: only an admin can assign admin role");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
