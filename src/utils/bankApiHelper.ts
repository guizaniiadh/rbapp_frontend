/**
 * Bank API Helper
 * Uses bank codes directly from the database for bank-specific endpoints
 * 
 * The backend uses dynamic routing based on bank codes from the database.
 * Bank codes are stored as strings (e.g., "1", "2", "4") and used directly in URLs.
 */

/**
 * Get the API prefix for a given bank code
 * @param bankCode - The bank code from the database (e.g., "1", "2", "4")
 * @returns The API prefix (e.g., "/1", "/2", "/4")
 * @throws Error if bank code is empty or invalid
 */
export function getBankApiPrefix(bankCode: string): string {
  if (!bankCode || typeof bankCode !== 'string') {
    throw new Error(`Invalid bank code: ${bankCode}. Bank code must be a non-empty string.`)
  }
  
  const trimmedCode = bankCode.trim()
  if (!trimmedCode) {
    throw new Error(`Bank code cannot be empty.`)
  }
  
  // Use the bank code directly from the database
  // Backend URLs are now: /api/{bankCode}/...
  return `/${trimmedCode}`
}

/**
 * Validate that a bank code is valid
 * @param bankCode - The bank code to validate
 * @returns True if the bank code is valid (non-empty string)
 */
export function isValidBankCode(bankCode: string | null | undefined): boolean {
  return typeof bankCode === 'string' && bankCode.trim().length > 0
}
