'use client'

import Image from 'next/image'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Press_Start_2P } from "next/font/google";
import { searchPokemonByNamePartial } from '@/libs/actions/partida';
import GuessGrid, { type GuessEntry } from '@/components/GuessGrid';

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"] });

const getTodayStorageKey = () => {
  const today = new Intl.DateTimeFormat('sv-SE').format(new Date()); // YYYY-MM-DD
  return `pokedle:diario:${today}`;
};

const DiarioPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<{ nombre: string; imagen: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false);
  const [isDailyLoading, setIsDailyLoading] = useState(true);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [guessError, setGuessError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [winPokemonName, setWinPokemonName] = useState('');
  const [isSessionHydrated, setIsSessionHydrated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const storageKey = useMemo(() => getTodayStorageKey(), []);

  // Inicializar partida diaria compartida
  useEffect(() => {
    let cancelled = false;

    const initDailyGame = async () => {
      try {
        const response = await fetch('/api/partidas/diario/target', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar la partida diaria');
        }

        const payload = await response.json();
        if (!payload?.ok) {
          throw new Error(payload?.error ?? 'Respuesta inválida del servidor');
        }

        if (!cancelled) {
          setDailyError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setDailyError(error instanceof Error ? error.message : 'Error desconocido');
        }
      } finally {
        if (!cancelled) {
          setIsDailyLoading(false);
        }
      }
    };

    initDailyGame();

    return () => {
      cancelled = true;
    };
  }, []);

  // Cargar progreso diario (localStorage -> DB -> inicializar vacío)
  useEffect(() => {
    if (isDailyLoading || dailyError || isSessionHydrated) {
      return;
    }

    let cancelled = false;

    const hydrateProgress = async () => {
      const applyProgress = (progress: {
        guesses: GuessEntry[];
        isGameWon: boolean;
        winPokemonName: string;
      }) => {
        if (cancelled) {
          return;
        }

        setGuesses(progress.guesses);
        setIsGameWon(progress.isGameWon);
        setWinPokemonName(progress.winPokemonName);
      };

      const emptyProgress = {
        guesses: [] as GuessEntry[],
        isGameWon: false,
        winPokemonName: '',
      };

      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as {
            guesses?: GuessEntry[];
            isGameWon?: boolean;
            winPokemonName?: string;
          };

          const localProgress = {
            guesses: Array.isArray(parsed.guesses) ? parsed.guesses : [],
            isGameWon: typeof parsed.isGameWon === 'boolean' ? parsed.isGameWon : false,
            winPokemonName: typeof parsed.winPokemonName === 'string' ? parsed.winPokemonName : '',
          };

          const hasLocalProgress =
            localProgress.guesses.length > 0 ||
            localProgress.isGameWon ||
            localProgress.winPokemonName.length > 0;

          // Si hay progreso real en local, usamos caché y evitamos consulta.
          // Si está vacío, consultamos DB para soportar multi-dispositivo.
          if (hasLocalProgress) {
            applyProgress(localProgress);
            return;
          }
        }

        const response = await fetch('/api/partidas/diario/progress', {
          method: 'GET',
          cache: 'no-store',
        });

        if (response.ok) {
          const payload = await response.json();

          if (payload?.ok) {
            const remoteProgress = {
              guesses: Array.isArray(payload.guesses) ? (payload.guesses as GuessEntry[]) : [],
              isGameWon: typeof payload.isGameWon === 'boolean' ? payload.isGameWon : false,
              winPokemonName: typeof payload.winPokemonName === 'string' ? payload.winPokemonName : '',
            };

            const hasRemoteProgress =
              remoteProgress.guesses.length > 0 ||
              remoteProgress.isGameWon ||
              remoteProgress.winPokemonName.length > 0;

            if (hasRemoteProgress) {
              applyProgress(remoteProgress);
              localStorage.setItem(storageKey, JSON.stringify(remoteProgress));
              return;
            }
          }
        }

        applyProgress(emptyProgress);
        localStorage.setItem(storageKey, JSON.stringify(emptyProgress));

        await fetch('/api/partidas/diario/progress', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emptyProgress),
        }).catch((error) => {
          console.error('No se pudo inicializar progreso diario en DB:', error);
        });
      } catch (error) {
        console.error('No se pudo restaurar la sesión diaria:', error);
      } finally {
        if (!cancelled) {
          setIsSessionHydrated(true);
        }
      }
    };

    void hydrateProgress();

    return () => {
      cancelled = true;
    };
  }, [isDailyLoading, dailyError, isSessionHydrated, storageKey]);

  // Persistir progreso diario en localStorage y DB
  useEffect(() => {
    if (!isSessionHydrated || isDailyLoading || dailyError) {
      return;
    }

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          guesses,
          isGameWon,
          winPokemonName,
        })
      );

      const payload = {
        guesses,
        isGameWon,
        winPokemonName,
      };

      void fetch('/api/partidas/diario/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).catch((error) => {
        console.error('No se pudo sincronizar la sesión diaria en DB:', error);
      });
    } catch (error) {
      console.error('No se pudo guardar la sesión diaria:', error);
    }
  }, [guesses, isGameWon, winPokemonName, isSessionHydrated, isDailyLoading, dailyError, storageKey]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar sugerencias con debounce
  useEffect(() => {
    if (isDailyLoading || dailyError) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (inputValue.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchPokemonByNamePartial(inputValue);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error('Error buscando sugerencias:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, isDailyLoading, dailyError]);

  const handleSelect = (nombre: string) => {
    setInputValue(nombre);
    setShowSuggestions(false);
    setSuggestions([]);
    handleSubmitGuess(nombre);
  };

  const handleSubmitGuess = async (nameOverride?: string) => {
    const name = (nameOverride ?? inputValue).trim();
    if (!name || isDailyLoading || dailyError || isSubmittingGuess) {
      return;
    }

    setIsSubmittingGuess(true);
    setGuessError(null);

    try {
      const response = await fetch('/api/partidas/diario/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.ok || !payload?.entry) {
        throw new Error(payload?.error ?? 'No se pudo validar el intento');
      }

      const entry = payload.entry as GuessEntry;
      setGuesses((prev) => [...prev, entry]);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);

      if (payload.isCorrect) {
        setIsGameWon(true);
        setWinPokemonName(entry.pokemon.nombre);
        // 8 celdas × 240ms stagger + 700ms duración de la última = ~2400ms
        setTimeout(() => setShowWinAnimation(true), 2500);
      }
    } catch (error) {
      setGuessError(error instanceof Error ? error.message : 'Error desconocido al validar intento');
    } finally {
      setIsSubmittingGuess(false);
    }
  };

  return (
    <main>
      <section className="flex flex-col items-center justify-center text-center gap-12 px-8 py-12">
        <Image src="/logo.webp" alt="Pokedle" width={500} height={500} priority />

        <p className={`${pixelFont.className} text-base bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-wide leading-relaxed`}>
          ¡¿Cuál es este pokémon?!
        </p>

        {/* Input con autocompletado */}
        <div ref={containerRef} className="relative w-full max-w-md">
          <div className="flex items-stretch gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmitGuess();
                  }
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder={isDailyLoading ? 'Cargando partida diaria...' : 'Nombre del pokemon'}
                autoComplete="off"
                disabled={isDailyLoading || !!dailyError || isSubmittingGuess || isGameWon}
                className={`${pixelFont.className} w-full px-4 py-3 text-sm text-amber-900 placeholder-amber-600/60 bg-yellow-100/80 border-2 border-amber-400 rounded-md shadow-[0_0_10px_rgba(251,191,36,0.4),inset_0_0_10px_rgba(255,255,200,0.3)] outline-none focus:border-yellow-300 focus:shadow-[0_0_16px_rgba(253,224,71,0.5),inset_0_0_10px_rgba(255,255,200,0.3)] transition-all duration-200`}
              />
              {/* Indicador de carga */}
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleSubmitGuess()}
              disabled={isDailyLoading || !!dailyError || isSubmittingGuess || isGameWon || inputValue.trim().length === 0}
              className="aspect-square flex-shrink-0 flex items-center justify-center bg-yellow-100 border-2 border-amber-400 rounded-md shadow-[0_0_10px_rgba(251,191,36,0.4)] hover:bg-amber-100 hover:shadow-[0_0_16px_rgba(253,224,71,0.5)] active:scale-95 opacity-80 disabled:cursor-not-allowed transition-all duration-200 p-1.5"
            >
              <Image
                src="/pokeball.webp"
                alt="Validar intento"
                width={32}
                height={32}
                className="object-contain"
              />
            </button>
          </div>

          {dailyError && (
            <p className="mt-2 text-xs text-red-200 text-left">
              Error cargando el modo diario. Inténtalo de nuevo en unos segundos.
            </p>
          )}

          {guessError && (
            <p className="mt-2 text-xs text-red-200 text-left">
              {guessError}
            </p>
          )}

          {/* Lista de sugerencias */}
          {showSuggestions && (
            <ul
              className="absolute z-50 w-full mt-1 bg-yellow-50 border-2 border-amber-400 rounded-md shadow-[0_4px_20px_rgba(251,191,36,0.4)] max-h-60 overflow-y-auto overscroll-none"
              style={{ WebkitOverflowScrolling: 'auto' }}
            >
              {suggestions.map((poke) => (
                <li
                  key={poke.nombre}
                  onMouseDown={() => handleSelect(poke.nombre)}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-amber-100 transition-colors duration-150 border-b border-amber-200 last:border-b-0"
                >
                  <Image
                    src={poke.imagen}
                    alt={poke.nombre}
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                  <span className={`${pixelFont.className} text-xs text-amber-900 capitalize`}>
                    {poke.nombre}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tabla de intentos */}
        <GuessGrid guesses={guesses} />

        {/* Mensaje de partida completada */}
        {isGameWon && !showWinAnimation && (
          <p className={`${pixelFont.className} text-xs text-green-300 animate-pulse`}>
            ¡Pokémon correcto! Vuelve mañana para el siguiente.
          </p>
        )}

      </section>

      {/* Overlay de victoria */}
      {showWinAnimation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div
            className="relative flex flex-col items-center gap-6 bg-gradient-to-b from-yellow-100 to-amber-100 border-4 border-amber-400 rounded-2xl px-10 py-10 shadow-[0_0_60px_rgba(251,191,36,0.9)]"
            style={{ animation: 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            {/* Destellos decorativos */}
            <div className="absolute -top-3 -left-3 text-2xl animate-spin" style={{ animationDuration: '3s' }}>✨</div>
            <div className="absolute -top-3 -right-3 text-2xl animate-spin" style={{ animationDuration: '2s' }}>⭐</div>
            <div className="absolute -bottom-3 -left-3 text-2xl animate-bounce">🎉</div>
            <div className="absolute -bottom-3 -right-3 text-2xl animate-bounce" style={{ animationDelay: '0.15s' }}>🎊</div>

            <Image
              src="/pokeball.webp"
              alt="¡Ganaste!"
              width={90}
              height={90}
              className="drop-shadow-[0_0_16px_rgba(251,191,36,0.8)]"
              style={{ animation: 'spinBounce 0.8s ease-out' }}
            />

            <div className="flex flex-col items-center gap-2">
              <p className={`${pixelFont.className} text-amber-900 text-lg leading-relaxed`}>
                ¡CORRECTO!
              </p>
              <p className={`${pixelFont.className} text-amber-700 text-xs capitalize`}>
                Era {winPokemonName}
              </p>
            </div>

            <p className={`${pixelFont.className} text-amber-600 text-[10px] text-center leading-relaxed`}>
              Tu racha ha sido<br />actualizada ✓
            </p>

            <button
              onClick={() => setShowWinAnimation(false)}
              className="mt-1 px-6 py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-900 rounded-lg border-2 border-amber-600 shadow-[0_4px_0_#b45309] hover:shadow-[0_2px_0_#b45309] hover:translate-y-0.5 transition-all duration-150"
            >
              <span className={`${pixelFont.className} text-xs`}>¡Genial!</span>
            </button>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes bounceIn {
              from { opacity: 0; transform: scale(0.5); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes spinBounce {
              0% { transform: rotate(-180deg) scale(0); }
              60% { transform: rotate(10deg) scale(1.1); }
              100% { transform: rotate(0deg) scale(1); }
            }
          `}</style>
        </div>
      )}
    </main>
  );
};

export default DiarioPage