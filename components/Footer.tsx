import Link from "next/link";
import Image from "next/image";
import config from "@/config";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-gray-950/80">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-16">

          <div className="flex-shrink-0 space-y-3 md:w-56">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src={"/pokeball.webp"}
                alt={`${config.appName} logo`}
                priority
                className="w-7 h-7"
                width={28}
                height={28}
              />
              <span className="font-extrabold text-lg tracking-tight text-yellow-200/80">
                {config.appName}
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-white/35">
              {config.appDescription}
            </p>

            <p className="text-xs text-yellow-200/80">
              © {new Date().getFullYear()} {config.appName}
            </p>
          </div>

          <div className="flex flex-wrap gap-10 flex-1">
            <div className="space-y-3 min-w-[120px]">
              <p className="text-xs font-semibold uppercase tracking-widest text-yellow-200/80">
                Jugar
              </p>
              <ul className="space-y-2 text-sm text-white/40">
                <li>
                  <Link href="/partidas/diario" className="hover:text-white/80 transition-colors">
                    Modo Diario
                  </Link>
                </li>
                <li>
                  <Link href="/partidas/infinito" className="hover:text-white/80 transition-colors">
                    Modo Infinito
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 min-w-[120px]">
              <p className="text-xs font-semibold uppercase tracking-widest text-yellow-200/80">
                Cuenta
              </p>
              <ul className="space-y-2 text-sm text-white/40">
                <li>
                  <Link href="/signin" className="hover:text-white/80 transition-colors">
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="hover:text-white/80 transition-colors">
                    Configuración
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 min-w-[120px]">
              <p className="text-xs font-semibold uppercase tracking-widest text-yellow-200/80">
                Legal
              </p>
              <ul className="space-y-2 text-sm text-white/40">
                <li>
                  <Link href="/tos" className="hover:text-white/80 transition-colors">
                    Términos de uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-white/80 transition-colors">
                    Política de privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
