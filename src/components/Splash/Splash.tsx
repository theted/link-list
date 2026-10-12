import { useState } from "react";
import { motion } from "motion/react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/AuthProvider";
import { authenticate } from "@/helpers";
import { Wordmark } from "@/components/Wordmark";
import { PasteDemo } from "./PasteDemo";

const prefersDark = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

export const Splash = () => {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleCredential = async (credential?: string) => {
    setError(null);
    try {
      const data = await authenticate(credential);
      if (!data.token) throw new Error(data.message);
      signIn(data.token, data.payload);
    } catch {
      setError("Google sign-in didn't go through. Try again.");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto w-full max-w-6xl px-6 pt-6 sm:px-10">
        <Wordmark />
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-14 px-6 py-14 sm:px-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:py-10">
        <section>
          <h1 className="display text-[clamp(3.1rem,7.2vw,5.6rem)] leading-[1.02]">
            <motion.span
              className="underline-link"
              initial={{ backgroundSize: "0% 0.085em" }}
              animate={{ backgroundSize: "100% 0.085em" }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            >
              Save links.
              <br />
              Find them again.
            </motion.span>
          </h1>

          <p className="mt-9 max-w-[36ch] text-base text-ink-soft">
            Paste a web address and link-list saves it under the page's own
            title, in a category of your choosing. Your list is yours alone.
          </p>

          {/* Google's button is a transparent iframe: in a dark color-scheme
              the browser paints it white unless it's told light */}
          <div className="mt-10 flex min-h-11 items-center [color-scheme:light]">
            <GoogleLogin
              onSuccess={({ credential }) => handleCredential(credential)}
              onError={() => setError("Google sign-in didn't go through. Try again.")}
              theme={prefersDark() ? "filled_black" : "outline"}
              shape="pill"
              size="large"
              text="continue_with"
            />
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-danger">
              {error}
            </p>
          )}
          <p className="mt-5 max-w-[42ch] text-xs text-ink-soft">
            Signing in shares your Google name, email address and profile
            picture with link-list, and nothing else.
          </p>
        </section>

        <PasteDemo />
      </main>
    </div>
  );
};
