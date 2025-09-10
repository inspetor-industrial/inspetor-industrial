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
import { Inbox } from 'lucide-react'

interface ExamsTableProps {
  options: Array<{ question: string; answer: string }>
  value: Array<{ question: string; answer: string }>
  onValueChange: (value: Array<{ question: string; answer: string }>) => void
}

export function ExamsTable({ options, value, onValueChange }: ExamsTableProps) {
  function handleYesValueChange(index: number, checked: boolean) {
    const newValue = [...value]
    let answer = newValue[index].answer
    if (answer === 'y' && !checked) {
      answer = ''
    } else {
      answer = 'y'
    }

    newValue[index] = {
      ...newValue[index],
      answer,
    }
    onValueChange(newValue)
  }

  function handleNoValueChange(index: number, checked: boolean) {
    const newValue = [...value]
    let answer = newValue[index].answer
    if (answer === 'n' && !checked) {
      answer = ''
    } else {
      answer = 'n'
    }

    newValue[index] = {
      ...newValue[index],
      answer,
    }
    onValueChange(newValue)
  }

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead className="max-w-40 md:max-w-none">Pergunta</TableHead>
              <TableHead className="text-center w-12">Sim</TableHead>
              <TableHead className="text-center w-12">Não</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Inbox className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhuma pergunta encontrada
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {options.map((item, index) => (
              <TableRow key={index} className="divide-x">
                <TableCell className="max-w-40 md:max-w-none whitespace-normal">
                  {item.question}
                </TableCell>
                <TableCell className="text-center w-12">
                  <div className="flex justify-center items-center mr-2">
                    <Checkbox
                      checked={value[index]?.answer === 'y'}
                      onCheckedChange={(checked) =>
                        handleYesValueChange(index, !!checked)
                      }
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center w-12">
                  <div className="flex justify-center items-center mr-2">
                    <Checkbox
                      checked={value[index]?.answer === 'n'}
                      onCheckedChange={(checked) =>
                        handleNoValueChange(index, !!checked)
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
