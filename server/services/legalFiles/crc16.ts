/**
 * CRC-16 CCITT-TRUE (CRC-16/KERMIT) implementation
 * Used for AFD file record validation per Portaria 671
 * Standard reflected algorithm: LSB-first with polynomial 0x8408
 */

export function calculateCRC16(data: string): string {
  const polynomial = 0x8408; // Reversed polynomial for LSB-first
  let crc = 0x0000; // Initial value for CRC-16/KERMIT

  // Convert string to ISO 8859-1 bytes
  const bytes = Buffer.from(data, 'latin1');

  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    
    // Process LSB-first with right shifts
    for (let j = 0; j < 8; j++) {
      if (crc & 0x0001) {
        crc = (crc >> 1) ^ polynomial;
      } else {
        crc = crc >> 1;
      }
    }
  }

  // Final XOR is 0x0000 (no XOR), crc remains as-is
  
  // Return as 4-digit hex string
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Verify CRC-16 checksum
 */
export function verifyCRC16(data: string, expectedCrc: string): boolean {
  const calculated = calculateCRC16(data);
  return calculated === expectedCrc.toUpperCase();
}
