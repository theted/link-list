import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Wordmark } from "@/components/Wordmark";
import { SearchField } from "@/components/SearchField";
import { UserMenu } from "@/components/UserMenu";
import { CategoryNav } from "@/components/CategoryNav";

export type ShellContext = { query: string; setQuery: (q: string) => void };

export const AppShell = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur-md">
        {/* Same columns as the body below, so search lines up with the list */}
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-8 md:grid-cols-[13rem_minmax(0,1fr)_auto] md:gap-10 lg:grid-cols-[15rem_minmax(0,1fr)_auto] lg:gap-14">
          <Wordmark className="justify-self-start px-0 md:px-3" />
          <SearchField value={query} onChange={setQuery} className="w-full max-w-sm justify-self-end md:justify-self-start" />
          <UserMenu />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-8 md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
        <CategoryNav />
        <main className="min-w-0 pb-28 pt-6 md:pt-8">
          <Outlet context={{ query, setQuery } satisfies ShellContext} />
        </main>
      </div>
    </div>
  );
};
