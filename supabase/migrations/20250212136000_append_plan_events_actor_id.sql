-- Fix append_plan_events overloads and cast actor_id to uuid.
BEGIN;

DROP FUNCTION IF EXISTS public.append_plan_events(uuid, integer, jsonb);
DROP FUNCTION IF EXISTS public.append_plan_events(uuid, bigint, jsonb);

CREATE OR REPLACE FUNCTION public.append_plan_events(
  plan_id uuid,
  base_version bigint,
  events jsonb,
  snapshot_state jsonb DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_version bigint;
  new_version bigint;
  event_record jsonb;
  inserted_events jsonb := '[]'::jsonb;
  new_event_id uuid;
  event_payload jsonb;
BEGIN
  -- Get current version from plan_snapshots (with row lock)
  SELECT version INTO current_version
  FROM public.plan_snapshots
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
      'inserted_events', '[]'::json
    );
  END IF;

  new_version := current_version;

  -- Insert each event from the JSONB array
  FOR event_record IN SELECT * FROM jsonb_array_elements(events)
  LOOP
    new_version := new_version + 1;
    new_event_id := COALESCE((event_record->>'id')::uuid, gen_random_uuid());
    event_payload := COALESCE(event_record->'payload', '{}'::jsonb);

    INSERT INTO public.plan_events (event_id, plan_id, version, event_type, payload, actor_id, created_at)
    VALUES (
      new_event_id,
      append_plan_events.plan_id,
      new_version,
      event_record->>'type',
      event_payload,
      NULLIF(BTRIM(event_record->>'actorId'), '')::uuid,
      NOW()
    );

    -- Accumulate inserted events
    inserted_events := inserted_events || jsonb_build_object(
      'event_id', new_event_id,
      'plan_id', append_plan_events.plan_id,
      'version', new_version,
      'event_type', event_record->>'type',
      'payload', event_payload,
      'actor_id', NULLIF(BTRIM(event_record->>'actorId'), '')::uuid,
      'created_at', NOW()
    );
  END LOOP;

  -- Update snapshot version + state
  UPDATE public.plan_snapshots
  SET version = new_version,
      state = COALESCE(snapshot_state, plan_snapshots.state),
      updated_at = NOW()
  WHERE plan_snapshots.plan_id = append_plan_events.plan_id;

  -- If no snapshot existed, create one
  IF NOT FOUND THEN
    INSERT INTO public.plan_snapshots (plan_id, version, state, updated_at)
    VALUES (
      append_plan_events.plan_id,
      new_version,
      COALESCE(snapshot_state, '{"days":[]}'::jsonb),
      NOW()
    );
  END IF;

  RETURN json_build_object(
    'version', new_version,
    'inserted_events', inserted_events
  );
END;
$$;

COMMIT;
