import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token",
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, config.jwt_secret as string);

    // 3. Attach user info to request
    req.user = decoded;

    // 4. Continue
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};