import { UserResponsibility } from '@inspetor/generated/prisma/browser'

export class UserResponsabilityMapper {
  static toLabel(responsibility: UserResponsibility): string {
    switch (responsibility) {
      case UserResponsibility.ENGINEER:
        return 'Engenheiro'
      case UserResponsibility.SECRETARY:
        return 'Secretário'
      case UserResponsibility.OPERATOR:
        return 'Operador'
    }
  }
}
