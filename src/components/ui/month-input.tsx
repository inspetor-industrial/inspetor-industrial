'use client'

import { Input } from '@inspetor/components/ui/input'
import { type ChangeEvent, useId } from 'react'
import { usePaymentInputs } from 'react-payment-inputs'

type MonthInputProps = {
  onChange: (value: ChangeEvent<HTMLInputElement>) => void
  value?: string
  disabled?: boolean
}
export function MonthInput({ value, onChange, disabled }: MonthInputProps) {
  const id = useId()
  const { getExpiryDateProps } = usePaymentInputs()

  return (
    <Input
      {...getExpiryDateProps({
        onChange,
      })}
      id={`expiry-${id}`}
      className="[direction:inherit]"
      value={value}
      disabled={disabled}
    />
  )
}
