/**
 * Generates a numeric code derived from a UUID.
 * Practically non-repeating and safe for distributed systems.
 */
export class GenerateReportCode {
  static generate(length = 12): string {
    const uuid = crypto.randomUUID().replace(/-/g, '') // hex string

    // convert hex UUID to BigInt
    const numeric = BigInt(`0x${uuid}`).toString(10)

    // ensure fixed length (take last digits)
    return numeric.slice(-length)
  }
}
