import express from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import {
  categories as categorySchema,
  links as linkSchema,
} from "../db/schema";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", async (req, res) => {
  const categories = await db.select().from(categorySchema);
  res.json(categories);
});

router.get("/:id", async (req, res) => {
  console.log({ userRRR: req.user });

  const { id } = req.params;

  const category = await db
    .select()
    .from(categorySchema)
    .where(eq(categorySchema.id, Number(id)));

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const links = await db
    .select()
    .from(linkSchema)
    .where(eq(linkSchema.categoryId, Number(id)));

  res.json({ category: category[0], links });
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  const category = await db.insert(categorySchema).values([{ name }]);
  res.json(category);
});

export default router;
