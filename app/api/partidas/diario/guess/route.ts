import { NextResponse } from 'next/server';

import { getOrCreateDailyPokemon, getTodayKey } from '@/libs/daily';
import { createServiceClient } from '@/libs/supabase/service';

type CellStatus = 'correct' | 'partial' | 'wrong';
type NumericStatus = 'correct' | 'higher' | 'lower';

type GuessPokemon = {
  id: number;
  nombre: string;
  tipos: string[];
  peso: number;
  altura: number;
  color: string;
  generacion: string;
  habitat: string | null;
  imagen: string;
};

type GuessComparison = {
  tipo1: CellStatus;
  tipo2: CellStatus;
  habitat: CellStatus;
  color: CellStatus;
  altura: NumericStatus;
  peso: NumericStatus;
  generacion: NumericStatus;
};

const normalizeTypes = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim().toLowerCase()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const cleaned = value
      .replace(/[\[\]{}]/g, '')
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
    return cleaned;
  }

  return [];
};

const GENERATION_ORDER: Record<string, number> = {
  'generation-i': 1,
  'generation-ii': 2,
  'generation-iii': 3,
  'generation-iv': 4,
  'generation-v': 5,
  'generation-vi': 6,
  'generation-vii': 7,
  'generation-viii': 8,
  'generation-ix': 9,
};

const compareNumeric = (guess: number, target: number): NumericStatus => {
  if (guess === target) return 'correct';
  return guess < target ? 'higher' : 'lower';
};

const compareTypes = (guessTypes: string[], targetTypes: string[]): { tipo1: CellStatus; tipo2: CellStatus } => {
  const guessType1 = guessTypes[0] ?? null;
  const guessType2 = guessTypes[1] ?? null;
  const targetType1 = targetTypes[0] ?? null;
  const targetType2 = targetTypes[1] ?? null;

  const tipo1: CellStatus =
    guessType1 === targetType1
      ? 'correct'
      : guessType1 && targetTypes.includes(guessType1)
        ? 'partial'
        : 'wrong';

  let tipo2: CellStatus;
  if (!guessType2 && !targetType2) {
    tipo2 = 'correct';
  } else if (guessType2 === targetType2) {
    tipo2 = 'correct';
  } else if (guessType2 && targetTypes.includes(guessType2)) {
    tipo2 = 'partial';
  } else {
    tipo2 = 'wrong';
  }

  return { tipo1, tipo2 };
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === 'string' ? body.name.toLowerCase().trim() : '';

    if (!name) {
      return NextResponse.json({ ok: false, error: 'Nombre de Pokémon inválido' }, { status: 400 });
    }

    const day = getTodayKey();
    const daily = await getOrCreateDailyPokemon(day);

    const supabase = createServiceClient();

    const { data: guessed, error: guessedError } = await supabase
      .from('pokemon')
      .select('id, nombre, tipos, peso, altura, color, generacion, habitat')
      .eq('nombre', name)
      .maybeSingle<{
        id: number;
        nombre: string;
        tipos: unknown;
        peso: number;
        altura: number;
        color: string;
        generacion: string;
        habitat: string | null;
      }>();

    if (guessedError) {
      throw new Error(`Error buscando Pokémon intentado: ${guessedError.message}`);
    }

    if (!guessed) {
      return NextResponse.json({ ok: false, error: 'Pokémon no encontrado' }, { status: 404 });
    }

    const { data: target, error: targetError } = await supabase
      .from('pokemon')
      .select('id, tipos, peso, altura, color, generacion, habitat')
      .eq('id', daily.pokemon_id)
      .maybeSingle<{
        id: number;
        tipos: unknown;
        peso: number;
        altura: number;
        color: string;
        generacion: string;
        habitat: string | null;
      }>();

    if (targetError || !target) {
      throw new Error(`Error obteniendo Pokémon objetivo: ${targetError?.message ?? 'sin datos'}`);
    }

    const guessedTypes = normalizeTypes(guessed.tipos);
    const targetTypes = normalizeTypes(target.tipos);

    const typeComparison = compareTypes(guessedTypes, targetTypes);

    const comparison: GuessComparison = {
      tipo1: typeComparison.tipo1,
      tipo2: typeComparison.tipo2,
      habitat:
        (guessed.habitat ?? null) === (target.habitat ?? null)
          ? 'correct'
          : 'wrong',
      color: guessed.color === target.color ? 'correct' : 'wrong',
      altura: compareNumeric(guessed.altura, target.altura),
      peso: compareNumeric(guessed.peso, target.peso),
      generacion: compareNumeric(
        GENERATION_ORDER[guessed.generacion] ?? 0,
        GENERATION_ORDER[target.generacion] ?? 0
      ),
    };

    const pokemon: GuessPokemon = {
      id: guessed.id,
      nombre: guessed.nombre,
      tipos: guessedTypes,
      peso: guessed.peso,
      altura: guessed.altura,
      color: guessed.color,
      generacion: guessed.generacion,
      habitat: guessed.habitat,
      imagen: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${guessed.id}.png`,
    };

    return NextResponse.json({
      ok: true,
      entry: {
        pokemon,
        comparison,
      },
      isCorrect: guessed.id === target.id,
    });
  } catch (error) {
    console.error('Error validando intento diario:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'No se pudo validar el intento',
      },
      { status: 500 }
    );
  }
}
