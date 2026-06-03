import { prisma } from "../lib/prisma.js";

export async function logAudit(params: {
  adminId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: params.metadata as object | undefined,
      ipAddress: params.ipAddress,
    },
  });
}
