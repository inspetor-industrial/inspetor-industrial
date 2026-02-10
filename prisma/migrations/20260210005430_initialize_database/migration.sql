-- CreateEnum
CREATE TYPE "BoilerReportAttachmentFieldName" AS ENUM ('OPERATOR_CERTIFICATION', 'EXAMINATIONS_PERFORMED_RECORD', 'EXAMINATIONS_PERFORMED_BOOK', 'EXTERNAL_EXAMINATIONS_PERFORMED_PLATE_IDENTIFICATION', 'EXTERNAL_EXAMINATIONS_PERFORMED_BOILER', 'EXTERNAL_EXAMINATIONS_PERFORMED_EXTRA_PHOTOS', 'INTERNAL_EXAMINATIONS_PERFORMED_TUBES', 'INTERNAL_EXAMINATIONS_PERFORMED_FURNACE', 'INTERNAL_EXAMINATIONS_PERFORMED_INTERNAL_BOILER', 'INTERNAL_EXAMINATIONS_PERFORMED_EXTRA_PHOTOS', 'LOCAL_INSTALLATION_EXAMINATIONS_PERFORMED_BOILER_HOUSE', 'INJECTOR_GAUGE_PHOTOS', 'CALIBRATION_OF_THE_LEVEL_INDICATOR_ASSEMBLY_PHOTOS', 'SAFETY_VALVE_GAUGE_PHOTOS', 'CONTROL_DEVICES_AND_COMMANDS_PHOTOS', 'WATER_QUALITY_PHOTOS', 'BOTTOM_DISCHARGE_SYSTEM_CHECKS_PHOTOS', 'HYDROSTATIC_TEST_PHOTOS', 'ULTRASOUND_TESTS_BODY_EXAMINATION_A_PHOTOS', 'ULTRASOUND_TESTS_BODY_EXAMINATION_B_PHOTOS', 'ULTRASOUND_TESTS_BODY_EXAMINATION_C_PHOTOS', 'ULTRASOUND_TESTS_BODY_EXAMINATION_D_PHOTOS', 'PRESSURE_GAUGE_CALIBRATION_PHOTOS', 'STRUCTURE_BODY_CERTIFICATE', 'STRUCTURE_TUBE_CERTIFICATE');

-- CreateEnum
CREATE TYPE "BoilerReportType" AS ENUM ('INITIAL', 'PERIODIC', 'EXTRAORDINARY');

-- CreateEnum
CREATE TYPE "BoilerType" AS ENUM ('FIRE_TUBE_HORIZONTAL', 'FIRE_TUBE_VERTICAL', 'WATER_TUBE_HORIZONTAL', 'WATER_TUBE_VERTICAL', 'MIXED');

-- CreateEnum
CREATE TYPE "BoilerFuelType" AS ENUM ('FIRE_WOOD', 'WOOD_CHIPS', 'BAGASSE', 'STRAW', 'LPG', 'NG', 'DIESEL_OIL', 'BPF_OIL', 'BLACK_LIQUOR', 'BRIQUETTE');

-- CreateEnum
CREATE TYPE "BoilerCategory" AS ENUM ('A', 'B');

-- CreateEnum
CREATE TYPE "BoilerBodyMaterial" AS ENUM ('ASTMA285GRC', 'ASTMA516', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "BoilerTubeMaterial" AS ENUM ('ASTMA178', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "InjectorGaugeFuel" AS ENUM ('LIQUID', 'GASEOUS', 'SOLID');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StorageStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StructureFurnaceType" AS ENUM ('REFRACTORY', 'COOLED', 'WATER_TUBE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR', 'USER');

-- CreateEnum
CREATE TYPE "UserResponsibility" AS ENUM ('ENGINEER', 'SECRETARY', 'OPERATOR');

-- CreateTable
CREATE TABLE "BoilerInfo" (
    "id" TEXT NOT NULL,
    "manufacturer" TEXT,
    "mark" TEXT,
    "type" "BoilerType" NOT NULL,
    "model" TEXT,
    "yearOfManufacture" INTEGER,
    "maximumWorkingPressure" TEXT,
    "maximumOperatingPressure" TEXT,
    "series" TEXT,
    "fuelType" "BoilerFuelType" NOT NULL,
    "category" "BoilerCategory" NOT NULL,
    "boilerReportId" TEXT NOT NULL,

    CONSTRAINT "BoilerInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalPerformedTests" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,

    CONSTRAINT "ExternalPerformedTests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneralPerformedTests" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralPerformedTests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InjectorGauge" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,
    "fuelType" "InjectorGaugeFuel" NOT NULL,
    "mark" TEXT NOT NULL,
    "diameter" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InjectorGauge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isAbleToOperateWithNR13" TEXT NOT NULL,
    "certificateId" TEXT,
    "provisionsForOperator" TEXT,
    "observations" TEXT,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PowerSupply" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,

    CONSTRAINT "PowerSupply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoilerReport" (
    "id" TEXT NOT NULL,
    "type" "BoilerReportType" NOT NULL,
    "clientId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "motivation" TEXT,
    "date" TIMESTAMP(3),
    "startTimeOfInspection" TEXT,
    "endTimeOfInspection" TEXT,
    "inspectionValidation" TEXT,
    "nextInspectionDate" TIMESTAMP(3),
    "engineerId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoilerReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructureBodyInfo" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "thickness" TEXT NOT NULL,
    "diameter" TEXT NOT NULL,
    "length" TEXT NOT NULL,
    "material" "BoilerBodyMaterial" NOT NULL,
    "certificateId" TEXT,

    CONSTRAINT "StructureBodyInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructureFurnaceInfo" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "heatingSurface" DOUBLE PRECISION,
    "surfaceType" "StructureFurnaceType" NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "diameter" DOUBLE PRECISION,
    "tubeDiameter" DOUBLE PRECISION,
    "tubeThickness" DOUBLE PRECISION,
    "freeLengthWithoutStays" DOUBLE PRECISION,

    CONSTRAINT "StructureFurnaceInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructureMirrorInfo" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "thickness" DOUBLE PRECISION,
    "diameter" DOUBLE PRECISION,

    CONSTRAINT "StructureMirrorInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructureTubeInfo" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "certificateId" TEXT,
    "length" TEXT NOT NULL,
    "diameter" TEXT NOT NULL,
    "thickness" TEXT NOT NULL,
    "material" "BoilerTubeMaterial" NOT NULL,
    "isNaturalOrForced" TEXT NOT NULL,
    "quantityOfSafetyFuse" TEXT NOT NULL,

    CONSTRAINT "StructureTubeInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoilerReportAttachment" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "fieldName" "BoilerReportAttachmentFieldName" NOT NULL,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "injectorGaugeId" TEXT,

    CONSTRAINT "BoilerReportAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bomb" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "mark" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "stages" TEXT NOT NULL,
    "potency" DECIMAL(65,30) NOT NULL,
    "photoId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "powerSupplyId" TEXT,

    CONSTRAINT "Bomb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clients" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "taxRegistration" TEXT,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT,

    CONSTRAINT "Clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyUnit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMaintenance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "operatorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "equipmentId" TEXT NOT NULL,

    CONSTRAINT "DailyMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documents" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "cloudflareR2Key" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "identificationNumber" TEXT NOT NULL,
    "manufactorYear" VARCHAR(10) NOT NULL,
    "mark" TEXT NOT NULL,
    "pmta" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instruments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "validationDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accessToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "id" TEXT NOT NULL,
    "ipAddress" TEXT,
    "refreshExpiresAt" TIMESTAMP(3) NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "userAgent" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Storage" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "relativeLink" TEXT NOT NULL,
    "status" "StorageStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "password" TEXT,
    "companyId" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "username" TEXT,
    "responsibility" "UserResponsibility" DEFAULT 'OPERATOR',
    "registrationNumber" TEXT DEFAULT 'N-A',
    "crea" TEXT DEFAULT 'N-A',
    "defaultUnitId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserUnitAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "unitId" TEXT,

    CONSTRAINT "UserUnitAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Valve" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "diameter" DECIMAL(65,30) NOT NULL,
    "flow" DECIMAL(65,30) NOT NULL,
    "opening_pressure" DECIMAL(65,30) NOT NULL,
    "closing_pressure" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tests" JSONB NOT NULL,

    CONSTRAINT "Valve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoilerInfo_boilerReportId_key" ON "BoilerInfo"("boilerReportId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalPerformedTests_boilerReportId_key" ON "ExternalPerformedTests"("boilerReportId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneralPerformedTests_boilerReportId_key" ON "GeneralPerformedTests"("boilerReportId");

-- CreateIndex
CREATE UNIQUE INDEX "InjectorGauge_boilerReportId_key" ON "InjectorGauge"("boilerReportId");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_boilerReportId_key" ON "Operator"("boilerReportId");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_certificateId_key" ON "Operator"("certificateId");

-- CreateIndex
CREATE UNIQUE INDEX "PowerSupply_boilerReportId_key" ON "PowerSupply"("boilerReportId");

-- CreateIndex
CREATE UNIQUE INDEX "StructureBodyInfo_boilerReportId_key" ON "StructureBodyInfo"("boilerReportId");

-- CreateIndex
CREATE UNIQUE INDEX "StructureBodyInfo_certificateId_key" ON "StructureBodyInfo"("certificateId");

-- CreateIndex
CREATE UNIQUE INDEX "StructureFurnaceInfo_boilerReportId_key" ON "StructureFurnaceInfo"("boilerReportId");

-- CreateIndex
CREATE UNIQUE INDEX "StructureMirrorInfo_boilerReportId_key" ON "StructureMirrorInfo"("boilerReportId");

-- CreateIndex
CREATE UNIQUE INDEX "StructureTubeInfo_boilerReportId_key" ON "StructureTubeInfo"("boilerReportId");

-- CreateIndex
CREATE UNIQUE INDEX "StructureTubeInfo_certificateId_key" ON "StructureTubeInfo"("certificateId");

-- CreateIndex
CREATE INDEX "BoilerReportAttachment_documentId_idx" ON "BoilerReportAttachment"("documentId");

-- CreateIndex
CREATE INDEX "BoilerReportAttachment_injectorGaugeId_fieldName_idx" ON "BoilerReportAttachment"("injectorGaugeId", "fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_companyId_taxId_key" ON "Clients"("companyId", "taxId");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_companyId_taxRegistration_key" ON "Clients"("companyId", "taxRegistration");

-- CreateIndex
CREATE UNIQUE INDEX "Company_cnpj_key" ON "Company"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_identificationNumber_key" ON "Equipment"("identificationNumber");

-- CreateIndex
CREATE INDEX "Equipment_companyId_idx" ON "Equipment"("companyId");

-- CreateIndex
CREATE INDEX "Equipment_id_companyId_idx" ON "Equipment"("id", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_accessToken_key" ON "Session"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_accessToken_idx" ON "Session"("accessToken");

-- CreateIndex
CREATE INDEX "Session_refreshToken_idx" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserUnitAccess_userId_companyId_unitId_key" ON "UserUnitAccess"("userId", "companyId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "Valve_serial_number_key" ON "Valve"("serial_number");

-- CreateIndex
CREATE INDEX "Valve_companyId_idx" ON "Valve"("companyId");

-- CreateIndex
CREATE INDEX "Valve_id_companyId_idx" ON "Valve"("id", "companyId");

-- AddForeignKey
ALTER TABLE "BoilerInfo" ADD CONSTRAINT "BoilerInfo_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalPerformedTests" ADD CONSTRAINT "ExternalPerformedTests_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralPerformedTests" ADD CONSTRAINT "GeneralPerformedTests_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InjectorGauge" ADD CONSTRAINT "InjectorGauge_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "BoilerReportAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerSupply" ADD CONSTRAINT "PowerSupply_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoilerReport" ADD CONSTRAINT "BoilerReport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoilerReport" ADD CONSTRAINT "BoilerReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoilerReport" ADD CONSTRAINT "BoilerReport_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureBodyInfo" ADD CONSTRAINT "StructureBodyInfo_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureBodyInfo" ADD CONSTRAINT "StructureBodyInfo_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "BoilerReportAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureFurnaceInfo" ADD CONSTRAINT "StructureFurnaceInfo_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureMirrorInfo" ADD CONSTRAINT "StructureMirrorInfo_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureTubeInfo" ADD CONSTRAINT "StructureTubeInfo_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureTubeInfo" ADD CONSTRAINT "StructureTubeInfo_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "BoilerReportAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoilerReportAttachment" ADD CONSTRAINT "BoilerReportAttachment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoilerReportAttachment" ADD CONSTRAINT "BoilerReportAttachment_injectorGaugeId_fkey" FOREIGN KEY ("injectorGaugeId") REFERENCES "InjectorGauge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bomb" ADD CONSTRAINT "Bomb_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bomb" ADD CONSTRAINT "Bomb_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bomb" ADD CONSTRAINT "Bomb_powerSupplyId_fkey" FOREIGN KEY ("powerSupplyId") REFERENCES "PowerSupply"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clients" ADD CONSTRAINT "Clients_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUnit" ADD CONSTRAINT "CompanyUnit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMaintenance" ADD CONSTRAINT "DailyMaintenance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMaintenance" ADD CONSTRAINT "DailyMaintenance_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instruments" ADD CONSTRAINT "Instruments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultUnitId_fkey" FOREIGN KEY ("defaultUnitId") REFERENCES "CompanyUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserUnitAccess" ADD CONSTRAINT "UserUnitAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserUnitAccess" ADD CONSTRAINT "UserUnitAccess_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserUnitAccess" ADD CONSTRAINT "UserUnitAccess_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "CompanyUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valve" ADD CONSTRAINT "Valve_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
