export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '') // Remove diacritics (accents)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
}
