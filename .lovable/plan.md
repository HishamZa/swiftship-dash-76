## Almwanaa Company — Major Update Plan

### 1. Branding & Defaults
- Replace app logo/icon with the uploaded ship illustration (saved as Lovable asset, used in header + PWA `icon-512.png` + favicon).
- Rename app: English "Almwanaa Company", Arabic "شركة الموانئ" (update `i18n.tsx`, `manifest.webmanifest`, `index.html` title).
- Default language → Arabic (RTL on first load). Persist override if user toggles.
- Default landing route → `/auth` (login). Authenticated users redirect to their dashboard.

### 2. Navigation Overhaul
- Remove the bottom tab bar entirely from `Layout.tsx` (both public, customer, admin variants).
- Adjust `pb-20` spacing.
- All navigation is driven from the main dashboard pages (cards/links already exist on `/admin` and `/dashboard`). Add equivalent dashboard cards for the new sections (Accounts, News, Offices).
- Keep header with brand, theme, language, sign-out, and a back button on inner pages.
- Add a customer header notification bell with **red unread badge counter**.

### 3. Roles & Permissions
Add `manager` to the `app_role` enum. Final hierarchy: `admin > manager > employee > customer`.

Permission matrix:

```text
Capability                  Admin  Manager  Employee  Customer
Manage shipments              ✓      ✓        ✓         –
Create customers              ✓      ✓        ✓         –
Create employees              ✓      ✓        –         –
Create managers               ✓      ✓        –         –
Modify admin account          ✓      –        –         –
Send notifications            ✓      ✓        –         –
Manage news                   ✓      ✓        –         –
Manage offices (CRUD)         ✓      ✓        view      view
Delete shipment               ✓      ✓        ✓         –
```

Enforced both in the UI (hide/disable) and in RLS via `has_role()` + a new `has_min_role()` SQL helper.

Employee opening Notifications → shows message: "Only administrators can use this feature."

### 4. Login Page
- Label → "Phone Number" only (still accepts username/Admin internally via the existing synthetic-email mapping).
- Remove helper text "Enter your phone number (or 'Admin' for administrator)".

### 5. New Admin Panel — Accounts Management
New route `/_authenticated/accounts` (replaces/augments `admin-customers`):
- **Add Employee/Manager form**: username + password + role selector (Manager / Employee). Creates account via signup with synthetic email `username@almwanaa.local`, no phone required.
- **Registered Members list**: staff (managers + employees) first, customers below; search box.
- **Account Details page** `/_authenticated/accounts/$id`:
  - Editable: name, phone, address, username, role (role editable only if current user outranks target).
  - "Reset Password" (admin/manager via server function using `supabaseAdmin.auth.admin.updateUserById`).
  - "Delete Account" (red, confirm dialog) → cascades shipments/notifications/etc.
- Permission rule enforced: cannot modify accounts at equal or higher rank.

### 6. Notifications
- Auto-notify customer on shipment status change (database trigger writes a row in `notifications` with shipment number + new status + note).
- Red badge on the bell icon in header showing unread count (live via Supabase realtime on `notifications`).
- Mark-as-read on opening `/notifications`.

### 7. Shipments
- New field **`description`** (text) on shipments with placeholder "Clothes, Electronics, etc." Visible to customers in list + details.
- **Delete Shipment** red button + confirm dialog on shipment details page (`/_authenticated/shipments/$id` — create if missing). Allowed for admin/manager/employee.
- Customer view: **countdown to estimated delivery** ("3 days remaining", "Today", "Overdue by 2 days") computed from `estimated_delivery`.
- Format `estimated_cost` as `$120` and `cbm_volume` as `2.5 CBM` everywhere (helper in `lib/format.ts`).

### 8. News Management
New route `/_authenticated/news` (admin/manager): list, create, edit, delete announcements (reuses existing `announcements` table). Public `/announcements` continues to read these.

### 9. Offices Management
New route `/_authenticated/offices-manage` (admin/manager full, employee view-only). CRUD on existing `addresses` table (re-labeled as offices). Public `/offices` continues to read.

---

### Technical / Database Section

**Migration 1 — roles & permissions**
- `ALTER TYPE app_role ADD VALUE 'manager';`
- Function `public.has_min_role(_user_id uuid, _min app_role) returns boolean` (security definer, ranks admin=4, manager=3, employee=2, customer=1).
- Update RLS on `shipments`, `notifications`, `announcements`, `addresses`, `profiles`, `user_roles` to use the new helper.
- Policy: only admin can touch user_roles row where role='admin'; manager can insert manager/employee; employee cannot insert.

**Migration 2 — shipments & notifications**
- `ALTER TABLE shipments ADD COLUMN description text;`
- Trigger `notify_customer_on_status_change` on `shipments` AFTER UPDATE OF status → inserts notification (`title`, `body`, `user_id = customer_id`, `shipment_id`). Add `shipment_id uuid` to `notifications` if not present.
- Cascade deletes from `auth.users` already handled; ensure `shipments.customer_id` has `ON DELETE CASCADE`.

**Server functions (`createServerFn` + `supabaseAdmin`)**
- `createStaffAccount({ username, password, role })` — admin/manager only.
- `resetUserPassword({ userId, newPassword })` — rank-gated.
- `deleteUserAccount({ userId })` — rank-gated; deletes auth user (cascade clears data).
- `updateUserProfile({ userId, ... })` — rank-gated.

**Frontend**
- `useAuth` exposes `role` ("admin" | "manager" | "employee" | "customer") and `canManageUser(targetRole)`.
- `lib/format.ts` → `formatUSD`, `formatCBM`, `formatCountdown`.
- `i18n.tsx` extended with all new strings (Arabic + English).
- New routes added; route tree regenerates automatically on build.
- Logo asset wired via `lovable-assets create` from `/mnt/user-uploads/IMG_20260605_152105.png`; also written to `public/icon-512.png` for the PWA.

**Out of scope / preserved**
- All existing customer-facing flows (track, dashboard, shipments list, addresses, announcements) remain.
- Tracking number format, status enum, Iraq governorate list — unchanged.
- Cloudflare Pages build compatibility maintained.
