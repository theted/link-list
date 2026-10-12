import { useMemo, useState } from "react";
import { NavLink, useMatch, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useAddCategory, useCategories, useLinks } from "@/api";
import { Count } from "@/components/Count";
import { cn } from "@/lib/utils";

const NewCategory = () => {
  const navigate = useNavigate();
  const addCategory = useAddCategory();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setError(null);
  };

  const create = async (name: string) => {
    if (!name.trim()) return close();
    try {
      const category = await addCategory.mutateAsync(name);
      close();
      navigate(`/categories/${category.id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    // No exit animation to wait for: the input must exist the moment it's
    // clicked, or the first keystrokes are lost
    open ? (
      <motion.form
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.12 }}
        onSubmit={(e) => {
          e.preventDefault();
          create(new FormData(e.currentTarget).get("name") as string);
        }}
        className="min-w-44"
      >
        <input
          name="name"
          autoFocus
          maxLength={64}
          placeholder="Category name"
          disabled={addCategory.isPending}
          onKeyDown={(e) => e.key === "Escape" && close()}
          onBlur={(e) => !e.currentTarget.value.trim() && close()}
          className="h-9 w-full rounded-lg border border-link bg-surface px-3 text-sm outline-none ring-4 ring-link/15"
        />
        {error && <p className="mt-1 px-1 text-xs text-danger">{error}</p>}
      </motion.form>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-ink-soft transition-colors hover:bg-surface hover:text-ink"
      >
        <Plus className="size-4" aria-hidden />
        New category
      </button>
    )
  );
};

export const CategoryNav = () => {
  const { data: links = [] } = useLinks();
  const { data: categories = [] } = useCategories();
  const match = useMatch("/categories/:id");
  const activeId = match ? Number(match.params.id) : null;

  const counts = useMemo(() => {
    const byCategory = new Map<number, number>();
    for (const link of links) {
      if (link.categoryId !== null) {
        byCategory.set(
          link.categoryId,
          (byCategory.get(link.categoryId) ?? 0) + 1,
        );
      }
    }
    return byCategory;
  }, [links]);

  const items = [
    {
      key: "all",
      to: "/",
      label: "All links",
      count: links.length,
      active: activeId === null,
    },
    ...categories.map((c) => ({
      key: String(c.id),
      to: `/categories/${c.id}`,
      label: c.name,
      count: counts.get(c.id) ?? 0,
      active: activeId === c.id,
    })),
  ];

  return (
    <nav
      aria-label="Categories"
      className="-mx-4 border-b border-rule px-4 md:sticky md:top-16 md:mx-0 md:self-start md:border-0 md:px-0 md:pt-8"
    >
      {/* On phones the categories scroll sideways; the fade says there's more */}
      <ul className="flex items-center gap-1 overflow-x-auto py-2 [mask-image:linear-gradient(to_right,black_85%,transparent)] [scrollbar-width:none] md:flex-col md:items-stretch md:overflow-visible md:py-0 md:[mask-image:none]">
        {items.map((item) => (
          <li key={item.key} className="shrink-0">
            <NavLink
              to={item.to}
              end
              className={cn(
                "flex h-9 items-center gap-4 rounded-lg px-3 transition-colors hover:bg-surface",
                item.active
                  ? "font-semibold text-ink"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              {/* The underline sits outside the truncating span, which would clip it */}
              <span className="relative min-w-0">
                <span className="block truncate">{item.label}</span>
                {item.active && (
                  <motion.span
                    layoutId="nav-underline"
                    transition={{ type: "spring", stiffness: 650, damping: 42 }}
                    className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-link"
                  />
                )}
              </span>
              <Count value={item.count} className="ml-auto" />
            </NavLink>
          </li>
        ))}
        <li className="shrink-0 md:mt-2">
          <NewCategory />
        </li>
      </ul>
    </nav>
  );
};
