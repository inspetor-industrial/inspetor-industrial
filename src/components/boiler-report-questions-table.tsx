'use client'

import { Checkbox } from '@inspetor/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@inspetor/components/ui/table'

export type QuestionAnswer = 'yes' | 'no' | ''

export type BoilerReportQuestion = {
  question: string
  answer: QuestionAnswer
}

type BoilerReportQuestionsTableProps = {
  questions: BoilerReportQuestion[]
  onChange: (questions: BoilerReportQuestion[]) => void
  disabled?: boolean
}

export function BoilerReportQuestionsTable({
  questions,
  onChange,
  disabled = false,
}: BoilerReportQuestionsTableProps) {
  const handleAnswerChange = (index: number, value: QuestionAnswer) => {
    const next = questions.map((q, i) =>
      i === index ? { ...q, answer: value } : q,
    )
    onChange(next)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Pergunta</TableHead>
          <TableHead
            scope="col"
            className="w-20 border-l border-border text-center"
          >
            Sim
          </TableHead>
          <TableHead
            scope="col"
            className="w-20 border-l border-border text-center"
          >
            Não
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map((row, index) => (
          <TableRow key={`question-${index}-${row.question.slice(0, 20)}`}>
            <TableCell className="whitespace-normal font-medium">
              {row.question}
            </TableCell>
            <TableCell className="border-l border-border text-center">
              <div className="flex justify-center">
                <Checkbox
                  id={`q-${index}-yes`}
                  checked={row.answer === 'yes'}
                  onCheckedChange={(checked) => {
                    handleAnswerChange(index, checked ? 'yes' : '')
                  }}
                  disabled={disabled}
                  aria-label={`Sim para: ${row.question}`}
                  className="cursor-pointer"
                />
              </div>
            </TableCell>
            <TableCell className="border-l border-border text-center">
              <div className="flex justify-center">
                <Checkbox
                  id={`q-${index}-no`}
                  checked={row.answer === 'no'}
                  onCheckedChange={(checked) => {
                    handleAnswerChange(index, checked ? 'no' : '')
                  }}
                  disabled={disabled}
                  aria-label={`Não para: ${row.question}`}
                  className="cursor-pointer"
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
