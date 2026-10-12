import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link2 } from "lucide-react";
import { addLinkVariables, useAddLink, useLinks } from "@/api";
import { isTyping, normalizeUrl } from "@/helpers";

type Props = { categoryId: number | null; categoryName?: string };

export const AddLink = ({ categoryId, categoryName }: Props) => {
  const addLink = useAddLink();
  const { data: links = [] } = useLinks();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const save = (raw: string) => {
    const url = normalizeUrl(raw);

    if (!url) {
      setError("That doesn't look like a web address.");
      return;
    }

    if (links.some((l) => l.url === url && l.categoryId === categoryId)) {
      setError(categoryName ? `That link is already in ${categoryName}.` : "That link is already saved.");
      return;
    }

    setError(null);
    setValue("");
    addLink.mutate(addLinkVariables({ url, category: categoryId }), {
      onError: (err) => {
        setValue(raw);
        setError(err.message);
      },
    });
  };

  // Pasting a URL anywhere on the page saves it, without clicking the field first
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (isTyping(event.target)) return;
      const text = event.clipboardData?.getData("text") ?? "";
      if (normalizeUrl(text)) {
        event.preventDefault();
        saveRef.current(text);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) save(value);
      }}
    >
      <label className="flex h-14 items-center gap-3 rounded-2xl border border-rule bg-surface pl-4 pr-2 transition-[border-color,box-shadow] duration-150 focus-within:border-link focus-within:ring-4 focus-within:ring-link/15">
        <Link2 className="size-5 shrink-0 text-ink-soft" aria-hidden />
        <span className="sr-only">Link to save</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          inputMode="url"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={categoryName ? `Paste a link to save in ${categoryName}` : "Paste a link to save it"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "add-link-error" : undefined}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-soft"
        />
        <AnimatePresence initial={false}>
          {value.trim() && (
            <motion.button
              type="submit"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
              transition={{ type: "spring", stiffness: 700, damping: 35 }}
              className="h-10 shrink-0 rounded-xl bg-link px-4 font-semibold text-paper transition-[filter] hover:brightness-110 active:brightness-95"
            >
              Save
            </motion.button>
          )}
        </AnimatePresence>
      </label>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id="add-link-error"
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden px-4 pt-2 text-sm text-danger"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
};
