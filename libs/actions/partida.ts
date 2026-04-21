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
export const generateRandomPokemon = async (): Promise<GameState> => {
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
// FUNCIÓN BUSCAR POR NOMBRE
// ============================================

/**
 * Busca un Pokémon en la base de datos por su nombre exacto
 * @param name - Nombre del Pokémon a buscar
 * @returns Promise<PokemonData | null>
 */
export const searchPokemonByName = async (
  name: string
): Promise<PokemonData | null> => {
  const normalizedName = name.toLowerCase().trim();

  if (!normalizedName) {
    return null;
  }

  const { data: pokemon, error } = await supabase
    .from('pokemon')
    .select('*')
    .eq('nombre', normalizedName)
    .single<PokemonData>();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error buscando Pokémon:', error);
    return null;
  }

  return pokemon;
};

/// ============================================
// FUNCIÓN BUSCAR POR NOMBRE PARCIAL (empieza por)
// ============================================

/**
 * Busca Pokémon cuyo nombre empiece por el texto proporcionado
 * @param name - Inicio del nombre del Pokémon
 * @returns Promise<{ nombre: string; imagen: string }[]> - Lista de Pokémon con nombre e imagen
 */
export const searchPokemonByNamePartial = async (
  name: string
): Promise<{ nombre: string; imagen: string }[]> => {
  const normalizedName = name.toLowerCase().trim();

  if (!normalizedName) {
    return [];
  }

  const { data: pokemon, error } = await supabase
    .from('pokemon')
    .select('id, nombre')
    .ilike('nombre', `${normalizedName}%`)  // ← Cambiado: solo empieza por
    .limit(10);

  if (error) {
    console.error('Error buscando Pokémon:', error);
    return [];
  }

  const resultados = pokemon.map(p => ({
    nombre: p.nombre,
    imagen: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`
  }));

  return resultados;
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

