import Image from "next/image";
import DailyModeButton from "@/components/DailyModeButton";
import InfiniteModeButton from "@/components/InfiniteModeButton";
import AccountButton from "@/components/AccountButton";
import RankingButton from "@/components/RankingButton";
import { Press_Start_2P } from "next/font/google";
import Footer from "@/components/Footer";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export default async function Page() {
  return (
    <>
      <main>
        <section className="flex flex-col items-center justify-center text-center gap-12 px-8 py-12 pb-24">
          <div className="flex items-center gap-6">
            <AccountButton />
            <Image src="/logo.webp" alt="Pokedle" width={500} height={500} priority />
            <RankingButton />
          </div>

          <p className={`${pixelFont.className} text-base bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-wide leading-relaxed`}>¡Minijuegos de Pokémon diarios!</p>

          <DailyModeButton />
          <InfiniteModeButton />
        </section>
      </main>
      <Footer />
    </>
    
  );
}
