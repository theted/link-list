import express from "express";
import { db } from "../db";
import { and, desc, eq } from "drizzle-orm";
import { categories as categorySchema, links as linkScema } from "../db/schema";
import { asyncHandler } from "../middleware/async";

const router = express.Router();

const entities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  middot: "·",
  laquo: "«",
  raquo: "»",
};

const decodeEntities = (text: string) =>
  text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const point =
        code[1].toLowerCase() === "x"
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : match;
    }
    return entities[code.toLowerCase()] ?? match;
  });

type ParseTitle = (body: string) => string | null;

const parseTitle: ParseTitle = (body) => {
  // Attributes are common (<title data-rh="true">), and so are line breaks
  const match = body.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (!match) return null;
  const title = decodeEntities(match[1]).replace(/\s+/g, " ").trim();
  // links.title is varchar(256)
  return title.slice(0, 256) || null;
};

// Best effort: a link whose page can't be fetched is still saved, untitled
const getUrlTitle = async (url: string) => {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; link-list/1.0)",
        Accept: "text/html",
      },
    });

    // Error pages and bot challenges ("Just a moment...") have titles too
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !res.body || !/html/i.test(type)) return null;

    let decoder: TextDecoder;
    try {
      decoder = new TextDecoder(/charset=([^;\s]+)/i.exec(type)?.[1] ?? "utf-8");
    } catch {
      decoder = new TextDecoder();
    }

    // The title is in <head>, so stop reading once it has arrived: some
    // servers take seconds to send the rest of a large page
    const reader = res.body.getReader();
    let html = "";
    while (html.length < 512_000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      if (/<\/title>/i.test(html)) break;
    }
    reader.cancel().catch(() => {});

    return parseTitle(html);
  } catch {
    return null;
  }
};

// Adds https:// when the scheme is missing; null for anything that isn't a
// usable http(s) URL
const normalizeUrl = (input: unknown) => {
  if (typeof input !== "string") return null;
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

// Resolves a category id the user owns: undefined when none was given, null
// when it isn't theirs
const ownedCategoryId = async (category: unknown, userId: number) => {
  if (category === undefined || category === null || category === "") {
    return undefined;
  }

  const id = Number(category);
  if (!Number.isInteger(id)) return null;

  const [owned] = await db
    .select({ id: categorySchema.id })
    .from(categorySchema)
    .where(and(eq(categorySchema.id, id), eq(categorySchema.userId, userId)));

  return owned ? owned.id : null;
};

router.get(
  "/",
  asyncHandler(async (_, res) => {
    const links = await db
      .select()
      .from(linkScema)
      .where(eq(linkScema.userId, res.locals.user.id))
      .orderBy(desc(linkScema.createdAt), desc(linkScema.id));
    res.json(links);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const userId = res.locals.user.id;
    const url = normalizeUrl(req.body.url);

    if (!url) {
      return res
        .status(400)
        .json({ message: "That doesn't look like a web address" });
    }

    if (url.length > 256) {
      return res
        .status(400)
        .json({ message: "Links can be at most 256 characters long" });
    }

    const categoryId = await ownedCategoryId(req.body.category, userId);

    if (categoryId === null) {
      return res.status(404).json({ message: "Category not found" });
    }

    // A title is passed back when a deleted link is restored
    const title =
      typeof req.body.title === "string" && req.body.title.trim()
        ? req.body.title.trim().slice(0, 256)
        : await getUrlTitle(url);
    const [link] = await db
      .insert(linkScema)
      .values({ url, title, categoryId: categoryId ?? null, userId })
      .returning();
    res.json(link);
  })
);

// Renames a link (an empty title falls back to its URL) or moves it
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const userId = res.locals.user.id;
    const changes: { title?: string | null; categoryId?: number | null } = {};

    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Link not found" });
    }

    if ("title" in req.body) {
      const { title } = req.body;
      if (title !== null && typeof title !== "string") {
        return res.status(400).json({ message: "Title must be text" });
      }
      changes.title = title?.trim().slice(0, 256) || null;
    }

    if ("category" in req.body) {
      const categoryId = await ownedCategoryId(req.body.category, userId);
      if (categoryId === null) {
        return res.status(404).json({ message: "Category not found" });
      }
      changes.categoryId = categoryId ?? null;
    }

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ message: "Nothing to change" });
    }

    const [link] = await db
      .update(linkScema)
      .set(changes)
      .where(and(eq(linkScema.id, id), eq(linkScema.userId, userId)))
      .returning();

    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    res.json(link);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Link not found" });
    }

    const [link] = await db
      .delete(linkScema)
      .where(and(eq(linkScema.id, id), eq(linkScema.userId, res.locals.user.id)))
      .returning();

    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    res.json(link);
  })
);

export default router;
