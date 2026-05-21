import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('perfiles')
      .select('username, racha_maxima')
      .order('racha_maxima', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Error cargando ranking: ${error.message}`);
    }

    return NextResponse.json({ ok: true, ranking: data ?? [] });
  } catch (error) {
    console.error('Error obteniendo ranking:', error);
    return NextResponse.json(
      { ok: false, error: 'No se pudo obtener el ranking' },
      { status: 500 }
    );
  }
}
