import { db } from '../db';
import type { FinancialEntry, OperationCost, RevenueEntry } from '../db/models';

export async function createFinancialEntry(
  input: Omit<FinancialEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<number> {
  const now = new Date();
  return db.financial_entries.add({
    ...input,
    createdAt: now,
    updatedAt: now,
  });
}

export async function createOperationCost(
  input: Omit<OperationCost, 'id' | 'createdAt' | 'updatedAt'>
): Promise<number> {
  const now = new Date();
  return db.operation_costs.add({
    ...input,
    createdAt: now,
    updatedAt: now,
  });
}

export async function createRevenueEntry(
  input: Omit<RevenueEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<number> {
  const now = new Date();
  return db.revenue_entries.add({
    ...input,
    createdAt: now,
    updatedAt: now,
  });
}
