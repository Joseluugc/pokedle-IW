import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link href="/" className="btn btn-ghost mb-6 inline-flex">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
            clipRule="evenodd"
          />
        </svg>{" "}
        Back
      </Link>

      <article className="bg-base-100 rounded-2xl shadow-lg px-5 py-8 sm:px-8 sm:py-10 md:px-12 break-words">
        <header className="mb-8 pb-6 border-b border-base-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
            Terms of Service for {config.appName}
          </h1>
          <p className="text-sm text-base-content/50">
            <strong>Effective Date:</strong> May 23, 2026
          </p>
        </header>

        <p className="mb-8 leading-relaxed text-base-content/80">
          Welcome to Pokedle (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or using
          our website,{" "}
          <a
            href="https://pokedle-iw.vercel.app"
            className="link link-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pokedle
          </a>
          , you agree to comply with and be bound by these Terms of Service.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Use of the Website</h2>
          <p className="mb-3 leading-relaxed text-base-content/80">
            Pokedle provides daily Pokémon-themed challenges for entertainment
            purposes. By using the website, you agree to use it lawfully and
            respectfully.
          </p>
          <p className="mb-3 leading-relaxed text-base-content/80">
            You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-base-content/80">
            <li>Use the website for any illegal or unauthorized purpose</li>
            <li>
              Attempt to interfere with the operation or security of the website
            </li>
            <li>
              Misuse or attempt to gain unauthorized access to user accounts or
              data
            </li>
          </ul>
        </section>

        <div className="divider" />

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">User Accounts and Data</h2>
          <p className="mb-3 leading-relaxed text-base-content/80">
            When using Pokedle, we may collect personal information including:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4 pl-2 text-base-content/80">
            <li>Name</li>
            <li>Email address</li>
          </ul>
          <p className="mb-4 leading-relaxed text-base-content/80">
            We may also use cookies and similar technologies to improve the user
            experience.
          </p>
          <p className="leading-relaxed text-base-content/80">
            For more information about how we collect and use data, please
            review our{" "}
            <Link href="/privacy-policy" className="link link-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <div className="divider" />

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Intellectual Property</h2>
          <p className="mb-3 leading-relaxed text-base-content/80">
            All content, branding, and materials available on Pokedle, including
            but not limited to text, graphics, logos, and website functionality,
            are owned by Pokedle or their respective owners and are protected by
            applicable intellectual property laws.
          </p>
          <p className="leading-relaxed text-base-content/80">
            Pokémon and related names, characters, and assets are trademarks and
            property of Nintendo, Game Freak, and The Pokémon Company.
          </p>
        </section>

        <div className="divider" />

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Disclaimer</h2>
          <p className="leading-relaxed text-base-content/80">
            Pokedle is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do
            not guarantee that the website will always be available, error-free,
            or uninterrupted.
          </p>
        </section>

        <div className="divider" />

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Limitation of Liability</h2>
          <p className="leading-relaxed text-base-content/80">
            To the fullest extent permitted by law, Pokedle and its owners shall
            not be liable for any indirect, incidental, or consequential damages
            arising from the use of the website.
          </p>
        </section>

        <div className="divider" />

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Governing Law</h2>
          <p className="leading-relaxed text-base-content/80">
            These Terms of Service shall be governed and interpreted in
            accordance with the laws of Spain.
          </p>
        </section>

        <div className="divider" />

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Updates to These Terms</h2>
          <p className="leading-relaxed text-base-content/80">
            We may update these Terms of Service from time to time. Users will
            be notified of significant changes by email.
          </p>
        </section>

        <div className="divider" />

        <section>
          <h2 className="text-xl font-bold mb-3">Contact Information</h2>
          <p className="mb-3 leading-relaxed text-base-content/80">
            If you have any questions about these Terms of Service, you may
            contact us at:
          </p>
          <ul className="list-disc list-inside pl-2 text-base-content/80">
            <li>
              Email:{" "}
              <a
                href="mailto:espejoramirezhugo@gmail.com"
                className="link link-primary"
              >
                espejoramirezhugo@gmail.com
              </a>
            </li>
          </ul>
        </section>
      </article>
    </main>
  );
};

export default TOS;
