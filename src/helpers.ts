import { API_URL } from "@/constants";

// JWT helpers
export const authenticate = async (credential?: string) => {
  return fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  }).then((res) => res.json());
};

export const getToken = () => localStorage.getItem("token");

export const validateToken = (token: string) => {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const parsedToken = JSON.parse(atob(base64));
  const expired = Date.now() >= parsedToken.exp * 1000;
  return { expired, parsedToken };
};

// URL helpers, mirroring the server's normalizeUrl in routes/links.ts
export const normalizeUrl = (input: string) => {
  const trimmed = input.trim();
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
    return url.toString();
  } catch {
    return null;
  }
};

// True when a key or paste event belongs to a text field, not the page
export const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export const domainOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

// Shows the URL without its scheme, which is noise when skimming a list
export const displayUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});
const yearFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const formatSaved = (iso: string) => {
  const date = new Date(iso);
  const today = new Date();
  const days = Math.round(
    (new Date(today.toDateString()).getTime() -
      new Date(date.toDateString()).getTime()) /
      86_400_000
  );

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return date.getFullYear() === today.getFullYear()
    ? dayFormat.format(date)
    : yearFormat.format(date);
};
