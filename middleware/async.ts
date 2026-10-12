import type { Request, Response, NextFunction } from "express";

type Handler = (req: Request, res: Response, next: NextFunction) => unknown;

// Express 4 doesn't catch rejected promises: without this, one failed query
// takes the whole server down instead of answering 500.
export const asyncHandler =
  (fn: Handler) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
