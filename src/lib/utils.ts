import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Regular expression to validate UK postcode formats (case-insensitive)
// Supports formats like: M1 1AA, M60 1NW, CR2 6XH, DN55 1PT, W1A 1HQ, EC1A 1BB
const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;

/**
 * Helper function to validate if a string matches a common UK postcode format.
 * @param postcode - The string to test.
 * @returns True if the string matches the pattern, false otherwise.
 */
export function isValidUKPostcode(postcode: string): boolean {
  return ukPostcodeRegex.test(postcode);
}
