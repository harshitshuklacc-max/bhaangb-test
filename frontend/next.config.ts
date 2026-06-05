import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "bcryptjs",
    "pdfkit",
    "exceljs",
    "cloudinary",
    "nodemailer",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "backend/app": path.resolve(__dirname, "../backend/dist/app.js"),
    };
    return config;
  },
};

export default nextConfig;
