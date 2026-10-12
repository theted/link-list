import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Wordmark = ({ className }: { className?: string }) => (
  <Link
    to="/"
    className={cn(
      "condensed text-lg font-extrabold tracking-[-0.02em] text-ink",
      className
    )}
  >
    <span className="underline-link">link-list</span>
  </Link>
);
