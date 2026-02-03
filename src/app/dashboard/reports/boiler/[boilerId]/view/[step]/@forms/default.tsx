import { Card, CardContent } from '@inspetor/components/ui/card'
import { FileQuestion } from 'lucide-react'

export default function FormsDefault() {
  return (
    <Card className="border-2">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileQuestion className="size-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Nenhum formulário selecionado
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Selecione uma seção acima para começar a preencher o relatório de
          inspeção da caldeira.
        </p>
      </CardContent>
    </Card>
  )
}
