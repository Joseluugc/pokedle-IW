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

    if (userError) {
      throw new Error(`Error obteniendo usuario autenticado: ${userError.message}`);
    }

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No autenticado',
        },
        { status: 401 }
      );
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
