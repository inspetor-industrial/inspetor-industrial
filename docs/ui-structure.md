# Estrutura da Interface do Usuário (UI)

## Visão Geral

O sistema **Inspetor Industrial** utiliza **Next.js 14+** com **App Router** para gerenciar a interface do usuário. A aplicação é construída com **React**, **TypeScript**, **Tailwind CSS** e componentes da biblioteca **shadcn/ui**, proporcionando uma experiência moderna e responsiva.

---

## Arquitetura da Aplicação

### Framework e Tecnologias

- **Next.js 14+**: Framework React com App Router
- **React 18+**: Biblioteca de interface
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização utilitária
- **shadcn/ui**: Componentes de UI reutilizáveis
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas
- **CASL**: Sistema de permissões baseado em abilities
- **TanStack Query**: Gerenciamento de estado do servidor
- **ZSA**: Server Actions tipadas

---

## Estrutura de Diretórios

```
src/
├── app/                          # App Router do Next.js
│   ├── (public)/                # Rotas públicas (sem autenticação)
│   │   ├── page.tsx            # Página inicial
│   │   ├── contact/            # Formulário de contato
│   │   ├── services/           # Página de serviços
│   │   └── institutional/      # Página institucional
│   ├── auth/                   # Rotas de autenticação
│   │   ├── layout.tsx          # Layout de autenticação
│   │   └── sign-in/            # Página de login
│   ├── dashboard/              # Área autenticada (dashboard)
│   │   ├── layout.tsx          # Layout principal do dashboard
│   │   ├── page.tsx            # Página inicial do dashboard
│   │   ├── profile/            # Configurações de perfil
│   │   ├── users/              # Gerenciamento de usuários
│   │   ├── company/            # Gerenciamento de empresas
│   │   ├── client/             # Gerenciamento de clientes
│   │   ├── reports/            # Relatórios de inspeção
│   │   ├── maintenance/        # Manutenções
│   │   ├── equipment/          # Equipamentos
│   │   └── ...                 # Outras páginas
│   ├── api/                    # API Routes
│   │   └── auth/               # Endpoints de autenticação
│   ├── layout.tsx              # Layout raiz
│   └── providers.tsx          # Providers globais
├── components/                  # Componentes reutilizáveis
│   ├── ui/                     # Componentes base (shadcn/ui)
│   ├── app-sidebar.tsx         # Sidebar principal
│   ├── header.tsx              # Cabeçalho
│   └── ...                     # Outros componentes
├── lib/                        # Bibliotecas e utilitários
│   ├── auth/                   # Sistema de autenticação
│   ├── prisma.ts               # Cliente Prisma
│   └── utils.ts                # Funções utilitárias
├── actions/                    # Server Actions
├── casl/                       # Sistema de permissões (CASL)
├── hooks/                      # React Hooks customizados
└── types/                      # Definições de tipos TypeScript
```

---

## Sistema de Layouts

### Layout Raiz (`app/layout.tsx`)

O layout raiz configura:
- **Metadata**: Título, descrição e SEO
- **Fontes**: Google Fonts (Geist)
- **Providers**: Contextos globais da aplicação

```typescript
// Estrutura básica
<RootLayout>
  <Providers>
    {children}
  </Providers>
</RootLayout>
```

### Layout Público (`app/(public)/layout.tsx`)

Layout para páginas públicas (não autenticadas):
- **Navbar**: Barra de navegação pública
- **Sem sidebar**: Apenas conteúdo principal
- **Acesso livre**: Sem verificação de autenticação

### Layout de Autenticação (`app/auth/layout.tsx`)

Layout para páginas de autenticação:
- **Navbar**: Barra de navegação simples
- **Formulários**: Login, registro, recuperação de senha
- **Background**: Design específico para autenticação

### Layout do Dashboard (`app/dashboard/layout.tsx`)

Layout principal da área autenticada, composto por múltiplas camadas de proteção:

```typescript
<AuthWrapper>              // 1. Verifica autenticação
  <AbilityProvider>         // 2. Configura permissões (CASL)
    <PermissionWrapper>     // 3. Verifica permissões por rota
      <SidebarProvider>     // 4. Gerencia sidebar
        <AppSidebar />      // 5. Sidebar lateral
        <Header />          // 6. Cabeçalho superior
        <MainContainer>     // 7. Container principal
          {children}        // 8. Conteúdo da página
        </MainContainer>
      </SidebarProvider>
    </PermissionWrapper>
  </AbilityProvider>
</AuthWrapper>
```

**Camadas de Proteção:**

1. **AuthWrapper**: Redireciona para `/auth/sign-in` se não autenticado
2. **AbilityProvider**: Cria e fornece abilities do CASL baseadas no usuário
3. **PermissionWrapper**: Verifica se o usuário tem permissão para acessar a rota atual
4. **SidebarProvider**: Gerencia estado do sidebar (colapsado/expandido)

---

## Sistema de Autenticação

### Fluxo de Autenticação

#### 1. Login (`/auth/sign-in`)

**Processo:**
1. Usuário preenche email/username e senha
2. Formulário valida dados com Zod
3. Requisição POST para `/api/auth/login`
4. Backend valida credenciais:
   - Busca usuário por email ou username
   - Verifica se usuário está ativo (`status: ACTIVE`)
   - Compara senha com hash armazenado
5. Cria sessão no banco de dados:
   - Gera `accessToken` e `refreshToken`
   - Armazena IP e User-Agent
   - Define datas de expiração
6. Define cookies HTTP-only:
   - `access_token`: Token de acesso (curta duração)
   - `refresh_token`: Token de refresh (longa duração)
7. Retorna dados do usuário (sem informações sensíveis)
8. Redireciona para `/dashboard`

**Componentes:**
- `app/auth/sign-in/page.tsx`: Página de login
- `app/auth/sign-in/sign-form.tsx`: Formulário de login
- `app/api/auth/login/route.ts`: Endpoint de login

#### 2. Verificação de Sessão

**Server-Side (`getSession`):**
- Lê cookies HTTP-only
- Busca sessão no banco por `accessToken`
- Valida:
  - Sessão existe
  - Não está revogada (`revokedAt === null`)
  - Token não expirou
  - Usuário está ativo
- Retorna objeto `Session` com dados do usuário

**Client-Side (`useAuth`):**
- Hook React que gerencia estado de autenticação
- Fornece:
  - `user`: Dados do usuário atual
  - `isAuthenticated`: Status de autenticação
  - `isLoading`: Estado de carregamento
  - `login()`: Função para fazer login
  - `logout()`: Função para fazer logout
  - `refresh()`: Atualiza dados do usuário
  - `update()`: Força atualização

**Endpoints:**
- `GET /api/auth/me`: Retorna usuário atual
- `POST /api/auth/refresh`: Renova tokens
- `POST /api/auth/logout`: Encerra sessão

#### 3. Logout

**Processo:**
1. Requisição POST para `/api/auth/logout`
2. Backend:
   - Marca sessão como revogada (`revokedAt`)
   - Remove cookies
3. Client:
   - Limpa estado de autenticação
   - Redireciona para `/auth/sign-in`

### Estrutura de Tokens

**Access Token:**
- Duração: Curta (ex: 15 minutos)
- Armazenado em cookie HTTP-only
- Usado para autenticação em requisições

**Refresh Token:**
- Duração: Longa (ex: 7 dias)
- Armazenado em cookie HTTP-only
- Usado para renovar access token

**Segurança:**
- Cookies HTTP-only (não acessíveis via JavaScript)
- Cookies Secure (apenas HTTPS em produção)
- SameSite protection
- Validação de IP e User-Agent (opcional)

---

## Configuração de Usuário

### Página de Perfil (`/dashboard/profile`)

A página de perfil permite que usuários gerenciem suas informações pessoais e configurações da conta.

#### Estrutura da Página

**Tabs (Abas):**
1. **Perfil**: Informações pessoais e da empresa
2. **Segurança**: Configurações de segurança e verificação de email
3. **Preferências**: Configurações de preferências (em desenvolvimento)

#### Aba Perfil

**Informações Pessoais:**
- **Foto do Perfil**: Avatar do usuário (opcional)
- **Nome**: Nome completo
- **Username**: Nome de usuário para login
- **Email**: Endereço de email

**Componente:** `ChangePersonalInfo`
- Formulário com validação Zod
- Campos editáveis: nome, username, email
- **Comportamento especial**: Ao alterar username, usuário é deslogado e redirecionado para login

**Informações da Empresa:**
- **Nome da Empresa**: Nome da empresa vinculada
- **CNPJ**: CNPJ da empresa
- **Status**: Status da empresa (Ativa/Inativa)
- **Somente leitura**: Informações da empresa não podem ser editadas pelo usuário

#### Aba Segurança

**Alteração de Senha:**
- Funcionalidade em desenvolvimento
- Será implementada futuramente

**Verificação de Email:**
- **Status**: Mostra se email está verificado
- **Botão de Verificação**: Envia email de verificação (se não verificado)
- **Data de Verificação**: Mostra quando email foi verificado (se aplicável)

**Componente:** `SendEmailVerificationButton`
- Envia email com token de verificação
- Token expira após período determinado

#### Aba Preferências

- Funcionalidade em desenvolvimento
- Será implementada futuramente

#### Sidebar de Informações

**Card lateral mostra:**
- Avatar e nome do usuário
- Email
- **Função**: Badge com role (Administrador/Operador/Usuário)
- **Status**: Status da conta (Ativo/Inativo)
- **Membro desde**: Data de criação da conta
- **Empresa**: Nome da empresa (se vinculado)

### Gerenciamento de Usuários (Admin)

Apenas usuários com role `ADMIN` podem acessar `/dashboard/users`.

#### Criação de Usuário

**Modal/Drawer:** `UserCreationModal`

**Campos:**
- **Nome**: Nome completo (obrigatório)
- **Username**: Nome de usuário único (obrigatório)
- **Email**: Endereço de email (opcional)
- **Empresa**: Seleção de empresa (obrigatório)
- **Permissão**: Role do usuário (ADMIN | OPERATOR | USER)
- **Senha**: Senha inicial (obrigatório)
- **Confirmar Senha**: Confirmação da senha (obrigatório)

**Validações:**
- Todos os campos obrigatórios preenchidos
- Senhas devem coincidir
- Email válido (se fornecido)
- Username único
- Email único (se fornecido)

**Comportamento:**
- Responsivo: Modal em desktop, Drawer em mobile
- Após criação: Invalida cache de usuários e fecha modal
- Toast de sucesso/erro

#### Edição de Usuário

**Modal/Drawer:** `UserEditModal`

**Campos editáveis:**
- **Nome**: Nome completo
- **Username**: Nome de usuário
- **Email**: Endereço de email
- **Empresa**: Empresa vinculada
- **Permissão**: Role do usuário

**Validações:**
- Mesmas validações da criação
- Não permite alteração de senha (funcionalidade separada)

**Comportamento especial:**
- **Modo somente leitura**: Pode ser aberto em modo somente leitura
- **Auto-logout**: Se admin editar seu próprio role, é deslogado automaticamente
- **Atualização de cache**: Invalida cache após edição

**Acesso:**
- Botão "Editar" na tabela de usuários
- Abre modal com dados pré-preenchidos

#### Tabela de Usuários

**Componente:** `UserTable`

**Colunas:**
- **Nome**: Nome do usuário
- **Email**: Email do usuário
- **Username**: Nome de usuário
- **Empresa**: Nome da empresa vinculada
- **Função**: Badge com role
- **Status**: Badge com status (Ativo/Inativo)
- **Ações**: Botões de editar e deletar

**Funcionalidades:**
- **Filtros**: Filtro por nome, email, empresa, role, status
- **Paginação**: Paginação de resultados
- **Ordenação**: Ordenação por colunas
- **Loading**: Skeleton durante carregamento
- **Empty State**: Mensagem quando não há usuários

---

## Sistema de Permissões (CASL)

### Visão Geral

O sistema utiliza **CASL** (Isomorphic Authorization JavaScript library) para gerenciar permissões de forma declarativa e baseada em abilities.

### Estrutura de Permissões

#### Roles (Papéis)

1. **ADMIN**: Acesso total ao sistema
   - Pode gerenciar tudo (`manage: all`)
   - Não possui escopo de empresa (pode acessar todas)

2. **ENGINEER**: Engenheiro
   - CRUD completo em todos os subjects
   - Escopo limitado à empresa (`companyId`)

3. **SECRETARY**: Secretário
   - CRUD completo em subjects de empresa
   - Read/Update/Delete em relatórios
   - Escopo limitado à empresa

4. **OPERATOR**: Operador
   - Manage (CRUD) em manutenção diária; apenas leitura em equipamentos de manutenção
   - Escopo limitado à empresa

#### Subjects (Recursos)

- `Company`: Empresas
- `Client`: Clientes
- `Storage`: Armazenamento
- `User`: Usuários
- `Instruments`: Instrumentos
- `Documents`: Documentos
- `MaintenanceDaily`: Manutenções diárias
- `MaintenanceEquipment`: Equipamentos de manutenção
- `ReportBoiler`: Relatórios de caldeiras
- `ReportValve`: Relatórios de válvulas
- `ReportBomb`: Relatórios de bombas

#### Actions (Ações)

- `manage`: Todas as ações
- `create`: Criar
- `read`: Ler
- `update`: Atualizar
- `delete`: Deletar

### Implementação

#### Ability Provider (`casl/context.tsx`)

```typescript
<AbilityProvider>
  {children}
</AbilityProvider>
```

- Cria abilities baseadas no usuário atual
- Fornece contexto para componentes filhos
- Hook `useAbility()` para acessar abilities

#### Verificação de Permissões

**Server-Side:**
- Verificação em Server Actions via `authProcedure`
- Validação de permissões antes de executar ações

**Client-Side:**
- `PermissionWrapper`: Verifica permissão por rota
- `useAbility()`: Hook para verificar abilities
- Componente `<Can>`: Renderização condicional baseada em permissões

#### Mapeamento de Rotas

**PermissionWrapper** mapeia rotas para subjects:

```typescript
/dashboard/company → Company
/dashboard/users → User
/dashboard/client → Client
/dashboard/reports/boiler → ReportBoiler
/dashboard/storage → Storage
/dashboard/instruments → Instruments
/dashboard/documents → Documents
/dashboard/maintenance/equipment → MaintenanceEquipment
/dashboard/valve → ReportValve
/dashboard/bomb → ReportBomb
```

**Rotas sem verificação:**
- `/dashboard/storage/reports`: Acesso livre para usuários autenticados

---

## Navegação e Sidebar

### App Sidebar (`components/app-sidebar.tsx`)

A sidebar principal fornece navegação para todas as áreas do sistema.

#### Estrutura

**Header:**
- Logo e nome do sistema
- Link para dashboard

**Conteúdo:**
- **Dashboard**: Página inicial
- **Armazenamento**: Submenu com relatórios, storage management e documentos
- **Base de Dados**: Submenu com empresas, clientes e usuários (apenas admin)
- **Inspeções**: Submenu com instrumentos e inspeções de caldeiras
- **Equipamentos**: Submenu com válvulas e bombas (apenas admin)
- **Manutenções**: Submenu com equipamentos de manutenção

**Footer:**
- Menu do usuário com:
  - Avatar e informações
  - Link para perfil
  - Link para configurações
  - Link para changelogs
  - Botão de logout

#### Comportamento Dinâmico

**Visibilidade baseada em permissões:**
- Seções são ocultadas se usuário não tem permissão
- Verificação via `ability.can('read', subject)`
- Admin sempre vê todas as seções

**Flags de Feature:**
- `disableEquipments`: Oculta seção de equipamentos
- `disableBoilerReport`: Oculta relatórios de caldeiras
- Em desenvolvimento: flags são desabilitadas

**Estado:**
- **Colapsável**: Pode ser colapsado para ícones apenas
- **Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Ativo**: Destaca rota atual

### Header (`components/header.tsx`)

Cabeçalho superior do dashboard.

**Elementos:**
- **Sidebar Trigger**: Botão para abrir/fechar sidebar
- **Título**: Nome do sistema (mobile)
- **Menu do Usuário**: Dropdown com:
  - Avatar e informações
  - Link para changelogs
  - Link para configurações
  - Link para perfil
  - Botão de logout

---

## Componentes Principais

### Componentes de UI (shadcn/ui)

Biblioteca de componentes baseada em Radix UI e Tailwind CSS:

- **Form**: Formulários com React Hook Form
- **Dialog**: Modais
- **Drawer**: Drawers para mobile
- **Table**: Tabelas de dados
- **Button**: Botões
- **Input**: Campos de entrada
- **Select**: Seletores
- **Card**: Cards
- **Badge**: Badges
- **Avatar**: Avatares
- **Tabs**: Abas
- **Dropdown Menu**: Menus dropdown
- E muitos outros...

### Componentes Customizados

**Navegação:**
- `AppSidebar`: Sidebar principal
- `Header`: Cabeçalho
- `Navbar`: Barra de navegação pública

**Formulários:**
- `CompanySelect`: Seletor de empresas
- `ClientSelect`: Seletor de clientes
- `EngineerSelect`: Seletor de engenheiros

**Tabelas:**
- `UserTable`: Tabela de usuários
- `BoilerTable`: Tabela de relatórios de caldeiras
- Componentes de tabela específicos para cada entidade

**Modais:**
- Modais de criação/edição para cada entidade
- Modais responsivos (Dialog em desktop, Drawer em mobile)

**Outros:**
- `InspetorLoading`: Componente de loading
- `LogoutButton`: Botão de logout
- `Markdown`: Renderizador de markdown

---

## Estrutura de Páginas do Dashboard

### Página Inicial (`/dashboard`)

Dashboard principal com visão geral do sistema.

### Páginas de Gerenciamento

Cada entidade possui uma página dedicada com estrutura similar:

**Estrutura padrão:**
```
/dashboard/[entidade]/
├── page.tsx                    # Página principal
└── components/
    ├── table.tsx               # Tabela de dados
    ├── creation-modal.tsx      # Modal de criação
    ├── edit-modal.tsx          # Modal de edição
    ├── filter.tsx              # Filtros
    └── table-skeleton.tsx      # Loading skeleton
```

**Exemplos:**
- `/dashboard/users`: Gerenciamento de usuários
- `/dashboard/company`: Gerenciamento de empresas
- `/dashboard/client`: Gerenciamento de clientes
- `/dashboard/instruments`: Gerenciamento de instrumentos
- `/dashboard/documents`: Gerenciamento de documentos
- `/dashboard/storage`: Gerenciamento de storage
- `/dashboard/valve`: Gerenciamento de válvulas
- `/dashboard/bomb`: Gerenciamento de bombas

### Páginas de Relatórios

**Relatórios de Caldeiras:**
```
/dashboard/reports/boiler/
├── page.tsx                    # Lista de relatórios
├── creation/
│   └── page.tsx                # Criação de relatório
└── [boilerId]/
    └── view/
        ├── page.tsx            # Visualização do relatório
        └── [step]/
            └── page.tsx        # Formulários por etapa
```

### Páginas de Manutenção

**Manutenção de Equipamentos:**
```
/dashboard/maintenance/equipment/
├── page.tsx                    # Lista de equipamentos
└── [equipmentId]/
    └── daily/
        └── page.tsx            # Manutenções diárias do equipamento
```

---

## Providers Globais

### Providers (`app/providers.tsx`)

Hierarquia de providers que envolvem a aplicação:

```typescript
<AntdRegistry>              // Ant Design (componentes específicos)
  <ProgressProvider>         // Barra de progresso de navegação
    <AuthProvider>           // Contexto de autenticação
      <MantineProvider>      // Mantine UI (componentes específicos)
        <NuqsAdapter>        // Gerenciamento de query strings
          <ReactProviderQuery> // TanStack Query
            {children}
          </ReactProviderQuery>
        </NuqsAdapter>
      </MantineProvider>
      <Toaster />            // Notificações toast
    </AuthProvider>
  </ProgressProvider>
</AntdRegistry>
```

**Providers:**
- **AntdRegistry**: Registro de componentes Ant Design
- **ProgressProvider**: Barra de progresso durante navegação
- **AuthProvider**: Contexto de autenticação (client-side)
- **MantineProvider**: Provider do Mantine UI
- **NuqsAdapter**: Adapter para gerenciamento de query strings
- **ReactProviderQuery**: Provider do TanStack Query
- **Toaster**: Sistema de notificações toast (Sonner)

---

## Fluxo de Dados

### Server Actions

**Localização:** `src/actions/`

**Padrão:**
- Server Actions tipadas com ZSA
- Validação com Zod
- Autenticação via `authProcedure`
- Retorno tipado

**Exemplos:**
- `create-user.ts`: Criar usuário
- `update-user.ts`: Atualizar usuário
- `create-boiler-report.ts`: Criar relatório de caldeira
- `update-profile.ts`: Atualizar perfil

### API Routes

**Localização:** `src/app/api/`

**Endpoints principais:**
- `/api/auth/*`: Autenticação
- `/api/users`: Usuários
- `/api/companies`: Empresas
- `/api/clients`: Clientes
- `/api/boiler-reports`: Relatórios de caldeiras
- E outros...

### TanStack Query

**Uso:**
- Cache de dados do servidor
- Invalidação automática
- Loading states
- Error handling

**Hooks customizados:**
- `useUsersQuery`: Query de usuários
- `useCompaniesQuery`: Query de empresas
- E outros...

---

## Responsividade

### Breakpoints (Tailwind)

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Adaptações Mobile

**Componentes adaptativos:**
- **Modais**: Dialog em desktop, Drawer em mobile
- **Sidebar**: Colapsável em mobile
- **Tabelas**: Scroll horizontal em mobile
- **Formulários**: Layout adaptativo

**Hook:** `useIsMobile()` para detectar mobile

---

## Estilização

### Tailwind CSS

- **Utility-first**: Classes utilitárias
- **Customização**: Configuração customizada
- **Dark Mode**: Suporte a modo escuro (em desenvolvimento)

### Design System

**Cores:**
- Cores primárias do sistema
- Cores de estado (success, error, warning)
- Cores de texto e background

**Tipografia:**
- Fonte: Geist (Google Fonts)
- Tamanhos padronizados
- Hierarquia clara

**Espaçamento:**
- Sistema de espaçamento consistente
- Padding e margin padronizados

---

## Acessibilidade (a11y)

### Boas Práticas Implementadas

- **ARIA labels**: Labels descritivos
- **Keyboard navigation**: Navegação por teclado
- **Focus management**: Gerenciamento de foco
- **Screen readers**: Suporte a leitores de tela
- **Contraste**: Contraste adequado de cores

### Componentes Acessíveis

- Componentes baseados em Radix UI (acessíveis por padrão)
- Validação de formulários com mensagens claras
- Estados de loading e erro bem comunicados

---

## Performance

### Otimizações

- **Server Components**: Máximo uso de Server Components
- **Code Splitting**: Divisão automática de código
- **Image Optimization**: Otimização de imagens (Next.js Image)
- **Lazy Loading**: Carregamento sob demanda
- **Caching**: Cache de queries e dados

### Loading States

- **Skeletons**: Componentes skeleton durante carregamento
- **Suspense**: Boundaries de Suspense para loading
- **Progress Bar**: Barra de progresso durante navegação

---

## Conclusão

A estrutura da UI do **Inspetor Industrial** foi projetada para ser:

- **Modular**: Componentes reutilizáveis e bem organizados
- **Escalável**: Fácil adicionar novas funcionalidades
- **Segura**: Múltiplas camadas de autenticação e autorização
- **Responsiva**: Funciona bem em todos os dispositivos
- **Acessível**: Segue boas práticas de acessibilidade
- **Performática**: Otimizada para velocidade e eficiência

O sistema de configuração de usuário permite que administradores gerenciem usuários e que usuários gerenciem suas próprias informações, sempre respeitando as permissões definidas pelo sistema CASL.
