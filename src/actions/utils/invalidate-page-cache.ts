'use server'

import { revalidatePath } from 'next/cache'

export async function invalidatePageCache(path: string) {
  await revalidatePath(path, 'page')
}
