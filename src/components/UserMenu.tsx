import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/AuthProvider";

export const UserMenu = () => {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const initial = (profile?.given_name ?? profile?.name ?? profile?.email ?? "?")[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account"
        onClick={() => setOpen((o) => !o)}
        className="grid size-9 place-items-center overflow-hidden rounded-full bg-link/10 font-bold text-link ring-offset-2 ring-offset-paper transition-shadow hover:ring-2 hover:ring-rule"
      >
        {profile?.picture ? (
          <img src={profile.picture} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          initial
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.1 } }}
            transition={{ type: "spring", stiffness: 600, damping: 36 }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-11 z-40 w-64 rounded-2xl border border-rule bg-surface p-2 shadow-[0_12px_40px_rgb(var(--ink)/0.14)]"
          >
            <div className="px-3 py-2">
              <p className="truncate font-semibold">{profile?.name}</p>
              <p className="truncate text-xs text-ink-soft">{profile?.email}</p>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors hover:bg-paper"
            >
              <LogOut className="size-4 text-ink-soft" aria-hidden />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
