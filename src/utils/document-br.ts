export enum DocumentType {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
}

export class DocumentBRValidator {
  private static validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]+/g, '')
    if (cpf.length !== 11) return false
    if (/^(\d)\1+$/.test(cpf)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i)
    let rest = 11 - (sum % 11)
    const digit1 = rest > 9 ? 0 : rest
    if (digit1 !== parseInt(cpf.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i)
    rest = 11 - (sum % 11)
    const digit2 = rest > 9 ? 0 : rest
    if (digit2 !== parseInt(cpf.charAt(10))) return false

    return true
  }

  private static validateCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]+/g, '')
    if (cnpj.length !== 14) return false
    if (/^(\d)\1+$/.test(cnpj)) return false

    let length = 12
    let numbers = cnpj.substring(0, length)
    const digits = cnpj.substring(length)
    let sum = 0
    let pos = length - 7
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--
      if (pos < 2) pos = 9
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (result !== parseInt(digits.charAt(0))) return false

    length = 13
    numbers = cnpj.substring(0, length)
    sum = 0
    pos = length - 7
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--
      if (pos < 2) pos = 9
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (result !== parseInt(digits.charAt(1))) return false

    return true
  }

  static validate(document: string, type: DocumentType): boolean {
    switch (type) {
      case DocumentType.CPF:
        return this.validateCPF(document)
      case DocumentType.CNPJ:
        return this.validateCNPJ(document)
      default:
        throw new Error('Unknown document type')
    }
  }
}
