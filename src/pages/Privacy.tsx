import SiteLayout from "@/components/SiteLayout";
import SEO from "@/components/SEO";

const Privacy = () => (
  <SiteLayout>
    <SEO
      title="Privacy Policy — Your Url Live"
      description="How Your Url Live collects, uses and protects your data. We do not sell your data. Ever."
      canonical="https://yoururl.live/privacy"
    />
    <article className="prose prose-slate mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</p>
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: April 29, 2026</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">1. What we collect</h2>
        <p className="text-muted-foreground">
          When you create an account we collect your email, password (hashed), and the business info you choose to publish:
          name, tagline, logo, website URL and CTA text. We also record anonymous click counts on your page button so you can see traffic.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">2. How we use it</h2>
        <p className="text-muted-foreground">
          We use your data only to deliver the service: hosting your page, authenticating your dashboard, and showing you visit analytics.
          We never sell your data, and we do not run advertising on your public page.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">3. Cookies & analytics</h2>
        <p className="text-muted-foreground">
          We use a single authentication cookie to keep you signed in. We track aggregate page-visit counts but do not store personally
          identifiable visitor information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">4. Your rights</h2>
        <p className="text-muted-foreground">
          You can update or delete your business page anytime from your dashboard. To delete your account entirely, contact
          <a className="font-medium text-primary hover:underline" href="mailto:privacy@yoururl.live"> privacy@yoururl.live</a>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">5. Contact</h2>
        <p className="text-muted-foreground">
          Questions about this policy? Email <a className="font-medium text-primary hover:underline" href="mailto:privacy@yoururl.live">privacy@yoururl.live</a>.
        </p>
      </section>
    </article>
  </SiteLayout>
);

export default Privacy;
