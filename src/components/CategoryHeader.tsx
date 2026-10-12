import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Pencil, Trash2 } from "lucide-react";
import { Category, useDeleteCategory, useRenameCategory } from "@/api";
import { useToast } from "@/components/Toasts";

const headingClass = "condensed text-2xl font-extrabold tracking-[-0.025em]";
const iconButton =
  "grid size-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-surface hover:text-ink";

type Props = { category: Category | null; count: number };

export const CategoryHeader = ({ category, count }: Props) => {
  const navigate = useNavigate();
  const toast = useToast();
  const renameCategory = useRenameCategory();
  const deleteCategory = useDeleteCategory();
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!category) {
    return <h1 className={headingClass}>All links</h1>;
  }

  const rename = (name: string) => {
    setRenaming(false);
    if (name.trim() && name.trim() !== category.name) {
      renameCategory.mutate(
        { id: category.id, name },
        { onError: (err) => toast({ message: err.message }) }
      );
    }
  };

  const remove = () => {
    deleteCategory.mutate(category.id, {
      onSuccess: () => {
        navigate("/");
        toast({ message: `Deleted ${category.name}` });
      },
      onError: (err) => toast({ message: `Couldn't delete the category: ${err.message}` }),
    });
  };

  const links = count === 1 ? "1 link" : `${count} links`;

  return (
    <div>
      <div className="flex min-h-10 items-center gap-2">
        {renaming ? (
          <input
            autoFocus
            defaultValue={category.name}
            maxLength={64}
            aria-label="Category name"
            onKeyDown={(e) => {
              if (e.key === "Enter") rename(e.currentTarget.value);
              if (e.key === "Escape") setRenaming(false);
            }}
            onBlur={(e) => rename(e.currentTarget.value)}
            className={`${headingClass} -mx-2 min-w-0 flex-1 rounded-lg bg-surface px-2 outline-none ring-2 ring-link/40`}
          />
        ) : (
          <h1 className={`${headingClass} min-w-0 truncate`}>{category.name}</h1>
        )}
        {!renaming && (
          <div className="ml-1 flex shrink-0 items-center">
            <button type="button" className={iconButton} aria-label="Rename category" title="Rename" onClick={() => setRenaming(true)}>
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              className={`${iconButton} hover:text-danger`}
              aria-label="Delete category"
              title="Delete"
              aria-expanded={confirming}
              onClick={() => setConfirming((c) => !c)}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {confirming && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 45 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-3 pl-4">
              <p className="mr-auto">
                {`Delete ${category.name}${count > 0 ? ` and its ${links}` : ""}? This can't be undone.`}
              </p>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="h-9 rounded-xl px-3 font-semibold transition-colors hover:bg-surface"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={remove}
                disabled={deleteCategory.isPending}
                className="h-9 rounded-xl bg-danger px-4 font-semibold text-paper transition-[filter] hover:brightness-110 disabled:opacity-60"
              >
                Delete category
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
