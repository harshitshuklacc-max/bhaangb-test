import type { NextApiRequest, NextApiResponse } from "next";
import type { IncomingMessage, ServerResponse } from "http";

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { getApp } = await import("../../../../backend/dist/app.js");
  const app = getApp();
  return new Promise((resolve, reject) => {
    app(req as unknown as IncomingMessage, res as unknown as ServerResponse, (err?: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
