import { db } from '../db';
import type { OperationAssignment } from '../db/models';

export async function assignResource(
  input: Omit<OperationAssignment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<number> {
  const now = new Date();
  return db.operation_assignments.add({
    ...input,
    createdAt: now,
    updatedAt: now,
  });
}

export async function listAssignmentsByOperation(operationId: number): Promise<OperationAssignment[]> {
  return db.operation_assignments.where('operationId').equals(operationId).toArray();
}
