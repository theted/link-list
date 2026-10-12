import { useMemo } from "react";
import { Link as RouterLink, useOutletContext, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useCategories, useLinks } from "@/api";
import { AddLink } from "@/components/AddLink";
import { CategoryHeader } from "@/components/CategoryHeader";
import { LinkRow } from "@/components/LinkRow";
import type { ShellContext } from "@/components/AppShell";

const Skeleton = () => (
  <ul aria-hidden className="mt-8 space-y-1">
    {[72, 55, 64, 48].map((width) => (
      <li key={width} className="flex items-start gap-3 py-3">
        <span className="size-5 animate-pulse rounded-[5px] bg-rule" />
        <span className="flex-1 space-y-2">
          <span className="block h-4 animate-pulse rounded bg-rule" style={{ width: `${width}%` }} />
          <span className="block h-3 w-24 animate-pulse rounded bg-rule/70" />
        </span>
      </li>
    ))}
  </ul>
);

const Empty = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="mt-14 max-w-sm"
  >
    <p className="text-lg font-semibold">{title}</p>
    <p className="mt-1 text-ink-soft">{children}</p>
  </motion.div>
);

export const LinksView = () => {
  const { id } = useParams();
  const { query, setQuery } = useOutletContext<ShellContext>();
  const links = useLinks();
  const categories = useCategories();

  const categoryId = id ? Number(id) : null;
  const category =
    categoryId === null ? null : categories.data?.find((c) => c.id === categoryId);

  const inView = useMemo(
    () =>
      (links.data ?? []).filter(
        (l) => categoryId === null || l.categoryId === categoryId
      ),
    [links.data, categoryId]
  );

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? inView.filter((l) =>
        `${l.title ?? ""} ${l.url}`.toLowerCase().includes(needle)
      )
    : inView;

  if (categoryId !== null && categories.isSuccess && !category) {
    return (
      <Empty title="This category doesn't exist">
        It may have been deleted.{" "}
        <RouterLink to="/" className="font-semibold text-link underline decoration-2 underline-offset-4">
          Show all links
        </RouterLink>
      </Empty>
    );
  }

  if (links.isError || categories.isError) {
    return (
      <Empty title="Your links didn't load">
        {(links.error ?? categories.error)?.message}. Reload the page to try again.
      </Empty>
    );
  }

  return (
    <motion.div
      key={categoryId ?? "all"}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <CategoryHeader category={category ?? null} count={inView.length} />

      <div className="mt-5">
        <AddLink categoryId={categoryId} categoryName={category?.name} />
      </div>

      {needle && (
        <p className="mt-6 text-sm text-ink-soft">
          {visible.length === 1 ? "1 link matches" : `${visible.length} links match`} “{query.trim()}”.{" "}
          <button type="button" onClick={() => setQuery("")} className="font-semibold text-ink underline decoration-link decoration-2 underline-offset-4">
            Clear search
          </button>
        </p>
      )}

      {links.isPending || categories.isPending ? (
        <Skeleton />
      ) : (
        <ul className="mt-4">
          {/* Rows animate in when a view opens, staggered by position */}
          <AnimatePresence>
            {visible.map((link, index) => (
              <LinkRow
                key={link.clientKey ?? link.id}
                index={index}
                link={link}
                categories={categories.data ?? []}
                showCategory={categoryId === null}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {links.isSuccess && !needle && inView.length === 0 && (
        <Empty title={category ? `Nothing in ${category.name} yet` : "No links saved yet"}>
          Paste a link into the field above, or anywhere on this page, and it's
          saved with the page's title.
        </Empty>
      )}
    </motion.div>
  );
};
