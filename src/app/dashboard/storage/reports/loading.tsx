import { CardGridSkeleton } from './components/skeleton'

export default async function StorageReportsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Relatórios</h1>

      <CardGridSkeleton />
    </div>
  )
}
