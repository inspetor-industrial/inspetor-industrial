'use client'

import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const handleBack = () => {
    window.history.back()
  }

  return (
    <button
      onClick={handleBack}
      className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm text-inspetor-gray-600 hover:text-inspetor-dark-blue-700 hover:bg-inspetor-dark-blue-700/5 transition-all duration-300 rounded-md"
    >
      <ArrowLeft className="size-4" />
      Voltar
    </button>
  )
}
