import type { CancelPolicyWindow } from '../db/models';
import { diffHours } from './date';

export function calculateCancellationFee(
  cancelPolicy: CancelPolicyWindow[],
  scheduledDate: Date,
  cancellationDate: Date,
  totalPrice: number
): number {
  const hoursUntilService = diffHours(scheduledDate, cancellationDate);
  
  // Sort policy windows by minHours descending
  const sortedPolicy = [...cancelPolicy].sort((a, b) => b.minHours - a.minHours);
  
  for (const window of sortedPolicy) {
    const meetsMin = hoursUntilService >= window.minHours;
    const meetsMax = window.maxHours === null || hoursUntilService < window.maxHours;
    
    if (meetsMin && meetsMax) {
      return totalPrice * (window.percentage / 100);
    }
  }
  
  // If no window matches, return 100% (full charge)
  return totalPrice;
}

export function getCancellationPercentage(
  cancelPolicy: CancelPolicyWindow[],
  hoursUntilService: number
): number {
  const sortedPolicy = [...cancelPolicy].sort((a, b) => b.minHours - a.minHours);
  
  for (const window of sortedPolicy) {
    const meetsMin = hoursUntilService >= window.minHours;
    const meetsMax = window.maxHours === null || hoursUntilService < window.maxHours;
    
    if (meetsMin && meetsMax) {
      return window.percentage;
    }
  }
  
  return 100;
}
