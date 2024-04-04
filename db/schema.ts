import {
  mysqlTable,
  serial,
  varchar,
  int,
  timestamp,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  email: varchar("email", { length: 256 }),
});

export const links = mysqlTable("links", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 256 }),
  title: varchar("title", { length: 256 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: int("user_id").references(() => users.id),
  categoryId: serial("category_id").references(() => categories.id),
});

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  userId: int("user_id").references(() => users.id),
});
