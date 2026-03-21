import Link from "next/link";
import Image from "next/image";
import ButtonSignin from "@/components/ButtonSignin";

export default function Page() {
  return (
    <>
      {/* <header className="p-4 flex justify-end max-w-7xl mx-auto">
        <ButtonSignin text="Login" />
      </header> */}

      <main>
        <section className="flex flex-col items-center justify-center text-center gap-12 px-8 py-24">
          <Image src="/logo.webp" alt="Pokedle" width={500} height={500} priority />

          <p className="text-2xl font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">¡Minijuegos de Pokémon diarios!</p>

          
        </section>
      </main>
    </>
  );
}
