export type Theme =
  | "light"
  | "dark"
  | "cupcake"
  | "bumblebee"
  | "emerald"
  | "corporate"
  | "synthwave"
  | "retro"
  | "cyberpunk"
  | "valentine"
  | "halloween"
  | "garden"
  | "forest"
  | "aqua"
  | "lofi"
  | "pastel"
  | "fantasy"
  | "wireframe"
  | "black"
  | "luxury"
  | "dracula"
  | "";

export interface ConfigProps {
  appName: string;
  appDescription: string;
  domainName: string;
  crisp: {
    id?: string;
    onlyShowOnRoutes?: string[];
  };
  stripe: {
    plans: {
      isFeatured?: boolean;
      priceId: string;
      name: string;
      description?: string;
      price: number;
      priceAnchor?: number;
      features: {
        name: string;
      }[];
    }[];
  };
  aws?: {
    bucket?: string;
    bucketUrl?: string;
    cdn?: string;
  };
  resend: {
    fromNoReply: string;
    fromAdmin: string;
    supportEmail?: string;
  };
  colors: {
    theme: Theme;
    main: string;
  };
  auth: {
    loginUrl: string;
    callbackUrl: string;
  };
}


// ============================================
// TIPOS
// ============================================

export type GameMode = 'daily' | 'infinite';

export type GameStatus = 'active' | 'won' | 'lost';

// types.ts
export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  'special-attack': number;
  'special-defense': number;
  speed: number;
}

export interface PokemonData {
  id: number;
  nombre: string;
  tipos: string[];
  peso: number;
  altura: number;
  habilidades: string[];
  estadisticas: PokemonStats;
  color: string;
  generacion: string;
  habitat: string | null;
  imagen_url: string;
}

export interface TargetPokemon {
  id: number;
  nombre: string;
  tipos: string[];
  peso: number;
  altura: number;
  habilidades: string[];
  estadisticas: PokemonStats;
  color: string;
  generacion: string;
  habitat: string | null;
  imagen: string;
}

export interface GameStats {
  startTime: number;
  endTime: number | null;
  totalTime: number | null;
}

export interface GameState {
  id: string;
  createdAt: string;
  targetPokemon: TargetPokemon;
  status: 'active' | 'won' | 'lost';
  stats: GameStats;
}