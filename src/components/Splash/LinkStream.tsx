import { Favicon } from "@/components/Favicon";
import { cn } from "@/lib/utils";

type Saved = { domain: string; title: string; visited?: boolean };

const ROWS: Saved[][] = [
  [
    { domain: "every-layout.dev", title: "Relearn CSS layout: Every Layout" },
    { domain: "seriouseats.com", title: "The Food Lab's Guide to Sous Vide Steak", visited: true },
    { domain: "news.ycombinator.com", title: "Hacker News" },
    { domain: "arxiv.org", title: "Attention Is All You Need", visited: true },
    { domain: "svd.se", title: "Svenska Dagbladet" },
    { domain: "css-tricks.com", title: "A Complete Guide to CSS Grid", visited: true },
    { domain: "github.com", title: "drizzle-team/drizzle-orm" },
    { domain: "web.dev", title: "Learn Accessibility" },
  ],
  [
    { domain: "en.wikipedia.org", title: "Hyperlink – Wikipedia", visited: true },
    { domain: "vite.dev", title: "Getting Started | Vite" },
    { domain: "smashingmagazine.com", title: "Smashing Magazine" },
    { domain: "youtube.com", title: "How to Make a Perfect French Omelette", visited: true },
    { domain: "figma.com", title: "Auto layout – Figma Learn" },
    { domain: "developer.mozilla.org", title: "Using CSS transitions – MDN", visited: true },
    { domain: "dn.se", title: "Dagens Nyheter" },
    { domain: "a11yproject.com", title: "The A11Y Project" },
  ],
];

const Chip = ({ domain, title, visited }: Saved) => (
  <li className="flex shrink-0 items-center gap-2 rounded-full border border-rule bg-surface/70 py-1.5 pl-2 pr-4">
    <Favicon domain={domain} className="size-4 [&_img]:size-4" />
    <span className={cn("whitespace-nowrap text-sm font-semibold", visited ? "text-visited" : "text-link")}>
      {title}
    </span>
  </li>
);

// Other people's lists drifting past. Decoration, so hidden from assistive tech.
export const LinkStream = () => (
  <div
    aria-hidden
    className="space-y-3 overflow-hidden py-2 opacity-70 transition-opacity duration-500 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] hover:opacity-100"
  >
    {ROWS.map((row, i) => (
      <ul
        key={i}
        className="drift flex w-max gap-3"
        style={{
          ["--drift-duration" as string]: i === 0 ? "80s" : "95s",
          animationDirection: i === 0 ? "normal" : "reverse",
        }}
      >
        {/* Twice over, so sliding by half loops without a seam */}
        {[...row, ...row].map((saved, j) => (
          <Chip key={j} {...saved} />
        ))}
      </ul>
    ))}
  </div>
);
