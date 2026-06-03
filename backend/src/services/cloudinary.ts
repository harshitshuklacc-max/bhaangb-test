import { v2 as cloudinary } from "cloudinary";
import type { Express } from "express";

const configured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadImage(
  file: Express.Multer.File,
  folder: string
): Promise<string | null> {
  if (!configured) return null;
  return new Promise((resolve) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `smart-step-academy/${folder}` },
      (err, result) => {
        if (err || !result) resolve(null);
        else resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
}
