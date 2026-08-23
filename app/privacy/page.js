export const metadata = { title: 'Privacy Policy — TB Creation' };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <h1 className="font-display text-3xl mb-2 uppercase">Privacy Policy</h1>
      <p className="text-muted text-sm mb-8">Last updated: August 2026</p>

      <div className="flex flex-col gap-6 text-sm text-muted leading-relaxed">
        <section>
          <h2 className="text-paper font-semibold mb-2">1. What We Collect</h2>
          <p>Your name, email, and password (hashed, never stored in plain text) when you sign up. Anything you upload or post — comics, scripts, comments, bio, avatar. Basic usage data like reading history, for the "Continue Reading" feature.</p>
        </section>
        <section>
          <h2 className="text-paper font-semibold mb-2">2. How We Use It</h2>
          <p>To run the core features you use: authentication, showing your uploads, tracking bookmarks and follows, sending in-app notifications, and improving the platform.</p>
        </section>
        <section>
          <h2 className="text-paper font-semibold mb-2">3. What We Don't Do</h2>
          <p>We don't sell your data to third parties. We don't share your email publicly — only your display name and bio are shown on your public profile.</p>
        </section>
        <section>
          <h2 className="text-paper font-semibold mb-2">4. Cookies</h2>
          <p>We use a login token stored in your browser to keep you signed in. That's it — no third-party ad trackers.</p>
        </section>
        <section>
          <h2 className="text-paper font-semibold mb-2">5. Your Rights</h2>
          <p>You can edit or delete your profile information at any time from your account settings, or contact us to request full account deletion.</p>
        </section>
        <p className="text-xs">
          This is placeholder legal text for development. Before launching publicly, have an actual lawyer review and finalize this policy, especially if you'll have users outside your home country (GDPR, etc.).
        </p>
      </div>
    </div>
  );
}
