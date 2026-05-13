"use client";

import Link from "next/link";
import Image from "next/image";

export default function InfiniteModeButton() {
  return (
    <Link href="/partidas/infinito" className="group">
      <div
        className="relative w-[480px] h-[120px] rounded-2xl overflow-hidden border-[3px] border-pink-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.35)] cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_6px_28px_rgba(236,72,153,0.35)] active:scale-[0.98]"
      >
        {/* Left side - Mew area with soft pink background */}
        <div className="absolute inset-y-0 left-0 w-[130px] bg-gradient-to-br from-pink-200 via-pink-300 to-fuchsia-300 flex items-center justify-center z-10">
          {/* Mew image from PokeAPI (#151) */}
          <Image
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png"
            alt="Mew"
            width={100}
            height={100}
            className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)] group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Diagonal separator */}
        <div className="absolute inset-y-0 left-[115px] w-[30px] z-10"
          style={{
            background: "linear-gradient(to right, #f9a8d4, transparent)",
            clipPath: "polygon(0 0, 100% 0, 60% 100%, 0 100%)",
          }}
        />

        {/* Right side - Background image area */}
        <div className="absolute inset-y-0 left-[120px] right-0 flex items-center justify-center overflow-hidden">
          {/* Background image - desaturated */}
          <Image
            src="/background.webp"
            alt=""
            fill
            className="object-cover saturate-[0.3] brightness-[0.45] opacity-90"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-slate-900/50" />

          {/* Text content */}
          <div className="relative z-10 flex flex-col items-center gap-1 pr-2 ml-2">
            <span className="text-[10px] text-teal-300/70 font-medium tracking-[0.3em] uppercase">
              Sin límites
            </span>
            <span className="text-xl font-extrabold text-white tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            >
              MODO INFINITO
            </span>
            <span className="text-[10px] text-pink-300/80 font-semibold tracking-widest">
              ∞ JUEGA SIN PARAR ∞
            </span>
          </div>
        </div>

        {/* Pink shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-300/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />

        {/* Inner border glow */}
        <div className="absolute inset-0 rounded-2xl border border-pink-400/20 pointer-events-none z-20" />
      </div>
    </Link>
  );
}
