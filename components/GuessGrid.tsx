'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import { Press_Start_2P } from 'next/font/google'

const pixelFont = Press_Start_2P({ weight: '400', subsets: ['latin'] })

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type CellStatus = 'correct' | 'partial' | 'wrong'
export type NumericStatus = 'correct' | 'higher' | 'lower'

export interface GuessComparison {
  tipo1: CellStatus
  tipo2: CellStatus
  habitat: CellStatus
  color: CellStatus
  altura: NumericStatus
  peso: NumericStatus
  generacion: NumericStatus
}

export interface GuessEntry {
  pokemon: {
    id: number
    nombre: string
    tipos: string[]
    peso: number
    altura: number
    color: string
    generacion: string
    habitat: string | null
    imagen: string
  }
  comparison: GuessComparison
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_ES: Record<string, string> = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico',
  grass: 'Planta', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
  ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
  rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
  steel: 'Acero', fairy: 'Hada',
}

const COLOR_ES: Record<string, string> = {
  red: 'Rojo', blue: 'Azul', yellow: 'Amarillo', green: 'Verde',
  black: 'Negro', brown: 'Marrón', purple: 'Morado', gray: 'Gris',
  white: 'Blanco', pink: 'Rosa',
}

const HABITAT_ES: Record<string, string> = {
  cave: 'Cueva', forest: 'Bosque', grassland: 'Pradera', mountain: 'Montaña',
  rare: 'Raro', 'rough-terrain': 'Terreno', sea: 'Mar',
  urban: 'Urbano', 'waters-edge': 'Orilla',
}

function formatAltura(dm: number): string {
  if (dm < 10) return `${dm * 10}cm`
  const metros = Math.floor(dm / 10)
  const cm = (dm % 10) * 10
  return cm === 0 ? `${metros}m` : `${metros}m${cm}`
}

function formatPeso(hg: number): string {
  const kg = hg / 10
  return `${kg % 1 === 0 ? kg : kg.toFixed(1)}kg`
}

function formatGen(gen: string): string {
  // "generation-ii" → "Gen II"
  const part = gen.replace('generation-', '').toUpperCase()
  return `Gen ${part}`
}

// ─── Colores de celda (paleta retro NES/GBC) ─────────────────────────────────

const cellBg: Record<CellStatus | NumericStatus, string> = {
  correct: 'bg-green-500',
  partial: 'bg-yellow-400',
  wrong:   'bg-red-500',
  higher:  'bg-red-500',
  lower:   'bg-red-500',
}

// Sombras inset que simulan el "tile en relieve" típico del pixel art:
// borde superior-izquierdo claro + borde inferior-derecho oscuro.
const RAISED_TILE_SHADOW =
  'shadow-[inset_2px_2px_0_rgba(255,255,255,0.45),inset_-2px_-2px_0_rgba(0,0,0,0.45)]'

// Sombra de texto al estilo NES: pequeño contorno negro alrededor del texto
// para que sea legible sobre cualquier color de fondo.
const PIXEL_TEXT_SHADOW = {
  textShadow: '1px 1px 0 rgba(0,0,0,0.85), -1px 1px 0 rgba(0,0,0,0.85), 1px -1px 0 rgba(0,0,0,0.85), -1px -1px 0 rgba(0,0,0,0.85)',
} as const

// ─── Flecha para numéricos ─────────────────────────────────────────────────────

function Arrow({ status }: { status: NumericStatus }) {
  if (status === 'correct') return null
  // "higher" significa que el objetivo es más alto → el intento es bajo → flecha arriba
  // "lower"  significa que el objetivo es más bajo  → el intento es alto → flecha abajo
  return (
    <span
      className="block text-white text-[11px] leading-none mt-0.5"
      style={PIXEL_TEXT_SHADOW}
    >
      {status === 'higher' ? '▲' : '▼'}
    </span>
  )
}

// ─── Celda genérica ───────────────────────────────────────────────────────────

function Cell({
  status,
  children,
  animDelay,
}: {
  status: CellStatus | NumericStatus
  children: ReactNode
  animDelay?: number
}) {
  const animStyle = animDelay !== undefined
    ? { animation: `cardFlip 0.7s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: `${animDelay}ms`, opacity: 0 }
    : {}

  return (
    <div
      style={animStyle}
      className={`flex flex-col items-center justify-center border-[3px] border-black ${cellBg[status]} ${RAISED_TILE_SHADOW}
        min-w-[72px] w-full h-16 px-1`}
    >
      <span
        className={`${pixelFont.className} text-[9px] text-white text-center leading-tight`}
        style={PIXEL_TEXT_SHADOW}
      >
        {children}
      </span>
      {(status === 'higher' || status === 'lower') && <Arrow status={status} />}
    </div>
  )
}

// ─── Celda de imagen ──────────────────────────────────────────────────────────

function PokemonCell({ entry, animDelay }: { entry: GuessEntry; animDelay?: number }) {
  const animStyle = animDelay !== undefined
    ? { animation: `cardFlip 0.7s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: `${animDelay}ms`, opacity: 0 }
    : {}

  return (
    <div
      style={animStyle}
      className={`flex flex-col items-center justify-center border-[3px] border-black bg-slate-100 ${RAISED_TILE_SHADOW}
        min-w-[72px] w-full h-16 overflow-hidden relative`}
    >
      <Image
        src={entry.pokemon.imagen}
        alt={entry.pokemon.nombre}
        width={52}
        height={52}
        className="object-contain drop-shadow-[1px_1px_0_rgba(0,0,0,0.4)]"
      />
    </div>
  )
}

// ─── Cabecera ─────────────────────────────────────────────────────────────────

const HEADERS = ['Pokémon', 'Tipo 1', 'Tipo 2', 'Hábitat', 'Color', 'Altura', 'Peso', 'Gen.']

function HeaderRow() {
  return (
    <div className="grid grid-cols-8 gap-2 w-full mb-2">
      {HEADERS.map((h) => (
        <div
          key={h}
          className={`flex items-center justify-center border-[2px] border-black bg-zinc-900 h-7 ${RAISED_TILE_SHADOW}`}
        >
          <span
            className={`${pixelFont.className} text-[8px] text-yellow-300 text-center leading-tight`}
            style={PIXEL_TEXT_SHADOW}
          >
            {h}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Fila de intento ──────────────────────────────────────────────────────────

const STAGGER_MS = 240

function GuessRow({ entry, animate }: { entry: GuessEntry; animate?: boolean }) {
  const { pokemon, comparison } = entry

  const tipo1Label = TYPE_ES[pokemon.tipos[0]] ?? pokemon.tipos[0] ?? '—'
  const tipo2Label = pokemon.tipos[1]
    ? (TYPE_ES[pokemon.tipos[1]] ?? pokemon.tipos[1])
    : 'Ninguno'

  const habitatLabel = pokemon.habitat
    ? (HABITAT_ES[pokemon.habitat] ?? pokemon.habitat)
    : 'Ninguno'

  const colorLabel = COLOR_ES[pokemon.color] ?? pokemon.color

  const delay = (i: number) => animate ? i * STAGGER_MS : undefined

  return (
    <div className="grid grid-cols-8 gap-2 w-full" style={{ perspective: '600px' }}>
      <PokemonCell entry={entry} animDelay={delay(0)} />
      <Cell status={comparison.tipo1} animDelay={delay(1)}>{tipo1Label}</Cell>
      <Cell status={comparison.tipo2} animDelay={delay(2)}>{tipo2Label}</Cell>
      <Cell status={comparison.habitat} animDelay={delay(3)}>{habitatLabel}</Cell>
      <Cell status={comparison.color} animDelay={delay(4)}>{colorLabel}</Cell>
      <Cell status={comparison.altura} animDelay={delay(5)}>{formatAltura(pokemon.altura)}</Cell>
      <Cell status={comparison.peso} animDelay={delay(6)}>{formatPeso(pokemon.peso)}</Cell>
      <Cell status={comparison.generacion} animDelay={delay(7)}>{formatGen(pokemon.generacion)}</Cell>
    </div>
  )
}

// ─── Grid completo ────────────────────────────────────────────────────────────

interface GuessGridProps {
  guesses: GuessEntry[]
}

export default function GuessGrid({ guesses }: GuessGridProps) {
  if (guesses.length === 0) return null

  return (
    <div className="w-full max-w-3xl flex flex-col gap-2 mt-4">
      <HeaderRow />
      {guesses.map((entry, index) => (
        <GuessRow
          key={`${entry.pokemon.id}-${entry.pokemon.nombre}-${index}`}
          entry={entry}
          animate={index === guesses.length - 1}
        />
      ))}
    </div>
  )
}
