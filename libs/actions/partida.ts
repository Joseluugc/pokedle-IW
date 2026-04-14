import { GameMode, GameState, PokemonData } from '@/types';
import { createClient } from '@supabase/supabase-js';

// ============================================
// CLIENTE DE SUPABASE
// ============================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

/**
 * Crea una nueva partida obteniendo los datos del Pokémon por su número
 * @param pokemonNumber - Número de la Pokédex del Pokémon (1-1025)
 * @returns Promise<GameState> - Estado inicial de la partida
 */
export const createGame = async (
  pokemonNumber: number
): Promise<GameState> => {
  // 1. Validar número de Pokémon
  if (pokemonNumber < 1 || pokemonNumber > 1025) {
    throw new Error(`Número de Pokémon inválido: ${pokemonNumber}`);
  }

  // 2. Obtener datos del Pokémon desde Supabase
  const { data: pokemon, error } = await supabase
    .from('pokemon')
    .select('*')
    .eq('id', pokemonNumber)
    .single<PokemonData>();

  if (error || !pokemon) {
    console.error('Error obteniendo Pokémon:', error);
    throw new Error(`Pokémon con número ${pokemonNumber} no encontrado`);
  }

  // 3. Generar ID único para la partida (sin modo, solo timestamp)
  const gameId = generateGameId();
  
  // 4. Construir objeto de la partida
  const gameState: GameState = {
    id: gameId,
    createdAt: new Date().toISOString(),
    targetPokemon: {
      id: pokemon.id,
      nombre: pokemon.nombre,
      tipos: pokemon.tipos,
      peso: pokemon.peso,
      altura: pokemon.altura,
      habilidades: pokemon.habilidades,
      estadisticas: pokemon.estadisticas,
      color: pokemon.color,
      generacion: pokemon.generacion,
      habitat: pokemon.habitat,
      imagen: pokemon.imagen_url
    },
    status: 'active',
    stats: {
      startTime: Date.now(),
      endTime: null,
      totalTime: null
    }
  };

  return gameState;
};

// ============================================
// FUNCIÓN PARA OBTENER POKÉMON ALEATORIO
// ============================================

/**
 * Obtiene un Pokémon aleatorio de la base de datos y crea una partida
 * @returns Promise<GameState> - Partida creada con Pokémon aleatorio
 */
export const generarPokemonAleatorio = async (): Promise<GameState> => {
  try {
    // 1. Obtener el total de Pokémon en la base de datos
    const { count, error: countError } = await supabase
      .from('pokemon')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Error obteniendo total de Pokémon: ${countError.message}`);
    }

    if (!count || count === 0) {
      throw new Error('No hay Pokémon en la base de datos');
    }

    // 2. Generar un ID aleatorio entre 1 y el total
    const randomId = Math.floor(Math.random() * count) + 1;

    // 3. Llamar a createGame con el ID aleatorio
    const gameState = await createGame(randomId);

    return gameState;

  } catch (error) {
    console.error('Error en generarPokemonAleatorio:', error);
    throw error;
  }
};

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Genera un ID único para la partida
 */
const generateGameId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}`;
};