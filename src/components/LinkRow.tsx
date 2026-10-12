import { forwardRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { FolderInput, Pencil, Trash2 } from "lucide-react";
import {
  addLinkVariables,
  Category,
  Link,
  useAddLink,
  useDeleteLink,
  useUpdateLink,
} from "@/api";
import { displayUrl, domainOf, formatSaved } from "@/helpers";
import { Favicon } from "@/components/Favicon";
import { useToast } from "@/components/Toasts";
import { cn } from "@/lib/utils";

const iconButton =
  "grid size-8 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-paper hover:text-ink";

type Props = {
  link: Link;
  categories: Category[];
  showCategory: boolean;
  // Position in the list, for a short staggered entrance
  index: number;
};

const spring = { type: "spring", stiffness: 560, damping: 38 } as const;

export const LinkRow = forwardRef<HTMLLIElement, Props>(
  ({ link, categories, showCategory, index }, ref) => {
    const toast = useToast();
    const addLink = useAddLink();
    const updateLink = useUpdateLink();
    const deleteLink = useDeleteLink();
    const [editing, setEditing] = useState(false);

    const domain = domainOf(link.url);
    const category = categories.find((c) => c.id === link.categoryId);
    const label = link.title ?? displayUrl(link.url);

    const rename = (value: string) => {
      setEditing(false);
      if (value.trim() !== (link.title ?? "")) {
        updateLink.mutate(
          { id: link.id, title: value },
          { onError: (err) => toast({ message: `Couldn't rename the link: ${err.message}` }) }
        );
      }
    };

    const move = (value: string) => {
      const to = value ? Number(value) : null;
      const from = link.categoryId;
      const target = categories.find((c) => c.id === to);
      updateLink.mutate(
        { id: link.id, category: to },
        { onError: (err) => toast({ message: `Couldn't move the link: ${err.message}` }) }
      );
      toast({
        message: target ? `Moved to ${target.name}` : "Removed from its category",
        action: {
          label: "Undo",
          run: () => updateLink.mutate({ id: link.id, category: from }),
        },
      });
    };

    const remove = () => {
      deleteLink.mutate(link, {
        onError: (err) => toast({ message: `Couldn't delete the link: ${err.message}` }),
      });
      toast({
        message: "Link deleted",
        action: {
          label: "Undo",
          run: () =>
            addLink.mutate(
              addLinkVariables({
                url: link.url,
                title: link.title,
                category: link.categoryId,
              })
            ),
        },
      });
    };

    return (
      <motion.li
        ref={ref}
        layout="position"
        initial={{ opacity: 0, y: -8 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { ...spring, delay: Math.min(index, 12) * 0.03 },
        }}
        exit={{ opacity: 0, x: -12, transition: { duration: 0.14 } }}
        transition={spring}
        className="group relative -mx-3 flex items-start gap-3 rounded-xl px-3 py-3 transition-colors focus-within:bg-surface hover:bg-surface"
      >
        {/* A link added a moment ago glows briefly, so the eye finds it */}
        {link.addedAt !== undefined && Date.now() - link.addedAt < 3000 && (
          <motion.span
            aria-hidden
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 1.4, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 rounded-xl bg-link/10"
          />
        )}
        <Favicon domain={domain} className="mt-[3px]" />

        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              defaultValue={link.title ?? ""}
              placeholder={displayUrl(link.url)}
              maxLength={256}
              aria-label="Link title"
              onKeyDown={(e) => {
                if (e.key === "Enter") rename(e.currentTarget.value);
                if (e.key === "Escape") setEditing(false);
              }}
              onBlur={(e) => rename(e.currentTarget.value)}
              className="-my-0.5 w-full rounded-md bg-paper px-1.5 py-0.5 -mx-1.5 text-base font-semibold outline-none ring-2 ring-link/40"
            />
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.a
                key={link.pending ? "pending" : "saved"}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.22 }}
                className={cn(
                  "line-clamp-2 text-base leading-snug decoration-2 underline-offset-4 [overflow-wrap:anywhere] hover:underline",
                  link.pending
                    ? "animate-pulse text-ink-soft"
                    : "font-semibold text-link visited:text-visited"
                )}
              >
                {link.pending ? displayUrl(link.url) : label}
              </motion.a>
            </AnimatePresence>
          )}
          <p className="flex min-w-0 gap-3 text-xs text-ink-soft">
            <span className="truncate">{domain}</span>
            {showCategory && category && (
              <RouterLink
                to={`/categories/${category.id}`}
                className="shrink-0 transition-colors hover:text-ink"
              >
                in {category.name}
              </RouterLink>
            )}
          </p>
        </div>

        <span className="hidden shrink-0 pt-1 text-xs tabular-nums text-ink-soft sm:block">
          {formatSaved(link.createdAt)}
        </span>

        <div
          className={cn(
            "-my-1 flex shrink-0 items-center opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100",
            link.pending && "invisible"
          )}
        >
          <button type="button" className={iconButton} aria-label="Rename link" title="Rename" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
          </button>
          <label className={cn(iconButton, "relative cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-link")} title="Move to category">
            <FolderInput className="size-4" aria-hidden />
            <select
              aria-label="Move to category"
              value={link.categoryId ?? ""}
              onChange={(e) => move(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={cn(iconButton, "hover:text-danger")} aria-label="Delete link" title="Delete" onClick={remove}>
            <Trash2 className="size-4" />
          </button>
        </div>
      </motion.li>
    );
  }
);
