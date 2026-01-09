-- RPC to fetch user planners (owned + member) with proper snapshot ordering
CREATE OR REPLACE FUNCTION get_user_planners(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  start_date date,
  end_date date,
  created_at timestamptz,
  public_slug text,
  edit_token text,
  destination_name text,
  latest_snapshot_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH user_plan_ids AS (
    -- Plans owned by user
    SELECT p.id as plan_id
    FROM plans p
    WHERE p.user_id = p_user_id
    UNION
    -- Plans where user is a member
    SELECT pm.plan_id
    FROM plan_members pm
    WHERE pm.user_id = p_user_id
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
    pls.updated_at as latest_snapshot_at
  FROM plans p
  JOIN user_plan_ids upi ON upi.plan_id = p.id
  LEFT JOIN plan_latest_snapshots pls ON pls.plan_id = p.id
  LEFT JOIN plan_first_destinations pfd ON pfd.plan_id = p.id
  ORDER BY COALESCE(pls.updated_at, p.created_at) DESC
  LIMIT 50;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_user_planners(uuid) TO authenticated;
