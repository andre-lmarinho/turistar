DROP FUNCTION IF EXISTS public.append_plan_events(uuid, integer, jsonb);
DROP FUNCTION IF EXISTS public.append_plan_events(uuid, bigint, jsonb);

CREATE OR REPLACE FUNCTION append_plan_events(
  plan_id UUID,
  base_version BIGINT,
  events JSONB,
  snapshot_state JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_version BIGINT;
  new_version BIGINT;
  event_record JSONB;
  inserted_events JSONB := '[]'::JSONB;
  new_event_id UUID;
  event_payload JSONB;
BEGIN
  -- Get current version from plan_snapshots (with row lock)
  SELECT version INTO current_version
  FROM plan_snapshots
  WHERE plan_snapshots.plan_id = append_plan_events.plan_id
  FOR UPDATE;

  -- If no snapshot exists, assume version 0
  IF current_version IS NULL THEN
    current_version := 0;
  END IF;

  -- Optimistic locking: if base_version doesn't match, return current version (conflict)
  IF base_version <> current_version THEN
    RETURN json_build_object(
      'version', current_version,
      'inserted_events', '[]'::JSON
    );
  END IF;

  new_version := current_version;

  -- Insert each event from the JSONB array
  FOR event_record IN SELECT * FROM jsonb_array_elements(events)
  LOOP
    new_version := new_version + 1;
    new_event_id := COALESCE((event_record->>'id')::UUID, gen_random_uuid());
    event_payload := COALESCE(event_record->'payload', '{}'::JSONB);

    INSERT INTO plan_events (event_id, plan_id, version, event_type, payload, actor_id, created_at)
    VALUES (
      new_event_id,
      append_plan_events.plan_id,
      new_version,
      event_record->>'type',
      event_payload,
      event_record->>'actorId',
      NOW()
    );

    -- Accumulate inserted events
    inserted_events := inserted_events || jsonb_build_object(
      'event_id', new_event_id,
      'plan_id', append_plan_events.plan_id,
      'version', new_version,
      'event_type', event_record->>'type',
      'payload', event_payload,
      'actor_id', event_record->>'actorId',
      'created_at', NOW()
    );
  END LOOP;

  -- Update snapshot version
  UPDATE plan_snapshots
  SET version = new_version,
      state = COALESCE(snapshot_state, plan_snapshots.state),
      updated_at = NOW()
  WHERE plan_snapshots.plan_id = append_plan_events.plan_id;

  -- If no snapshot existed, create one
  IF NOT FOUND THEN
    INSERT INTO plan_snapshots (plan_id, version, state, updated_at)
    VALUES (
      append_plan_events.plan_id,
      new_version,
      COALESCE(snapshot_state, '{"days":[]}'::JSONB),
      NOW()
    );
  END IF;

  RETURN json_build_object(
    'version', new_version,
    'inserted_events', inserted_events
  );
END;
$$;
