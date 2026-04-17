CREATE TABLE public.flow_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  apartment_number TEXT,
  tenant_name TEXT,
  floor TEXT,
  system_number TEXT,
  rooms JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_flow_measurements_inspection_id ON public.flow_measurements(inspection_id);

ALTER TABLE public.flow_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own flow measurements"
ON public.flow_measurements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flow measurements"
ON public.flow_measurements FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flow measurements"
ON public.flow_measurements FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flow measurements"
ON public.flow_measurements FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_flow_measurements_updated_at
BEFORE UPDATE ON public.flow_measurements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();