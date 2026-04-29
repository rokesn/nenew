
-- Fix function search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Tighten visit-insert policy: must reference an actual business row
DROP POLICY "Anyone can insert a visit" ON public.page_visits;
CREATE POLICY "Anyone can insert a visit for an existing business"
  ON public.page_visits FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = page_visits.business_id)
  );

-- Restrict logo bucket SELECT: only allow fetching a specific object, not listing
DROP POLICY "Logos are publicly viewable" ON storage.objects;
CREATE POLICY "Logos are publicly readable by path"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos' AND name IS NOT NULL);
