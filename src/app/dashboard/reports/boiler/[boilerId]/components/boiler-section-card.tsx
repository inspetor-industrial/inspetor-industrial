import { Button } from '@inspetor/components/ui/button'
import { Card, CardContent } from '@inspetor/components/ui/card'
import { Edit, Eye } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

type SubSection = {
  id: string
  title: string
  icon: LucideIcon
}

type BoilerSectionCardProps = {
  section: SubSection
}

export function BoilerSectionCard({ section }: BoilerSectionCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/50">
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <section.icon className="size-6 text-primary" />
        </div>
        <h3 className="font-semibold text-center text-sm min-h-[40px] flex items-center">
          {section.title}
        </h3>
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="size-4" />
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
