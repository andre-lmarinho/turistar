# Database Schema

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activities (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
day_id uuid NOT NULL,
title text,
category text,
description text,
start_time time without time zone,
duration integer,
latitude double precision,
longitude double precision,
budget numeric,
image_url text,
catalog_id text,
color text,
address text,
CONSTRAINT activities_pkey PRIMARY KEY (id),
CONSTRAINT activities_day_id_fkey FOREIGN KEY (day_id) REFERENCES public.plan_days(id),
CONSTRAINT activities_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalog(id)
);
CREATE TABLE public.budget_entries (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
plan_id uuid NOT NULL,
description text,
category text,
amount numeric,
CONSTRAINT budget_entries_pkey PRIMARY KEY (id),
CONSTRAINT budget_entries_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);
CREATE TABLE public.catalog (
id text NOT NULL,
name text NOT NULL,
category text NOT NULL,
description text,
address text,
image_url text,
rating numeric,
popularity integer NOT NULL DEFAULT 0,
latitude double precision NOT NULL,
longitude double precision NOT NULL,
source text NOT NULL,
metadata jsonb,
inserted_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
destination_id uuid NOT NULL,
coords point DEFAULT point(longitude, latitude),
CONSTRAINT catalog_pkey PRIMARY KEY (id),
CONSTRAINT catalog_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id)
);
CREATE TABLE public.destinations (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
name text NOT NULL UNIQUE,
country text,
latitude double precision,
longitude double precision,
CONSTRAINT destinations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.plan_days (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
plan_id uuid NOT NULL,
date date,
position integer,
destination_id uuid NOT NULL,
CONSTRAINT plan_days_pkey PRIMARY KEY (id),
CONSTRAINT plan_days_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id),
CONSTRAINT plan_days_destination_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id)
);
CREATE TABLE public.plan_destinations (
plan_id uuid NOT NULL,
destination_id uuid NOT NULL,
position integer NOT NULL DEFAULT 0,
CONSTRAINT plan_destinations_pkey PRIMARY KEY (plan_id, destination_id),
CONSTRAINT plan_destinations_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id),
CONSTRAINT plan_destinations_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);
CREATE TABLE public.plans (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
user_id uuid,
title text,
start_date date,
end_date date,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT plans_pkey PRIMARY KEY (id),
CONSTRAINT plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
id uuid NOT NULL,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT profiles_pkey PRIMARY KEY (id),
CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
