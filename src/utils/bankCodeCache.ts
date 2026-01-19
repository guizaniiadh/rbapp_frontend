/**
 * Bank Code Cache
 * Caches bank codes per agency to avoid repeated API calls
 */

import type { Bank } from '@/types/bank'
import { bankService } from '@/services/bank.service'

interface CacheEntry {
  bankCode: string
  timestamp: number
}

// Cache storage: agency code -> bank code
const agencyBankCodeCache = new Map<string, CacheEntry>()

// Cache storage: bank ID -> bank code
const bankIdCodeCache = new Map<number | string, string>()

// Cache TTL: 1 hour (in milliseconds)
const CACHE_TTL = 60 * 60 * 1000

/**
 * Get bank code from cache or extract it from agency data
 * @param agencyCode - The agency code
 * @param bankData - The bank data from agency (can be number, string, Bank object, or { code: string })
 * @returns The bank code
 */
export async function getBankCodeForAgency(
  agencyCode: string,
  bankData?: number | string | { code: string; name?: string } | any
): Promise<string> {
  // Check cache first
  const cached = agencyBankCodeCache.get(agencyCode)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.bankCode
  }

  let bankCode: string | null = null

  // If bankData is already a string (bank code), use it directly
  // Bank codes from database are strings like "1", "2", "4" - preserve as-is, just trim
  if (typeof bankData === 'string') {
    bankCode = bankData.trim()
  }
  // If bankData is an object with a code property (nested bank object)
  else if (bankData && typeof bankData === 'object' && 'code' in bankData) {
    bankCode = String(bankData.code).trim()
  }
  // If bankData is a number (bank ID), try to get from cache or fetch
  else if (typeof bankData === 'number') {
    // Check if we have the bank code cached for this ID
    const cachedBankCode = bankIdCodeCache.get(bankData)
    if (cachedBankCode) {
      bankCode = cachedBankCode
    } else {
      // Fetch bank details
      try {
        const banks = await bankService.getBanks()
        const bank = banks.find(b => (b as any).id === bankData)
        
        if (bank) {
          // Bank code from database is a string - preserve as-is
          bankCode = String(bank.code).trim()
          // Cache the mapping
          bankIdCodeCache.set(bankData, bankCode)
        }
      } catch (error) {
        console.error(`Error fetching bank for ID ${bankData}:`, error)
        throw new Error(`Failed to fetch bank code for agency ${agencyCode}`)
      }
    }
  }

  if (!bankCode) {
    throw new Error(`Cannot determine bank code for agency ${agencyCode}. Bank data is required.`)
  }

  // Cache the result
  agencyBankCodeCache.set(agencyCode, {
    bankCode,
    timestamp: Date.now()
  })

  return bankCode
}

/**
 * Get bank code from bank object (if nested in agency response)
 * @param bank - Bank object (can be full Bank object or just { code: string })
 * @returns The bank code (preserved as-is from database, e.g., "1", "2", "4")
 */
export function extractBankCodeFromBank(bank: Bank | { code: string } | number | string): string {
  if (typeof bank === 'string') {
    return bank.trim()
  }
  if (typeof bank === 'number') {
    throw new Error('Cannot extract bank code from number. Use getBankCodeForAgency instead.')
  }
  if (bank && typeof bank === 'object' && 'code' in bank) {
    return String(bank.code).trim()
  }
  throw new Error('Invalid bank object format')
}

/**
 * Clear cache for a specific agency
 * @param agencyCode - The agency code
 */
export function clearAgencyCache(agencyCode: string): void {
  agencyBankCodeCache.delete(agencyCode)
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  agencyBankCodeCache.clear()
  bankIdCodeCache.clear()
}

/**
 * Get cached bank code (without fetching)
 * @param agencyCode - The agency code
 * @returns The cached bank code or null if not cached
 */
export function getCachedBankCode(agencyCode: string): string | null {
  const cached = agencyBankCodeCache.get(agencyCode)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.bankCode
  }
  return null
}

