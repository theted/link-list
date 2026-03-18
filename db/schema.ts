import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  email: varchar("email", { length: 256 }),
});

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 256 }),
  title: varchar("title", { length: 256 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: integer("user_id").references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  userId: integer("user_id").references(() => users.id),
});
