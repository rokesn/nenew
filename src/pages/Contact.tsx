import SiteLayout from "@/components/SiteLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, Twitter } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Thanks! We'll reply within 24 hours.");
      (e.target as HTMLFormElement).reset();
    }, 600);
  };

  return (
    <SiteLayout>
      <SEO
        title="Contact — Your Url Live"
        description="Get in touch with the Your Url Live team. Support, partnerships, hosting requests, and feedback welcome."
        canonical="https://yoururl.live/contact"
      />
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</p>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Let's talk</h1>
          <p className="text-lg text-muted-foreground">
            Questions, feedback, or hosting requests? We read every message and reply within 24 hours.
          </p>

          <ul className="space-y-4 pt-2">
            {[
              { icon: Mail, t: "Email", d: "hello@yoururl.live" },
              { icon: MessageCircle, t: "Support", d: "support@yoururl.live" },
              { icon: Twitter, t: "Social", d: "@yoururllive" },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex gap-3">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="text-sm text-muted-foreground">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border bg-card p-6 shadow-elegant md:p-8">
          <h2 className="text-2xl font-bold">Send a message</h2>
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required maxLength={80} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required maxLength={255} />
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" required rows={5} maxLength={2000} />
            </div>
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full bg-gradient-primary shadow-elegant" disabled={loading}>
            {loading ? "Sending..." : "Send message"}
          </Button>
        </form>
      </div>
    </SiteLayout>
  );
};

export default Contact;
