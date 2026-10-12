import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

// A number that rolls to its new value: up when it grows, down when it shrinks
export const Count = ({ value, className }: { value: number; className?: string }) => (
  <span className={cn("relative inline-grid overflow-hidden text-xs tabular-nums text-ink-soft", className)}>
    <AnimatePresence mode="popLayout" initial={false} custom={value}>
      <motion.span
        key={value}
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 34 }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </span>
);
