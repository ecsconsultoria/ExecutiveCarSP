import { db } from '../db';
import type { SupplierPayment } from '../db/models';

export async function createSupplierPayment(
  input: Omit<SupplierPayment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<number> {
  const now = new Date();
  return db.supplier_payments.add({
    ...input,
    createdAt: now,
    updatedAt: now,
  });
}

export async function listSupplierPaymentsByOperation(operationId: number): Promise<SupplierPayment[]> {
  return db.supplier_payments.where('operationId').equals(operationId).toArray();
}
