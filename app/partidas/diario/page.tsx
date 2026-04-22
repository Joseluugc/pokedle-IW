import Image from 'next/image'
import React from 'react'
import { Press_Start_2P } from "next/font/google";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"] });

const DiarioPage = () => {
  return (
    <main>
        <section className="flex flex-col items-center justify-center text-center gap-12 px-8 py-12">
            <Image src="/logo.webp" alt="Pokedle" width={500} height={500} priority />

            <p className={`${pixelFont.className} text-base bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-wide leading-relaxed`}>¡¿Cuál es este pokémon?!</p>
    
            <input
              type="text"
              placeholder="Nombre del pokemon"
              className={`${pixelFont.className} w-full max-w-md px-4 py-3 text-sm text-amber-900 placeholder-amber-600/60 bg-yellow-100/80 border-2 border-amber-400 rounded-md shadow-[0_0_10px_rgba(251,191,36,0.4),inset_0_0_10px_rgba(255,255,200,0.3)] outline-none focus:border-yellow-300 focus:shadow-[0_0_16px_rgba(253,224,71,0.5),inset_0_0_10px_rgba(255,255,200,0.3)] transition-all duration-200`}
            />

        </section>
    </main>
  )
}

export default DiarioPage
