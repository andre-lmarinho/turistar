-- Allow reading plan_events for owners and public plans; keep inserts restricted to owners.
BEGIN;

DROP POLICY IF EXISTS "Select plan_events for own or public plans" ON public.plan_events;
CREATE POLICY "Select plan_events for own or public plans"
  ON public.plan_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = plan_events.plan_id
        AND (p.is_public = true OR p.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Insert plan_events for own plans" ON public.plan_events;
CREATE POLICY "Insert plan_events for own plans"
  ON public.plan_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = plan_events.plan_id
        AND p.user_id = auth.uid()
    )
  );

COMMIT;
