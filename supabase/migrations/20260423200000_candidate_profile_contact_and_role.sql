-- Extra candidate profile fields for Edit Basic Info (dashboard / settings).
alter table public.candidate_profiles add column if not exists job_title text;
alter table public.candidate_profiles add column if not exists current_company text;
alter table public.candidate_profiles add column if not exists phone text;
alter table public.candidate_profiles add column if not exists linkedin_url text;
alter table public.candidate_profiles add column if not exists gender text;
alter table public.candidate_profiles add column if not exists certifications text;

comment on column public.candidate_profiles.job_title is 'Current or target role title (editable in applicant settings).';
comment on column public.candidate_profiles.current_company is 'Current employer name if applicable.';
comment on column public.candidate_profiles.phone is 'Contact phone (optional).';
comment on column public.candidate_profiles.linkedin_url is 'LinkedIn profile URL or handle.';
comment on column public.candidate_profiles.gender is 'Self-reported gender (optional).';
comment on column public.candidate_profiles.certifications is 'Free-text certifications.';
