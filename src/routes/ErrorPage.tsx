import { Link } from "react-router-dom";
import { Wordmark } from "@/components/Wordmark";

type Props = { title?: string; message?: string };

export const ErrorPage = ({
  title = "Something broke on this page",
  message = "Reload to try again. If it keeps happening, start over from your list.",
}: Props) => (
  <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-6 pt-6 sm:px-10">
    <header>
      <Wordmark />
    </header>
    <main className="flex flex-1 flex-col justify-center pb-24">
      <h1 className="display text-[clamp(2.5rem,7vw,4.5rem)] leading-none">{title}</h1>
      <p className="mt-5 max-w-[42ch] text-base text-ink-soft">{message}</p>
      <p className="mt-8">
        <Link to="/" className="text-base font-semibold text-link underline decoration-2 underline-offset-4">
          Go to your links
        </Link>
      </p>
    </main>
  </div>
);

export const NotFound = () => (
  <ErrorPage
    title="Nothing lives at this address"
    message="The page you followed doesn't exist in link-list."
  />
);
