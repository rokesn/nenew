import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const SiteLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-hero">
      <header className="container flex items-center justify-between py-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg" aria-label="Your Url Live home">
          <img src={logo} alt="Your Url Live logo" width={32} height={32} className="h-8 w-8 rounded-xl shadow-elegant" />
          Your Url Live
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
          <Link to="/about" className="hidden text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground sm:inline px-2">About</Link>
          <Link to="/contact" className="hidden text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground sm:inline px-2">Contact</Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
        </nav>
      </header>

      <main className="container py-10 md:py-16">{children}</main>

      <footer className="border-t mt-10">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" width={20} height={20} className="h-5 w-5 rounded-md" loading="lazy" />
            <span>© {new Date().getFullYear()} Your Url Live</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Footer">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/dashboard" className="hover:text-foreground">Sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default SiteLayout;
