export function calculatePagination(page: number | string) {
  return {
    skip: (Number(page || 1) - 1) * 10,
    take: 10,
  }
}
