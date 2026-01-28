import { Badge } from '@inspetor/components/ui/badge'
import { BoilerReportType } from '@inspetor/generated/prisma/browser'
import { cn } from '@inspetor/lib/utils'

type BoilerReportTypeBadgeProps = {
  type?: BoilerReportType | null
  className?: string
}

const reportTypeLabels: Record<BoilerReportType, string> = {
  [BoilerReportType.INITIAL]: 'Inicial',
  [BoilerReportType.PERIODIC]: 'Periódico',
  [BoilerReportType.EXTRAORDINARY]: 'Extraordinário',
}

const reportTypeColors: Record<BoilerReportType, string> = {
  [BoilerReportType.INITIAL]: 'bg-blue-50 text-blue-700 border-blue-200',
  [BoilerReportType.PERIODIC]: 'bg-green-50 text-green-700 border-green-200',
  [BoilerReportType.EXTRAORDINARY]:
    'bg-orange-50 text-orange-700 border-orange-200',
}

export function BoilerReportTypeBadge({
  type,
  className,
}: BoilerReportTypeBadgeProps) {
  const label = type ? (reportTypeLabels[type] ?? type) : 'Não informado'

  const color = type
    ? (reportTypeColors[type] ?? 'bg-muted')
    : 'bg-muted text-muted-foreground'

  return (
    <Badge
      variant="secondary"
      className={cn('text-xs font-medium', color, className)}
    >
      {label}
    </Badge>
  )
}
