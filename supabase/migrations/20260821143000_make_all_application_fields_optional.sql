-- Migration to make all application fields optional and update RLS check for consent

ALTER TABLE public.applications ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN whatsapp DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN program_interest DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN study_level DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN applicant_type DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN current_status DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN school_university DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN parent_name DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN parent_whatsapp DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN intake_plan DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN destination_country DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN intended_major DROP NOT NULL;

-- Allow insert regardless of consent value (can be true or false)
DROP POLICY IF EXISTS "Anyone can submit an application" ON public.applications;
CREATE POLICY "Anyone can submit an application" ON public.applications FOR INSERT TO anon, authenticated WITH CHECK (true);
