import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
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

      <article className="bg-base-100 rounded-2xl shadow-lg px-8 py-10 md:px-12">
        <header className="mb-8 pb-6 border-b border-base-200">
          <h1 className="text-3xl font-extrabold mb-2">
            Privacy Policy for {config.appName}
          </h1>
          <p className="text-sm text-base-content/50">
            <strong>Effective Date:</strong> May 23, 2026
          </p>
        </header>

        <p className="mb-8 leading-relaxed text-base-content/80">
          Welcome to Pokedle (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). Your privacy is
          important to us. This Privacy Policy explains how we collect, use, and
          protect your information when you use our website,{" "}
          <a
            href="https://pokedle-iw.vercel.app"
            className="link link-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pokedle
          </a>
          .
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Information We Collect</h2>
          <p className="mb-3 leading-relaxed text-base-content/80">
            We may collect the following personal information:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-3 pl-2 text-base-content/80">
            <li>Name</li>
            <li>Email address</li>
          </ul>
          <p className="leading-relaxed text-base-content/80">
            We may also collect non-personal information through cookies and
            similar technologies.
          </p>
        </section>

        <div className="divider" />

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">How We Use Your Information</h2>
          <p className="mb-3 leading-relaxed text-base-content/80">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-base-content/80">
            <li>Create and manage internal user profiles</li>
            <li>Improve the user experience on our website</li>
            <li>Maintain and operate the website</li>
          </ul>
        </section>

        <div className="divider" />

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Cookies</h2>
          <p className="leading-relaxed text-base-content/80">
            Pokedle uses cookies to enhance your browsing experience and collect
            non-personal usage data. You can disable cookies through your
            browser settings if you prefer.
          </p>
        </section>

        <div className="divider" />

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Data Sharing</h2>
          <p className="leading-relaxed text-base-content/80">
            We do not sell, trade, or share your personal information with third
            parties.
          </p>
        </section>

        <div className="divider" />

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Children&apos;s Privacy</h2>
          <p className="leading-relaxed text-base-content/80">
            Pokedle does not knowingly collect personal information from
            children.
          </p>
        </section>

        <div className="divider" />

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            Updates to This Privacy Policy
          </h2>
          <p className="leading-relaxed text-base-content/80">
            We may update this Privacy Policy from time to time. If we make
            significant changes, we will notify users by email.
          </p>
        </section>

        <div className="divider" />

        <section>
          <h2 className="text-xl font-bold mb-3">Contact Us</h2>
          <p className="mb-3 leading-relaxed text-base-content/80">
            If you have any questions about this Privacy Policy, you can contact
            us at:
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

export default PrivacyPolicy;
