import express, { NextFunction, Request, Response } from "express";
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
app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Express only treats a handler as an error handler when it takes four arguments
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

app.get("/*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => console.log(`Server running @ port ${port}`));
