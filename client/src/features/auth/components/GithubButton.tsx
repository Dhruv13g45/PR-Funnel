import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const GithubButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);

    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: `${window.location.origin}/dashboard`,
      });
    } catch (error) {
      setIsLoading(false);
      console.error("GitHub sign-in failed", error);
    }
  };

  return (
    <Button
      type="button"
      variant="default"
      size="lg"
      className="w-full justify-center bg-white text-slate-950 shadow-lg shadow-slate-950/10 hover:bg-slate-100 hover:cursor-pointer"
      onClick={handleSignIn}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <svg
          viewBox="0 0 24 24"
          className="mr-2 h-5 w-5 animate-spin"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            opacity="0.25"
          />
          <path
            d="M22 12a10 10 0 00-10-10"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="mr-2 h-5 w-5"
          aria-hidden="true"
        >
          <path d="M12 0.297C5.373.297 0 5.67 0 12.297c0 5.292 3.438 9.777 8.205 11.366.6.111.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.76-1.605-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.382 1.235-3.222-.123-.303-.536-1.524.117-3.176 0 0 1.008-.323 3.301 1.23a11.53 11.53 0 0 1 3.005-.404c1.02.005 2.047.138 3.005.404 2.291-1.553 3.297-1.23 3.297-1.23.655 1.653.242 2.874.119 3.176.77.84 1.233 1.912 1.233 3.222 0 4.61-2.804 5.624-5.475 5.921.43.372.814 1.104.814 2.222 0 1.606-.015 2.896-.015 3.287 0 .319.218.694.825.576C20.565 22.07 24 17.587 24 12.297 24 5.67 18.627.297 12 .297z" />
        </svg>
      )}
      {isLoading ? "Redirecting..." : "Continue with GitHub"}
    </Button>
  );
};

export default GithubButton;
