import Link from 'next/link'

export default async function Home() {
  return (
    <main className="flex h-[calc(100vh-var(--navbar-height))] w-full flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-4xl space-y-8 max-sm:space-y-6">
        <div className="space-y-6 max-sm:space-y-4">
          <h1 className="text-6xl font-bold leading-tight text-white max-lg:text-5xl max-md:text-4xl max-sm:text-3xl">
            Segurança e conformidade
            <span className="block">em suas mãos</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/80 max-md:text-base max-sm:text-sm">
            Com mais de duas décadas de experiência, oferecemos inspeções
            industriais de alta qualidade. Garantimos conformidade total com as
            normas regulamentadoras para sua tranquilidade e segurança
            operacional.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4 max-sm:flex-col max-sm:w-full max-sm:gap-3">
          <Link
            href="/services"
            className="rounded-lg bg-white px-8 py-4 font-semibold text-inspetor-dark-blue-700 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-inspetor-dark-blue-700 max-sm:w-full max-sm:py-3"
          >
            Nossos Serviços
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border-2 border-white/30 px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white/10 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent max-sm:w-full max-sm:py-3"
          >
            Fale Conosco
          </Link>
        </div>
      </div>
    </main>
  )
}
