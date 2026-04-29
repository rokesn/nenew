import SiteLayout from "@/components/SiteLayout";
import SEO from "@/components/SEO";
import { Heart, Rocket, Users } from "lucide-react";

const About = () => (
  <SiteLayout>
    <SEO
      title="About — Your Url Live"
      description="Learn about Your Url Live, the free micro-page and subdomain hosting platform built for small businesses and creators."
      canonical="https://yoururl.live/about"
    />
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">About</p>
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
          A free home on the web for every small business
        </h1>
        <p className="text-lg text-muted-foreground">
          Your Url Live gives small businesses, creators and side projects a beautiful free micro-page —
          and optional subdomain hosting — without the cost or complexity of a full website builder.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: Rocket, t: "Our mission", d: "Make the web accessible. Anyone should be able to launch a real online presence in 60 seconds, for free." },
          { icon: Users, t: "Who we serve", d: "Small business owners, freelancers, creators, students, and anyone who needs a sharable link that just works." },
          { icon: Heart, t: "Our promise", d: "Free forever for the basic page. No ads on your page. No selling your data. Ever." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-2xl border bg-card p-6 shadow-soft">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold">{t}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4 rounded-2xl border bg-card p-8 shadow-soft">
        <h2 className="text-2xl font-bold">The story</h2>
        <p className="text-muted-foreground">
          Your Url Live started with a simple frustration: building a basic landing page or hosting a small static
          site shouldn't require a credit card, a domain purchase, or learning a new platform. We built a
          focused tool that does one thing perfectly — give you a fast, mobile-first link you can share anywhere.
        </p>
        <p className="text-muted-foreground">
          Today thousands of micro-pages live on Your Url Live, and we are expanding into free subdomain hosting,
          GitHub Pages style, with personal review for every request to keep the platform clean and safe.
        </p>
      </section>
    </article>
  </SiteLayout>
);

export default About;
