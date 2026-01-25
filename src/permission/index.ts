import { UserRole } from '@inspetor/generated/prisma/enums'

export class Permission {
  static canNotAccess(role: UserRole, path: string): boolean {
    if (this.isAdminUser(role)) {
      return false
    }

    const routes = this.getRoutesByRole(role)
    if (routes === '*') {
      return false
    }

    return routes.some((route) => path === route)
  }

  private static isAdminUser(role: UserRole) {
    return role === UserRole.ADMIN
  }

  private static isOperatorUser(role: UserRole) {
    return role === UserRole.OPERATOR
  }

  private static isCommonUser(role: UserRole) {
    return role === UserRole.USER
  }

  private static getRoutesByRole(role: UserRole): '*' | string[] {
    if (this.isAdminUser(role)) {
      return ['/dashboard/reports/boiler']
    }

    if (this.isOperatorUser(role)) {
      return [
        '/dashboard/company',
        '/dashboard/storage',
        '/dashboard/users',
        '/dashboard/client',
        '/dashboard/instruments',
        '/dashboard/documents',
        '/dashboard/reports/boiler',
        '/dashboard/valve',
        '/dashboard/bomb',
      ]
    }

    if (this.isCommonUser(role)) {
      return [
        '/dashboard/company',
        '/dashboard/storage',
        '/dashboard/users',
        '/dashboard/client',
        '/dashboard/maintenance/daily',
        '/dashboard/instruments',
        '/dashboard/documents',
        '/dashboard/reports/boiler',
        '/dashboard/maintenance/equipment',
        '/dashboard/valve',
        '/dashboard/bomb',
      ]
    }

    return []
  }
}
