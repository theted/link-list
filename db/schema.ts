import { mysqlTable, serial, varchar, timestamp } from "drizzle-orm/mysql-core";

export const links = mysqlTable("links", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 256 }),
  title: varchar("title", { length: 256 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
