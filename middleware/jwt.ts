import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authSecret } from "../config";

export type SessionUser = {
  id: number;
  email: string;
  name: string | null;
};

export const signToken = (user: SessionUser) =>
  jwt.sign(user, authSecret, { expiresIn: "30d" });

// Puts the signed-in user on res.locals.user, or answers 401
export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Not signed in" });
  }

  try {
    const { id, email, name } = jwt.verify(token, authSecret) as SessionUser;
    res.locals.user = { id, email, name };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
