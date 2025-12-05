-- Update create_full_plan RPC to store destination country codes.
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
DROP FUNCTION IF EXISTS public.create_full_plan(
  text,
  text,
  double precision,
  double precision,
  text,
  date,
  date,
  uuid
);

CREATE OR REPLACE FUNCTION public.create_full_plan(
  _title text,
  _dest_name text,
  _dest_lat double precision DEFAULT NULL,
  _dest_long double precision DEFAULT NULL,
  _dest_country text DEFAULT NULL,
  _start_date date DEFAULT NULL,
  _end_date date DEFAULT NULL,
  _user_id uuid DEFAULT NULL
)
RETURNS TABLE(result_plan_id uuid, result_public_slug text, result_edit_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  destination_pk uuid;
  normalized_title text;
  normalized_dest text;
  normalized_country text;
BEGIN
  normalized_title := NULLIF(BTRIM(_title), '');
  normalized_dest := NULLIF(BTRIM(_dest_name), '');
  normalized_country := NULLIF(upper(BTRIM(_dest_country)), '');

  INSERT INTO public.plans (title, start_date, end_date, user_id)
  VALUES (normalized_title, _start_date, _end_date, _user_id)
  RETURNING id, public_slug, edit_token
  INTO result_plan_id, result_public_slug, result_edit_token;

  IF normalized_dest IS NOT NULL THEN
    INSERT INTO public.destinations (name, latitude, longitude, country)
    VALUES (normalized_dest, _dest_lat, _dest_long, normalized_country)
    ON CONFLICT (name) DO UPDATE
      SET latitude = COALESCE(EXCLUDED.latitude, public.destinations.latitude),
          longitude = COALESCE(EXCLUDED.longitude, public.destinations.longitude),
          country = COALESCE(EXCLUDED.country, public.destinations.country)
    RETURNING id INTO destination_pk;

    INSERT INTO public.plan_destinations (plan_id, destination_id, position)
    VALUES (result_plan_id, destination_pk, 0)
    ON CONFLICT (plan_id, destination_id) DO NOTHING;
  END IF;

  INSERT INTO public.plan_snapshots (plan_id)
  VALUES (result_plan_id)
  ON CONFLICT (plan_id) DO NOTHING;

  RETURN QUERY SELECT result_plan_id, result_public_slug, result_edit_token;
END;
$$;

COMMIT;
