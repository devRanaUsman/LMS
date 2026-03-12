import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isDefaultDateRange(
  current: { start: Date | null; end: Date | null },
  defaultStart: Date | null,
  defaultEnd: Date | null
) {
  return (
    current.start?.getTime() === defaultStart?.getTime() &&
    current.end?.getTime() === defaultEnd?.getTime()
  );
}
