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

// ─── Colores de celda ─────────────────────────────────────────────────────────

const cellBg: Record<CellStatus | NumericStatus, string> = {
  correct: 'bg-emerald-400 border-emerald-500',
  partial: 'bg-yellow-300 border-yellow-400',
  wrong:   'bg-rose-400   border-rose-500',
  higher:  'bg-rose-400   border-rose-500',
  lower:   'bg-rose-400   border-rose-500',
}

// ─── Flecha para numéricos ─────────────────────────────────────────────────────

function Arrow({ status }: { status: NumericStatus }) {
  if (status === 'correct') return null
  // "higher" significa que el objetivo es más alto → el intento es bajo → flecha arriba
  // "lower"  significa que el objetivo es más bajo  → el intento es alto → flecha abajo
  return (
    <span className="block text-white text-[10px] leading-none mt-0.5">
      {status === 'higher' ? '▲' : '▼'}
    </span>
  )
}

// ─── Celda genérica ───────────────────────────────────────────────────────────

function Cell({
  status,
  children,
}: {
  status: CellStatus | NumericStatus
  children: ReactNode
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 ${cellBg[status]} 
        min-w-[72px] w-full h-16 px-1 shadow-md`}
    >
      <span className={`${pixelFont.className} text-[9px] text-white text-center leading-tight`}>
        {children}
      </span>
      {(status === 'higher' || status === 'lower') && <Arrow status={status} />}
    </div>
  )
}

// ─── Celda de imagen ──────────────────────────────────────────────────────────

function PokemonCell({ entry }: { entry: GuessEntry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-amber-400 bg-white min-w-[72px] w-full h-16 shadow-md overflow-hidden">
      <Image
        src={entry.pokemon.imagen}
        alt={entry.pokemon.nombre}
        width={52}
        height={52}
        className="object-contain"
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
        <div key={h} className="flex items-center justify-center">
          <span className={`${pixelFont.className} text-[8px] text-amber-200 text-center leading-tight`}>
            {h}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Fila de intento ──────────────────────────────────────────────────────────

function GuessRow({ entry }: { entry: GuessEntry }) {
  const { pokemon, comparison } = entry

  const tipo1Label = TYPE_ES[pokemon.tipos[0]] ?? pokemon.tipos[0] ?? '—'
  const tipo2Label = pokemon.tipos[1]
    ? (TYPE_ES[pokemon.tipos[1]] ?? pokemon.tipos[1])
    : 'Ninguno'

  const habitatLabel = pokemon.habitat
    ? (HABITAT_ES[pokemon.habitat] ?? pokemon.habitat)
    : 'Ninguno'

  const colorLabel = COLOR_ES[pokemon.color] ?? pokemon.color

  return (
    <div className="grid grid-cols-8 gap-2 w-full">
      <PokemonCell entry={entry} />
      <Cell status={comparison.tipo1}>{tipo1Label}</Cell>
      <Cell status={comparison.tipo2}>{tipo2Label}</Cell>
      <Cell status={comparison.habitat}>{habitatLabel}</Cell>
      <Cell status={comparison.color}>{colorLabel}</Cell>
      <Cell status={comparison.altura}>{formatAltura(pokemon.altura)}</Cell>
      <Cell status={comparison.peso}>{formatPeso(pokemon.peso)}</Cell>
      <Cell status={comparison.generacion}>{formatGen(pokemon.generacion)}</Cell>
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
        <GuessRow key={`${entry.pokemon.id}-${entry.pokemon.nombre}-${index}`} entry={entry} />
      ))}
    </div>
  )
}
