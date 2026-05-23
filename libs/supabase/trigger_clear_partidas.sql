-- Trigger: clean all game sessions when a new daily Pokémon is inserted
--
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- The trigger fires AFTER each INSERT on daily_pokemon.
--
-- IMPORTANT: the DELETE is wrapped in an exception handler so that any failure
-- inside the trigger NEVER rolls back the INSERT on daily_pokemon.

-- 1. Trigger function
CREATE OR REPLACE FUNCTION clear_partidas_on_new_daily()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- runs as the function owner (postgres), bypassing RLS
AS $$
BEGIN
  BEGIN
    DELETE FROM public.partidas_diarias;
  EXCEPTION WHEN OTHERS THEN
    -- Log but never abort the transaction that caused the trigger
    RAISE WARNING 'clear_partidas_on_new_daily: could not clear partidas_diarias: %', SQLERRM;
  END;
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
