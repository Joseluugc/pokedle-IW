import { NextResponse } from 'next/server';

import { getOrCreateDailyPokemon, getTodayKey } from '@/libs/daily';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const day = getTodayKey();
    const daily = await getOrCreateDailyPokemon(day);

    return NextResponse.json({
      ok: true,
      day: daily.day,
    });
  } catch (error) {
    console.error('Error inicializando partida diaria:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'No se pudo inicializar la partida diaria',
      },
      { status: 500 }
    );
  }
}
