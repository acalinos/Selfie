import { useState } from "react";
import { ModeToggle } from "@/components/dashboard/ModeToggle";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import clsx from "clsx";

export default function WelcomePage() {
  const [view, setView] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-muted px-4 py-12 relative">
      {/* Dark mode toggle */}
      <div className="absolute top-4 right-4">
        <ModeToggle isIcon={true} />
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-popover rounded-2xl shadow-lg p-6 flex flex-col">

        {/* Tabs */}
        <div className="flex justify-around border-b border-muted mb-6">
          {["login", "signup"].map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab as "login" | "signup")}
              className={clsx(
                "text-lg font-medium px-4 py-2 transition-colors duration-200",
                view === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "login" ? "Login" : "Signup"}
            </button>
          ))}
        </div>

        {/* Form content */}
        <div className="flex flex-col gap-6">
          {view === "login" && <LoginForm />}
          {view === "signup" && <SignupForm />}
        </div>
      </div>
    </div>
  );
}
