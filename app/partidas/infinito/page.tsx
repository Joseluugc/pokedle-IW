'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Press_Start_2P } from 'next/font/google'
import { searchPokemonByNamePartial } from '@/libs/actions/partida'
import GuessGrid, { type GuessEntry } from '@/components/GuessGrid'

const pixelFont = Press_Start_2P({ weight: '400', subsets: ['latin'] })

const STORAGE_KEY = 'pokedle:infinito:session'

type InfinitoSession = {
  guesses: GuessEntry[]
  isGameWon: boolean
  winPokemonName: string
  winPokemonImage: string
}

const emptySession = (): InfinitoSession => ({
  guesses: [],
  isGameWon: false,
  winPokemonName: '',
  winPokemonImage: '',
})

const loadSession = (): InfinitoSession => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptySession()
    const parsed = JSON.parse(raw) as Partial<InfinitoSession>
    return {
      guesses: Array.isArray(parsed.guesses) ? parsed.guesses : [],
      isGameWon: typeof parsed.isGameWon === 'boolean' ? parsed.isGameWon : false,
      winPokemonName: typeof parsed.winPokemonName === 'string' ? parsed.winPokemonName : '',
      winPokemonImage: typeof parsed.winPokemonImage === 'string' ? parsed.winPokemonImage : '',
    }
  } catch {
    return emptySession()
  }
}

const saveSession = (session: InfinitoSession) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // localStorage no disponible
  }
}

const clearSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // noop
  }
}

// ─── Componente ──────────────────────────────────────────────────────────────

const InfinitoPage = () => {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<{ nombre: string; imagen: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGameLoading, setIsGameLoading] = useState(true)
  const [gameError, setGameError] = useState<string | null>(null)
  const [guessError, setGuessError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [guesses, setGuesses] = useState<GuessEntry[]>([])
  const [isGameWon, setIsGameWon] = useState(false)
  const [showWinAnimation, setShowWinAnimation] = useState(false)
  const [winPokemonName, setWinPokemonName] = useState('')
  const [winPokemonImage, setWinPokemonImage] = useState('')
  const [isGivenUp, setIsGivenUp] = useState(false)
  const [giveUpPokemon, setGiveUpPokemon] = useState<{ nombre: string; imagen: string } | null>(null)
  const [isGivingUp, setIsGivingUp] = useState(false)
  const [showGiveUpAnimation, setShowGiveUpAnimation] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // ─── Inicializar partida nueva ────────────────────────────────────────────

  const startNewGame = useCallback(async () => {
    setIsGameLoading(true)
    setGameError(null)
    setGuessError(null)
    setGuesses([])
    setIsGameWon(false)
    setWinPokemonName('')
    setWinPokemonImage('')
    setShowWinAnimation(false)
    setIsGivenUp(false)
    setGiveUpPokemon(null)
    setShowGiveUpAnimation(false)
    setInputValue('')
    setSuggestions([])
    clearSession()

    try {
      const response = await fetch('/api/partidas/infinito/nueva', {
        method: 'POST',
        cache: 'no-store',
      })

      if (!response.ok) throw new Error('No se pudo iniciar la partida')

      const payload = await response.json()
      if (!payload?.ok) throw new Error(payload?.error ?? 'Respuesta inválida')
    } catch (error) {
      setGameError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsGameLoading(false)
    }
  }, [])

  // ─── Carga inicial: sesión local activa o nueva partida ───────────────────

  useEffect(() => {
    const session = loadSession()
    const hasProgress =
      session.guesses.length > 0 || session.isGameWon || session.winPokemonName.length > 0

    if (hasProgress) {
      // Sesión activa en caché → restaurar sin llamar a la API
      setGuesses(session.guesses)
      setIsGameWon(session.isGameWon)
      setWinPokemonName(session.winPokemonName)
      setWinPokemonImage(session.winPokemonImage)
      setIsGameLoading(false)
    } else {
      // Sin sesión → nueva partida (asigna cookie httpOnly con target)
      void startNewGame()
    }
  }, [startNewGame])

  // ─── Cerrar sugerencias al hacer clic fuera ────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ─── Autocompletado con debounce ───────────────────────────────────────────

  useEffect(() => {
    if (isGameLoading || gameError) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    if (inputValue.trim().length < 1) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchPokemonByNamePartial(inputValue)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      } catch {
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, isGameLoading, gameError])

  // ─── Enviar intento ────────────────────────────────────────────────────────

  const handleSubmitGuess = async (nameOverride?: string) => {
    const name = (nameOverride ?? inputValue).trim()
    if (!name || isGameLoading || gameError || isSubmitting || isGameWon) return

    setIsSubmitting(true)
    setGuessError(null)

    try {
      const response = await fetch('/api/partidas/infinito/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      const payload = await response.json()

      if (!response.ok || !payload?.ok || !payload?.entry) {
        throw new Error(payload?.error ?? 'No se pudo validar el intento')
      }

      const entry = payload.entry as GuessEntry
      const newGuesses = [...guesses, entry]
      const won: boolean = payload.isCorrect
      const wonName = won ? entry.pokemon.nombre : winPokemonName

      setGuesses(newGuesses)
      setInputValue('')
      setSuggestions([])
      setShowSuggestions(false)

      const wonImage = won ? entry.pokemon.imagen : winPokemonImage

      if (won) {
        setIsGameWon(true)
        setWinPokemonName(wonName)
        setWinPokemonImage(wonImage)
        setTimeout(() => setShowWinAnimation(true), 2500)
      }

      saveSession({
        guesses: newGuesses,
        isGameWon: won,
        winPokemonName: won ? wonName : '',
        winPokemonImage: won ? wonImage : '',
      })
    } catch (error) {
      setGuessError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGiveUp = async () => {
    if (isGivingUp || isGivenUp || isGameWon) return
    setIsGivingUp(true)
    try {
      const response = await fetch('/api/partidas/infinito/reveal', { method: 'GET', cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload?.ok) throw new Error(payload?.error ?? 'No se pudo obtener el resultado')
      setGiveUpPokemon({ nombre: payload.pokemon.nombre, imagen: payload.pokemon.imagen })
      setIsGivenUp(true)
      clearSession()
      setTimeout(() => setShowGiveUpAnimation(true), 300)
    } catch (error) {
      setGuessError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsGivingUp(false)
    }
  }

  const handleSelect = (nombre: string) => {
    setInputValue(nombre)
    setShowSuggestions(false)
    setSuggestions([])
    handleSubmitGuess(nombre)
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main>
      <section className="flex flex-col items-center justify-center text-center gap-12 px-8 py-12">
        <Link href="/" className="transition-opacity hover:opacity-80 active:opacity-60">
          <Image src="/logo.webp" alt="Pokedle – Volver al inicio" width={500} height={500} priority />
        </Link>

        <p
          className={`${pixelFont.className} text-base bg-gradient-to-r from-pink-200 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-wide leading-relaxed`}
        >
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
                    e.preventDefault()
                    handleSubmitGuess()
                  }
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder={isGameLoading ? 'Cargando partida...' : 'Nombre del pokemon'}
                autoComplete="off"
                disabled={isGameLoading || !!gameError || isSubmitting || isGameWon}
                className={`${pixelFont.className} w-full px-4 py-3 text-sm text-fuchsia-900 placeholder-fuchsia-600/60 bg-pink-100/80 border-2 border-pink-400 rounded-md shadow-[0_0_10px_rgba(236,72,153,0.4),inset_0_0_10px_rgba(255,220,240,0.3)] outline-none focus:border-fuchsia-400 focus:shadow-[0_0_16px_rgba(232,121,249,0.5),inset_0_0_10px_rgba(255,220,240,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleSubmitGuess()}
              disabled={isGameLoading || !!gameError || isSubmitting || isGameWon || inputValue.trim().length === 0}
              className="aspect-square flex-shrink-0 flex items-center justify-center bg-pink-100 border-2 border-pink-400 rounded-md shadow-[0_0_10px_rgba(236,72,153,0.4)] hover:bg-pink-200 hover:shadow-[0_0_16px_rgba(232,121,249,0.5)] active:scale-95 disabled:cursor-not-allowed transition-all duration-200 p-1.5"
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

          {gameError && (
            <p className="mt-2 text-xs text-red-300 text-left">
              Error cargando el modo infinito. Inténtalo de nuevo en unos segundos.
            </p>
          )}

          {guessError && (
            <p className="mt-2 text-xs text-red-300 text-left">{guessError}</p>
          )}

          {/* Sugerencias */}
          {showSuggestions && (
            <ul
              className="absolute z-50 w-full mt-1 bg-pink-50 border-2 border-pink-400 rounded-md shadow-[0_4px_20px_rgba(236,72,153,0.4)] max-h-60 overflow-y-auto overscroll-none"
              style={{ WebkitOverflowScrolling: 'auto' }}
            >
              {suggestions.map((poke) => (
                <li
                  key={poke.nombre}
                  onMouseDown={() => handleSelect(poke.nombre)}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-pink-100 transition-colors duration-150 border-b border-pink-200 last:border-b-0"
                >
                  <Image
                    src={poke.imagen}
                    alt={poke.nombre}
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                  <span className={`${pixelFont.className} text-xs text-fuchsia-900 capitalize`}>
                    {poke.nombre}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tabla de intentos — min-h garantiza separación con el botón de abajo */}
        <div className="w-full flex flex-col items-center min-h-[180px]">
          <GuessGrid guesses={guesses} />
        </div>

        {isGameWon && !showWinAnimation && (
          <p className={`${pixelFont.className} text-xs text-pink-300 animate-pulse`}>
            ¡Pokémon correcto! Pulsa &quot;¡Otra!&quot; para seguir jugando.
          </p>
        )}

        {/* Botón rendirse / revelar resultado / reiniciar */}
        {!isGameWon && !isGivenUp && guesses.length > 0 && (
          <button
            onClick={() => void handleGiveUp()}
            disabled={isGameLoading || !!gameError || isGivingUp}
            className={`${pixelFont.className} text-[10px] px-5 py-2.5 rounded-lg border-2 border-pink-700/50 bg-pink-950/40 text-pink-400/70 hover:text-pink-300 hover:border-pink-500/70 hover:bg-pink-900/40 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200`}
          >
            {isGivingUp ? 'Revelando...' : 'Me rindo...'}
          </button>
        )}

      </section>

      {/* Overlay de victoria */}
      {showWinAnimation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div
            className="relative flex flex-col items-center gap-6 bg-gradient-to-b from-pink-100 to-fuchsia-100 border-4 border-pink-400 rounded-2xl px-10 py-10 shadow-[0_0_60px_rgba(236,72,153,0.9)]"
            style={{ animation: 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            <div className="absolute -top-3 -left-3 text-2xl animate-spin" style={{ animationDuration: '3s' }}>✨</div>
            <div className="absolute -top-3 -right-3 text-2xl animate-spin" style={{ animationDuration: '2s' }}>⭐</div>
            <div className="absolute -bottom-3 -left-3 text-2xl animate-bounce">🎉</div>
            <div className="absolute -bottom-3 -right-3 text-2xl animate-bounce" style={{ animationDelay: '0.15s' }}>🎊</div>

            <Image
              src={winPokemonImage}
              alt={winPokemonName}
              width={90}
              height={90}
              className="object-contain drop-shadow-[0_0_16px_rgba(236,72,153,0.8)]"
              style={{ animation: 'spinBounce 0.8s ease-out' }}
            />

            <div className="flex flex-col items-center gap-2">
              <p className={`${pixelFont.className} text-fuchsia-900 text-lg leading-relaxed`}>
                ¡CORRECTO!
              </p>
              <p className={`${pixelFont.className} text-fuchsia-700 text-xs capitalize`}>
                Era {winPokemonName}
              </p>
            </div>

            <p className={`${pixelFont.className} text-fuchsia-600 text-[10px] text-center leading-relaxed`}>
              {guesses.length} {guesses.length === 1 ? 'intento' : 'intentos'}
            </p>

            <button
              onClick={() => void startNewGame()}
              className="mt-1 px-6 py-3 bg-pink-400 hover:bg-pink-300 active:scale-95 text-white rounded-lg border-2 border-pink-600 shadow-[0_4px_0_#9d174d] hover:shadow-[0_2px_0_#9d174d] hover:translate-y-0.5 transition-all duration-150"
            >
              <span className={`${pixelFont.className} text-xs`}>¡Otra!</span>
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

      {/* Overlay rendirse */}
      {showGiveUpAnimation && giveUpPokemon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div
            className="relative flex flex-col items-center gap-6 bg-gradient-to-b from-pink-100 to-fuchsia-100 border-4 border-pink-400 rounded-2xl px-10 py-10 shadow-[0_0_60px_rgba(236,72,153,0.9)]"
            style={{ animation: 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            <div className="absolute -top-3 -left-3 text-2xl">😔</div>
            <div className="absolute -top-3 -right-3 text-2xl">💔</div>
            <div className="absolute -bottom-3 -left-3 text-2xl">😢</div>
            <div className="absolute -bottom-3 -right-3 text-2xl animate-bounce" style={{ animationDelay: '0.15s' }}>🎐</div>

            <Image
              src={giveUpPokemon.imagen}
              alt={giveUpPokemon.nombre}
              width={90}
              height={90}
              className="object-contain drop-shadow-[0_0_16px_rgba(236,72,153,0.8)]"
              style={{ animation: 'spinBounce 0.8s ease-out' }}
            />

            <div className="flex flex-col items-center gap-2">
              <p className={`${pixelFont.className} text-fuchsia-900 text-lg leading-relaxed`}>
                ¡ERA ESTE!
              </p>
              <p className={`${pixelFont.className} text-fuchsia-700 text-xs capitalize`}>
                {giveUpPokemon.nombre}
              </p>
            </div>

            <p className={`${pixelFont.className} text-fuchsia-600 text-[10px] text-center leading-relaxed`}>
              {guesses.length} {guesses.length === 1 ? 'intento' : 'intentos'}
            </p>

            <button
              onClick={() => void startNewGame()}
              className="mt-1 px-6 py-3 bg-pink-400 hover:bg-pink-300 active:scale-95 text-white rounded-lg border-2 border-pink-600 shadow-[0_4px_0_#9d174d] hover:shadow-[0_2px_0_#9d174d] hover:translate-y-0.5 transition-all duration-150"
            >
              <span className={`${pixelFont.className} text-xs`}>Nueva partida</span>
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default InfinitoPage
