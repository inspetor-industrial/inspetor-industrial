type NormalizedQuestion = {
  question: string
  answer: '' | 'yes' | 'no'
}

type NormalizedNr = {
  parent: string
  parentSelected: boolean
  children: Array<{
    selected: boolean
    text: string
  }>
}

export type NormalizedTests = {
  questions: NormalizedQuestion[]
  nrs: NormalizedNr[]
}

export function normalizeStoredTests(raw: unknown): NormalizedTests | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const questions = o.questions
  const nrs = o.nrs
  if (!Array.isArray(questions) || !Array.isArray(nrs)) return null

  const normalizedQuestions = questions.map((q: unknown) => {
    const item = q as Record<string, unknown>
    const answer = item.answer
    const normalizedAnswer: '' | 'yes' | 'no' =
      answer === 'yes' || answer === 'no' ? answer : ''
    return {
      question: String(item.question ?? ''),
      answer: normalizedAnswer,
    }
  })

  const normalizedNrs = nrs.map((nr: unknown) => {
    const item = nr as Record<string, unknown>
    const children = Array.isArray(item.children)
      ? (item.children as Array<Record<string, unknown>>).map((c) => ({
          selected: Boolean(c.selected),
          text: String(c.text ?? ''),
        }))
      : []
    return {
      parent: String(item.parent ?? ''),
      parentSelected: Boolean(item.parentSelected),
      children,
    }
  })

  return { questions: normalizedQuestions, nrs: normalizedNrs }
}
