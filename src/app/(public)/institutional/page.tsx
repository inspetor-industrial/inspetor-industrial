import { BubbleFooter } from '@inspetor/components/bubble-footer'
import Link from 'next/link'
import { FiAward } from 'react-icons/fi'
import { GiGearHammer } from 'react-icons/gi'
import { RiExchangeDollarFill } from 'react-icons/ri'

export default async function InstitutionalPage() {
  return (
    <main className="flex h-[calc(100vh-var(--navbar-height))] w-full flex-col items-center justify-start overflow-y-auto px-4 py-6 pb-20 max-md:pb-32 max-sm:pb-24 max-sm:px-3 max-sm:py-4">
      <div className="w-full max-w-[1280px] space-y-6 max-sm:space-y-4">
        <h1 className="text-left text-4xl font-bold leading-tight text-white max-sm:text-2xl max-sm:text-center max-sm:leading-snug">
          Sobre o Inspetor Industrial
        </h1>
        <div className="space-y-4 max-sm:space-y-3">
          <p className="text-lg leading-relaxed text-white/90 max-sm:text-base max-sm:text-center">
            Com <strong className="text-white">23 anos de experiência</strong>{' '}
            no mercado de Inspeção de Caldeiras, Tubulações e Vasos de Pressão,
            o <strong className="text-white">Inspetor Industrial</strong> é a
            escolha CERTA para o seu negócio.
          </p>
          <p className="text-lg leading-relaxed text-white/90 max-sm:text-base max-sm:text-center">
            Somos especialistas em soluções industriais e medições de segurança,
            preparados para atender clientes em todo Brasil conforme as{' '}
            <strong className="text-white">
              Normas Regulamentadoras NR10, NR12, NR13, NR33 e NR35
            </strong>{' '}
            do Ministério do Trabalho e Emprego.
          </p>
          <p className="text-lg leading-relaxed text-white/90 max-sm:text-base max-sm:text-center">
            Conheça mais sobre nossos serviços:{' '}
            <Link
              href="/services"
              className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Ver Serviços →
            </Link>
          </p>
          <p className="text-lg leading-relaxed text-white/90 max-sm:text-base max-sm:text-center">
            Nosso escritório está localizado em{' '}
            <strong className="text-white">Lambari, Minas Gerais</strong>, e
            estamos à disposição para melhor atender nossos clientes.
          </p>
        </div>
      </div>

      <section
        className="mt-8 w-full max-w-[1280px] space-y-6 max-sm:mt-6 max-sm:space-y-4"
        aria-label="Diferenciais do Inspetor Industrial"
      >
        <h2 className="text-center text-2xl font-bold text-white max-sm:text-xl">
          Nossos Diferenciais
        </h2>
        <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1 max-md:gap-4 max-sm:gap-3">
          <div className="group transform transition-all duration-300 hover:scale-105">
            <BubbleFooter
              className="h-full w-full shadow-lg transition-all duration-300 group-hover:shadow-xl max-sm:h-auto max-sm:min-h-[120px] max-sm:flex-row max-sm:text-left max-sm:gap-4 max-sm:p-3"
              icon={FiAward}
              text="EQUIPE ALTAMENTE QUALIFICADA"
            />
          </div>
          <div className="group transform transition-all duration-300 hover:scale-105">
            <BubbleFooter
              className="h-full w-full shadow-lg transition-all duration-300 group-hover:shadow-xl max-sm:h-auto max-sm:min-h-[120px] max-sm:flex-row max-sm:text-left max-sm:gap-4 max-sm:p-3"
              icon={GiGearHammer}
              text="EXPERIÊNCIA COMPROVADA"
            />
          </div>
          <div className="group transform transition-all duration-300 hover:scale-105">
            <BubbleFooter
              className="h-full w-full shadow-lg transition-all duration-300 group-hover:shadow-xl max-sm:h-auto max-sm:min-h-[120px] max-sm:flex-row max-sm:text-left max-sm:gap-4 max-sm:p-3"
              icon={RiExchangeDollarFill}
              text="PREÇO JUSTO E COMPETITIVO"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
