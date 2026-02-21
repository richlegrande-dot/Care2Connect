-- Enable the Supabase Storage extension
create extension if not exists "storage" schema extensions;

-- Create storage bucket for audio files
insert into storage.buckets (id, name, public)
values ('audio-files', 'audio-files', false);

-- Create storage bucket for QR codes (public)
insert into storage.buckets (id, name, public)
values ('qr-codes', 'qr-codes', true);

-- Set up Row Level Security (RLS) policies for audio files
create policy "Users can upload their own audio files"
on storage.objects for insert
with check (
  bucket_id = 'audio-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view their own audio files"
on storage.objects for select
using (
  bucket_id = 'audio-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own audio files"
on storage.objects for delete
using (
  bucket_id = 'audio-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Public access for QR codes
create policy "QR codes are publicly accessible"
on storage.objects for select
using (bucket_id = 'qr-codes');

create policy "Service can upload QR codes"
on storage.objects for insert
with check (bucket_id = 'qr-codes');

-- Create function to clean up old audio files (optional)
create or replace function cleanup_old_audio_files()
returns void
language plpgsql
security definer
as $$
begin
  delete from storage.objects
  where bucket_id = 'audio-files'
    and created_at < now() - interval '30 days';
end;
$$;

-- Schedule cleanup (if using pg_cron extension)
-- select cron.schedule('cleanup-audio', '0 2 * * *', 'select cleanup_old_audio_files();');