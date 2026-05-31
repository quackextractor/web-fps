import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | INDUSTRIALIST",
  description: "GDPR privacy policy for INDUSTRIALIST - Descent Into Darkness.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-[100dvh] bg-black text-gray-200">
      <div className="h-[100dvh] overflow-y-auto px-6 py-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <header className="space-y-3">
            <p className="retro-text text-xs text-gray-400">Last updated: May 31, 2026</p>
            <h1 className="retro-text text-2xl text-red-500 sm:text-3xl">
              Privacy Policy
            </h1>
            <p className="text-sm leading-relaxed text-gray-300">
              This Privacy Policy explains how INDUSTRIALIST - Descent Into Darkness (the
              “Game”, “we”, “us”) processes personal data when you visit{" "}
              <span className="text-white">https://web-fps-sigma.vercel.app</span> or use
              the Game’s online features.
            </p>
          </header>

          <section className="space-y-2">
            <h2 className="retro-text text-lg text-white">Who is responsible for your data</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              The Game is an open-source project maintained by the INDUSTRIALIST
              contributors. For GDPR requests, please contact us via the public issue
              tracker at{" "}
              <a
                href="https://github.com/quackextractor/web-fps/issues"
                className="text-red-400 underline"
                target="_blank"
                rel="noreferrer"
              >
                https://github.com/quackextractor/web-fps/issues
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="retro-text text-lg text-white">Personal data we collect</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-300">
              <li>
                <span className="text-white">Account data:</span> username, password
                hash, and account timestamps when you create an online profile.
              </li>
              <li>
                <span className="text-white">Game progress:</span> save data such as
                credits, inventory, machines, unlocked weapons, highest level completed,
                net worth, and kill count.
              </li>
              <li>
                <span className="text-white">Public data:</span> your username, net
                worth, kills, and factory layout may appear on the leaderboard or public
                factory view if you use those features.
              </li>
              <li>
                <span className="text-white">Local device data:</span> settings and
                offline progress stored in your browser’s local storage (e.g.
                “doom-settings”, “fps-savegame”, and “industrialist_save_*”).
              </li>
              <li>
                <span className="text-white">Technical data:</span> basic request data
                such as IP address, device/browser information, and timestamps may be
                processed by our hosting provider for security, debugging, and
                performance.
              </li>
              <li>
                <span className="text-white">Analytics:</span> we use Vercel Analytics to
                understand aggregate usage (for example, page views and performance
                metrics). Vercel may process IP addresses and device data according to
                its privacy policy.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="retro-text text-lg text-white">Why we use your data</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-300">
              <li>Provide the Game, online saves, and leaderboards.</li>
              <li>Authenticate accounts and prevent abuse or cheating.</li>
              <li>Store your preferences and offline progress locally.</li>
              <li>Measure performance and improve the experience.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="retro-text text-lg text-white">Legal bases (GDPR)</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-300">
              <li>
                <span className="text-white">Contract:</span> processing needed to
                deliver online features you request.
              </li>
              <li>
                <span className="text-white">Legitimate interests:</span> securing the
                service, preventing fraud, and improving stability.
              </li>
              <li>
                <span className="text-white">Consent:</span> where required for non-essential
                analytics.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="retro-text text-lg text-white">Cookies & local storage</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              The Game uses essential cookies for authentication (for example, an
              “auth_token” session cookie and a short-lived login token cookie). We also
              use browser local storage to remember your settings and offline progress.
              You can clear cookies and local storage in your browser settings; doing so
              will remove local saves and sign you out.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="retro-text text-lg text-white">Sharing & service providers</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              We use trusted service providers to host and operate the Game, including
              Vercel (hosting/analytics) and Supabase/PostgreSQL (database). These
              providers process data on our behalf and under their own privacy
              obligations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="retro-text text-lg text-white">International transfers</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              Our service providers may process data outside the EEA. When they do, they
              rely on appropriate safeguards such as Standard Contractual Clauses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="retro-text text-lg text-white">Retention</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              Account and gameplay data are stored while your account is active or until
              you request deletion. Local storage persists until you clear it. Server
              logs and analytics are retained for limited periods consistent with
              provider policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="retro-text text-lg text-white">Your GDPR rights</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-300">
              <li>Access, correct, or delete your personal data.</li>
              <li>Object to or restrict certain processing.</li>
              <li>Request portability of your data.</li>
              <li>Withdraw consent where processing is based on consent.</li>
              <li>File a complaint with your local data protection authority.</li>
            </ul>
            <p className="text-sm leading-relaxed text-gray-300">
              To exercise these rights, contact us via the issue tracker linked above.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="retro-text text-lg text-white">Automated decisions</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              We do not use automated decision-making or profiling that produces legal
              or similarly significant effects.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="retro-text text-lg text-white">Children</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              The Game is not directed to children under 16. If you are under 16, please
              use the Game only with parental consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="retro-text text-lg text-white">Changes to this policy</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              We may update this policy from time to time. The latest version will
              always be available on this page.
            </p>
          </section>

          <footer className="pt-4">
            <Link
              href="/"
              className="retro-text text-xs text-red-400 underline hover:text-red-300"
            >
              Return to game
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
