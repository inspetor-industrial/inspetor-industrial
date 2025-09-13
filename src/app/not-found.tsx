import { Button } from '@inspetor/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function NotFound() {
  return (
    <main className="flex h-[calc(100vh-var(--navbar-height))] w-full flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-inspetor-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-inspetor-secondary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="space-y-12 max-w-2xl mx-auto">
        {/* 404 Number */}
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-9xl md:text-[12rem] font-black text-inspetor-dark-blue-700 leading-none">
            4
          </h1>
          <h1 className="text-9xl md:text-[12rem] font-black text-inspetor-primary leading-none">
            0
          </h1>
          <h1 className="text-9xl md:text-[12rem] font-black text-inspetor-dark-blue-700 leading-none">
            4
          </h1>
        </div>

        {/* Error Message with Fade In */}
        <div
          className="space-y-6 animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-inspetor-gray-800">
            Página não encontrada
          </h2>
          <p className="text-lg text-inspetor-gray-600 leading-relaxed max-w-md mx-auto">
            A página que você está procurando não existe ou pode ter sido
            movida. Verifique o endereço digitado ou navegue para uma das opções
            abaixo.
          </p>
        </div>

        {/* Action Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in"
          style={{ animationDelay: '0.6s' }}
        >
          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Ir para o Início
            </Button>
          </Link>
        </div>

        {/* Additional Help */}
        <div
          className="pt-8 animate-fade-in"
          style={{ animationDelay: '0.9s' }}
        >
          <p className="text-sm text-inspetor-gray-500 mb-4">
            Precisa de ajuda para encontrar o que procura?
          </p>
          <Link href="/services">
            <Button
              variant="link"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              Explorar nossos serviços
            </Button>
          </Link>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-inspetor-primary rounded-full animate-ping opacity-60"></div>
      <div
        className="absolute top-32 right-16 w-1 h-1 bg-inspetor-secondary rounded-full animate-ping opacity-40"
        style={{ animationDelay: '2s' }}
      ></div>
      <div
        className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-inspetor-primary rounded-full animate-ping opacity-50"
        style={{ animationDelay: '4s' }}
      ></div>
      <div
        className="absolute bottom-32 right-10 w-1 h-1 bg-inspetor-secondary rounded-full animate-ping opacity-30"
        style={{ animationDelay: '6s' }}
      ></div>
    </main>
  )
}
