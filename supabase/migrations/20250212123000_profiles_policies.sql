-- RLS policies for public.profiles so authenticated users can insert/update/select their own row.
-- Run after enabling RLS on the table.
BEGIN;

CREATE POLICY "Users manage their own profile"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

COMMIT;
