import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'

interface Step {
  number: number
  title: string
}

interface StepTitleSelectorProps {
  steps: Step[]
  currentStep: number
  onStepChange: (step: number) => void
}

export function StepTitleSelector({
  steps,
  currentStep,
  onStepChange,
}: StepTitleSelectorProps) {
  const currentStepData = steps.find((s) => s.number === currentStep)

  return (
    <Select
      value={currentStep.toString()}
      onValueChange={(value) => onStepChange(parseInt(value))}
    >
      <SelectTrigger className="w-[280px] bg-card border-border text-foreground font-medium">
        <SelectValue>
          {currentStepData
            ? `${currentStepData.number}. ${currentStepData.title}`
            : 'Selecionar etapa'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {steps.map((step) => (
          <SelectItem
            key={step.number}
            value={step.number.toString()}
            className="text-foreground hover:bg-accent/10 focus:bg-accent/10"
          >
            <span className="font-medium">{step.number}.</span> {step.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
