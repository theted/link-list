import { useEffect, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useAuth } from "@/AuthProvider";
import { authenticate } from "@/helpers";
import { Wordmark } from "@/components/Wordmark";
import { DeepMesh } from "./DeepMesh";
import { GoogleButton } from "./GoogleButton";
import { PasteDemo } from "./PasteDemo";

const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 30 } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const LINES = ["Save links.", "Find them again."];

export const Splash = () => {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // index.html sinks the page into deep water before first paint; this keeps
  // it there after signing out, and lets the app surface after signing in
  useEffect(() => {
    document.documentElement.classList.add("deep");
    return () => document.documentElement.classList.remove("deep");
  }, []);

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
    <div className="isolate flex min-h-dvh flex-col overflow-x-clip pb-6">
      <DeepMesh />
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto w-full max-w-6xl px-6 pt-6 sm:px-10"
      >
        <Wordmark />
      </motion.header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-14 px-6 py-14 sm:px-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:py-10">
        <motion.section variants={stagger} initial="hidden" animate="show">
          <h1 className="display text-[clamp(3.1rem,7.2vw,5.6rem)] leading-[1.02]">
            {LINES.map((line, i) => (
              <motion.span key={line} variants={rise} className="block">
                {/* Each line draws its underline in turn, and turns visited
                    violet under the pointer, like a link that's been opened */}
                <motion.span
                  className="underline-link hover:underline-visited"
                  initial={{ backgroundSize: "0% 0.085em" }}
                  animate={{ backgroundSize: "100% 0.085em" }}
                  transition={{ delay: 0.45 + i * 0.18, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {line}
                </motion.span>
              </motion.span>
            ))}
          </h1>

          <motion.p variants={rise} className="mt-9 max-w-[36ch] text-base text-ink-soft">
            Paste a web address and link-list saves it under the page's own
            title, in a category of your choosing. Your list is yours alone.
          </motion.p>

          <motion.div variants={rise} className="mt-10">
            <GoogleButton
              onCredential={handleCredential}
              onError={() => setError("Google sign-in didn't go through. Try again.")}
            />
          </motion.div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-danger">
              {error}
            </p>
          )}
          <motion.p variants={rise} className="mt-5 max-w-[42ch] text-xs text-ink-soft">
            Signing in shares your Google name, email address and profile
            picture with link-list, and nothing else.
          </motion.p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 32, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.25 }}
          className="w-full max-w-xl justify-self-center lg:justify-self-end"
        >
          <PasteDemo />
        </motion.div>
      </main>
    </div>
  );
};
