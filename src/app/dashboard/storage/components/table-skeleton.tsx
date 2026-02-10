import { Skeleton } from '@inspetor/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@inspetor/components/ui/table'

const ROWS = 4

type StorageTableSkeletonProps = {
  isAdmin?: boolean
}

export function StorageTableSkeleton({
  isAdmin = false,
}: StorageTableSkeletonProps) {
  const columnCount = isAdmin ? 6 : 4
  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table className="min-w-[500px]">
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              {isAdmin && <TableHead>Empresa</TableHead>}
              {isAdmin && <TableHead>Unidade</TableHead>}
              <TableHead>Link relativo</TableHead>
              <TableHead>Data de criação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: ROWS }).map((_, index) => (
              <TableRow key={index} className="divide-x">
                {isAdmin && (
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                )}
                {isAdmin && (
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                )}
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Skeleton className="h-9 w-9 rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={columnCount - 1}>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell colSpan={1} className="flex justify-end">
                <div className="flex gap-2 justify-end">
                  <Skeleton className="h-9 w-9 rounded" />
                  <Skeleton className="h-9 w-9 rounded" />
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
