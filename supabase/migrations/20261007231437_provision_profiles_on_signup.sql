-- Auth owns profile creation; signing in must never overwrite account settings.
begin;

lock table auth.users in share row exclusive mode;

do $$
begin
  if exists (
    select 1 from auth.users u
    where not exists (select 1 from public.profiles p where p.id = u.id)
  ) then
    raise exception 'Profile provisioning migration requires a profile for every existing auth user';
  end if;
end;
$$;

create function public.provision_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  username text := lower(btrim(new.raw_user_meta_data ->> 'username'));
begin
  if jsonb_typeof(new.raw_user_meta_data -> 'username') is distinct from 'string'
    or length(username) not between 1 and 28
    or username !~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' then
    raise exception 'provision_user_profile: invalid username for userId=%', new.id
      using errcode = '22023';
  end if;

  -- The unique constraint rejects a taken username; never rename it implicitly.
  insert into public.profiles (id, slug, display_name, avatar_url)
  values (
    new.id,
    username,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      username
    ),
    nullif(btrim(new.raw_user_meta_data ->> 'avatar_url'), '')
  );
  return new;
end;
$$;

revoke execute on function public.provision_user_profile() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.provision_user_profile();

-- Profile existence belongs to Auth. Users can edit their own profile, but cannot
-- create or delete it independently of their account.
drop policy "Users insert their own profile" on public.profiles;
drop policy "Users delete their own profile" on public.profiles;
revoke insert, delete on public.profiles from authenticated;
revoke insert (id, slug, display_name, avatar_url) on public.profiles from authenticated;

commit;
