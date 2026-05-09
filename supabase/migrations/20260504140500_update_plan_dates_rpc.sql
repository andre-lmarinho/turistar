CREATE OR REPLACE FUNCTION public.update_plan_dates(
  _plan_id uuid,
  _edit_token uuid,
  _start_date date,
  _end_date date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.plans
  SET start_date = _start_date,
      end_date = _end_date
  WHERE id = _plan_id
    AND edit_token = _edit_token;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count = 0 THEN
    RAISE EXCEPTION 'Unable to update plan dates'
      USING ERRCODE = 'P0001';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_plan_dates(uuid, uuid, date, date) TO anon, authenticated;
