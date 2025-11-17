-- Adds slug/display name/avatar metadata to public.profiles and backfills slugs.
BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN slug text,
  ADD COLUMN display_name text,
  ADD COLUMN avatar_url text;

WITH prepared AS (
  SELECT
    p.id,
    COALESCE(
      NULLIF(
        trim(both '-' FROM regexp_replace(lower(split_part(u.email, '@', 1)), '[^a-z0-9]+', '-', 'g')),
        ''
      ),
      substr(u.id::text, 1, 24)
    ) AS normalized_base,
    row_number() OVER (
      PARTITION BY COALESCE(
        NULLIF(
          trim(both '-' FROM regexp_replace(lower(split_part(u.email, '@', 1)), '[^a-z0-9]+', '-', 'g')),
          ''
        ),
        substr(u.id::text, 1, 24)
      )
      ORDER BY u.created_at, p.id
    ) - 1 AS duplicate_offset
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
)
UPDATE public.profiles AS p
SET slug = CASE
    WHEN prepared.duplicate_offset = 0 THEN prepared.normalized_base
    ELSE prepared.normalized_base || '-' || prepared.duplicate_offset::text
  END
FROM prepared
WHERE p.id = prepared.id;

ALTER TABLE public.profiles
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_slug_key UNIQUE (slug);

COMMIT;
