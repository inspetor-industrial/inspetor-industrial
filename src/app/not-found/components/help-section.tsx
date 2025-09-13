import { Button } from '@inspetor/components/ui/button'
import { HelpCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function HelpSection() {
  return (
    <div className="pt-6 border-t border-inspetor-gray-300 bg-inspetor-gray-300/20 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <HelpCircle className="size-5 text-inspetor-dark-blue-700 mt-0.5 flex-shrink-0" />
        <div className="text-left">
          <p className="text-sm font-semibold text-inspetor-dark-blue-700 mb-1">
            Precisa de ajuda?
          </p>
          <p className="text-sm text-inspetor-gray-600 mb-3">
            Nossa equipe está pronta para ajudar você a encontrar o que precisa.
          </p>
          <Link href="/contact">
            <Button
              size="sm"
              className="bg-inspetor-dark-blue-700 hover:bg-inspetor-dark-blue-800 text-white"
            >
              <ExternalLink className="size-4" />
              Fale Conosco
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
