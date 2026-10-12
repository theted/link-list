import express from "express";
import { db } from "../db";
import { and, asc, eq } from "drizzle-orm";
import {
  categories as categorySchema,
  links as linkSchema,
} from "../db/schema";
import { asyncHandler } from "../middleware/async";

const router = express.Router();

// Returns a trimmed name, or null when it's empty or too long
const parseName = (name: unknown) => {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 64 ? trimmed : null;
};

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categories = await db
      .select()
      .from(categorySchema)
      .where(eq(categorySchema.userId, res.locals.user.id))
      .orderBy(asc(categorySchema.id));
    res.json(categories);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
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
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const name = parseName(req.body.name);

    if (!name) {
      return res
        .status(400)
        .json({ message: "Give the category a name of 1–64 characters" });
    }

    const [category] = await db
      .insert(categorySchema)
      .values({ name, userId: res.locals.user.id })
      .returning();
    res.json(category);
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const name = parseName(req.body.name);

    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (!name) {
      return res
        .status(400)
        .json({ message: "Give the category a name of 1–64 characters" });
    }

    const [category] = await db
      .update(categorySchema)
      .set({ name })
      .where(
        and(
          eq(categorySchema.id, id),
          eq(categorySchema.userId, res.locals.user.id)
        )
      )
      .returning();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  })
);

// Deletes the category and every link in it
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const userId = res.locals.user.id;

    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Category not found" });
    }

    const category = await db.transaction(async (tx) => {
      await tx
        .delete(linkSchema)
        .where(and(eq(linkSchema.categoryId, id), eq(linkSchema.userId, userId)));

      const [deleted] = await tx
        .delete(categorySchema)
        .where(and(eq(categorySchema.id, id), eq(categorySchema.userId, userId)))
        .returning();

      return deleted;
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  })
);

export default router;
