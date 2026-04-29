import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Building2, Copy, ExternalLink, Eye, ImagePlus, LogOut, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ensureUrl } from "@/lib/slug";
import type { Session } from "@supabase/supabase-js";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";

type Business = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  tagline: string | null;
  website_url: string;
  button_text: string;
  logo_url: string | null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authLoading, setAuthLoading] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [visitCount, setVisitCount] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auth state
  useEffect(() => {
    document.title = "Dashboard · Your Url Live";
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load business + visits
  useEffect(() => {
    if (!session) {
      setBusiness(null);
      return;
    }
    (async () => {
      const { data: b } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", session.user.id)
        .maybeSingle();
      setBusiness(b as Business | null);
      if (b) {
        const { count } = await supabase
          .from("page_visits")
          .select("*", { count: "exact", head: true })
          .eq("business_id", b.id);
        setVisitCount(count ?? 0);
      }
    })();
  }, [session]);

  async function handleAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    if (!email || password.length < 8) {
      toast.error("Enter a valid email and 8+ char password");
      return;
    }
    setAuthLoading(true);
    try {
      if (authMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) toast.error(error.message);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) toast.error(error.message);
        else toast.success("Account created — go to the homepage to set up your page");
      }
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!business) return;
    const fd = new FormData(e.currentTarget);
    const update = {
      name: String(fd.get("name") || "").trim().slice(0, 80),
      tagline: String(fd.get("tagline") || "").trim().slice(0, 140) || null,
      website_url: ensureUrl(String(fd.get("website_url") || "").trim().slice(0, 300)),
      button_text: String(fd.get("button_text") || "").trim().slice(0, 40) || "Visit Our Website",
    };
    if (!update.name || !update.website_url) {
      toast.error("Name and website are required");
      return;
    }
    setSaving(true);
    const { error, data } = await supabase
      .from("businesses")
      .update(update)
      .eq("id", business.id)
      .select()
      .maybeSingle();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) setBusiness(data as Business);
    toast.success("Saved");
  }

  async function handleLogo(file: File) {
    if (!business || !session) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    setLogoUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${session.user.id}/logo.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      toast.error(upErr.message);
      setLogoUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from("logos").getPublicUrl(path);
    const cacheBusted = `${pub.publicUrl}?t=${Date.now()}`;
    const { data, error } = await supabase
      .from("businesses")
      .update({ logo_url: cacheBusted })
      .eq("id", business.id)
      .select()
      .maybeSingle();
    setLogoUploading(false);
    if (error) toast.error(error.message);
    else if (data) {
      setBusiness(data as Business);
      toast.success("Logo updated");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  // ---- Auth screen ----
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero px-6">
        <SEO
          title={authMode === "signin" ? "Sign in · Your Url Live dashboard" : "Create your Your Url Live account"}
          description="Sign in to your Your Url Live dashboard to edit your free business page, update your logo and tagline, and track your visit clicks."
          canonical="https://yoururl.live/dashboard"
          noindex
        />
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-bold text-lg" aria-label="Your Url Live home">
            <img src={logo} alt="Your Url Live logo" width={32} height={32} className="h-8 w-8 rounded-xl shadow-elegant" />
            Your Url Live
          </Link>
          <form onSubmit={handleAuth} className="rounded-3xl border bg-card p-8 shadow-elegant">
            <h1 className="text-2xl font-bold">{authMode === "signin" ? "Welcome back" : "Create account"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {authMode === "signin" ? "Sign in to manage your page" : "Sign up, then create a page from the homepage"}
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required maxLength={255} />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required minLength={8} maxLength={72} />
              </div>
            </div>
            <Button type="submit" size="lg" className="mt-6 w-full bg-gradient-primary" disabled={authLoading}>
              {authLoading ? "..." : authMode === "signin" ? "Sign in" : "Create account"}
            </Button>
            <button
              type="button"
              onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {authMode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
            <div className="mt-6 border-t pt-4 text-center">
              <Link to="/" className="text-sm font-medium text-primary hover:underline">
                ← Back to homepage
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ---- No business yet ----
  if (!business) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-hero px-6 text-center">
        <h1 className="text-3xl font-bold">No page yet</h1>
        <p className="max-w-md text-muted-foreground">
          You're signed in but haven't created a business page. Head back home to set one up.
        </p>
        <div className="flex gap-3">
          <Link to="/"><Button>Create my page</Button></Link>
          <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
        </div>
      </div>
    );
  }

  const liveUrl = `${window.location.origin}/${business.slug}`;

  // ---- Dashboard ----
  return (
    <div className="min-h-screen bg-secondary/30">
      <SEO
        title={`Dashboard · ${business?.name ?? "Your Url Live"}`}
        description="Manage your Your Url Live business page, update your logo, tagline, button text, and track your visit clicks."
        canonical="https://yoururl.live/dashboard"
        noindex
      />
      <header className="border-b bg-background">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2 font-bold" aria-label="Your Url Live home">
            <img src={logo} alt="Your Url Live logo" width={28} height={28} className="h-7 w-7 rounded-lg" />
            Your Url Live
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-1.5 h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="container py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Your page</h1>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {liveUrl} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(liveUrl);
                toast.success("Link copied");
              }}
            >
              <Copy className="mr-1.5 h-4 w-4" /> Copy link
            </Button>
            <a href={liveUrl} target="_blank" rel="noopener noreferrer">
              <Button><ExternalLink className="mr-1.5 h-4 w-4" /> Open page</Button>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" /> Button clicks
            </div>
            <div className="mt-2 text-4xl font-bold">{visitCount}</div>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <div className="text-sm text-muted-foreground">Slug</div>
            <div className="mt-2 truncate text-lg font-mono font-semibold">/{business.slug}</div>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" /> Live
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* Editor */}
          <form onSubmit={handleSave} className="rounded-2xl border bg-card p-6 shadow-soft md:p-8">
            <h2 className="text-xl font-bold">Edit page</h2>

            {/* Logo */}
            <div className="mt-6">
              <Label>Logo</Label>
              <div className="mt-1.5 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed text-muted-foreground transition-smooth hover:border-primary hover:text-primary"
                >
                  {business.logo_url ? (
                    <img src={business.logo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-5 w-5" />
                  )}
                </button>
                <Button type="button" variant="outline" size="sm" disabled={logoUploading} onClick={() => fileRef.current?.click()}>
                  {logoUploading ? "Uploading..." : business.logo_url ? "Replace logo" : "Upload logo"}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogo(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="name">Business name</Label>
                <Input id="name" name="name" defaultValue={business.name} required maxLength={80} />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Textarea id="tagline" name="tagline" defaultValue={business.tagline ?? ""} maxLength={140} rows={2} />
              </div>
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input id="website_url" name="website_url" defaultValue={business.website_url} required maxLength={300} />
              </div>
              <div>
                <Label htmlFor="button_text">Button text</Label>
                <Input id="button_text" name="button_text" defaultValue={business.button_text} maxLength={40} />
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-6 bg-gradient-primary" disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>

          {/* Live preview */}
          <div>
            <div className="mb-3 text-sm font-semibold text-muted-foreground">Live preview</div>
            <div className="overflow-hidden rounded-3xl border bg-hero shadow-elegant">
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border bg-card shadow-soft">
                  {business.logo_url ? (
                    <img src={business.logo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-9 w-9 text-muted-foreground" strokeWidth={1.5} />
                  )}
                </div>
                <h3 className="text-balance text-2xl font-bold">{business.name}</h3>
                {business.tagline && (
                  <p className="mx-auto mt-2 max-w-xs text-balance text-sm text-muted-foreground">{business.tagline}</p>
                )}
                <div className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant">
                  {business.button_text}
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </div>
                <div className="mt-6 text-xs text-muted-foreground">Powered by Your Url Live ⚡</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
