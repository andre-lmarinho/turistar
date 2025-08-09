CREATE OR REPLACE FUNCTION create_full_plan(
  _title text,
  _dest_name text,
  _dest_lat double precision,
  _dest_long double precision,
  _start_date date,
  _end_date date
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_plan_id uuid;
  v_dest_id uuid;
BEGIN
  INSERT INTO plans(title, user_id, start_date, end_date)
    VALUES (_title, auth.uid(), _start_date, _end_date)
    RETURNING id INTO v_plan_id;

  INSERT INTO destinations(name, latitude, longitude)
    VALUES (_dest_name, _dest_lat, _dest_long)
    ON CONFLICT (name) DO UPDATE
      SET latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude
    RETURNING id INTO v_dest_id;

  INSERT INTO plan_destinations(plan_id, destination_id, position)
    VALUES (v_plan_id, v_dest_id, 0);

  INSERT INTO plan_days(plan_id, date, position, destination_id)
  SELECT v_plan_id,
         gs::date,
         row_number() OVER () - 1,
         v_dest_id
  FROM generate_series(_start_date, _end_date, interval '1 day') AS gs;

  RETURN v_plan_id;
END;
$$;
