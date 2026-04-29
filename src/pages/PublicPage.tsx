import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ensureUrl } from "@/lib/slug";
import SEO from "@/components/SEO";

type Business = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  website_url: string;
  button_text: string;
  logo_url: string | null;
};

const PublicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!slug) return;
      const { data } = await supabase
        .from("businesses")
        .select("id, slug, name, tagline, website_url, button_text, logo_url")
        .eq("slug", slug)
        .maybeSingle();
      if (!mounted) return;
      if (!data) setNotFound(true);
      else setBusiness(data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  // SEO handled via <SEO /> component below

  async function handleVisit() {
    if (!business) return;
    // fire and forget
    supabase.from("page_visits").insert({ business_id: business.id }).then(() => {});
    window.location.href = ensureUrl(business.website_url);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero">
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-hero px-6 text-center">
        <SEO title="Page not found · Your Url Live" description="This business page does not exist on Your Url Live." noindex />
        <h1 className="text-4xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">No business page exists at this link.</p>
        <Link to="/">
          <Button>Create your own page</Button>
        </Link>
      </div>
    );
  }

  const canonical = `https://yoururl.live/${business.slug}`;
  const description = business.tagline
    ? `${business.name} — ${business.tagline}. Visit the official website.`
    : `${business.name}. Visit the official website of ${business.name}.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.tagline ?? undefined,
    url: ensureUrl(business.website_url),
    image: business.logo_url ?? undefined,
    sameAs: [ensureUrl(business.website_url)],
  };

  return (
    <div className="flex min-h-screen flex-col bg-hero">
      <SEO
        title={`${business.name}${business.tagline ? " — " + business.tagline : ""}`}
        description={description}
        canonical={canonical}
        ogImage={business.logo_url ?? "https://yoururl.live/favicon.png"}
        jsonLd={jsonLd}
      />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <article className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border bg-card shadow-elegant">
            {business.logo_url ? (
              <img src={business.logo_url} alt={`${business.name} logo`} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
            )}
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            {business.name}
          </h1>
          {business.tagline && (
            <p className="mx-auto mt-3 max-w-sm text-balance text-lg text-muted-foreground">
              {business.tagline}
            </p>
          )}

          <Button
            onClick={handleVisit}
            size="lg"
            className="mt-10 h-14 w-full bg-gradient-primary text-base font-semibold shadow-elegant transition-smooth hover:shadow-glow"
          >
            {business.button_text}
            <ArrowUpRight className="ml-1 h-5 w-5" />
          </Button>
        </article>
      </main>

      <footer className="pb-8 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground hover:underline">
          Powered by Your Url Live ⚡
        </Link>
      </footer>
    </div>
  );
};

export default PublicPage;
