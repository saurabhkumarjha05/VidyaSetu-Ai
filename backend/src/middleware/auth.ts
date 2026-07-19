import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: string;
  schoolCode: string;
  associatedStudentId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function signAuthToken(user: AuthUser) {
  return jwt.sign(user, process.env.JWT_SECRET || "vidyasetu-dev-secret", { expiresIn: "12h" });
}

export function parseAuthToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "vidyasetu-dev-secret") as AuthUser;
  } catch {
    return null;
  }
}

export function attachUser(req: AuthRequest, _res: Response, next: NextFunction) {
  req.user = parseAuthToken(req) || undefined;
  next();
}

export function allowRoles(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role || (req.headers["x-user-role"] as string | undefined);
    if (roles.length > 0 && (!role || !roles.includes(role))) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    next();
  };
}

export function resolveContext(req: AuthRequest) {
  return {
    user: req.user,
    schoolCode: req.user?.schoolCode || (req.headers["x-school-code"] as string) || "VIDYA-99",
    role: req.user?.role || (req.headers["x-user-role"] as string) || "STUDENT",
    userId: req.user?.id || (req.headers["x-user-id"] as string) || "anonymous",
  };
}
