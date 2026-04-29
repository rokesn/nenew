import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { ArrowRight, BarChart3, Check, Copy, Globe, ImagePlus, MousePointerClick, ShieldCheck, Smartphone, Sparkles, Upload, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ensureUrl, slugify } from "@/lib/slug";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Business name must be at least 2 characters").max(80),
  website_url: z.string().trim().min(3, "Enter your website").max(300),
  tagline: z.string().trim().max(140).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

const FAQS = [
  { q: "Is Your Url Live really free?", a: "Yes. Creating, hosting, and editing your business micro-page on Your Url Live is 100% free forever. No credit card required, no trial period." },
  { q: "How long does it take to set up a business page?", a: "About 60 seconds. Enter your business name, website URL, an optional tagline and logo, then you get a live shareable link instantly." },
  { q: "Can I change my page after I create it?", a: "Absolutely. Sign in to your dashboard anytime to update your name, tagline, logo, website URL, and the call-to-action button text." },
  { q: "Can I track how many people click my button?", a: "Yes. Every visit click is recorded and shown in your dashboard so you know how your link is performing." },
  { q: "Do I need any coding or design skills?", a: "No. Your Url Live is built for non-technical small business owners. If you can fill out a form, you can launch a beautiful page." },
  { q: "Where can I share my Your Url Live link?", a: "Anywhere — your Instagram or TikTok bio, business cards, QR codes, WhatsApp status, email signatures, or printed flyers." },
  { q: "Can I host my own website on a Your Url Live subdomain?", a: "Yes. Like GitHub Pages, you can host a full static site at yourname.yoururl.live for free. Submit a request from your dashboard, our team personally reviews it, and once approved you get access to deploy your site." },
];

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ slug: string; url: string } | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Your Url Live",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      url: "https://yoururl.live/",
      description: "Free business micro-page platform. Create a mobile-friendly link-in-bio style page that sends visitors straight to your real website.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "128" },
    },
    { "@context": "https://schema.org", "@type": "Organization", name: "Your Url Live", url: "https://yoururl.live/", logo: "https://yoururl.live/favicon.png" },
    { "@context": "https://schema.org", "@type": "WebSite", name: "Your Url Live", url: "https://yoururl.live/" },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  async function uniqueSlug(base: string): Promise<string> {
    let slug = base || "page";
    let attempt = 0;
    // try base, base-2, base-3 ...
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const candidate = attempt === 0 ? slug : `${slug}-${attempt + 1}`;
      const { data } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", candidate)
        .maybeSingle();
      if (!data) return candidate;
      attempt++;
      if (attempt > 50) return `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const raw = {
      name: String(form.get("name") || ""),
      website_url: String(form.get("website_url") || ""),
      tagline: String(form.get("tagline") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };
    const parsed = signupSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      // 1. Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (authError) {
        if (authError.message.toLowerCase().includes("registered")) {
          toast.error("That email already has a page. Try signing in instead.");
        } else {
          toast.error(authError.message);
        }
        return;
      }
      const userId = authData.user?.id;
      if (!userId) {
        toast.error("Could not create your account. Try again.");
        return;
      }

      // 2. Slug
      const slug = await uniqueSlug(slugify(parsed.data.name));

      // 3. Logo upload (optional)
      let logo_url: string | null = null;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop()?.toLowerCase() || "png";
        const path = `${userId}/logo.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("logos")
          .upload(path, logoFile, { upsert: true, contentType: logoFile.type });
        if (!upErr) {
          const { data: pub } = supabase.storage.from("logos").getPublicUrl(path);
          logo_url = pub.publicUrl;
        }
      }

      // 4. Insert business
      const { error: insErr } = await supabase.from("businesses").insert({
        owner_id: userId,
        slug,
        name: parsed.data.name,
        tagline: parsed.data.tagline || null,
        website_url: ensureUrl(parsed.data.website_url),
        email: parsed.data.email,
        logo_url,
      });
      if (insErr) {
        toast.error(insErr.message);
        return;
      }

      const url = `${window.location.origin}/${slug}`;
      setCreated({ slug, url });
      toast.success("Your page is live! 🎉");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!created) return;
    navigator.clipboard.writeText(created.url);
    toast.success("Link copied");
  }

  return (
    <div className="min-h-screen bg-hero">
      <SEO
        title="Your Url Live — Free business micro-pages in 60 seconds"
        description="Get your free Your Url Live business page in 60 seconds. One mobile-friendly link with a big button to your real website. No code, free forever."
        canonical="https://yoururl.live/"
        ogImage="https://yoururl.live/favicon.png"
        jsonLd={jsonLd}
      />
      {/* Nav */}
      <header className="container flex items-center justify-between py-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg" aria-label="Your Url Live home">
          <img src={logo} alt="Your Url Live logo" width={32} height={32} className="h-8 w-8 rounded-xl shadow-elegant" />
          Your Url Live
        </Link>
        <nav className="flex items-center gap-2" aria-label="Primary">
          <a href="#features" className="hidden text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground sm:inline">Features</a>
          <a href="#hosting" className="hidden text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground sm:inline">Hosting</a>
          <Link to="/about" className="hidden text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground md:inline">About</Link>
          <Link to="/contact" className="hidden text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground md:inline">Contact</Link>
          <a href="#faq" className="hidden text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground sm:inline">FAQ</a>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main>
        <section className="container grid gap-12 py-12 md:py-20 lg:grid-cols-2 lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Free forever · No credit card
            </div>
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Get your free business page in{" "}
              <span className="inline-block bg-gradient-primary bg-clip-text pb-1 text-transparent">60 seconds</span>.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
              One link. One big button. Send customers straight to your real site —
              <span className="font-semibold text-foreground"> or host your own static website free</span> on a
              <span className="font-semibold text-foreground"> yourname.yoururl.live</span> subdomain, GitHub Pages style.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2 text-sm text-muted-foreground">
              {["No code", "Mobile-first", "Free hosting"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> {f}
                </div>
              ))}
            </div>
          </div>

          {/* Form / Success card */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-mesh blur-2xl" />
            {created ? (
              <div className="rounded-3xl border bg-card p-8 shadow-elegant">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  <Check className="h-3.5 w-3.5" /> Live
                </div>
                <h2 className="text-3xl font-bold">Your page is ready 🎉</h2>
                <p className="mt-2 text-muted-foreground">Share this link anywhere — Instagram bio, business cards, QR codes.</p>
                <div className="mt-6 flex items-center gap-2 rounded-xl border bg-secondary/60 p-3">
                  <code className="flex-1 truncate text-sm font-medium">{created.url}</code>
                  <Button size="sm" variant="outline" onClick={copyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link to={`/${created.slug}`} className="flex-1">
                    <Button className="w-full" size="lg">
                      View page <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full" size="lg">
                      Go to dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-3xl border bg-card p-6 shadow-elegant md:p-8">
                <h2 className="text-2xl font-bold">Claim your page</h2>
                <p className="mt-1 text-sm text-muted-foreground">Free forever. Edit anytime.</p>

                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="name">Business name *</Label>
                    <Input id="name" name="name" placeholder="Burger King" required maxLength={80} />
                  </div>
                  <div>
                    <Label htmlFor="website_url">Your website URL *</Label>
                    <Input id="website_url" name="website_url" placeholder="burgerking.com" required maxLength={300} />
                  </div>
                  <div>
                    <Label htmlFor="tagline">Tagline (optional)</Label>
                    <Input id="tagline" name="tagline" placeholder="Have it your way" maxLength={140} />
                  </div>

                  <div>
                    <Label>Logo (optional)</Label>
                    <div className="mt-1.5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed text-muted-foreground transition-smooth hover:border-primary hover:text-primary"
                      >
                        {logoFile ? (
                          <img src={URL.createObjectURL(logoFile)} alt="" className="h-full w-full rounded-xl object-cover" />
                        ) : (
                          <ImagePlus className="h-5 w-5" />
                        )}
                      </button>
                      <span className="text-sm text-muted-foreground">{logoFile ? logoFile.name : "PNG or JPG, max 2MB"}</span>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          if (f.size > 2 * 1024 * 1024) {
                            toast.error("Logo must be under 2MB");
                            return;
                          }
                          setLogoFile(f);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" placeholder="you@example.com" required maxLength={255} />
                    </div>
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input id="password" name="password" type="password" placeholder="8+ characters" required minLength={8} maxLength={72} />
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="mt-6 w-full bg-gradient-primary shadow-elegant" disabled={loading}>
                  {loading ? "Creating your page..." : (
                    <>Create my free page <ArrowRight className="ml-1 h-4 w-4" /></>
                  )}
                </Button>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Already have a page? <Link to="/dashboard" className="font-medium text-primary hover:underline">Sign in</Link>
                </p>
              </form>
            )}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container scroll-mt-20 py-20">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Why Your Url Live</p>
            <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Everything a small business needs. Nothing it doesn't.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A focused micro-page that converts visitors into website traffic — without the bloat of a full website builder.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Smartphone, title: "Mobile-first design", desc: "Pixel-perfect on every phone. Loads instantly so visitors never bounce." },
              { icon: MousePointerClick, title: "One bold CTA", desc: "A single, unmissable button drives every visitor straight to your real website." },
              { icon: BarChart3, title: "Built-in click tracking", desc: "See exactly how many people are tapping your link from your dashboard." },
            ].map(({ icon: Icon, title, desc }) => (
              <article key={title} className="rounded-2xl border bg-card p-6 shadow-soft transition-smooth hover:shadow-elegant">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y bg-card/40">
          <div className="container py-20">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
              <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
                Live in three steps
              </h2>
            </div>
            <ol className="grid gap-6 md:grid-cols-3">
              {[
                { n: "01", t: "Fill the form", d: "Business name, website URL, optional tagline and logo. Takes under a minute." },
                { n: "02", t: "Get your link", d: "We generate yoururl.live/yourbusiness instantly. Copy, share, done." },
                { n: "03", t: "Track the clicks", d: "Sign in to your dashboard to edit the page and watch your visit count grow." },
              ].map((s) => (
                <li key={s.n} className="rounded-2xl border bg-card p-6 shadow-soft">
                  <div className="inline-block bg-gradient-primary bg-clip-text pb-1 font-mono text-3xl font-bold text-transparent">{s.n}</div>
                  <h3 className="mt-3 text-xl font-bold">{s.t}</h3>
                  <p className="mt-2 text-muted-foreground">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Host your site — subdomain hosting */}
        <section id="hosting" className="container scroll-mt-20 py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-primary shadow-soft">
                <Globe className="h-3.5 w-3.5" /> New · Free subdomain hosting
              </div>
              <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
                Host your full website on{" "}
                <span className="inline-block break-all bg-gradient-primary bg-clip-text pb-1 text-transparent">yourname.yoururl.live</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Just like GitHub Pages — but easier. Get a free dedicated subdomain to host your static site,
                portfolio, landing page, or docs. SSL included. No server setup.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  { icon: Upload, t: "Upload your site files", d: "HTML, CSS, JS, images — drop a folder and we serve it." },
                  { icon: ShieldCheck, t: "Personally reviewed", d: "Our team manually reviews every request to keep the platform clean and safe." },
                  { icon: Zap, t: "Instant access once approved", d: "Most requests reviewed within 24 hours. Then deploy as often as you want." },
                ].map(({ icon: Icon, t, d }) => (
                  <li key={t} className="flex gap-3">
                    <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold">{t}</p>
                      <p className="text-sm text-muted-foreground">{d}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-gradient-primary shadow-elegant">
                    Request hosting access <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#faq">
                  <Button size="lg" variant="outline">How it works</Button>
                </a>
              </div>
            </div>

            {/* Mock browser */}
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-mesh blur-2xl" />
              <div className="overflow-hidden rounded-2xl border bg-card shadow-elegant">
                <div className="flex items-center gap-2 border-b bg-secondary/60 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-destructive/70" />
                    <span className="h-3 w-3 rounded-full bg-primary/40" />
                    <span className="h-3 w-3 rounded-full bg-primary/70" />
                  </div>
                  <div className="ml-2 flex-1 truncate rounded-md bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    https://yourname.yoururl.live
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  <div className="h-6 w-2/3 rounded-md bg-gradient-primary" />
                  <div className="h-3 w-full rounded bg-secondary" />
                  <div className="h-3 w-5/6 rounded bg-secondary" />
                  <div className="h-3 w-4/6 rounded bg-secondary" />
                  <div className="grid grid-cols-3 gap-3 pt-3">
                    <div className="aspect-square rounded-lg bg-accent" />
                    <div className="aspect-square rounded-lg bg-secondary" />
                    <div className="aspect-square rounded-lg bg-accent" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    <ShieldCheck className="h-3 w-3" /> SSL secured
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="container scroll-mt-20 py-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
              <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
                Frequently asked questions
              </h2>
            </div>
            <Accordion type="single" collapsible className="rounded-2xl border bg-card px-6 shadow-soft">
              {FAQS.map((f, i) => (
                <AccordionItem key={f.q} value={`item-${i}`} className="border-b last:border-b-0">
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container pb-20">
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-primary p-10 text-center text-primary-foreground shadow-elegant md:p-16">
            <div className="absolute inset-0 -z-0 bg-mesh opacity-20" />
            <h2 className="relative text-balance text-3xl font-bold tracking-tight md:text-5xl">
              Your free business page is one minute away.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-base opacity-90 md:text-lg">
              Join the small businesses using Your Url Live to turn every link into a customer.
            </p>
            <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <Button size="lg" variant="secondary" className="relative mt-8 font-semibold">
                Create my free page <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t">
          <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row">
            <div className="flex items-center gap-2">
              <img src={logo} alt="" width={20} height={20} className="h-5 w-5 rounded-md" loading="lazy" />
              <span>© {new Date().getFullYear()} Your Url Live · Made for small businesses</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Footer">
              <a href="#features" className="hover:text-foreground">Features</a>
              <a href="#hosting" className="hover:text-foreground">Hosting</a>
              <a href="#faq" className="hover:text-foreground">FAQ</a>
              <Link to="/about" className="hover:text-foreground">About</Link>
              <Link to="/contact" className="hover:text-foreground">Contact</Link>
              <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground">Terms</Link>
              <Link to="/dashboard" className="hover:text-foreground">Sign in</Link>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
