import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { TEXT_INFOS } from './text'

interface ServiceInfoPageProps {
  params: Promise<{
    service:
      | 'boiler-inspection'
      | 'integrity-inspection'
      | 'pipe-inspection'
      | 'pressure-vessel-inspection'
      | 'automotive-elevator-inspection'
      | 'fuel-tanks-inspection'
      | 'safety-valve-calibration'
      | 'manometer-calibration'
  }>
}

export const revalidate = 604800 // 7 days to revalidate this page

export async function generateMetadata({
  params,
}: ServiceInfoPageProps): Promise<Metadata> {
  const { service } = await params
  const title = TEXT_INFOS[service]?.title ?? ''

  return {
    title,
  }
}

export async function generateStaticParams() {
  const services = [
    'boiler-inspection',
    'integrity-inspection',
    'pipe-inspection',
    'pressure-vessel-inspection',
    'automotive-elevator-inspection',
    'fuel-tanks-inspection',
    'safety-valve-calibration',
    'manometer-calibration',
  ]

  return services.map((service: string) => ({
    service,
  }))
}

export default async function ServiceInfoPage({
  params,
}: ServiceInfoPageProps) {
  const { service: serviceName } = await params
  const service = TEXT_INFOS[serviceName]

  return (
    <main className="flex h-[calc(100vh-var(--navbar-height))] w-full flex-col items-center justify-start overflow-y-auto px-4 py-6 pb-20 max-md:pb-32 max-sm:pb-24 max-sm:px-3 max-sm:py-4">
      <div className="w-full max-w-[880px] space-y-6 max-sm:space-y-4">
        <h1 className="text-left text-3xl font-bold leading-tight text-white max-sm:text-2xl max-sm:text-center max-sm:leading-snug">
          {service.title}
        </h1>
        <div
          className="prose prose-invert max-w-none text-white/90 max-sm:prose-sm [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>br]:mb-4 [&>i]:text-white/80 [&>i]:italic [&>p]:mb-4 [&>p]:leading-relaxed max-sm:[&>ul]:pl-4 max-sm:[&>ul>li]:mb-1 max-sm:[&>ul>li]:text-sm"
          dangerouslySetInnerHTML={{ __html: service.text }}
        />
      </div>
      <div className="mt-8 flex w-full max-w-[880px] flex-row-reverse items-center justify-center gap-4 max-sm:mt-6 max-sm:flex-col max-sm:gap-3">
        <Link
          className="group w-full max-w-[300px] transform rounded-lg bg-inspetor-dark-blue-700 px-8 py-4 text-center font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-inspetor-dark-blue-800 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent max-sm:py-3 max-sm:text-sm"
          href={`/contact?service=${serviceName}`}
        >
          Solicitar Orçamento
        </Link>
        <Link
          className="group flex items-center justify-center gap-2 w-full max-w-[300px] transform rounded-lg border-2 border-white/20 bg-white/10 px-8 py-4 text-center font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent max-sm:py-3 max-sm:text-sm"
          href="/services"
        >
          <ArrowLeft className="size-4" />
          Voltar aos Serviços
        </Link>
      </div>
    </main>
  )
}
