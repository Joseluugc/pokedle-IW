'use client'

import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react'
import { Press_Start_2P } from "next/font/google";
import { searchPokemonByNamePartial } from '@/libs/actions/partida';

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"] });

const DiarioPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<{ nombre: string; imagen: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (inputValue.trim().length < 2) {
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
  }, [inputValue]);

  const handleSelect = (nombre: string) => {
    setInputValue(nombre);
    setShowSuggestions(false);
    setSuggestions([]);
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
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Nombre del pokemon"
            autoComplete="off"
            className={`${pixelFont.className} w-full px-4 py-3 text-sm text-amber-900 placeholder-amber-600/60 bg-yellow-100/80 border-2 border-amber-400 rounded-md shadow-[0_0_10px_rgba(251,191,36,0.4),inset_0_0_10px_rgba(255,255,200,0.3)] outline-none focus:border-yellow-300 focus:shadow-[0_0_16px_rgba(253,224,71,0.5),inset_0_0_10px_rgba(255,255,200,0.3)] transition-all duration-200`}
          />

          {/* Indicador de carga */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Lista de sugerencias */}
          {showSuggestions && (
            <ul className="absolute z-50 w-full mt-1 bg-yellow-50 border-2 border-amber-400 rounded-md shadow-[0_4px_20px_rgba(251,191,36,0.4)] max-h-60 overflow-y-auto">
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
      </section>
    </main>
  );
};

export default DiarioPage