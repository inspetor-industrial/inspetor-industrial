'use client'

import type { BoilerReportWithRelations } from '@inspetor/actions/boiler/get-boiler-report-by-id'
import { Button } from '@inspetor/components/ui/button'
import type { Clients, User } from '@inspetor/generated/prisma/browser'
import { ArrowLeft, Edit, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'

import { BoilerReportEditModal } from './edit-view-modal'

type BoilerReportActionsProps = {
  boilerReport: BoilerReportWithRelations
  clients: Clients[]
  engineers: User[]
}

export function BoilerReportActions({
  boilerReport,
  clients,
  engineers,
}: BoilerReportActionsProps) {
  const modalRef = useRef<any>(null)

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => modalRef.current?.open(boilerReport, false)}
        >
          <Edit className="size-4" />
          <span className="hidden sm:inline">Editar</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => modalRef.current?.open(boilerReport, true)}
        >
          <Eye className="size-4" />
          <span className="hidden sm:inline">Visualizar</span>
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link
            href="/dashboard/reports/boiler"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Link>
        </Button>
      </div>

      <BoilerReportEditModal
        ref={modalRef}
        clients={clients}
        engineers={engineers}
      />
    </>
  )
}
