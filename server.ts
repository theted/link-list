import express from "express";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { port } from "./config";
import authRouter from "./routes/auth";
import linksRouter from "./routes/links";
import categoriesRouter from "./routes/categories";
import { validateToken } from "./middleware/jwt";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "dist")));

app.use((req, _res, next) => {
  console.log({ method: req.method, url: req.url, body: req.body });
  next();
});

app.use((_req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    console.dir(JSON.parse(body));
    originalSend.call(this, body);
  };
  next();
});

app.use("/links", validateToken, linksRouter);
app.use("/categories", validateToken, categoriesRouter);
app.use("/auth", authRouter);

app.get("/*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => console.log(`Server running @ port ${port}`));
