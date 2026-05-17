import { db } from '../db';
import type { OperationEvent } from '../db/models';

export async function registerOperationEvent(
  input: Omit<OperationEvent, 'id' | 'createdAt'>
): Promise<number> {
  return db.operation_events.add({
    ...input,
    createdAt: new Date(),
  });
}

export async function listOperationEvents(operationId: number): Promise<OperationEvent[]> {
  return db.operation_events.where('operationId').equals(operationId).sortBy('eventAt');
}
