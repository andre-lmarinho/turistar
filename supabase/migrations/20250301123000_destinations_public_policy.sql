-- Allow selecting destinations only when they are tied to public plans or owned by the requester.
BEGIN;

DROP POLICY IF EXISTS "Select destinations for public or owner plans" ON public.destinations;
CREATE POLICY "Select destinations for public or owner plans"
  ON public.destinations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_destinations pd
      JOIN public.plans p ON p.id = pd.plan_id
      WHERE pd.destination_id = public.destinations.id
        AND (p.is_public = true OR p.user_id = auth.uid())
    )
  );

COMMIT;
