import { UserRole } from '@prisma/client'

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
      return '*'
    }

    if (this.isOperatorUser(role)) {
      return [
        '/dashboard/company',
        '/dashboard/storage',
        '/dashboard/users',
        '/dashboard/client',
      ]
    }

    if (this.isCommonUser(role)) {
      return [
        '/dashboard/company',
        '/dashboard/storage',
        '/dashboard/users',
        '/dashboard/client',
        '/dashboard/maintenance/daily',
      ]
    }

    return []
  }
}
