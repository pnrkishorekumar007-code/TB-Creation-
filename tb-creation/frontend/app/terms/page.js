export const metadata = { title: 'Terms of Service — TB Creation' };

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <h1 className="font-display text-3xl mb-2 uppercase">Terms of Service</h1>
      <p className="text-muted text-sm mb-8">Last updated: August 2026</p>

      <div className="flex flex-col gap-6 text-sm text-muted leading-relaxed">
        <section>
          <h2 className="text-paper font-semibold mb-2">1. What TB Creation Is</h2>
          <p>TB Creation is a platform for independent creators to publish manga comics and scripts, and for readers to discover and read them. By creating an account, you agree to these terms.</p>
        </section>
        <section>
          <h2 className="text-paper font-semibold mb-2">2. Content Ownership</h2>
          <p>Creators retain full ownership of everything they upload. By publishing on TB Creation, you grant us a license to host and display your work on the platform — nothing more.</p>
        </section>
        <section>
          <h2 className="text-paper font-semibold mb-2">3. What You Can't Upload</h2>
          <p>No content that infringes someone else's copyright, contains hate speech or harassment, or sexualizes minors. Violating this results in removal and possible account termination.</p>
        </section>
        <section>
          <h2 className="text-paper font-semibold mb-2">4. Reporting & Moderation</h2>
          <p>Readers can report comics, scripts, or comments they believe violate these terms. Our team reviews reports and may remove content or suspend accounts at our discretion.</p>
        </section>
        <section>
          <h2 className="text-paper font-semibold mb-2">5. Account Termination</h2>
          <p>We may suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting us.</p>
        </section>
        <section>
          <h2 className="text-paper font-semibold mb-2">6. Changes</h2>
          <p>We may update these terms as the platform grows. Continued use after changes means you accept the updated terms.</p>
        </section>
        <p className="text-xs">
          This is placeholder legal text for development. Before launching publicly, have an actual lawyer review and finalize these terms for your jurisdiction.
        </p>
      </div>
    </div>
  );
}
