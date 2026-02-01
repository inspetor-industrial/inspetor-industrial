'server-only'

import { readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

import matter from 'gray-matter'

import { slugify } from './slugify'

type ChangelogProperties = {
  title: string
  date: string
  version: string
  description: string
  body: string
  slug: string
}

export class Changelog {
  static async getChangelogs() {
    const files = await readdir('changelogs')

    const changelogs: ChangelogProperties[] = []
    for (const file of files) {
      const filePath = path.join('changelogs', file)
      const fileContent = readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)

      changelogs.push({
        title: data.title,
        date: data.date,
        version: data.version,
        description: data.description,
        body: content,
        slug: slugify(data.title),
      })
    }

    return changelogs
  }
}
