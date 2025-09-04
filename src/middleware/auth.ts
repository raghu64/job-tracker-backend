import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export default function (req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: string;
      name?: string;
    };
    req.user = payload;
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
}
