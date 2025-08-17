import { Card, CardContent, CardHeader } from '@inspetor/components/ui/card'
import { Skeleton } from '@inspetor/components/ui/skeleton'

export function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <Card
          key={index}
          className="group relative w-full p-0 h-80 transition-all duration-300 border border-border/50"
        >
          <CardContent className="p-0 h-full flex flex-col">
            {/* Thumbnail Section Skeleton */}
            <div className="relative border-b border-border/50 h-48 bg-gradient-to-br from-muted/20 to-muted/10 rounded-t-lg overflow-hidden">
              {/* Thumbnail skeleton */}
              <Skeleton className="w-full h-full" />

              {/* File type badge skeleton */}
              <div className="absolute top-2 left-2">
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>

              {/* Shared indicator skeleton */}
              <div className="absolute top-2 right-2">
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>

            {/* File Info Section Skeleton */}
            <div className="flex-1 p-4 flex flex-col">
              <CardHeader className="p-0 gap-2">
                {/* Title skeleton */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>

              <div className="flex-1 space-y-2 mt-3">
                {/* File size and type skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-1" />
                  <Skeleton className="h-3 w-8" />
                </div>

                {/* Modified time skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 w-24" />
                </div>

                {/* Owner info skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              {/* Quick actions skeleton */}
              <div className="flex gap-1 mt-3 pt-3 border-t border-border/50">
                <Skeleton className="flex-1 h-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
