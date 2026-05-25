import { Request } from "express";
import multer from "multer";
import path from "path";

// 1. storage config with precise types
const storage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) {
    cb(null, "uploads/"); // folder
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// 2. file filter with precise types (No more 'any' types!)
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    // Pass the error wrapped correctly for the file filter callback signature
    cb(new Error("Only image files are allowed") as any, false);
  }
};

// 3. multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
