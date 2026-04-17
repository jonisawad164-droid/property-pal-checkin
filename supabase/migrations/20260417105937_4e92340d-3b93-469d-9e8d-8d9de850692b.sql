
-- Shared timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles for inspectors (auto-created on signup)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  funkis_number TEXT,
  certification TEXT,
  certificate_number TEXT,
  certificate_org TEXT,
  certificate_valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inspections
CREATE TABLE public.inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference_number TEXT,

  -- Fastighet
  property_designation TEXT NOT NULL,
  building_address TEXT NOT NULL,
  building_postal_code TEXT,
  building_city TEXT,

  -- Byggnadsägare
  owner_name TEXT,
  owner_address TEXT,
  owner_postal_code TEXT,
  owner_city TEXT,

  -- Faktureringsadress
  billing_name TEXT,
  billing_address TEXT,
  billing_postal_code TEXT,
  billing_city TEXT,

  -- Fastighetsansvarig
  property_manager_name TEXT,
  property_manager_phone TEXT,
  property_manager_email TEXT,

  -- Driftansvar
  operations_name TEXT,
  operations_phone TEXT,
  operations_email TEXT,

  -- Kommun
  municipality_name TEXT,
  municipality_address TEXT,
  municipality_postal_code TEXT,
  municipality_city TEXT,

  -- Byggnad
  internal_building_name TEXT,
  internal_number TEXT,
  activity TEXT,
  usable_area TEXT,
  number_of_apartments TEXT,
  number_of_premises TEXT,

  -- Besiktningsman (snapshot)
  inspector_name TEXT,
  inspector_company TEXT,
  inspector_address TEXT,
  inspector_postal_code TEXT,
  inspector_city TEXT,
  inspector_phone TEXT,
  inspector_email TEXT,
  inspector_funkis_number TEXT,
  inspector_certification TEXT,
  inspector_certificate_number TEXT,
  inspector_certificate_org TEXT,
  inspector_certificate_valid_until DATE,
  signature_date DATE,

  -- Utlåtande
  all_systems_included BOOLEAN DEFAULT true,
  system_number TEXT,
  inspection_interval TEXT,
  inspection_date DATE,
  inspection_result TEXT CHECK (inspection_result IN ('G','EG')),
  reinspection_deadline DATE,
  next_inspection_date DATE,
  measurement_protocol_number TEXT,
  ventilation_norm TEXT,

  -- Systeminfo
  flow_setpoint TEXT,
  system_type TEXT,
  inspection_type TEXT,
  ovk_number TEXT,
  build_year TEXT,
  rebuild_year TEXT,
  serves TEXT,
  location TEXT,
  cooperates_with TEXT,
  full_speed_runtime TEXT,
  partial_speed_runtime TEXT,
  previous_inspection_date DATE,
  drawing_number TEXT,
  drawing_date DATE,
  flow_protocol_number TEXT,
  flow_protocol_date DATE,
  other_documents TEXT,
  not_checked_part TEXT,
  not_checked_reason TEXT,

  -- Kommentarer & utskick
  general_comments TEXT,
  recipient_email TEXT,
  recipient_name TEXT,
  email_sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','completed','sent')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inspections"
  ON public.inspections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own inspections"
  ON public.inspections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inspections"
  ON public.inspections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inspections"
  ON public.inspections FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_inspections_user_id ON public.inspections(user_id);
CREATE INDEX idx_inspections_created_at ON public.inspections(created_at DESC);

CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
