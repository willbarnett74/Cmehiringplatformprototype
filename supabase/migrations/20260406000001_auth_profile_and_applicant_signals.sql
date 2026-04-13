-- Auto-create public.profiles when a new auth user is created (GitHub, email, etc.)
-- Ensures applicant_profiles / businesses FKs resolve for signed-in users.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username'
    ),
    case
      when coalesce(new.raw_user_meta_data->>'role', '') in ('applicant', 'employer')
        then new.raw_user_meta_data->>'role'
      else 'applicant'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Optional conscientiousness signal from intake (used by compute-intake-scores edge function)
alter table public.applicant_profiles
  add column if not exists optional_fields_completed boolean default false;
