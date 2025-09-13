import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@inspetor/components/ui/avatar'
import { Badge } from '@inspetor/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@inspetor/components/ui/card'
import { Separator } from '@inspetor/components/ui/separator'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@inspetor/components/ui/tabs'
import { auth } from '@inspetor/lib/auth/authjs'
import { dayjsApi } from '@inspetor/lib/dayjs'
import { prisma } from '@inspetor/lib/prisma'
import { cn } from '@inspetor/lib/utils'
import { formatUsername } from '@inspetor/utils/format-username'
import { AlertCircle, Building2, CheckCircle, Shield, User } from 'lucide-react'
import { notFound } from 'next/navigation'

import { ChangePersonalInfo } from './components/change-personal-info'
import { SendEmailVerificationButton } from './components/send-email-verification-button'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  let user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: {
      company: {
        select: {
          name: true,
          cnpj: true,
          status: true,
        },
      },
    },
  })

  if (!user) {
    user = await prisma.user.findUnique({
      where: { username: session.user.username as string },
      include: {
        company: {
          select: {
            name: true,
            cnpj: true,
            status: true,
          },
        },
      },
    })
  }

  if (!user) {
    return notFound()
  }

  const getRoleBadgeVariant = (
    role: string,
  ): 'default' | 'secondary' | 'destructive' => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'OPERATOR':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador'
      case 'OPERATOR':
        return 'Operador'
      default:
        return 'Usuário'
    }
  }

  const getStatusIcon = (status: string) => {
    return status === 'ACTIVE' ? CheckCircle : AlertCircle
  }

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
  }

  const StatusIcon = getStatusIcon(user.status)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Configurações da Conta
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações da conta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
              <TabsTrigger value="preferences">Preferências</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais e dados de contato
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={user.image || ''}
                        alt={user.name || 'Usuário'}
                      />
                      <AvatarFallback className="text-lg font-semibold">
                        {user.name ? formatUsername(user.name) : 'UU'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <h3 className="font-medium">Foto do Perfil</h3>
                      <p className="text-sm text-muted-foreground">
                        Clique na foto para fazer upload de uma nova imagem
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uma foto é opcional mas fortemente recomendada
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <ChangePersonalInfo user={user} />
                </CardContent>
              </Card>

              {user.company && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Informações da Empresa
                    </CardTitle>
                    <CardDescription>
                      Dados da empresa à qual você está vinculado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Nome da Empresa
                        </label>
                        <div className="rounded-md border bg-muted/50 h-9 flex items-center justify-start px-3">
                          <span className="text-sm">{user.company.name}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">CNPJ</label>
                        <div className="rounded-md border bg-muted/50 h-9 flex items-center justify-start px-3">
                          <span className="text-sm font-mono">
                            {user.company.cnpj}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon
                        className={`h-4 w-4 ${getStatusColor(user.company.status)}`}
                      />
                      <span className="text-sm">
                        Status:{' '}
                        {user.company.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Segurança da Conta
                  </CardTitle>
                  <CardDescription>
                    Gerencie as configurações de segurança da sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alterar Senha</label>
                    <p className="text-sm text-muted-foreground">
                      Atualize sua senha para manter sua conta segura
                    </p>
                    <div className="p-4 rounded-md border bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        Funcionalidade de alteração de senha será implementada
                        em breve
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row sm:items-center w-full gap-2 sm:justify-between">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Verificação de Email
                      </label>
                      <div className="flex items-center gap-2">
                        {user.emailVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="text-sm">
                          {user.emailVerified
                            ? 'Email verificado'
                            : 'Email não verificado'}
                        </span>
                      </div>
                    </div>
                    {!user.emailVerified ? (
                      <SendEmailVerificationButton email={user.email} />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Verificado em{' '}
                        {dayjsApi(user.emailVerified).format(
                          'DD/MM/YYYY HH:mm',
                        )}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências</CardTitle>
                  <CardDescription>
                    Configure suas preferências de uso da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    As configurações de preferências serão implementadas em
                    breve
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage
                    src={user.image || ''}
                    alt={user.name || 'Usuário'}
                  />
                  <AvatarFallback className="text-sm font-semibold">
                    {user.name ? formatUsername(user.name) : 'UU'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium truncate">
                    {user.name || 'Usuário'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Função</span>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      className={cn('size-4', getStatusColor(user.status))}
                    />
                    <span className="text-sm">
                      {user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Membro desde
                  </span>
                  <span className="text-sm">
                    {dayjsApi(user.createdAt).format('MMM/YYYY')}
                  </span>
                </div>

                {user.company && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Empresa
                    </span>
                    <span className="text-sm font-medium">
                      {user.company.name}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle className="text-lg">Links Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Alterar senha
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Configurações de notificação
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Histórico de atividades
                </a>
                <a
                  href="#"
                  className="block text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  Excluir conta
                </a>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  )
}
