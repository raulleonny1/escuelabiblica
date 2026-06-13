-- Ejecutar en Supabase → SQL Editor (proyecto rfcfxdebtdgejvacxksd)
-- Bucket público para PDFs de hoja dominical

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hojas-dominicales',
  'hojas-dominicales',
  true,
  15728640,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY['application/pdf']::text[];

DROP POLICY IF EXISTS "Lectura publica hojas dominicales" ON storage.objects;
DROP POLICY IF EXISTS "Subida hojas dominicales" ON storage.objects;
DROP POLICY IF EXISTS "Actualizar hojas dominicales" ON storage.objects;

CREATE POLICY "Lectura publica hojas dominicales"
ON storage.objects FOR SELECT
USING (bucket_id = 'hojas-dominicales');

CREATE POLICY "Subida hojas dominicales"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hojas-dominicales');

CREATE POLICY "Actualizar hojas dominicales"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hojas-dominicales');
