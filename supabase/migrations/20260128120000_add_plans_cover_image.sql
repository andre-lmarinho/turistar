-- Add cover_image column to plans table and update RPCs
BEGIN;

-- Add cover_image column to plans table
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS cover_image text;

-- Update create_full_plan RPC to accept and store cover_image
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
  _user_id uuid DEFAULT NULL,
  _cover_image text DEFAULT NULL
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

  INSERT INTO public.plans (title, start_date, end_date, user_id, cover_image)
  VALUES (normalized_title, _start_date, _end_date, _user_id, _cover_image)
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

-- Update get_user_planners RPC to return cover_image
DROP FUNCTION IF EXISTS get_user_planners();

CREATE OR REPLACE FUNCTION get_user_planners()
RETURNS TABLE (
  id uuid,
  title text,
  start_date date,
  end_date date,
  created_at timestamptz,
  public_slug text,
  edit_token text,
  destination_name text,
  latest_snapshot_at timestamptz,
  cover_image text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_plan_ids AS (
    -- Plans owned by user
    SELECT p.id as plan_id
    FROM plans p
    WHERE p.user_id = auth.uid()
    UNION
    -- Plans where user is a member
    SELECT pm.plan_id
    FROM plan_members pm
    WHERE pm.user_id = auth.uid()
  ),
  plan_latest_snapshots AS (
    SELECT DISTINCT ON (ps.plan_id)
      ps.plan_id,
      ps.updated_at
    FROM plan_snapshots ps
    WHERE ps.plan_id IN (SELECT plan_id FROM user_plan_ids)
    ORDER BY ps.plan_id, ps.updated_at DESC
  ),
  plan_first_destinations AS (
    SELECT DISTINCT ON (pd.plan_id)
      pd.plan_id,
      d.name as destination_name
    FROM plan_destinations pd
    JOIN destinations d ON d.id = pd.destination_id
    WHERE pd.plan_id IN (SELECT plan_id FROM user_plan_ids)
    ORDER BY pd.plan_id, pd.position ASC
  )
  SELECT
    p.id,
    p.title,
    p.start_date,
    p.end_date,
    p.created_at,
    p.public_slug,
    p.edit_token,
    pfd.destination_name,
    pls.updated_at as latest_snapshot_at,
    p.cover_image
  FROM plans p
  JOIN user_plan_ids upi ON upi.plan_id = p.id
  LEFT JOIN plan_latest_snapshots pls ON pls.plan_id = p.id
  LEFT JOIN plan_first_destinations pfd ON pfd.plan_id = p.id
  ORDER BY COALESCE(pls.updated_at, p.created_at) DESC
  LIMIT 50;
$$;

-- Re-grant permissions to authenticated role (lost when function was dropped)
GRANT EXECUTE ON FUNCTION public.get_user_planners() TO authenticated;

COMMIT;
