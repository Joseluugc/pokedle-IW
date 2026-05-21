-- Trigger: clean all game sessions when a new daily Pokémon is inserted
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- The trigger fires AFTER each INSERT on daily_pokemon, which happens once per day
-- when getOrCreateDailyPokemon() creates tomorrow's entry. All rows in
-- partidas_diarias are deleted so every player starts fresh.

-- 1. Trigger function
CREATE OR REPLACE FUNCTION clear_partidas_on_new_daily()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- runs as the function owner (postgres), bypassing RLS
AS $$
BEGIN
  DELETE FROM public.partidas_diarias;
  RETURN NEW;
END;
$$;

-- 2. Trigger on daily_pokemon
--    Drop first so re-running this script is idempotent.
DROP TRIGGER IF EXISTS trg_clear_partidas_on_new_daily ON public.daily_pokemon;

CREATE TRIGGER trg_clear_partidas_on_new_daily
  AFTER INSERT ON public.daily_pokemon
  FOR EACH STATEMENT
  EXECUTE FUNCTION clear_partidas_on_new_daily();
