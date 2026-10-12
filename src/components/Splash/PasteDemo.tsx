import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link2 } from "lucide-react";
import { Favicon } from "@/components/Favicon";

type Item = { url: string; title: string; domain: string };

const ITEMS: Item[] = [
  {
    url: "react.dev/learn",
    title: "Quick Start – React",
    domain: "react.dev",
  },
  {
    url: "developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-thickness",
    title: "text-decoration-thickness CSS property - CSS | MDN",
    domain: "developer.mozilla.org",
  },
  {
    url: "joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics",
    title: "A Friendly Introduction to Spring Physics",
    domain: "joshwcomeau.com",
  },
];

type Row = Item & { resolved: boolean };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The app's one trick, acted out once: a URL is pasted and becomes a title
export const PasteDemo = () => {
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (reduceMotion) {
      setRows([...ITEMS].reverse().map((item) => ({ ...item, resolved: true })));
      return;
    }

    let cancelled = false;

    const run = async () => {
      await wait(900);
      for (const item of ITEMS) {
        // A paste lands in a few quick bursts rather than one keystroke at a time
        for (let i = 1; i <= item.url.length; i += 3) {
          if (cancelled) return;
          setTyped(item.url.slice(0, i));
          await wait(16);
        }
        setTyped(item.url);
        await wait(380);
        if (cancelled) return;
        setTyped("");
        setRows((r) => [{ ...item, resolved: false }, ...r]);
        await wait(650);
        if (cancelled) return;
        setRows((r) =>
          r.map((row) => (row.url === item.url ? { ...row, resolved: true } : row))
        );
        await wait(700);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [reduceMotion]);

  return (
    <div
      aria-hidden
      className="relative w-full max-w-xl rounded-[28px] border border-rule bg-surface p-3 shadow-[0_40px_90px_-40px_rgb(var(--ink)/0.35)] sm:p-4"
    >
      <div className="flex h-14 items-center gap-3 rounded-2xl bg-paper px-4">
        <Link2 className="size-5 shrink-0 text-ink-soft" />
        <span className="min-w-0 flex-1 truncate">
          {typed ? (
            <span>{typed}</span>
          ) : (
            <span className="text-ink-soft">Paste a link</span>
          )}
          <span className="ml-px inline-block h-5 w-[2px] translate-y-1 animate-pulse bg-link" />
        </span>
      </div>

      <ul className="mt-2 min-h-[13.5rem]">
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <motion.li
              key={row.url}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 34 }}
              className="flex items-start gap-3 rounded-xl px-3 py-3"
            >
              <Favicon domain={row.domain} className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={row.resolved ? "title" : "url"}
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.25 }}
                    className={
                      row.resolved
                        ? "truncate text-base font-semibold text-link"
                        : "truncate text-base text-ink-soft"
                    }
                  >
                    {row.resolved ? row.title : row.url}
                  </motion.p>
                </AnimatePresence>
                <p className="truncate text-xs text-ink-soft">{row.domain}</p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};
