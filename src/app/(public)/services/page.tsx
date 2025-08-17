import { BubbleFooter } from '@inspetor/components/bubble-footer'
import Link from 'next/link'
import { BsFuelPumpFill } from 'react-icons/bs'
import {
  GiAutoRepair,
  GiFuelTank,
  GiPipes,
  GiScubaTanks,
  GiValve,
} from 'react-icons/gi'
import { MdCarRepair } from 'react-icons/md'
import { PiTimer } from 'react-icons/pi'

export default function ServicePage() {
  return (
    <main className="flex h-[calc(100vh-var(--navbar-height))] w-full flex-col items-center justify-start overflow-y-auto px-4 py-6 pb-20 max-md:pb-32 max-sm:pb-24 max-sm:px-3 max-sm:py-4">
      <div className="w-full max-w-[880px] space-y-4 max-sm:space-y-3">
        <h1 className="text-left text-3xl font-bold leading-tight text-white max-sm:text-2xl max-sm:text-center max-sm:leading-snug">
          Nossos Serviços
        </h1>
        <p className="max-w-2xl text-lg text-white/90 max-sm:text-base max-sm:text-center max-sm:leading-relaxed">
          Oferecemos serviços especializados de inspeção e calibração com
          excelência técnica e segurança.
        </p>
      </div>
      <div className="mt-6 grid w-full max-w-[880px] grid-cols-4 gap-6 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:mt-4 max-sm:grid-cols-1 max-sm:gap-3">
        <Link
          href="/services/boiler-inspection"
          className="group block transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-xl"
        >
          <BubbleFooter
            icon={GiPipes}
            text="Inspeção de Caldeiras"
            className="h-full transition-all duration-300 group-hover:-translate-y-2 max-sm:h-auto max-sm:min-h-[100px] max-sm:flex-row max-sm:text-left max-sm:gap-4"
          />
        </Link>
        <Link
          href="/services/integrity-inspection"
          className="group block transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-xl"
        >
          <BubbleFooter
            icon={GiFuelTank}
            iconSize="sm"
            text="Inspeção de Integridade"
            className="h-full transition-all duration-300 group-hover:-translate-y-2 max-sm:h-auto max-sm:min-h-[100px] max-sm:flex-row max-sm:text-left max-sm:gap-4"
          />
        </Link>
        <Link
          href="/services/pipe-inspection"
          className="group block transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-xl"
        >
          <BubbleFooter
            icon={GiAutoRepair}
            iconSize="sm"
            text="Inspeção de Tubulações"
            className="h-full transition-all duration-300 group-hover:-translate-y-2 max-sm:h-auto max-sm:min-h-[100px] max-sm:flex-row max-sm:text-left max-sm:gap-4"
          />
        </Link>
        <Link
          href="/services/pressure-vessel-inspection"
          className="group block transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-xl"
        >
          <BubbleFooter
            icon={GiScubaTanks}
            iconSize="sm"
            text="Inspeção em Vasos de Pressão"
            className="h-full transition-all duration-300 group-hover:-translate-y-2 max-sm:h-auto max-sm:min-h-[100px] max-sm:flex-row max-sm:text-left max-sm:gap-4"
          />
        </Link>
        <Link
          href="/services/automotive-elevator-inspection"
          className="group block transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-xl"
        >
          <BubbleFooter
            icon={MdCarRepair}
            iconSize="sm"
            text="Inspeção de Elevador Automotivo"
            className="h-full transition-all duration-300 group-hover:-translate-y-2 max-sm:h-auto max-sm:min-h-[100px] max-sm:flex-row max-sm:text-left max-sm:gap-4"
          />
        </Link>
        <Link
          href="/services/fuel-tanks-inspection"
          className="group block transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-xl"
        >
          <BubbleFooter
            icon={BsFuelPumpFill}
            iconSize="sm"
            text="Inspeção em Tanques de Combustível"
            className="h-full transition-all duration-300 group-hover:-translate-y-2 max-sm:h-auto max-sm:min-h-[100px] max-sm:flex-row max-sm:text-left max-sm:gap-4"
          />
        </Link>
        <Link
          href="/services/safety-valve-calibration"
          className="group block transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-xl"
        >
          <BubbleFooter
            icon={GiValve}
            iconSize="sm"
            text="Calibração de Válvula de Segurança"
            className="h-full transition-all duration-300 group-hover:-translate-y-2 max-sm:h-auto max-sm:min-h-[100px] max-sm:flex-row max-sm:text-left max-sm:gap-4"
          />
        </Link>
        <Link
          href="/services/manometer-calibration"
          className="group block transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-xl"
        >
          <BubbleFooter
            icon={PiTimer}
            iconSize="sm"
            text="Calibração de Manômetro"
            className="h-full transition-all duration-300 group-hover:-translate-y-2 max-sm:h-auto max-sm:min-h-[100px] max-sm:flex-row max-sm:text-left max-sm:gap-4"
          />
        </Link>
      </div>
    </main>
  )
}
