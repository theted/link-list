import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = { domain: string; className?: string };

// Google's favicon service, with the domain's first letter as the fallback.
// The icon fades in over a tinted tile instead of popping in when it arrives.
export const Favicon = ({ domain, className }: Props) => {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");

  if (state === "failed" || !domain.includes(".")) {
    return (
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-[5px] bg-link/10 text-[0.7rem] font-bold uppercase text-link",
          className
        )}
      >
        {domain[0]}
      </span>
    );
  }

  return (
    <span className={cn("relative size-5 shrink-0 rounded-[5px] bg-rule/60", className)}>
      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
        alt=""
        width={20}
        height={20}
        loading="lazy"
        onLoad={() => setState("loaded")}
        onError={() => setState("failed")}
        className={cn(
          "size-5 rounded-[5px] transition-opacity duration-300",
          state === "loaded" ? "opacity-100" : "opacity-0"
        )}
      />
    </span>
  );
};
