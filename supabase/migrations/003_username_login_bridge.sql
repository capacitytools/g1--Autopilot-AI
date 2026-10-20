-- ============================================================
-- G1-Autopilot AI — Username to Email Login Bridge
-- ============================================================

-- This function allows unauthenticated users (logging in) to 
-- resolve their username to the email required by Supabase Auth.
-- It is marked SECURITY DEFINER so it can read the profiles table 
-- despite RLS, but it ONLY returns the email for the exact username.
create or replace function public.get_email_by_username(lookup_username text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  found_email text;
begin
  select u.email into found_email
  from auth.users u
  join public.profiles p on p.id = u.id
  where p.username = lower(lookup_username)
  limit 1;

  return found_email;
end;
$$;