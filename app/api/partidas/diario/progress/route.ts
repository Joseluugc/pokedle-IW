import { NextResponse } from 'next/server';

import { getTodayKey } from '@/libs/daily';
import { createClient } from '@/libs/supabase/server';
import { createServiceClient } from '@/libs/supabase/service';

type DailyProgressRow = {
  guesses: unknown;
  is_game_won: boolean;
  win_pokemon_name: string | null;
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authClient = await createClient();
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No autenticado',
        },
        { status: 401 }
      );
    }

    if (userError) {
      throw new Error(`Error obteniendo usuario autenticado: ${userError.message}`);
    }

    const day = getTodayKey();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('partidas_diarias')
      .select('guesses, is_game_won, win_pokemon_name')
      .eq('user_id', user.id)
      .eq('day', day)
      .maybeSingle<DailyProgressRow>();

    if (error) {
      throw new Error(`Error cargando progreso diario: ${error.message}`);
    }

    return NextResponse.json({
      ok: true,
      guesses: Array.isArray(data?.guesses) ? data.guesses : [],
      isGameWon: data?.is_game_won ?? false,
      winPokemonName: data?.win_pokemon_name ?? null,
    });
  } catch (error) {
    console.error('Error obteniendo progreso diario:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'No se pudo obtener el progreso diario',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No autenticado',
        },
        { status: 401 }
      );
    }

    if (userError) {
      throw new Error(`Error obteniendo usuario autenticado: ${userError.message}`);
    }

    const body = await request.json().catch((): null => null);

    const guesses = Array.isArray(body?.guesses) ? body.guesses : [];
    const isGameWon = typeof body?.isGameWon === 'boolean' ? body.isGameWon : false;
    const winPokemonName =
      typeof body?.winPokemonName === 'string' && body.winPokemonName.trim().length > 0
        ? body.winPokemonName.trim()
        : null;

    const day = getTodayKey();
    const supabase = createServiceClient();

    const now = new Date().toISOString();

    const { data: updated, error: updateError } = await supabase
      .from('partidas_diarias')
      .update({ guesses, is_game_won: isGameWon, win_pokemon_name: winPokemonName, updated_at: now, day })
      .eq('user_id', user.id)
      .select('user_id');

    if (updateError) {
      throw new Error(`Error actualizando progreso diario: ${updateError.message}`);
    }

    if (!updated || updated.length === 0) {
      const { error: insertError } = await supabase
        .from('partidas_diarias')
        .insert({ user_id: user.id, day, guesses, is_game_won: isGameWon, win_pokemon_name: winPokemonName, updated_at: now });

      if (insertError) {
        throw new Error(`Error insertando progreso diario: ${insertError.message}`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error guardando progreso diario:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'No se pudo guardar el progreso diario',
      },
      { status: 500 }
    );
  }
}
