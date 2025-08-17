import { InspetorLogoHome } from '@inspetor/assets/inspetor-logo-home'
import { Button } from '@inspetor/components/ui/button'
import { FileIcon } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full mt-32">
      <InspetorLogoHome />

      <div className="flex flex-col gap-2 w-80">
        {/* <Link to="/">
          <Button className="bg-inspetor-primary w-full">
            <Calendar className="size-4" />
            Agendar inspeção
          </Button>
        </Link>
        <Link to="/">
          <Button className="bg-inspetor-primary w-full">
            <UserPlus className="size-4" />
            Cadastrar cliente
          </Button>
        </Link> */}
        <Link href="/dashboard/storage/reports">
          <Button className="w-full">
            <FileIcon className="size-4" />
            Relatórios
          </Button>
        </Link>
      </div>
    </div>
  )
}
