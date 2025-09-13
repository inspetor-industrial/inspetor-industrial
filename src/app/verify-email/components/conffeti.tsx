'use client'

import confetti from 'canvas-confetti'
import { type ReactNode, useEffect } from 'react'

type ConfettiProps = {
  children: ReactNode | ReactNode[]
}

export function Confetti({ children }: ConfettiProps) {
  function fireConfetti() {
    const end = Date.now() + 3 * 1000 // 3 seconds
    const colors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1']

    const frame = () => {
      if (Date.now() > end) return

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      })

      requestAnimationFrame(frame)
    }

    frame()
  }

  useEffect(() => {
    fireConfetti()
  }, [])

  return children
}
