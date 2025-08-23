import { auth } from '@inspetor/lib/auth/authjs'
import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'
import { redirect } from 'next/navigation'

import { DocumentsFilter } from './components/filter'
import { DocumentsTable } from './components/table'

type DocumentsPageProps = {
  searchParams: Promise<{
    search: string
    page: string
  }>
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const { search, page } = await searchParams
  const session = await auth()

  if (!session?.user.email) {
    redirect('/access-denied')
  }

  let documents: any[] = []
  let totalDocuments = 0

  try {
    documents = await prisma.documents.findMany({
      where: {
        name: {
          contains: search,
        },
        owner: {
          email: session?.user.email ?? 'unknown',
        },
      },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
      ...calculatePagination(page),
    })

    totalDocuments = await prisma.documents.count({
      where: {
        name: {
          contains: search,
        },
      },
    })
  } catch {
    documents = []
    totalDocuments = 0
  }

  const totalPages = Math.ceil(totalDocuments / 10)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Documentos</h1>

      <DocumentsFilter />
      <DocumentsTable documents={documents} totalPages={totalPages} />
    </div>
  )
}
