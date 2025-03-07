import { cn } from "@/lib/utils";
import { IconAlertCircle } from "@tabler/icons-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
      <div className="container px-4 py-12 mx-auto max-w-md">
        <div
          className={cn("glass rounded-2xl p-8 text-center", "animate-fade-in")}
        >
          <div className="flex justify-center">
            <div
              className={cn(
                "rounded-full p-3",
                "bg-destructive/10 text-destructive"
              )}
            >
              <IconAlertCircle className="h-8 w-8" />
            </div>
          </div>

          <h1 className="mt-4 text-3xl font-bold">404</h1>
          <p className="mt-2 text-xl text-muted-foreground">Page not found</p>

          <p className="mt-4 text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Link
            to="/"
            className={cn(
              "mt-6 inline-flex items-center justify-center",
              "rounded-xl px-5 py-2.5",
              "text-sm font-medium",
              "transition-all duration-200 ease-out",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "focus:outline-none focus:ring-2 focus:ring-primary/20"
            )}
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
