-- Recreate public.create_full_plan with non-conflicting OUT column names.
BEGIN;

DROP FUNCTION IF EXISTS public.create_full_plan(
  text,
  text,
  double precision,
  double precision,
  date,
  date,
  uuid
);

CREATE OR REPLACE FUNCTION public.create_full_plan(
  _title text,
  _dest_name text,
  _dest_lat double precision DEFAULT NULL,
  _dest_long double precision DEFAULT NULL,
  _start_date date DEFAULT NULL,
  _end_date date DEFAULT NULL,
  _user_id uuid DEFAULT NULL
)
RETURNS TABLE(result_plan_id uuid, result_public_slug text, result_edit_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_dest_id uuid;
  v_title text;
  v_dest text;
BEGIN
  v_title := NULLIF(BTRIM(_title), '');
  v_dest := NULLIF(BTRIM(_dest_name), '');

  INSERT INTO public.plans AS plans (title, start_date, end_date, user_id)
  VALUES (v_title, _start_date, _end_date, _user_id)
  RETURNING plans.id, plans.public_slug, plans.edit_token
  INTO result_plan_id, result_public_slug, result_edit_token;

  IF v_dest IS NOT NULL THEN
    INSERT INTO public.destinations (name, latitude, longitude)
    VALUES (v_dest, _dest_lat, _dest_long)
    ON CONFLICT (name) DO UPDATE
      SET latitude = COALESCE(EXCLUDED.latitude, public.destinations.latitude),
          longitude = COALESCE(EXCLUDED.longitude, public.destinations.longitude)
    RETURNING id INTO v_dest_id;

    INSERT INTO public.plan_destinations AS pd (plan_id, destination_id, position)
    VALUES (result_plan_id, v_dest_id, 0)
    ON CONFLICT (plan_id, destination_id) DO NOTHING;
  END IF;

  INSERT INTO public.plan_snapshots AS ps (plan_id)
  VALUES (result_plan_id)
  ON CONFLICT (plan_id) DO NOTHING;

  RETURN QUERY SELECT result_plan_id, result_public_slug, result_edit_token;
END;
$$;

COMMIT;
