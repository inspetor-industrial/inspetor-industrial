import { Button } from '@inspetor/components/ui/button'
import { cn } from '@inspetor/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Step {
  number: number
  title: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepChange: (step: number) => void
}

export function StepIndicator({
  steps,
  currentStep,
  onStepChange,
}: StepIndicatorProps) {
  const totalSteps = steps.length

  const getVisibleSteps = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const visibleCount = isMobile ? 3 : 5
    const offset = isMobile ? 1 : 2

    let start = currentStep - offset
    let end = currentStep + offset

    if (start < 1) {
      start = 1
      end = Math.min(visibleCount, totalSteps)
    }

    if (end > totalSteps) {
      end = totalSteps
      start = Math.max(1, totalSteps - visibleCount + 1)
    }

    return steps.slice(start - 1, end)
  }

  const visibleSteps = getVisibleSteps()
  const canGoPrev = currentStep > 1
  const canGoNext = currentStep < totalSteps

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        onClick={() => canGoPrev && onStepChange(currentStep - 1)}
        disabled={!canGoPrev}
        variant="ghost"
        size="icon"
        className={cn('h-10 w-10 rounded-full', !canGoPrev && 'opacity-50')}
        aria-label="Etapa anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2">
        {visibleSteps.map((step) => {
          const isActive = step.number === currentStep
          const isAdjacent = Math.abs(step.number - currentStep) === 1

          return (
            <Button
              key={step.number}
              onClick={() => onStepChange(step.number)}
              variant={isActive ? 'default' : 'outline'}
              size="icon"
              className={cn(
                'rounded-full font-semibold transition-all duration-300',
                isActive
                  ? 'h-10 w-10 shadow-lg scale-110'
                  : isAdjacent
                    ? 'h-9 w-9'
                    : 'h-8 w-8',
              )}
              aria-label={`Ir para etapa ${step.number}: ${step.title}`}
              aria-current={isActive ? 'step' : undefined}
            >
              {step.number}
            </Button>
          )
        })}
      </div>

      <Button
        onClick={() => canGoNext && onStepChange(currentStep + 1)}
        disabled={!canGoNext}
        variant="ghost"
        size="icon"
        className={cn('h-10 w-10 rounded-full', !canGoNext && 'opacity-50')}
        aria-label="Próxima etapa"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
