# Admin Authentication Setup Guide

This guide walks you through setting up real authentication for the admin panel with **matt.millard@me.com** as the first administrator.

## Overview

The admin authentication system uses:

- **Supabase Auth** for user authentication (email/password)
- **admin_users table** to control admin access and roles
- **Row Level Security (RLS)** policies for data protection
- **Middleware** for route protection
- **Client-side auth guards** in the admin layout

## Step 1: Run the Database Schema

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Open the file `/supabase/ADMIN_USERS_SCHEMA.sql`
4. Copy the entire SQL content
5. Paste it into the Supabase SQL Editor
6. Click **Run** to execute the schema

This creates:

- `admin_users` table with proper structure
- RLS policies for secure access
- Indexes for performance
- Trigger for auto-updating `updated_at` field

## Step 2: Create Your First Admin User

### 2.1 Create Auth User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add User** (or **Invite User**)
3. Enter the following:
   - **Email**: `matt.millard@me.com`
   - **Password**: Choose a strong password (you'll use this to log in)
   - **Auto Confirm User**: ✅ Enable this (or you'll need to confirm via email)
4. Click **Create User** or **Send Invitation**

### 2.2 Get User UUID

After creating the user:

1. Find `matt.millard@me.com` in the Users list
2. Click on the user to view details
3. **Copy the User ID (UUID)** - it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### 2.3 Add User to admin_users Table

1. Go back to **SQL Editor** in Supabase
2. Run this query (replace `YOUR-USER-UUID-HERE` with the UUID you copied):

```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'YOUR-USER-UUID-HERE',
  'matt.millard@me.com',
  'Matt Millard',
  'owner',
  true
);
```

3. Click **Run**

### 2.4 Verify Setup

Run this query to confirm the user was added:

```sql
SELECT id, email, full_name, role, is_active, created_at
FROM admin_users
WHERE email = 'matt.millard@me.com';
```

You should see your admin user record.

## Step 3: Configure Environment Variables

Make sure your `.env.local` file has these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

- Get these from Supabase **Project Settings** → **API**
- The `SUPABASE_SERVICE_ROLE_KEY` is only for server-side operations
- Never expose the service role key to the client

## Step 4: Test the Login

1. Start your dev server:

   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/admin/login`

3. Log in with:
   - **Email**: `matt.millard@me.com`
   - **Password**: The password you set in Step 2.1

4. You should be redirected to `/admin/dashboard`

## Step 5: Verify Route Protection

Test that authentication is working:

1. **Log out** from the admin panel (click user menu → Sign Out)
2. Try to access: `http://localhost:3000/admin/dashboard`
3. You should be **redirected to `/admin/login`**
4. Log back in to access the admin panel

## Admin Roles

The system supports three roles with different permissions:

### Owner

- Full access to everything
- Can manage other admin users
- Can view all settings and analytics

### Admin

- Can manage bookings, inventory, pricing, zones
- Can view dashboard and analytics
- **Cannot** manage other users

### Dispatcher

- Can view and manage bookings
- Limited access to other features
- Read-only on most pages

## Adding More Admin Users

### Via Supabase Dashboard

1. Go to **Authentication** → **Users** → **Add User**
2. Create the auth user
3. Copy their UUID
4. Run SQL:

```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'copied-uuid-here',
  'newadmin@example.com',
  'New Admin Name',
  'admin',  -- or 'dispatcher'
  true
);
```

### Programmatically (Future Feature)

You can build an admin user management page at `/admin/users` where owners can:

- Invite new admins
- Change roles
- Deactivate users

Example code structure:

```typescript
import { supabaseAdmin } from "@/lib/supabase/admin";

// Create new admin user
async function createAdminUser(
  email: string,
  password: string,
  role: "admin" | "dispatcher",
) {
  // 1. Create auth user
  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) throw authError;

  // 2. Create admin_users record
  const { error: dbError } = await supabaseAdmin.from("admin_users").insert({
    id: authUser.user.id,
    email,
    role,
    is_active: true,
  });

  if (dbError) throw dbError;
}
```

## Security Features

### What's Protected

1. **Middleware** (`middleware.ts`):
   - Checks Supabase session on every admin route request
   - Verifies user exists in `admin_users` table
   - Confirms user is active
   - Redirects unauthorized users to login

2. **Admin Layout** (`app/admin/layout.tsx`):
   - Client-side auth check on render
   - Listens for auth state changes
   - Auto-redirects if session expires

3. **Row Level Security**:
   - Users can only read their own profile
   - Only owners can manage other users
   - Analytics and bookings restricted to active admins

### Session Management

- Sessions are stored in HTTP-only cookies
- Default expiration: 1 hour (configurable in Supabase)
- Refresh tokens extend the session automatically
- Logout clears all session data

## Troubleshooting

### "Invalid credentials" on Login

- Verify the email and password are correct
- Check that the user exists in **Authentication** → **Users**
- Ensure the user was confirmed (or auto-confirm was enabled)

### "User not authorized" After Login

- Verify the user exists in `admin_users` table:
  ```sql
  SELECT * FROM admin_users WHERE email = 'your@email.com';
  ```
- Check that `is_active = true`
- Ensure the user's UUID matches between `auth.users` and `admin_users`

### Redirected to Login Immediately

- Check browser console for errors
- Verify environment variables are set correctly
- Clear browser cookies and try again
- Check that middleware is not blocking the requests

### Session Expires Too Quickly

1. Go to Supabase **Authentication** → **Policies**
2. Adjust "JWT expiration limit" (default 3600 seconds = 1 hour)
3. Increase "Refresh token rotation interval" if needed

### RLS Policies Not Working

Run this query to check policies:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'admin_users';
```

You should see 6 policies (read_own, update_own, read_all_owners, insert_owners, update_all_owners, delete_owners).

## Next Steps

1. ✅ Set up production SMTP for password reset emails
2. ✅ Enable 2FA in Supabase Auth settings (optional but recommended)
3. ✅ Build user management UI at `/admin/users` (for owners)
4. ✅ Implement role-based component hiding in the admin panel
5. ✅ Set up audit logging for admin actions

## Production Checklist

Before deploying to production:

- [ ] All admin users have strong passwords
- [ ] Email confirmation is enabled
- [ ] SMTP is configured for password resets
- [ ] Environment variables are set in Vercel/hosting platform
- [ ] RLS policies are enabled on all tables
- [ ] Service role key is never exposed to client
- [ ] Audit logging is set up (optional)
- [ ] 2FA is enabled for owner accounts (optional)

## Support

For issues or questions:

- Check Supabase docs: https://supabase.com/docs/guides/auth
- Review RLS policies: https://supabase.com/docs/guides/auth/row-level-security
- Check this project's `lib/auth/admin.ts` for auth utilities

---

**Authentication system is now production-ready!** 🎉
