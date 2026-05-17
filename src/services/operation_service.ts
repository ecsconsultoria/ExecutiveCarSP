import { db } from '../db';
import type { Operation, OperationStatus } from '../db/models';

export async function createOperation(input: Omit<Operation, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date();
  return db.operations.add({
    ...input,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateOperationStatus(operationId: number, status: OperationStatus): Promise<void> {
  await db.operations.update(operationId, {
    status,
    updatedAt: new Date(),
  });
}

export async function getOperationById(operationId: number): Promise<Operation | undefined> {
  return db.operations.get(operationId);
}
