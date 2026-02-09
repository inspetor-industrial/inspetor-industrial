# Estrutura do Banco de Dados

## Visão Geral

O banco de dados do sistema **Inspetor Industrial** é gerenciado através do **Prisma ORM** e utiliza **PostgreSQL** como SGBD. A estrutura foi projetada para suportar um sistema de gestão industrial focado em inspeções e relatórios de caldeiras, gestão de empresas, usuários, equipamentos e manutenções.

## Tecnologias

- **ORM**: Prisma Client
- **SGBD**: PostgreSQL
- **Geração de IDs**: CUID (Collision-resistant Unique Identifier)
- **Localização do Client**: `src/generated/prisma`

---

## Entidades Principais

### 1. Autenticação e Usuários

#### `User` (Usuário)
Modelo central para autenticação e autorização do sistema.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `name` (String?): Nome do usuário
- `email` (String, UNIQUE): Email único para login
- `username` (String?, UNIQUE): Nome de usuário opcional
- `emailVerified` (DateTime?): Data de verificação do email
- `image` (String?): URL da foto do perfil
- `password` (String?): Hash da senha (opcional para OAuth)
- `companyId` (String?, FK): Referência à empresa
- `status` (UserStatus): Status do usuário (ACTIVE | INACTIVE) - padrão: ACTIVE
- `role` (UserRole): Papel do usuário (ADMIN | OPERATOR | USER) - padrão: USER
- `responsibility` (UserResponsibility?): Responsabilidade (ENGINEER | SECRETARY | OPERATOR) - padrão: OPERATOR
- `registrationNumber` (String?): Número de registro profissional - padrão: "N-A"
- `crea` (String?): Número do CREA - padrão: "N-A"
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Relacionamentos:**
- `company`: Pertence a uma `Company` (opcional)
- `boilerReports`: Lista de relatórios de caldeiras criados
- `documents`: Lista de documentos criados
- `sessions`: Lista de sessões ativas

#### `Session` (Sessão)
Gerencia sessões de autenticação dos usuários.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `userId` (String, FK): Referência ao usuário
- `accessToken` (String, UNIQUE): Token de acesso
- `refreshToken` (String, UNIQUE): Token de refresh
- `expiresAt` (DateTime): Data de expiração do access token
- `refreshExpiresAt` (DateTime): Data de expiração do refresh token
- `revokedAt` (DateTime?): Data de revogação (se aplicável)
- `ipAddress` (String?): Endereço IP da sessão
- `userAgent` (String?): User agent do navegador
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Índices:**
- `accessToken`
- `refreshToken`
- `userId`

**Relacionamentos:**
- `user`: Pertence a um `User` (cascade delete)

#### `VerificationToken` (Token de Verificação)
Armazena tokens temporários para verificação de email e recuperação de senha.

**Campos:**
- `identifier` (String, PK): Identificador único (email ou username)
- `token` (String, PK): Token de verificação
- `expires` (DateTime): Data de expiração

**Chave Primária Composta:** `[identifier, token]`

---

### 2. Empresas e Organizações

#### `Company` (Empresa)
Representa empresas clientes do sistema.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `name` (String): Nome da empresa
- `cnpj` (String, UNIQUE): CNPJ único da empresa
- `status` (CompanyStatus): Status da empresa (ACTIVE | INACTIVE) - padrão: ACTIVE
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Relacionamentos:**
- `users`: Lista de usuários da empresa
- `boilerReports`: Lista de relatórios de caldeiras
- `clients`: Lista de clientes da empresa
- `bombs`: Lista de bombas cadastradas
- `valves`: Lista de válvulas cadastradas
- `DailyMaintenance`: Lista de manutenções diárias
- `Documents`: Lista de documentos
- `Equipment`: Lista de equipamentos
- `Instruments`: Lista de instrumentos
- `storage`: Lista de arquivos armazenados

#### `Clients` (Cliente)
Representa clientes das empresas (empresas que contratam serviços de inspeção).

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `companyName` (String): Nome da empresa cliente
- `taxId` (String): CPF/CNPJ do cliente
- `taxRegistration` (String?): Inscrição estadual (opcional)
- `state` (String): Estado
- `city` (String): Cidade
- `address` (String): Endereço completo
- `zipCode` (String): CEP
- `phone` (String): Telefone de contato
- `companyId` (String?, FK): Referência à empresa que gerencia o cliente
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Constraints Únicos:**
- `[companyId, taxId]`: Evita duplicação de CPF/CNPJ por empresa
- `[companyId, taxRegistration]`: Evita duplicação de inscrição estadual por empresa

**Relacionamentos:**
- `company`: Pertence a uma `Company` (opcional)
- `boilerReports`: Lista de relatórios de caldeiras do cliente

---

### 3. Equipamentos e Instrumentos

#### `Equipment` (Equipamento)
Cadastro de equipamentos industriais.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `companyId` (String, FK): Referência à empresa
- `name` (String): Nome do equipamento
- `model` (String): Modelo do equipamento
- `category` (String): Categoria do equipamento
- `identificationNumber` (String, UNIQUE): Número de identificação único
- `manufactorYear` (String, VARCHAR(10)): Ano de fabricação
- `mark` (String): Marca do equipamento
- `pmta` (String): PMTA (Pressão Máxima de Trabalho Admissível)
- `type` (String): Tipo do equipamento
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Índices:**
- `companyId`
- `[id, companyId]`

**Relacionamentos:**
- `company`: Pertence a uma `Company`
- `DailyMaintenance`: Lista de manutenções realizadas

#### `Instruments` (Instrumento)
Cadastro de instrumentos de medição e calibração.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `companyId` (String, FK): Referência à empresa
- `type` (String): Tipo do instrumento
- `manufacturer` (String): Fabricante
- `serialNumber` (String): Número de série
- `certificateNumber` (String): Número do certificado
- `validationDate` (DateTime): Data de validação/calibração
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Relacionamentos:**
- `company`: Pertence a uma `Company`

#### `Bomb` (Bomba)
Cadastro de bombas utilizadas em sistemas de caldeiras.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `companyId` (String, FK): Referência à empresa
- `mark` (String): Marca da bomba
- `model` (String): Modelo da bomba
- `stages` (String): Número de estágios
- `potency` (Decimal): Potência da bomba
- `photoId` (String, FK): Referência à foto/documento
- `powerSupplyId` (String?, FK): Referência ao sistema de alimentação
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Relacionamentos:**
- `company`: Pertence a uma `Company`
- `photo`: Foto/documento da bomba (`Documents`)
- `powerSupply`: Sistema de alimentação relacionado (`PowerSupply`)

#### `Valve` (Válvula)
Cadastro de válvulas de segurança e controle.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `companyId` (String, FK): Referência à empresa
- `serialNumber` (String, UNIQUE): Número de série único
- `model` (String): Modelo da válvula
- `diameter` (Decimal): Diâmetro
- `flow` (Decimal): Vazão
- `openingPressure` (Decimal): Pressão de abertura
- `closingPressure` (Decimal): Pressão de fechamento
- `tests` (Json): Dados de testes realizados (JSON)
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Índices:**
- `companyId`
- `[id, companyId]`

**Relacionamentos:**
- `company`: Pertence a uma `Company`

---

### 4. Relatórios de Caldeiras

#### `BoilerReport` (Relatório de Caldeira)
Modelo principal para relatórios de inspeção de caldeiras.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `type` (BoilerReportType): Tipo do relatório (INITIAL | PERIODIC | EXTRAORDINARY)
- `clientId` (String, FK): Referência ao cliente
- `companyId` (String, FK): Referência à empresa responsável
- `engineerId` (String, FK): Referência ao engenheiro responsável
- `motivation` (String?): Motivação da inspeção
- `date` (DateTime?): Data da inspeção
- `startTimeOfInspection` (String?): Horário de início da inspeção
- `endTimeOfInspection` (String?): Horário de término da inspeção
- `inspectionValidation` (String?): Validação da inspeção
- `nextInspectionDate` (DateTime?): Data da próxima inspeção
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Relacionamentos:**
- `client`: Cliente inspecionado (`Clients`)
- `company`: Empresa responsável (`Company`)
- `engineer`: Engenheiro responsável (`User`)
- `boilerInfo`: Informações da caldeira (`BoilerInfo`)
- `externalPerformedTests`: Testes externos realizados (`ExternalPerformedTests`)
- `generalPerformedTests`: Testes gerais realizados (`GeneralPerformedTests`)
- `injectorGauge`: Informações do medidor de nível (`InjectorGauge`)
- `operator`: Informações do operador (`Operator`)
- `powerSupply`: Sistema de alimentação (`PowerSupply`)
- `structureBodyInfo`: Informações estruturais do corpo (`StructureBodyInfo`)
- `structureFurnaceInfo`: Informações estruturais da fornalha (`StructureFurnaceInfo`)
- `structureMirrorInfo`: Informações estruturais do espelho (`StructureMirrorInfo`)
- `structureTubeInfo`: Informações estruturais dos tubos (`StructureTubeInfo`)

#### `BoilerInfo` (Informações da Caldeira)
Detalhes técnicos da caldeira inspecionada.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `boilerReportId` (String, UNIQUE, FK): Referência ao relatório
- `manufacturer` (String?): Fabricante
- `mark` (String?): Marca
- `type` (BoilerType): Tipo da caldeira
  - FIRE_TUBE_HORIZONTAL
  - FIRE_TUBE_VERTICAL
  - WATER_TUBE_HORIZONTAL
  - WATER_TUBE_VERTICAL
  - MIXED
- `model` (String?): Modelo
- `yearOfManufacture` (Int?): Ano de fabricação
- `maximumWorkingPressure` (String?): Pressão máxima de trabalho
- `maximumOperatingPressure` (String?): Pressão máxima de operação
- `series` (String?): Número de série
- `fuelType` (BoilerFuelType): Tipo de combustível
  - FIRE_WOOD, WOOD_CHIPS, BAGASSE, STRAW, LPG, NG, DIESEL_OIL, BPF_OIL, BLACK_LIQUOR, BRIQUETTE
- `category` (BoilerCategory): Categoria (A | B)

**Relacionamentos:**
- `boilerReport`: Relatório relacionado (`BoilerReport`)

#### `ExternalPerformedTests` (Testes Externos Realizados)
Registro de testes externos realizados na caldeira.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `boilerReportId` (String, UNIQUE, FK): Referência ao relatório
- `tests` (Json): Dados dos testes (JSON)
- `observations` (String?): Observações

**Relacionamentos:**
- `boilerReport`: Relatório relacionado (`BoilerReport`)

#### `GeneralPerformedTests` (Testes Gerais Realizados)
Registro de testes gerais realizados na caldeira.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `boilerReportId` (String, UNIQUE, FK): Referência ao relatório
- `tests` (Json): Dados dos testes (JSON)
- `observations` (String?): Observações
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Relacionamentos:**
- `boilerReport`: Relatório relacionado (`BoilerReport`)

#### `InjectorGauge` (Medidor de Nível)
Informações sobre o medidor de nível da caldeira.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `boilerReportId` (String, UNIQUE, FK): Referência ao relatório
- `fuelType` (InjectorGaugeFuel): Tipo de combustível (LIQUID | GASEOUS | SOLID)
- `mark` (String): Marca
- `diameter` (String): Diâmetro
- `serialNumber` (String): Número de série
- `tests` (Json): Dados dos testes (JSON)
- `observations` (String?): Observações
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Relacionamentos:**
- `boilerReport`: Relatório relacionado (`BoilerReport`)
- `photos`: Lista de fotos anexadas (`BoilerReportAttachment[]`)

#### `Operator` (Operador)
Informações sobre o operador da caldeira.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `boilerReportId` (String, UNIQUE, FK): Referência ao relatório
- `name` (String): Nome do operador
- `isAbleToOperateWithNR13` (String): Capacitação para operar conforme NR-13
- `certificateId` (String?, UNIQUE, FK): Referência ao certificado
- `provisionsForOperator` (String?): Disposições para o operador
- `observations` (String?): Observações

**Relacionamentos:**
- `boilerReport`: Relatório relacionado (`BoilerReport`)
- `certificate`: Certificado do operador (`BoilerReportAttachment`)

#### `PowerSupply` (Sistema de Alimentação)
Informações sobre o sistema de alimentação da caldeira.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `boilerReportId` (String, UNIQUE, FK): Referência ao relatório
- `tests` (Json): Dados dos testes (JSON)
- `observations` (String?): Observações

**Relacionamentos:**
- `boilerReport`: Relatório relacionado (`BoilerReport`)
- `bombs`: Lista de bombas relacionadas (`Bomb[]`)

#### `StructureBodyInfo` (Informações Estruturais do Corpo)
Informações estruturais do corpo da caldeira.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `boilerReportId` (String, UNIQUE, FK): Referência ao relatório
- `thickness` (String): Espessura
- `diameter` (String): Diâmetro
- `length` (String): Comprimento
- `material` (BoilerBodyMaterial): Material do corpo
  - ASTMA285GRC
  - ASTMA516
  - NOT_SPECIFIED
- `certificateId` (String?, UNIQUE, FK): Referência ao certificado

**Relacionamentos:**
- `boilerReport`: Relatório relacionado (`BoilerReport`)
- `certificate`: Certificado do material (`BoilerReportAttachment`)

#### `StructureFurnaceInfo` (Informações Estruturais da Fornalha)
Informações estruturais da fornalha da caldeira.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `boilerReportId` (String, UNIQUE, FK): Referência ao relatório
- `heatingSurface` (Float?): Superfície de aquecimento
- `surfaceType` (StructureFurnaceType): Tipo de superfície
  - REFRACTORY
  - COOLED
  - WATER_TUBE
- `width` (Float?): Largura
- `height` (Float?): Altura
- `length` (Float?): Comprimento
- `diameter` (Float?): Diâmetro
- `tubeDiameter` (Float?): Diâmetro dos tubos
- `tubeThickness` (Float?): Espessura dos tubos
- `freeLengthWithoutStays` (Float?): Comprimento livre sem escoras

**Relacionamentos:**
- `boilerReport`: Relatório relacionado (`BoilerReport`)

#### `StructureMirrorInfo` (Informações Estruturais do Espelho)
Informações estruturais do espelho da caldeira.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `boilerReportId` (String, UNIQUE, FK): Referência ao relatório
- `thickness` (Float?): Espessura
- `diameter` (Float?): Diâmetro

**Relacionamentos:**
- `boilerReport`: Relatório relacionado (`BoilerReport`)

#### `StructureTubeInfo` (Informações Estruturais dos Tubos)
Informações estruturais dos tubos da caldeira.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `boilerReportId` (String, UNIQUE, FK): Referência ao relatório
- `length` (String): Comprimento
- `diameter` (String): Diâmetro
- `thickness` (String): Espessura
- `material` (BoilerTubeMaterial): Material dos tubos
  - ASTMA178
  - NOT_SPECIFIED
- `isNaturalOrForced` (String): Tipo de circulação (natural ou forçada)
- `quantityOfSafetyFuse` (String): Quantidade de fusíveis de segurança
- `certificateId` (String?, UNIQUE, FK): Referência ao certificado

**Relacionamentos:**
- `boilerReport`: Relatório relacionado (`BoilerReport`)
- `certificate`: Certificado do material (`BoilerReportAttachment`)

#### `BoilerReportAttachment` (Anexo do Relatório)
Gerencia anexos (fotos, documentos) relacionados aos relatórios de caldeiras.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `documentId` (String, FK): Referência ao documento
- `fieldName` (BoilerReportAttachmentFieldName): Nome do campo/anexo
  - OPERATOR_CERTIFICATION
  - EXAMINATIONS_PERFORMED_RECORD
  - EXAMINATIONS_PERFORMED_BOOK
  - EXTERNAL_EXAMINATIONS_PERFORMED_PLATE_IDENTIFICATION
  - EXTERNAL_EXAMINATIONS_PERFORMED_BOILER
  - EXTERNAL_EXAMINATIONS_PERFORMED_EXTRA_PHOTOS
  - INTERNAL_EXAMINATIONS_PERFORMED_TUBES
  - INTERNAL_EXAMINATIONS_PERFORMED_FURNACE
  - INTERNAL_EXAMINATIONS_PERFORMED_INTERNAL_BOILER
  - INTERNAL_EXAMINATIONS_PERFORMED_EXTRA_PHOTOS
  - LOCAL_INSTALLATION_EXAMINATIONS_PERFORMED_BOILER_HOUSE
  - INJECTOR_GAUGE_PHOTOS
  - CALIBRATION_OF_THE_LEVEL_INDICATOR_ASSEMBLY_PHOTOS
  - SAFETY_VALVE_GAUGE_PHOTOS
  - CONTROL_DEVICES_AND_COMMANDS_PHOTOS
  - WATER_QUALITY_PHOTOS
  - BOTTOM_DISCHARGE_SYSTEM_CHECKS_PHOTOS
  - HYDROSTATIC_TEST_PHOTOS
  - ULTRASOUND_TESTS_BODY_EXAMINATION_A_PHOTOS
  - ULTRASOUND_TESTS_BODY_EXAMINATION_B_PHOTOS
  - ULTRASOUND_TESTS_BODY_EXAMINATION_C_PHOTOS
  - ULTRASOUND_TESTS_BODY_EXAMINATION_D_PHOTOS
  - PRESSURE_GAUGE_CALIBRATION_PHOTOS
  - STRUCTURE_BODY_CERTIFICATE
  - STRUCTURE_TUBE_CERTIFICATE
- `sortOrder` (Int?): Ordem de classificação
- `injectorGaugeId` (String?, FK): Referência ao medidor de nível (se aplicável)
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Índices:**
- `documentId`
- `[injectorGaugeId, fieldName]`

**Relacionamentos:**
- `document`: Documento anexado (`Documents`, cascade delete)
- `injectorGauge`: Medidor de nível relacionado (`InjectorGauge`)
- `operator`: Operador relacionado (`Operator`)
- `structureBodyInfo`: Informações do corpo relacionadas (`StructureBodyInfo`)
- `structureTubeInfo`: Informações dos tubos relacionadas (`StructureTubeInfo`)

---

### 5. Documentos e Armazenamento

#### `Documents` (Documento)
Gerencia documentos e arquivos do sistema.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `companyId` (String, FK): Referência à empresa
- `ownerId` (String, FK): Referência ao usuário proprietário
- `name` (String): Nome do arquivo
- `type` (String): Tipo/MIME do arquivo
- `size` (Int): Tamanho do arquivo em bytes
- `cloudflareR2Key` (String): Chave no Cloudflare R2 (armazenamento)
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Relacionamentos:**
- `company`: Empresa proprietária (`Company`)
- `owner`: Usuário proprietário (`User`)
- `BoilerReportAttachment`: Lista de anexos de relatórios
- `bombs`: Lista de bombas que utilizam este documento como foto

#### `Storage` (Armazenamento)
Gerencia links de arquivos armazenados externamente (ex: Google Drive).

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `companyId` (String, FK): Referência à empresa
- `relativeLink` (String): Link relativo do arquivo no Drive
- `status` (StorageStatus): Status do arquivo (ACTIVE | INACTIVE) - padrão: ACTIVE
- `createdAt` (DateTime): Data de upload
- `updatedAt` (DateTime): Data de atualização

**Relacionamentos:**
- `company`: Empresa proprietária (`Company`)

---

### 6. Manutenção e Contatos

#### `DailyMaintenance` (Manutenção Diária)
Registro de manutenções diárias realizadas em equipamentos.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `companyId` (String, FK): Referência à empresa
- `equipmentId` (String, FK): Referência ao equipamento
- `description` (String): Descrição da manutenção
- `operatorName` (String): Nome do operador responsável
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de atualização

**Relacionamentos:**
- `company`: Empresa responsável (`Company`)
- `equipment`: Equipamento mantido (`Equipment`)

#### `Contact` (Contato)
Formulário de contato do sistema.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `name` (String): Nome do contato
- `email` (String): Email do contato
- `phone` (String): Telefone
- `service` (String): Serviço solicitado
- `description` (String): Descrição da solicitação
- `createdAt` (DateTime): Data da mensagem
- `updatedAt` (DateTime): Data de atualização

---

## Enums

### `UserStatus`
- `ACTIVE`: Usuário ativo
- `INACTIVE`: Usuário inativo

### `UserRole`
- `ADMIN`: Administrador do sistema
- `OPERATOR`: Operador
- `USER`: Usuário comum

### `UserResponsibility`
- `ENGINEER`: Engenheiro
- `SECRETARY`: Secretário
- `OPERATOR`: Operador

### `CompanyStatus`
- `ACTIVE`: Empresa ativa
- `INACTIVE`: Empresa inativa

### `StorageStatus`
- `ACTIVE`: Arquivo ativo
- `INACTIVE`: Arquivo inativo

### `BoilerReportType`
- `INITIAL`: Inspeção inicial
- `PERIODIC`: Inspeção periódica
- `EXTRAORDINARY`: Inspeção extraordinária

### `BoilerType`
- `FIRE_TUBE_HORIZONTAL`: Caldeira de tubos de fogo horizontal
- `FIRE_TUBE_VERTICAL`: Caldeira de tubos de fogo vertical
- `WATER_TUBE_HORIZONTAL`: Caldeira de tubos de água horizontal
- `WATER_TUBE_VERTICAL`: Caldeira de tubos de água vertical
- `MIXED`: Caldeira mista

### `BoilerFuelType`
- `FIRE_WOOD`: Lenha
- `WOOD_CHIPS`: Cavaco de madeira
- `BAGASSE`: Bagaço
- `STRAW`: Palha
- `LPG`: GLP (Gás Liquefeito de Petróleo)
- `NG`: Gás Natural
- `DIESEL_OIL`: Óleo diesel
- `BPF_OIL`: Óleo BPF
- `BLACK_LIQUOR`: Licor negro
- `BRIQUETTE`: Briquete

### `BoilerCategory`
- `A`: Categoria A
- `B`: Categoria B

### `BoilerBodyMaterial`
- `ASTMA285GRC`: ASTM A285 Grade C
- `ASTMA516`: ASTM A516
- `NOT_SPECIFIED`: Não especificado

### `BoilerTubeMaterial`
- `ASTMA178`: ASTM A178
- `NOT_SPECIFIED`: Não especificado

### `InjectorGaugeFuel`
- `LIQUID`: Líquido
- `GASEOUS`: Gasoso
- `SOLID`: Sólido

### `StructureFurnaceType`
- `REFRACTORY`: Refratário
- `COOLED`: Resfriado
- `WATER_TUBE`: Tubos de água

### `BoilerReportAttachmentFieldName`
Enum extenso que define todos os tipos de anexos possíveis em um relatório de caldeira, incluindo certificados, fotos de exames, calibrações, etc.

---

## Relacionamentos Principais

### Hierarquia de Empresas
```
Company
├── users (User[])
├── clients (Clients[])
├── boilerReports (BoilerReport[])
├── equipment (Equipment[])
├── instruments (Instruments[])
├── bombs (Bomb[])
├── valves (Valve[])
├── documents (Documents[])
├── storage (Storage[])
└── dailyMaintenance (DailyMaintenance[])
```

### Estrutura de Relatórios de Caldeiras
```
BoilerReport
├── client (Clients)
├── company (Company)
├── engineer (User)
├── boilerInfo (BoilerInfo)
├── externalPerformedTests (ExternalPerformedTests)
├── generalPerformedTests (GeneralPerformedTests)
├── injectorGauge (InjectorGauge)
│   └── photos (BoilerReportAttachment[])
├── operator (Operator)
│   └── certificate (BoilerReportAttachment)
├── powerSupply (PowerSupply)
│   └── bombs (Bomb[])
├── structureBodyInfo (StructureBodyInfo)
│   └── certificate (BoilerReportAttachment)
├── structureFurnaceInfo (StructureFurnaceInfo)
├── structureMirrorInfo (StructureMirrorInfo)
└── structureTubeInfo (StructureTubeInfo)
    └── certificate (BoilerReportAttachment)
```

### Sistema de Documentos
```
Documents
├── company (Company)
├── owner (User)
├── BoilerReportAttachment[]
└── bombs (Bomb[]) [como foto]
```

---

## Índices e Performance

### Índices Criados

1. **Session**
   - `accessToken`
   - `refreshToken`
   - `userId`

2. **Equipment**
   - `companyId`
   - `[id, companyId]` (composto)

3. **Valve**
   - `companyId`
   - `[id, companyId]` (composto)

4. **BoilerReportAttachment**
   - `documentId`
   - `[injectorGaugeId, fieldName]` (composto)

### Constraints Únicos

1. **User**
   - `email` (UNIQUE)
   - `username` (UNIQUE)

2. **Company**
   - `cnpj` (UNIQUE)

3. **Clients**
   - `[companyId, taxId]` (composto)
   - `[companyId, taxRegistration]` (composto)

4. **Equipment**
   - `identificationNumber` (UNIQUE)

5. **Valve**
   - `serialNumber` (UNIQUE)

6. **VerificationToken**
   - `[identifier, token]` (chave primária composta)

---

## Observações Importantes

1. **Cascade Delete**: A relação `Session -> User` possui `onDelete: Cascade`, garantindo que sessões sejam removidas quando um usuário é deletado.

2. **Campos JSON**: Vários modelos utilizam campos `Json` para armazenar dados flexíveis:
   - `Valve.tests`
   - `ExternalPerformedTests.tests`
   - `GeneralPerformedTests.tests`
   - `InjectorGauge.tests`
   - `PowerSupply.tests`

3. **Mapeamento de Campos**: Alguns campos utilizam `@map()` para mapear nomes diferentes no banco:
   - `BoilerReport.createdAt` → `created_at`
   - `BoilerReport.updatedAt` → `updated_at`
   - `Bomb.createdAt` → `created_at`
   - `Bomb.updatedAt` → `updated_at`
   - `Valve.serialNumber` → `serial_number`
   - `Valve.openingPressure` → `opening_pressure`
   - `Valve.closingPressure` → `closing_pressure`
   - `InjectorGauge.serialNumber` → `serial_number`

4. **Valores Padrão**: Muitos campos possuem valores padrão para facilitar a criação de registros:
   - `User.status`: ACTIVE
   - `User.role`: USER
   - `User.responsibility`: OPERATOR
   - `User.registrationNumber`: "N-A"
   - `User.crea`: "N-A"
   - `Company.status`: ACTIVE
   - `Storage.status`: ACTIVE

5. **Armazenamento de Arquivos**: O sistema utiliza **Cloudflare R2** para armazenamento de arquivos, com referências armazenadas no campo `cloudflareR2Key` do modelo `Documents`.

---

## Estrutura de Diretórios do Prisma

```
prisma/
├── base.prisma                    # Configuração base (generator e datasource)
├── enums/
│   ├── user.prisma               # Enums relacionados a usuários
│   ├── companyStatus.prisma      # Status de empresas
│   ├── storageStatus.prisma      # Status de armazenamento
│   ├── boiler.prisma             # Enums relacionados a caldeiras
│   └── structureFurnace.prisma  # Tipos de fornalha
└── models/
    ├── user.prisma               # Modelo de usuário
    ├── company.prisma            # Modelo de empresa
    ├── session.prisma            # Modelo de sessão
    ├── verificationToken.prisma  # Token de verificação
    ├── clients.prisma            # Modelo de clientes
    ├── equipment.prisma          # Modelo de equipamentos
    ├── instruments.prisma        # Modelo de instrumentos
    ├── bomb.prisma               # Modelo de bombas
    ├── valve.prisma              # Modelo de válvulas
    ├── documents.prisma          # Modelo de documentos
    ├── storage.prisma            # Modelo de armazenamento
    ├── dailyMaintenance.prisma   # Modelo de manutenção diária
    ├── contact.prisma            # Modelo de contato
    ├── boilerReport.prisma       # Modelo principal de relatório
    ├── boilerReport.boilerInfo.prisma
    ├── boilerReport.externalPerformedTests.prisma
    ├── boilerReport.generalPerformedTests.prisma
    ├── boilerReport.injectorGauge.prisma
    ├── boilerReport.operator.prisma
    ├── boilerReport.powerSupply.prisma
    ├── boilerReport.structureBodyInfo.prisma
    ├── boilerReport.structureFurnaceInfo.prisma
    ├── boilerReport.structureMirrorInfo.prisma
    ├── boilerReport.structureTubeInfo.prisma
    └── boilerReportAttachment.prisma
```

---

## Conclusão

O banco de dados do **Inspetor Industrial** foi projetado para suportar um sistema completo de gestão de inspeções industriais, com foco especial em relatórios de caldeiras. A estrutura modular permite flexibilidade na criação de relatórios detalhados, mantendo a integridade referencial e facilitando consultas eficientes através de índices estratégicos.

A separação dos modelos em arquivos individuais facilita a manutenção e compreensão do schema, enquanto o uso de enums garante consistência nos dados armazenados.
