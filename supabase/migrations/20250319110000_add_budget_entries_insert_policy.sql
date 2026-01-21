-- Add INSERT, UPDATE, DELETE policies for budget_entries
-- This allows members and owners to fully manage budget entries

DROP POLICY IF EXISTS "Insert budget_entries for member or owner plans" ON public.budget_entries;
CREATE POLICY "Insert budget_entries for member or owner plans"
  ON public.budget_entries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = budget_entries.plan_id
        AND (
          p.user_id = (select auth.uid())
          OR public.is_plan_member(budget_entries.plan_id)
        )
    )
  );

DROP POLICY IF EXISTS "Update budget_entries for member or owner plans" ON public.budget_entries;
CREATE POLICY "Update budget_entries for member or owner plans"
  ON public.budget_entries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = budget_entries.plan_id
        AND (
          p.user_id = (select auth.uid())
          OR public.is_plan_member(budget_entries.plan_id)
        )
    )
  );

DROP POLICY IF EXISTS "Delete budget_entries for member or owner plans" ON public.budget_entries;
CREATE POLICY "Delete budget_entries for member or owner plans"
  ON public.budget_entries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = budget_entries.plan_id
        AND (
          p.user_id = (select auth.uid())
          OR public.is_plan_member(budget_entries.plan_id)
        )
    )
  );