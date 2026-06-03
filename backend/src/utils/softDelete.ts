import { prisma } from "../lib/prisma.js";
import { RETENTION_YEARS } from "../lib/constants.js";

export function purgeAfterDate(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() + RETENTION_YEARS);
  return d;
}

export async function softDelete(
  entityType: string,
  entityId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const purgeAfter = purgeAfterDate();
  await prisma.archivedRecord.create({
    data: {
      entityType,
      entityId,
      payload: payload as object,
      purgeAfter,
    },
  });
}

export async function purgeExpiredArchives(): Promise<number> {
  const now = new Date();
  const expired = await prisma.archivedRecord.findMany({
    where: { purgeAfter: { lte: now } },
  });
  for (const record of expired) {
    await prisma.archivedRecord.delete({ where: { id: record.id } });
  }
  return expired.length;
}
