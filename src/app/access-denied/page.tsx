import { Button } from '@inspetor/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@inspetor/components/ui/card'
import { getSession } from '@inspetor/lib/auth/server'
import { AlertTriangle, Home, Shield } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AccessDeniedPage() {
  const session = await getSession()
  const isLoggedIn = !!session?.user

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Acesso Negado
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Você não tem permissão para acessar este recurso. Entre em contato
              com o administrador do sistema se acredita que isso é um erro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Recurso protegido</span>
            </div>

            <div className="pt-4">
              <Link href={isLoggedIn ? '/dashboard' : '/'}>
                <Button className="w-full" size="lg" icon={Home}>
                  {isLoggedIn ? 'Voltar ao Dashboard' : 'Ir para o Início'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
