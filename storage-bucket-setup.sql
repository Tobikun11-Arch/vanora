-- Storage Bucket Configuration for profile photos

-- RLS Policy: Users can upload to their own folder
CREATE POLICY "Users can upload profile photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Users can view their own photos
CREATE POLICY "Users can view their own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Users can delete their own photos
CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage Bucket Configuration for gallery photos
-- RLS Policy: Users can upload gallery photos to their own folder
CREATE POLICY "Users can upload gallery photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Users can view their own gallery photos
CREATE POLICY "Users can view their own gallery photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'gallery-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Users can delete their own gallery photos
CREATE POLICY "Users can delete their own gallery photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gallery-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
