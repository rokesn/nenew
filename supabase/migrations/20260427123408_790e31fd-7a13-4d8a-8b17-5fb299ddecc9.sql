
-- businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  website_url TEXT NOT NULL,
  button_text TEXT NOT NULL DEFAULT 'Visit Our Website',
  logo_url TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX businesses_owner_id_idx ON public.businesses(owner_id);
CREATE INDEX businesses_slug_idx ON public.businesses(slug);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Public can view any business page
CREATE POLICY "Businesses are viewable by everyone"
  ON public.businesses FOR SELECT
  USING (true);

-- Only owner can insert their own
CREATE POLICY "Users can create their own business"
  ON public.businesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner can update their business"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owner can delete their business"
  ON public.businesses FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER businesses_set_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- page_visits table
CREATE TABLE public.page_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX page_visits_business_id_idx ON public.page_visits(business_id);

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Anyone can record a visit
CREATE POLICY "Anyone can insert a visit"
  ON public.page_visits FOR INSERT
  WITH CHECK (true);

-- Only the business owner can see visits for their business
CREATE POLICY "Owner can view visits for their business"
  ON public.page_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = page_visits.business_id AND b.owner_id = auth.uid()
    )
  );

-- Storage bucket for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true);

-- Storage policies: public read, authenticated owner write
CREATE POLICY "Logos are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "Users can upload their own logo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own logo"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own logo"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
