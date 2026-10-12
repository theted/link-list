import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { port } from "./config";
import { db } from "./db";
import authRouter from "./routes/auth";
import linksRouter from "./routes/links";
import categoriesRouter from "./routes/categories";
import { validateToken } from "./middleware/jwt";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

await migrate(db, { migrationsFolder: path.join(__dirname, "db", "migrations") });

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

app.use((req, _res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use("/api/links", validateToken, linksRouter);
app.use("/api/categories", validateToken, categoriesRouter);
app.use("/api/auth", authRouter);

app.get("/*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => console.log(`Server running @ port ${port}`));
