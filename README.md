# Inspetor V2

Sistema de gestão para empresa de inspeções industriais, oferecendo controle completo de clientes, relatórios, manutenções e armazenamento de documentos.

## 🎯 Sobre o Projeto

O **Inspetor V2** é uma aplicação web moderna desenvolvida para gerenciar operações de uma empresa especializada em inspeções industriais. Com mais de duas décadas de experiência, o sistema oferece:

- **Gestão de Clientes**: Cadastro e controle de empresas clientes
- **Relatórios de Inspeção**: Armazenamento e visualização de relatórios técnicos
- **Manutenções Diárias**: Registro e acompanhamento de manutenções preventivas
- **Controle de Usuários**: Sistema de permissões com diferentes níveis de acesso
- **Site Institucional**: Apresentação dos serviços oferecidos

## 🚀 Funcionalidades

### Área Pública
- **Site Institucional**: Apresentação da empresa e serviços
- **Página de Contato**: Formulário para solicitações
- **Serviços Oferecidos**:
  - Inspeção de Caldeiras
  - Inspeção de Integridade
  - Inspeção de Tubulações
  - Inspeção em Vasos de Pressão
  - Inspeção de Elevador Automotivo
  - Inspeção em Tanques de Combustível
  - Calibração de Válvula de Segurança

### Dashboard Administrativo
- **Gestão de Usuários**: Criação, edição e controle de status
- **Gestão de Empresas**: Cadastro e administração de clientes
- **Relatórios**: Upload, visualização e download de documentos
- **Manutenções**: Registro de manutenções diárias por empresa
- **Sistema de Permissões**: Controle de acesso por níveis (ADMIN, OPERATOR, USER)

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca para interfaces
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de estilização
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend
- **Next.js API Routes** - API REST
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados principal
- **NextAuth.js** - Autenticação
- **Google APIs** - Integração com Google Drive

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **pnpm** - Gerenciador de pacotes
- **Turbopack** - Bundler rápido para desenvolvimento

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **pnpm** (recomendado) ou npm
- **PostgreSQL** 12+
- **Conta Google** com Google Drive API habilitada

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd inspetor-v2
```

### 2. Instale as dependências
```bash
pnpm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/inspetor_v2"

# Autenticação
AUTH_SECRET="sua-chave-secreta-aqui"

# Email (Google)
GOOGLE_EMAIL="seu-email@gmail.com"
GOOGLE_PASSWORD="sua-senha-de-app"

# Email de suporte
SUPPORT_EMAIL="suporte@empresa.com"
SUPPORT_PASSWORD="senha-do-email-suporte"

# Google Service Account (para Google Drive)
GOOGLE_SERVICE_ACCOUNT_TYPE="service_account"
GOOGLE_PROJECT_ID="seu-projeto-id"
GOOGLE_PRIVATE_KEY_ID="chave-privada-id"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL="service-account@projeto.iam.gserviceaccount.com"
GOOGLE_CLIENT_ID="client-id"
GOOGLE_AUTH_URI="https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URI="https://oauth2.googleapis.com/token"
GOOGLE_AUTH_PROVIDER_X509_CERT_URL="https://www.googleapis.com/oauth2/v1/certs"
GOOGLE_CLIENT_X509_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/service-account%40projeto.iam.gserviceaccount.com"
GOOGLE_UNIVERSE_DOMAIN="googleapis.com"
```

### 4. Configure o banco de dados
```bash
# Gere o cliente Prisma
pnpm prisma generate

# Execute as migrações
pnpm prisma db push

# (Opcional) Visualize o banco com Prisma Studio
pnpm prisma studio
```

### 5. Execute o projeto
```bash
# Desenvolvimento
pnpm dev

# Produção
pnpm build
pnpm start
```

O projeto estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── actions/           # Server Actions
├── app/              # App Router (Next.js 13+)
│   ├── (public)/     # Rotas públicas
│   ├── dashboard/    # Área administrativa
│   └── api/          # API Routes
├── components/       # Componentes React
│   └── ui/          # Componentes base (Radix UI)
├── lib/             # Bibliotecas e configurações
├── types/           # Definições TypeScript
└── utils/           # Utilitários
```

## 🔐 Autenticação

O sistema utiliza **NextAuth.js** com as seguintes funcionalidades:
- Login com email/senha
- Controle de sessões
- Middleware de proteção de rotas
- Sistema de permissões por níveis

### Níveis de Acesso
- **ADMIN**: Acesso total ao sistema
- **OPERATOR**: Pode gerenciar relatórios e manutenções
- **USER**: Acesso básico para visualização

## 📊 Banco de Dados

### Principais Entidades
- **User**: Usuários do sistema
- **Company**: Empresas clientes
- **Storage**: Armazenamento de relatórios
- **DailyMaintenance**: Registro de manutenções
- **Contact**: Mensagens de contato

### Diagrama do Banco de Dados

#### 📊 Diagrama Entidade-Relacionamento

```mermaid
erDiagram
    %% Entidades do Sistema Principal
    User {
        string id PK "CUID único"
        string name "Nome do usuário"
        string email UK "Email único"
        datetime emailVerified "Data verificação email"
        string image "URL da foto"
        enum status "ACTIVE | INACTIVE"
        enum role "ADMIN | OPERATOR | USER"
        string password "Hash da senha"
        string companyId FK "ID da empresa"
        datetime createdAt "Data de criação"
        datetime updatedAt "Data de atualização"
    }

    Company {
        string id PK "CUID único"
        string name "Nome da empresa"
        string cnpj UK "CNPJ único"
        enum status "ACTIVE | INACTIVE"
        datetime createdAt "Data de criação"
        datetime updatedAt "Data de atualização"
    }

    Storage {
        string id PK "CUID único"
        string companyId FK "ID da empresa"
        string relativeLink "Link do arquivo no Drive"
        enum status "ACTIVE | INACTIVE"
        datetime createdAt "Data de upload"
        datetime updatedAt "Data de atualização"
    }

    DailyMaintenance {
        string id PK "CUID único"
        string companyId FK "ID da empresa"
        string description "Descrição da manutenção"
        string equipment "Equipamento"
        string operatorName "Nome do operador"
        datetime createdAt "Data de criação"
        datetime updatedAt "Data de atualização"
    }

    Contact {
        string id PK "CUID único"
        string name "Nome do contato"
        string email "Email do contato"
        string phone "Telefone"
        string service "Serviço solicitado"
        string description "Descrição da solicitação"
        datetime createdAt "Data da mensagem"
        datetime updatedAt "Data de atualização"
    }

    %% Entidades de Autenticação NextAuth.js
    Account {
        string userId FK "ID do usuário"
        string type "Tipo da conta"
        string provider "Provedor OAuth"
        string providerAccountId "ID no provedor"
        string refresh_token "Token de refresh"
        string access_token "Token de acesso"
        int expires_at "Expiração do token"
        string token_type "Tipo do token"
        string scope "Escopo de permissões"
        string id_token "Token de identificação"
        string session_state "Estado da sessão"
        datetime createdAt "Data de criação"
        datetime updatedAt "Data de atualização"
    }

    Session {
        string sessionToken PK "Token único da sessão"
        string userId FK "ID do usuário"
        datetime expires "Data de expiração"
        datetime createdAt "Data de criação"
        datetime updatedAt "Data de atualização"
    }

    VerificationToken {
        string identifier "Identificador único"
        string token "Token de verificação"
        datetime expires "Data de expiração"
    }

    Authenticator {
        string credentialID PK "ID da credencial"
        string userId FK "ID do usuário"
        string providerAccountId "ID da conta no provedor"
        string credentialPublicKey "Chave pública"
        int counter "Contador de uso"
        string credentialDeviceType "Tipo do dispositivo"
        boolean credentialBackedUp "Backup realizado"
        string transports "Transportes suportados"
    }

    %% Relacionamentos Principais
    User ||--o{ Account : "possui"
    User ||--o{ Session : "tem sessões"
    User ||--o{ Authenticator : "usa autenticadores"
    User }o--|| Company : "pertence a"
    
    Company ||--o{ User : "emprega"
    Company ||--o{ Storage : "armazena relatórios"
    Company ||--o{ DailyMaintenance : "realiza manutenções"
```

#### 🏗️ Arquitetura Visual do Sistema

```mermaid
graph TB
    subgraph "🏢 Gestão Empresarial"
        Company["🏭 Company<br/>Nome, CNPJ, Status"]
        Storage["📄 Storage<br/>Relatórios e Documentos"]
        Maintenance["🔧 DailyMaintenance<br/>Manutenções Diárias"]
    end
    
    subgraph "👥 Gestão de Usuários"
        User["👤 User<br/>Nome, Email, Role"]
        UserRoles["🎭 Níveis de Acesso<br/>ADMIN | OPERATOR | USER"]
    end
    
    subgraph "🔐 Sistema de Autenticação"
        Account["🔑 Account<br/>Contas OAuth"]
        Session["⏰ Session<br/>Sessões Ativas"]
        Auth["🛡️ Authenticator<br/>WebAuthn"]
        Verification["✉️ VerificationToken<br/>Verificação Email"]
    end
    
    subgraph "📞 Contato Público"
        Contact["📧 Contact<br/>Mensagens do Site"]
    end
    
    %% Relacionamentos principais
    Company --> Storage
    Company --> Maintenance
    Company --> User
    User --> UserRoles
    
    %% Autenticação
    User --> Account
    User --> Session
    User --> Auth
    
    %% Estilos
    classDef company fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef user fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef auth fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef contact fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class Company,Storage,Maintenance company
    class User,UserRoles user
    class Account,Session,Auth,Verification auth
    class Contact contact
```

#### 🔗 Fluxo de Dados Principais

```mermaid
flowchart LR
    A[👤 Usuário] --> B{🔐 Login}
    B --> C[⚡ Dashboard]
    
    C --> D[🏭 Selecionar Empresa]
    D --> E[📊 Operações]
    
    E --> F[📄 Upload Relatório]
    E --> G[🔧 Registrar Manutenção]
    E --> H[👥 Gerenciar Usuários]
    
    F --> I[☁️ Google Drive]
    G --> J[💾 Banco de Dados]
    H --> K[👤 Tabela Users]
    
    L[🌐 Site Público] --> M[📧 Formulário Contato]
    M --> N[💾 Tabela Contact]
    
    style A fill:#e3f2fd
    style I fill:#fff3e0
    style J fill:#e8f5e8
    style L fill:#f3e5f5
```

📊 **Diagrama Completo**: Para mais detalhes técnicos, veja o arquivo [`database-diagram.md`](./database-diagram.md).

### Descrição das Entidades

#### **User** (Usuários)
- Gerencia usuários do sistema com diferentes níveis de acesso
- Pode estar associado a uma empresa específica
- Suporta autenticação via NextAuth.js

#### **Company** (Empresas)
- Representa empresas clientes
- CNPJ único para identificação
- Status ativo/inativo para controle

#### **Storage** (Armazenamento)
- Gerencia relatórios e documentos
- Vinculado a uma empresa específica
- Armazena links relativos para Google Drive

#### **DailyMaintenance** (Manutenções Diárias)
- Registra manutenções preventivas
- Vinculado a empresa e operador
- Controle de equipamentos e descrições

#### **Contact** (Contatos)
- Mensagens recebidas pelo site
- Dados do solicitante e serviço desejado

#### **Entidades de Autenticação**
- **Account**: Contas de provedores externos
- **Session**: Sessões ativas dos usuários
- **VerificationToken**: Tokens de verificação
- **Authenticator**: Suporte a WebAuthn

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas
- **Railway**: Suporte nativo ao PostgreSQL
- **Netlify**: Configuração manual necessária
- **AWS/GCP**: Configuração de infraestrutura

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob **Licença Proprietária** da **pedroaba tech**.

**⚠️ TODOS OS DIREITOS RESERVADOS** - Uso, cópia ou distribuição não autorizada é **PROIBIDA**.

Para licenciamento comercial ou autorizações especiais, entre em contato:
- 📧 **Email:** pedr.augustobarbosa.aparecido@gmail.com
- 🏢 **Empresa:** pedroaba tech (CNPJ: 57.593.443/0001-50)

Veja o arquivo [`LICENSE`](./LICENSE) para detalhes completos.

## 📞 Suporte

Para dúvidas ou suporte técnico, entre em contato através do formulário no site ou diretamente com a equipe de desenvolvimento.

---

**Inspetor V2** - Segurança e conformidade em suas mãos 🏭
