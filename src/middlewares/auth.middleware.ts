import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { prisma } from "../lib/prisma";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Check cookies first, then check the standard Bearer token header string
    let token = req.cookies.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token",
      });
    }

    // 1. Verify token
    const decoded: any = jwt.verify(token, config.jwt_secret as string);

    // 2. Fetch fresh user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Check banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned by Admin",
      });
    }

    // 4. Attach FULL user (not decoded)
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};
