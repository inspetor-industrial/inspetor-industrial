/**
 * Utility for normalizing the GOOGLE_PRIVATE_KEY value for OpenSSL 3 compatibility.
 *
 * Handles both raw PEM content (with real or escaped newlines) and base64-encoded PEM content.
 * Ensures that newlines are real (not escaped) so that decoding does not throw ERR_OSSL_UNSUPPORTED.
 */
export class PrivateKeyNormalizer {
  /**
   * The header prefix expected at the start of a PEM-encoded private key.
   * @readonly
   */
  static readonly PEM_HEADER = '-----BEGIN'

  /**
   * Normalizes a private key string for OpenSSL 3 compatibility.
   *
   * - If the input is a PEM string (starts with the PEM header), replaces all escaped newlines (`\\n`) with real newlines (`\n`).
   * - If the input is base64-encoded PEM, decodes it and normalizes newlines.
   *
   * @param {string} raw - The GOOGLE_PRIVATE_KEY value, either as a PEM string or base64-encoded PEM.
   * @returns {string} The normalized PEM string with real newlines.
   */
  static normalize(raw: string): string {
    const trimmed = raw.trim()
    if (trimmed.startsWith(PrivateKeyNormalizer.PEM_HEADER)) {
      return trimmed.replace(/\\n/g, '\n')
    }

    const base64Clean = trimmed.replace(/\s/g, '')
    const decoded = Buffer.from(base64Clean, 'base64').toString('utf-8')
    return decoded.replace(/\\n/g, '\n').trim()
  }
}
