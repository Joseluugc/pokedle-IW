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
        <section className="flex flex-col items-center justify-center text-center gap-8 sm:gap-12 px-4 sm:px-8 py-8 sm:py-12 pb-24">
          {/* Top bar with Account/Ranking — stacked above logo on mobile/tablet, absolute beside logo on desktop */}
          <div className="flex w-full max-w-md items-center justify-between gap-3 lg:hidden">
            <AccountButton />
            <RankingButton />
          </div>

          <div className="relative w-full max-w-[500px]">
            <Image
              src="/logo.webp"
              alt="Pokedle"
              width={500}
              height={500}
              priority
              className="w-full h-auto"
            />
            <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-full mr-4">
              <AccountButton />
            </div>
            <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-full ml-4">
              <RankingButton />
            </div>
          </div>

          <p className={`${pixelFont.className} text-sm sm:text-base bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-wide leading-relaxed px-2`}>¡Minijuegos de Pokémon diarios!</p>

          <DailyModeButton />
          <InfiniteModeButton />
        </section>
      </main>
      <Footer />
    </>
  );
}
