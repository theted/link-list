import React, { useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type Toast = {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
};

type ShowToast = (toast: Omit<Toast, "id">) => void;

const ToastContext = React.createContext<ShowToast>(() => {});

const DURATION = 6000;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ShowToast>(
    (toast) => {
      const id = ++nextId.current;
      // Newest first, and never more than three on screen
      setToasts((all) => [{ ...toast, id }, ...all].slice(0, 3));
      setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
              className="pointer-events-auto flex items-center gap-4 rounded-full bg-ink py-2 pl-5 pr-2 text-sm text-paper shadow-[0_8px_30px_rgb(var(--ink)/0.25)]"
            >
              <span>{toast.message}</span>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.run();
                    dismiss(toast.id);
                  }}
                  className="rounded-full px-3 py-1 font-semibold text-paper underline decoration-link decoration-2 underline-offset-4 transition-colors hover:bg-paper/10"
                >
                  {toast.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
