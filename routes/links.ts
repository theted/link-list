import express from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { links as linkScema } from "../db/schema";

const router = express.Router();

type ParseTitle = (body: string) => string | null;

const parseTitle: ParseTitle = (body) => {
  const match = body.match(/<title>([^<]*)<\/title>/);
  if (!match) return null;
  return match[1] || null;
};

const getUrlTitle = async (url) => {
  return fetch(url)
    .then((res) => res.text())
    .then((body) => parseTitle(body));
};

router.get("/", async (_, res) => {
  const links = await db.select().from(linkScema);
  res.json(links);
});

router.post("/", async (req, res) => {
  const { url, category } = req.body;
  const title = await getUrlTitle(url);
  const link = await db
    .insert(linkScema)
    .values([{ url, title, categoryId: category }]);
  res.json(link);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("DELETE", id);
  const link = await db.delete(linkScema).where(eq(linkScema.id, Number(id)));
  res.json(link);
});

export default router;
