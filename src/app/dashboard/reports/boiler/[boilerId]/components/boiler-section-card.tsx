import { Button } from '@inspetor/components/ui/button'
import { Card, CardContent } from '@inspetor/components/ui/card'
import { Edit, Eye } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'

type SubSection = {
  id: string
  title: string
  icon: LucideIcon
}

type BoilerSectionCardProps = {
  section: SubSection
  boilerId: string
}

export function BoilerSectionCard({
  section,
  boilerId,
}: BoilerSectionCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/50">
      <CardContent className="flex flex-col items-center gap-2">
        <div className="p-3 bg-primary/10 rounded-full">
          <section.icon className="size-6 text-primary" />
        </div>
        <h3 className="font-semibold text-center text-sm min-h-[32px] flex items-center">
          {section.title}
        </h3>
        <div className="flex gap-2 w-full">
          <Link
            href={`/dashboard/reports/boiler/${boilerId}/view/${section.id}?action=edit`}
            className="w-full flex"
          >
            <Button variant="outline" size="sm" className="grow">
              <Edit className="size-4" />
            </Button>
          </Link>
          <Link
            href={`/dashboard/reports/boiler/${boilerId}/view/${section.id}?action=view`}
            className="w-full flex"
          >
            <Button variant="outline" size="sm" className="grow">
              <Eye className="size-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
