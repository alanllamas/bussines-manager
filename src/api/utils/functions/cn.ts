// cn — Tailwind class name utility.
// Combines clsx (conditional class logic) with tailwind-merge (conflict resolution).
// clsx handles arrays, objects, and conditional expressions (e.g. cn('base', isActive && 'active')).
// twMerge resolves Tailwind conflicts so the last class wins (e.g. 'p-2 p-4' → 'p-4').
// Used in components wherever dynamic or conditional Tailwind classes need to be merged safely.

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
