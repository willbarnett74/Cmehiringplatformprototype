-- Public bucket for applicant profile photos (URL stored on profiles.avatar_url).
-- If the bucket already exists, adjust visibility and file limits in the Dashboard instead.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png']::text[]
)
on conflict (id) do nothing;

-- RLS: anyone can read (public bucket); authenticated users may only write under avatars/{their_user_id}/...
drop policy if exists "Avatars: public read" on storage.objects;
create policy "Avatars: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "Avatars: users insert own folder" on storage.objects;
create policy "Avatars: users insert own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Avatars: users update own folder" on storage.objects;
create policy "Avatars: users update own folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Avatars: users delete own folder" on storage.objects;
create policy "Avatars: users delete own folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
