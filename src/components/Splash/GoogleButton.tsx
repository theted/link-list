import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { cn } from "@/lib/utils";

const prefersDark = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

type Props = {
  onCredential: (credential?: string) => void;
  onError: () => void;
};

// Google draws its button in an iframe that arrives a beat after the page.
// Its space is held by a placeholder, and the button fades in once loaded.
export const GoogleButton = ({ onCredential, onError }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fallback = setTimeout(() => setReady(true), 2500);
    const watch = (frame: HTMLIFrameElement) =>
      frame.addEventListener("load", () => setTimeout(() => setReady(true), 120), {
        once: true,
      });

    const observer = new MutationObserver(() => {
      const frame = el.querySelector("iframe");
      if (frame) {
        watch(frame);
        observer.disconnect();
      }
    });
    observer.observe(el, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div className="relative flex h-11 items-center">
      <span
        aria-hidden
        className={cn(
          "absolute left-0 h-10 w-56 rounded-full bg-rule/70 transition-opacity duration-300",
          ready ? "opacity-0" : "animate-pulse"
        )}
      />
      {/* A transparent iframe in a dark color-scheme gets painted white
          unless it's told light */}
      <div
        ref={ref}
        className={cn(
          "relative [color-scheme:light] transition-opacity duration-300",
          ready ? "opacity-100" : "opacity-0"
        )}
      >
        <GoogleLogin
          onSuccess={({ credential }) => onCredential(credential)}
          onError={onError}
          theme={prefersDark() ? "filled_black" : "outline"}
          shape="pill"
          size="large"
          text="continue_with"
        />
      </div>
    </div>
  );
};
