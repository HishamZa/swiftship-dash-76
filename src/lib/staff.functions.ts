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
    if (callerRole === "customer") throw new Error("Forbidden");
    if (callerRole === "employee" && targetRole !== "customer") {
      throw new Error("Forbidden: employees can only reset customer passwords");
    }
    if (targetRole === "admin" && callerRole !== "admin") {
      throw new Error("Forbidden: admin password can only be reset by admin");
    }
    if (callerRole === "manager" && targetRole === "admin") {
      throw new Error("Forbidden");
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
    if (callerRole === "customer") throw new Error("Forbidden: staff only");
    if (callerRole === "employee") {
      throw new Error("Forbidden: employees cannot delete accounts");
    }
    if (callerRole === "manager" && targetRole === "admin") {
      throw new Error("Forbidden: managers cannot delete admin accounts");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Update the calling user's own profile and (optionally) login identity.
export const updateMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    full_name: z.string().min(1).max(120).optional(),
    phone: z.string().max(40).optional(),
    governorate: z.string().max(80).optional(),
    area: z.string().max(120).optional(),
    username: z.string().min(2).max(60).optional(),
  }))
  .handler(async ({ data, context }) => {
    const callerRole = await getMaxRole(context.userId);
    const isStaff = callerRole === "admin" || callerRole === "manager" || callerRole === "employee";
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const profilePatch: { full_name?: string; phone?: string; governorate?: string; area?: string } = {};
    if (data.full_name !== undefined) profilePatch.full_name = data.full_name;
    if (data.phone !== undefined) profilePatch.phone = data.phone;
    if (!isStaff) {
      if (data.governorate !== undefined) profilePatch.governorate = data.governorate;
      if (data.area !== undefined) profilePatch.area = data.area;
    }
    if (Object.keys(profilePatch).length > 0) {
      const { error } = await supabaseAdmin.from("profiles").update(profilePatch).eq("id", context.userId);
      if (error) throw new Error(error.message);
    }

    let newEmail: string | null = null;
    const metaPatch: Record<string, unknown> = {};
    if (data.full_name !== undefined) metaPatch.full_name = data.full_name;
    if (isStaff && data.username && data.username.trim()) {
      const u = data.username.trim();
      newEmail = u.toLowerCase() === "admin" ? "admin@almwanaa.app"
        : `${u.replace(/[^a-zA-Z0-9]/g, "") || "user"}@almwanaa.local`;
      metaPatch.username = u;
    } else if (!isStaff && data.phone && data.phone.trim()) {
      const p = data.phone.trim();
      newEmail = `${p.replace(/[^a-zA-Z0-9]/g, "") || "user"}@almwanaa.local`;
      metaPatch.phone = p;
    }

    const updates: Record<string, unknown> = {};
    if (newEmail) updates.email = newEmail;
    if (Object.keys(metaPatch).length > 0) updates.user_metadata = metaPatch;
    if (Object.keys(updates).length > 0) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, updates);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const changeMyPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ newPassword: z.string().min(6).max(128) }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, { password: data.newPassword });
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
