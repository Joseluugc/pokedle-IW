import 'server-only';

import { createServiceClient } from '@/libs/supabase/service';

const DEFAULT_TIMEZONE = 'Europe/Madrid';

type DailyPokemonRow = {
  day: string;
  pokemon_id: number;
};

export const getTodayKey = (timeZone: string = DEFAULT_TIMEZONE): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date());
};

const getRandomPokemonId = async (): Promise<number> => {
  const supabase = createServiceClient();

  const { count, error: countError } = await supabase
    .from('pokemon')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`Error al contar Pokémon: ${countError.message}`);
  }

  if (!count || count < 1) {
    throw new Error('No hay Pokémon disponibles para el modo diario');
  }

  const randomOffset = Math.floor(Math.random() * count);

  const { data, error } = await supabase
    .from('pokemon')
    .select('id')
    .order('id', { ascending: true })
    .range(randomOffset, randomOffset)
    .maybeSingle<{ id: number }>();

  if (error || !data) {
    throw new Error(`Error al seleccionar Pokémon aleatorio: ${error?.message ?? 'sin datos'}`);
  }

  return data.id;
};

export const getOrCreateDailyPokemon = async (
  dayKey: string = getTodayKey()
): Promise<DailyPokemonRow> => {
  const supabase = createServiceClient();

  const { data: existing, error: existingError } = await supabase
    .from('daily_pokemon')
    .select('day, pokemon_id')
    .eq('day', dayKey)
    .maybeSingle<DailyPokemonRow>();

  if (existingError) {
    throw new Error(`Error al leer daily_pokemon: ${existingError.message}`);
  }

  if (existing) {
    return existing;
  }

  const randomPokemonId = await getRandomPokemonId();

  const { data: inserted, error: insertError } = await supabase
    .from('daily_pokemon')
    .insert({ day: dayKey, pokemon_id: randomPokemonId })
    .select('day, pokemon_id')
    .maybeSingle<DailyPokemonRow>();

  if (!insertError && inserted) {
    return inserted;
  }

  const { data: afterRace, error: afterRaceError } = await supabase
    .from('daily_pokemon')
    .select('day, pokemon_id')
    .eq('day', dayKey)
    .maybeSingle<DailyPokemonRow>();

  if (afterRaceError || !afterRace) {
    throw new Error(`Error creando/obteniendo daily_pokemon: ${insertError?.message ?? afterRaceError?.message ?? 'desconocido'}`);
  }

  return afterRace;
};
