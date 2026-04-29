import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-hero px-6 text-center">
    <h1 className="text-6xl font-bold tracking-tight">404</h1>
    <p className="text-muted-foreground">This page doesn't exist.</p>
    <Link to="/">
      <Button>Back home</Button>
    </Link>
  </div>
);

export default NotFound;
