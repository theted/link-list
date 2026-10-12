import express from "express";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { categories as categorySchema, links as linkScema } from "../db/schema";

const router = express.Router();

type ParseTitle = (body: string) => string | null;

const parseTitle: ParseTitle = (body) => {
  const match = body.match(/<title>([^<]*)<\/title>/);
  if (!match) return null;
  // links.title is varchar(256)
  return match[1]?.trim().slice(0, 256) || null;
};

// Best effort: a link whose page can't be fetched is still saved, untitled
const getUrlTitle = async (url: string) => {
  try {
    const { protocol } = new URL(url);
    if (protocol !== "http:" && protocol !== "https:") return null;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return parseTitle(await res.text());
  } catch {
    return null;
  }
};

router.get("/", async (_, res) => {
  const links = await db
    .select()
    .from(linkScema)
    .where(eq(linkScema.userId, res.locals.user.id));
  res.json(links);
});

router.post("/", async (req, res) => {
  const { url, category } = req.body;
  const userId = res.locals.user.id;
  const categoryId = Number(category);

  if (!Number.isInteger(categoryId)) {
    return res.status(400).json({ message: "Category is required" });
  }

  if (typeof url !== "string" || url.length > 256) {
    return res.status(400).json({ message: "URL must be at most 256 characters" });
  }

  const [owned] = await db
    .select({ id: categorySchema.id })
    .from(categorySchema)
    .where(
      and(eq(categorySchema.id, categoryId), eq(categorySchema.userId, userId))
    );

  if (!owned) {
    return res.status(404).json({ message: "Category not found" });
  }

  const title = await getUrlTitle(url);
  const [link] = await db
    .insert(linkScema)
    .values({ url, title, categoryId, userId })
    .returning();
  res.json(link);
});

router.delete("/:id", async (req, res) => {
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
});

export default router;
