import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { createServiceClient } from '@/libs/supabase/service';

export async function POST() {
  try {
    const supabase = createServiceClient();

    const { count, error: countError } = await supabase
      .from('pokemon')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Error contando Pokémon: ${countError.message}`);
    }

    if (!count || count < 1) {
      throw new Error('No hay Pokémon disponibles');
    }

    const randomOffset = Math.floor(Math.random() * count);

    const { data: pokemon, error: pokemonError } = await supabase
      .from('pokemon')
      .select('id')
      .order('id', { ascending: true })
      .range(randomOffset, randomOffset)
      .maybeSingle<{ id: number }>();

    if (pokemonError || !pokemon) {
      throw new Error(`Error seleccionando Pokémon: ${pokemonError?.message ?? 'sin datos'}`);
    }

    const cookieStore = await cookies();

    cookieStore.set('infinito_target', String(pokemon.id), {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24h
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error inicializando partida infinita:', error);

    return NextResponse.json(
      { ok: false, error: 'No se pudo inicializar la partida' },
      { status: 500 }
    );
  }
}
