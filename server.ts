import express from "express";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import { port } from "./config";
import { db } from "./db";
import { links as linkScema } from "./db/schema";
import { eq } from "drizzle-orm";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "dist")));

// links

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

app.get("/links", async (_, res) => {
  const users = await db.select().from(linkScema);
  res.json(users);
});

app.post("/links", async (req, res) => {
  const { url } = req.body;
  const title = await getUrlTitle(url);
  const link = await db.insert(linkScema).values([{ url, title }]);
  res.json(link);
});

app.delete("/links/:id", async (req, res) => {
  const { id } = req.params;
  const link = await db.delete(linkScema).where(eq(linkScema.id, Number(id)));
  res.json(link);
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => console.log(`Server running @ port ${port}`));
