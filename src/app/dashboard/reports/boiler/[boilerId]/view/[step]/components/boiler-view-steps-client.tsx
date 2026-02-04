'use client'

import { formSteps } from '@inspetor/constants/form-steps-boiler-report'
import { useRouter } from 'next/navigation'

import { StepIndicator } from './step-indicator'
import { StepTitleSelector } from './step-title-selector'

interface BoilerViewStepsClientProps {
  boilerId: string
  stepId: string
}

export function BoilerViewStepsClient({
  boilerId,
  stepId,
}: BoilerViewStepsClientProps) {
  const router = useRouter()
  const currentStepData = formSteps.find((s) => s.id === stepId)
  const currentStep = currentStepData?.number ?? 1

  const handleStepChange = (step: number) => {
    const stepData = formSteps.find((s) => s.number === step)
    if (stepData) {
      router.push(`/dashboard/reports/boiler/${boilerId}/view/${stepData.id}`)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex-1 flex justify-center">
          <StepIndicator
            steps={formSteps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />
        </div>
      </div>

      <div className="mb-8 flex justify-center">
        <StepTitleSelector
          steps={formSteps}
          currentStep={currentStep}
          onStepChange={handleStepChange}
        />
      </div>
    </div>
  )
}
