import SiteLayout from "@/components/SiteLayout";
import SEO from "@/components/SEO";

const Terms = () => (
  <SiteLayout>
    <SEO
      title="Terms of Service — Your Url Live"
      description="The terms of service for using Your Url Live's free micro-page and subdomain hosting platform."
      canonical="https://yoururl.live/terms"
    />
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</p>
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: April 29, 2026</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">1. Acceptance</h2>
        <p className="text-muted-foreground">
          By creating an account you agree to these terms. If you don't agree, please don't use the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">2. Acceptable use</h2>
        <p className="text-muted-foreground">
          You may not use Your Url Live to host or link to illegal content, malware, phishing pages, hate speech, or anything that infringes
          intellectual property. Pages and subdomains found in violation will be removed without notice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">3. Free service</h2>
        <p className="text-muted-foreground">
          The service is provided free of charge, "as is", without warranty. We may change features, limits, or pricing in the future
          but the basic micro-page will remain free.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">4. Subdomain hosting</h2>
        <p className="text-muted-foreground">
          Subdomains (yourname.yoururl.live) are issued at our discretion after manual review. We may revoke a subdomain
          if it violates our acceptable use policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">5. Termination</h2>
        <p className="text-muted-foreground">
          You can delete your account anytime. We may suspend accounts that violate these terms. We are not liable for losses resulting
          from termination of a free service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">6. Contact</h2>
        <p className="text-muted-foreground">
          Questions? Email <a className="font-medium text-primary hover:underline" href="mailto:legal@yoururl.live">legal@yoururl.live</a>.
        </p>
      </section>
    </article>
  </SiteLayout>
);

export default Terms;
