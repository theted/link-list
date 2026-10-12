import express from "express";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import {
  categories as categorySchema,
  links as linkSchema,
} from "../db/schema";

const router = express.Router();

router.get("/", async (_req, res) => {
  const categories = await db
    .select()
    .from(categorySchema)
    .where(eq(categorySchema.userId, res.locals.user.id));
  res.json(categories);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const userId = res.locals.user.id;

  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: "Category not found" });
  }

  const [category] = await db
    .select()
    .from(categorySchema)
    .where(and(eq(categorySchema.id, id), eq(categorySchema.userId, userId)));

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const links = await db
    .select()
    .from(linkSchema)
    .where(and(eq(linkSchema.categoryId, id), eq(linkSchema.userId, userId)));

  res.json({ category, links });
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  const [category] = await db
    .insert(categorySchema)
    .values({ name, userId: res.locals.user.id })
    .returning();
  res.json(category);
});

export default router;
