import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { isTyping } from "@/helpers";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export const SearchField = ({ value, onChange, className }: Props) => {
  const ref = useRef<HTMLInputElement>(null);

  // "/" jumps to search from anywhere that isn't already a text field
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && !isTyping(event.target)) {
        event.preventDefault();
        ref.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <label className={cn("relative flex items-center", className)}>
      <span className="sr-only">Search links</span>
      <Search className="pointer-events-none absolute left-3.5 size-4 text-ink-soft" aria-hidden />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onChange("");
            ref.current?.blur();
          }
        }}
        placeholder="Search links"
        className="peer h-10 w-full rounded-full border border-rule bg-surface pl-10 pr-10 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-ink-soft focus:border-link focus:ring-4 focus:ring-link/15 [&::-webkit-search-cancel-button]:hidden"
      />
      <kbd className="pointer-events-none absolute right-3.5 hidden rounded border border-rule px-1.5 text-xs text-ink-soft peer-focus:invisible sm:block">
        /
      </kbd>
    </label>
  );
};
