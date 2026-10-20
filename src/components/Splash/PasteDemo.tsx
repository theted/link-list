import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link2 } from "lucide-react";
import { Count } from "@/components/Count";
import { Favicon } from "@/components/Favicon";
import { cn } from "@/lib/utils";

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

const TABS = ["All links", "Reading", "Tools"];
// Links already "saved" in each tab before the demo adds to Reading
const BASE_COUNTS = [12, 4, 8];

type Row = Item & { resolved: boolean };
type Cursor = { x: number; y: number; pressed: boolean; visible: boolean };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const spring = { type: "spring", stiffness: 520, damping: 34 } as const;

// The app's one trick, acted out once: a URL is pasted, becomes a title in
// its category, and is opened, turning visited
export const PasteDemo = () => {
  const reduceMotion = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [typed, setTyped] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [visited, setVisited] = useState<string | null>(null);
  const [cursor, setCursor] = useState<Cursor>({ x: 0, y: 0, pressed: false, visible: false });

  useEffect(() => {
    if (reduceMotion) {
      setRows([...ITEMS].reverse().map((item) => ({ ...item, resolved: true })));
      return;
    }

    let cancelled = false;

    const run = async () => {
      // Park the cursor, still invisible, where it will later appear from
      const parked = panel.current?.getBoundingClientRect();
      if (parked) {
        setCursor((c) => ({ ...c, x: parked.width - 48, y: parked.height - 32 }));
      }
      await wait(1300);
      for (const item of ITEMS) {
        // A paste lands in a few quick bursts rather than one key at a time
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
        await wait(650);
      }

      // Then someone opens the newest one, and it turns visited
      const box = panel.current?.getBoundingClientRect();
      const title = list.current?.querySelector("p")?.getBoundingClientRect();
      if (cancelled || !box || !title) return;

      setCursor((c) => ({ ...c, visible: true }));
      await wait(250);
      setCursor((c) => ({ ...c, x: title.left - box.left + 64, y: title.top - box.top + 8 }));
      await wait(750);
      if (cancelled) return;
      setCursor((c) => ({ ...c, pressed: true }));
      setVisited(ITEMS[ITEMS.length - 1].url);
      await wait(160);
      setCursor((c) => ({ ...c, pressed: false }));
      await wait(900);
      if (cancelled) return;
      setCursor((c) => ({ ...c, visible: false }));
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [reduceMotion]);

  const counts = BASE_COUNTS.map((count, i) => (i === 2 ? count : count + rows.length));

  return (
    <div
      ref={panel}
      aria-hidden
      className="relative w-full max-w-xl select-none rounded-[28px] border border-white/10 bg-surface/60 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_50px_100px_-30px_rgb(1_3_18/0.9)] backdrop-blur-2xl sm:p-4"
    >
      <ul className="mb-3 flex gap-1 px-1">
        {TABS.map((tab, i) => (
          <li
            key={tab}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1 text-sm",
              i === 1 ? "font-semibold text-ink" : "text-ink-soft"
            )}
          >
            <span className={i === 1 ? "underline decoration-link decoration-[3px] underline-offset-[7px]" : ""}>
              {tab}
            </span>
            <Count value={counts[i]} />
          </li>
        ))}
      </ul>

      <div className="flex h-14 items-center gap-3 rounded-2xl bg-paper/55 px-4">
        <Link2 className="size-5 shrink-0 text-ink-soft" />
        <span className="min-w-0 flex-1 truncate">
          {typed ? (
            <span>{typed}</span>
          ) : (
            <span className="text-ink-soft">Paste a link to save in Reading</span>
          )}
          <span className="ml-px inline-block h-5 w-[2px] translate-y-1 animate-pulse bg-link" />
        </span>
      </div>

      <ul ref={list} className="mt-2 min-h-[13.5rem]">
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <motion.li
              key={row.url}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className={cn(
                "flex items-start gap-3 rounded-xl px-3 py-3 transition-colors duration-300",
                visited === row.url && "bg-paper/55"
              )}
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
                    className={cn(
                      "truncate text-base transition-colors duration-500",
                      !row.resolved
                        ? "text-ink-soft"
                        : visited === row.url
                          ? "font-semibold text-visited"
                          : "font-semibold text-link"
                    )}
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

      <motion.svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-0 top-0 size-6 drop-shadow-[0_2px_4px_rgb(var(--ink)/0.3)]"
        initial={false}
        animate={{
          x: cursor.x,
          y: cursor.y,
          opacity: cursor.visible ? 1 : 0,
          scale: cursor.pressed ? 0.82 : 1,
        }}
        transition={{
          x: { type: "spring", stiffness: 120, damping: 20 },
          y: { type: "spring", stiffness: 120, damping: 20 },
          opacity: { duration: 0.2 },
          scale: { duration: 0.12 },
        }}
      >
        <path
          d="M5 3l14 8.2-6.1 1.4-3.4 5.6L5 3z"
          className="fill-ink stroke-surface"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </motion.svg>
    </div>
  );
};
