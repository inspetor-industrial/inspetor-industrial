import {
  BoilerReportWithRelations,
  getBoilerReportByIdAction,
} from '@inspetor/actions/boiler/get-boiler-report-by-id'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@inspetor/components/ui/card'
import { UserResponsibility } from '@inspetor/generated/prisma/client'
import { getSession } from '@inspetor/lib/auth/server'
import { getFullAuthenticatedUser } from '@inspetor/lib/auth/get-full-user'
import { dayjsApi } from '@inspetor/lib/dayjs'
import { prisma } from '@inspetor/lib/prisma'
import {
  Beaker,
  Box,
  Clipboard,
  Cpu,
  Droplets,
  FileCheck,
  FileCog,
  FileText,
  Flame,
  FlaskConical,
  FlaskRound,
  Gauge,
  Package,
  Radio,
  Sparkles,
  Syringe,
  TestTube,
  TestTube2,
  TrendingUp,
  User,
  Waves,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react'
import { redirect } from 'next/navigation'

import { BoilerReportTypeBadge } from '../../components/boiler-report-type-badge'
import { BoilerSectionCard } from '../components/boiler-section-card'
import { BoilerReportActions } from './components/boiler-report-actions'

type BoilerViewPageProps = {
  params: Promise<{
    boilerId: string
  }>
}

const subSections = [
  {
    id: 'operator-data',
    title: 'Dados do Operador',
    icon: User,
  },
  {
    id: 'boiler-info',
    title: 'Informações da Caldeira',
    icon: Flame,
  },
  {
    id: 'structure-furnace',
    title: 'Informações da Estrutura do Forno',
    icon: Box,
  },
  {
    id: 'structure-mirror',
    title: 'Informações da Estrutura do Espelho',
    icon: Sparkles,
  },
  {
    id: 'structure-body',
    title: 'Informações da Estrutura do Corpo',
    icon: Package,
  },
  {
    id: 'structure-tube',
    title: 'Informações da Estrutura dos Tubos',
    icon: Wind,
  },
  {
    id: 'general-tests',
    title: 'Testes de Desempenho Gerais',
    icon: TestTube2,
  },
  {
    id: 'external-tests',
    title: 'Testes de Desempenho Externos',
    icon: Wrench,
  },
  {
    id: 'internal-tests',
    title: 'Testes de Desempenho Internos',
    icon: TestTube,
  },
  {
    id: 'local-installation-tests',
    title: 'Testes de Desempenho da Instalação Local',
    icon: TrendingUp,
  },
  {
    id: 'injector',
    title: 'Injetor',
    icon: Syringe,
  },
  {
    id: 'power-supply',
    title: 'Alimentação Elétrica',
    icon: Zap,
  },
  {
    id: 'level-indicator',
    title: 'Indicador de Nível',
    icon: Gauge,
  },
  {
    id: 'valve-tests',
    title: 'Testes de Válvulas',
    icon: FlaskConical,
  },
  {
    id: 'calibration-order',
    title: 'Ordem de Calibração',
    icon: Clipboard,
  },
  {
    id: 'eletronic-panel',
    title: 'Painel Eletrônico',
    icon: Cpu,
  },
  {
    id: 'discharge-system',
    title: 'Sistema de Descarga',
    icon: Droplets,
  },
  {
    id: 'water-quality',
    title: 'Qualidade da Água',
    icon: Beaker,
  },
  {
    id: 'hidrostatic-test',
    title: 'Teste Hidrostático',
    icon: Waves,
  },
  {
    id: 'accumulation-test',
    title: 'Teste de Acumulação',
    icon: FlaskRound,
  },
  {
    id: 'ultrasound-test',
    title: 'Teste de Ultrassom',
    icon: Radio,
  },
  {
    id: 'pmta',
    title: 'PMTA',
    icon: FileCog,
  },
  {
    id: 'conclusions',
    title: 'Conclusões',
    icon: FileCheck,
  },
]

export default async function BoilerViewPage({ params }: BoilerViewPageProps) {
  const { boilerId } = await params

  const session = await getSession()
  const fullUser = await getFullAuthenticatedUser(session)
  if (!fullUser) {
    redirect('/auth/sign-in')
  }

  const [boilerReportResponse] = await getBoilerReportByIdAction({
    boilerReportId: boilerId,
  })

  const boilerReport = boilerReportResponse.others
    .data as BoilerReportWithRelations

  if (!boilerReportResponse.success || !boilerReportResponse.others?.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Relatório não encontrado ou você não tem permissão para
              visualizá-lo
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const clients = await prisma.clients.findMany({
    where: {
      companyId: fullUser.companyId,
    },
  })

  const engineers = await prisma.user.findMany({
    where: {
      companyId: fullUser.companyId,
      responsibility: UserResponsibility.ENGINEER,
    },
  })

  return (
    <div className="flex flex-col min-h-screen space-y-6">
      <Card className="border-2">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl flex items-center gap-2 sm:gap-3">
              <FileText className="size-5 sm:size-6 lg:size-7 text-inspetor-dark-blue-700 flex-shrink-0" />
              <span className="leading-tight">
                Relatório de Inspeção de Caldeira
              </span>
            </CardTitle>
            <BoilerReportActions
              boilerReport={boilerReport}
              clients={clients}
              engineers={engineers}
            />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Cliente:</p>
            <p className="font-medium">{boilerReport.client.companyName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tipo:</p>
            <BoilerReportTypeBadge type={boilerReport.type} />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Data:</p>
            <p className="font-medium">
              {boilerReport.date
                ? dayjsApi(boilerReport.date).format('DD/MM/YYYY')
                : 'Não informado'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Próxima Inspeção:</p>
            <p className="font-medium">
              {boilerReport.nextInspectionDate
                ? dayjsApi(boilerReport.nextInspectionDate).format('DD/MM/YYYY')
                : 'Não informado'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Engenheiro:</p>
            <p className="font-medium">{boilerReport.engineer.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Criado em:</p>
            <p className="font-medium">
              {boilerReport.createdAt
                ? dayjsApi(boilerReport.createdAt).format('DD/MM/YYYY HH:mm')
                : 'Não informado'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {subSections.map((section) => (
          <BoilerSectionCard
            boilerId={boilerId}
            key={section.id}
            section={section}
          />
        ))}
      </div>
    </div>
  )
}
