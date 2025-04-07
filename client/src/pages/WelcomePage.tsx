import Logo from "@/components/Logo";
import { ModeToggle } from "@/components/dashboard/ModeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { NavLink } from "react-router-dom";

export default function WelcomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-background via-muted/30 to-muted p-6">
      {/* Header: Dark mode toggle */}
      <div className="flex justify-end">
        <ModeToggle isIcon={true} />
      </div>

      {/* Main content */}
      <main className="flex flex-col items-center justify-center flex-grow text-center gap-10 mt-10">
        <div className="flex flex-col items-center gap-6">
          <Logo size="lg" className="animate-slide-from-left" />
          <h1 className="text-4xl sm:text-5xl font-bold text-primary animate-slide-from-right">
            Welcome to <span className="text-accent">Selfie</span>!
          </h1>
        </div>

        <div className="w-full max-w-md mx-auto px-4">
          {user === undefined ? (
            <h3 className="text-base sm:text-lg my-3 text-muted-foreground">
              To use the app, first{" "}
              <span className="font-semibold text-foreground">Log in</span> as a user
            </h3>
          ) : (
            <h3 className="text-base sm:text-lg my-3 text-muted-foreground">
              Please continue to the app
            </h3>
          )}

          {/* Buttons */}
          {user === undefined ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Button asChild className="w-full sm:w-auto px-6 py-3 text-lg">
                <NavLink to="/login">Login</NavLink>
              </Button>
              <span className="text-sm text-muted-foreground sm:hidden">or</span>
              <Button
                variant="outline"
                asChild
                className="w-full sm:w-auto px-6 py-3 text-lg"
              >
                <NavLink to="/signup">Sign up</NavLink>
              </Button>
            </div>
          ) : (
            <div className="flex justify-center mt-6">
              <Button asChild className="px-6 py-3 text-lg">
                <NavLink to="/home">Go to Home</NavLink>
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-xs text-muted-foreground text-center mt-10 mb-4">
        Logo provided by{" "}
        <a
          className="underline hover:text-primary transition-colors"
          href="https://www.looka.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          looka.com
        </a>
      </footer>
    </div>
  );
}
