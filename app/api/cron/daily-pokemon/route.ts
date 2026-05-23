import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateDailyPokemon, getTodayKey } from '@/libs/daily';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const day = getTodayKey();
    const daily = await getOrCreateDailyPokemon(day);

    return NextResponse.json({
      ok: true,
      day: daily.day,
      pokemon_id: daily.pokemon_id,
    });
  } catch (error) {
    console.error('Error en cron daily-pokemon:', error);
    return NextResponse.json(
      { ok: false, error: 'No se pudo crear el Pokémon diario' },
      { status: 500 }
    );
  }
}
