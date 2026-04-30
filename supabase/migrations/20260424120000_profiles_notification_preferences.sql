-- Applicant account notification preferences (Settings > Preferences).
alter table public.profiles add column if not exists notify_email_matches boolean default true;
alter table public.profiles add column if not exists notify_weekly_digest boolean default false;

comment on column public.profiles.notify_email_matches is 'Applicant: email when new employer matches (product hook).';
comment on column public.profiles.notify_weekly_digest is 'Applicant: weekly summary email.';
