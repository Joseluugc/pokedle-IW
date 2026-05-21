import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { createServiceClient } from '@/libs/supabase/service';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const targetIdRaw = cookieStore.get('infinito_target')?.value;

    if (!targetIdRaw) {
      return NextResponse.json(
        { ok: false, error: 'No hay partida activa.' },
        { status: 400 }
      );
    }

    const targetId = parseInt(targetIdRaw, 10);
    if (isNaN(targetId)) {
      return NextResponse.json(
        { ok: false, error: 'Partida corrupta.' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: pokemon, error } = await supabase
      .from('pokemon')
      .select('id, nombre')
      .eq('id', targetId)
      .maybeSingle<{ id: number; nombre: string }>();

    if (error || !pokemon) {
      throw new Error(`Error obteniendo Pokémon objetivo: ${error?.message ?? 'sin datos'}`);
    }

    return NextResponse.json({
      ok: true,
      pokemon: {
        id: pokemon.id,
        nombre: pokemon.nombre,
        imagen: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
      },
    });
  } catch (error) {
    console.error('Error revelando Pokémon objetivo:', error);

    return NextResponse.json(
      { ok: false, error: 'No se pudo revelar el Pokémon objetivo' },
      { status: 500 }
    );
  }
}
