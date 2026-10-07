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
  base_slug text := lower(btrim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  candidate text;
  suffix text;
  violated_constraint text;
  attempt integer;
begin
  if length(base_slug) not between 1 and 28
    or base_slug !~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' then
    base_slug := 'traveler-' || left(replace(new.id::text, '-', ''), 19);
  end if;

  -- ponytail: bounded collision retries; the unique constraint arbitrates concurrent signups.
  for attempt in 0..9 loop
    candidate := base_slug;
    if attempt > 0 then
      suffix := left(replace(new.id::text, '-', ''), 8)
        || case when attempt > 1 then '-' || attempt::text else '' end;
      candidate := rtrim(left(base_slug, 27 - length(suffix)), '-') || '-' || suffix;
    end if;

    begin
      insert into public.profiles (id, slug, display_name, avatar_url)
      values (
        new.id,
        candidate,
        coalesce(
          nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
          nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
          nullif(btrim(new.raw_user_meta_data ->> 'username'), ''),
          nullif(split_part(new.email, '@', 1), ''),
          candidate
        ),
        nullif(btrim(new.raw_user_meta_data ->> 'avatar_url'), '')
      );
      return new;
    exception when unique_violation then
      get stacked diagnostics violated_constraint = constraint_name;
      if violated_constraint <> 'profiles_slug_key' then
        raise;
      end if;
    end;
  end loop;

  raise exception 'Profile provisioning could not allocate a slug for userId=%', new.id;
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
