export class FileSizeFormatter {
  /**
   * Returns the size formatted with appropriate unit.
   * @param bytes Number of bytes
   */
  static format(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`
    } else if (bytes < 1024 ** 2) {
      return `${(bytes / 1024).toFixed(2)} KB`
    } else if (bytes < 1024 ** 3) {
      return `${(bytes / 1024 ** 2).toFixed(2)} MB`
    } else {
      return `${(bytes / 1024 ** 3).toFixed(2)} GB`
    }
  }

  static toBytes(bytes: number): string {
    return `${bytes} B`
  }

  static toKilobytes(bytes: number): string {
    return `${(bytes / 1024).toFixed(2)} KB`
  }

  static toMegabytes(bytes: number): string {
    return `${(bytes / 1024 ** 2).toFixed(2)} MB`
  }

  static toGigabytes(bytes: number): string {
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`
  }
}
