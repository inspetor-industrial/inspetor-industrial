-- CreateEnum
CREATE TYPE "public"."BoilerReportAttachmentFieldName" AS ENUM ('OPERATOR_CERTIFICATION', 'EXAMINATIONS_PERFORMED_RECORD', 'EXAMINATIONS_PERFORMED_BOOK', 'EXTERNAL_EXAMINATIONS_PERFORMED_PLATE_IDENTIFICATION', 'EXTERNAL_EXAMINATIONS_PERFORMED_BOILER', 'EXTERNAL_EXAMINATIONS_PERFORMED_EXTRA_PHOTOS', 'INTERNAL_EXAMINATIONS_PERFORMED_TUBES', 'INTERNAL_EXAMINATIONS_PERFORMED_FURNACE', 'INTERNAL_EXAMINATIONS_PERFORMED_INTERNAL_BOILER', 'INTERNAL_EXAMINATIONS_PERFORMED_EXTRA_PHOTOS', 'LOCAL_INSTALLATION_EXAMINATIONS_PERFORMED_BOILER_HOUSE', 'INJECTOR_GAUGE_PHOTOS', 'CALIBRATION_OF_THE_LEVEL_INDICATOR_ASSEMBLY_PHOTOS', 'SAFETY_VALVE_GAUGE_PHOTOS', 'CONTROL_DEVICES_AND_COMMANDS_PHOTOS', 'WATER_QUALITY_PHOTOS', 'BOTTOM_DISCHARGE_SYSTEM_CHECKS_PHOTOS', 'HYDROSTATIC_TEST_PHOTOS', 'ULTRASOUND_TESTS_BODY_EXAMINATION_A_PHOTOS', 'ULTRASOUND_TESTS_BODY_EXAMINATION_B_PHOTOS', 'ULTRASOUND_TESTS_BODY_EXAMINATION_C_PHOTOS', 'ULTRASOUND_TESTS_BODY_EXAMINATION_D_PHOTOS');

-- CreateEnum
CREATE TYPE "public"."BoilerReportType" AS ENUM ('INITIAL', 'PERIODIC', 'EXTRAORDINARY');

-- CreateEnum
CREATE TYPE "public"."BoilerType" AS ENUM ('FIRE_TUBE_HORIZONTAL', 'FIRE_TUBE_VERTICAL', 'WATER_TUBE_HORIZONTAL', 'WATER_TUBE_VERTICAL', 'MIXED');

-- CreateEnum
CREATE TYPE "public"."BoilerFuel" AS ENUM ('FIRE_WOOD', 'WOOD_CHIPS', 'BAGASSE', 'STRAW', 'LPG', 'NG', 'DIESEL_OIL', 'BPF_OIL', 'BLACK_LIQUOR', 'BRIQUETTE');

-- CreateEnum
CREATE TYPE "public"."BoilerCategory" AS ENUM ('A', 'B');

-- CreateEnum
CREATE TYPE "public"."StructureFurnaceType" AS ENUM ('REFRACTORY', 'COOLED', 'WATER_TUBE');

-- CreateEnum
CREATE TYPE "public"."BoilerBodyMaterial" AS ENUM ('ASTMA285GRC', 'ASTMA516', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "public"."BoilerTubeMaterial" AS ENUM ('ASTMA178', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "public"."InjectorGaugeFuel" AS ENUM ('LIQUID', 'GASEOUS', 'SOLID');

-- CreateTable
CREATE TABLE "public"."BoilerReportAttachment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "fieldName" "public"."BoilerReportAttachmentFieldName" NOT NULL,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoilerReportAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BoilerReport" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "type" "public"."BoilerReportType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "motivation" TEXT,
    "date" TIMESTAMP(3),
    "startTimeOfInspection" TIMESTAMP(3),
    "endTimeOfInspection" TIMESTAMP(3),
    "durationOfInspection" INTEGER,
    "inspectionValidation" TEXT,
    "nextInspectionDate" TIMESTAMP(3),
    "engineerId" TEXT NOT NULL,
    "operatorName" TEXT NOT NULL,
    "operatorNr13" TEXT NOT NULL,
    "operatorProvidence" TEXT,
    "operatorCertificationId" TEXT,
    "operatorObservations" TEXT,
    "boilerManufacturer" TEXT,
    "boilerBrand" TEXT,
    "boilerType" "public"."BoilerType",
    "boilerModel" TEXT,
    "boilerManufacturerYear" TEXT,
    "boilerCapacity" DOUBLE PRECISION,
    "boilerMaxPressureWorkable" DOUBLE PRECISION,
    "boilerPressureOperating" DOUBLE PRECISION,
    "boilerSerie" TEXT,
    "boilerFuel" "public"."BoilerFuel",
    "boilerCategory" "public"."BoilerCategory",
    "structureHeatingSurface" TEXT,
    "structureFurnaceType" "public"."StructureFurnaceType",
    "structureFurnaceInfos" TEXT,
    "structureFurnaceDimensionWidth" DOUBLE PRECISION,
    "structureFurnaceDimensionHeight" DOUBLE PRECISION,
    "structureFurnaceDimensionLength" DOUBLE PRECISION,
    "structureFurnaceDimensionDiameter" DOUBLE PRECISION,
    "structureFurnaceDimensionTubeDiameter" DOUBLE PRECISION,
    "structureFurnaceDimensionTubeThickness" DOUBLE PRECISION,
    "structureFreeLengthWithoutStaysOrTube" TEXT,
    "structureMirrorThickness" DOUBLE PRECISION,
    "structureMirrorDiameter" DOUBLE PRECISION,
    "structureBodyThickness" DOUBLE PRECISION,
    "structureBodyDiameter" DOUBLE PRECISION,
    "structureBodyLength" DOUBLE PRECISION,
    "structureBodyMaterial" "public"."BoilerBodyMaterial",
    "structureBodyCertificateOfManufacturer" TEXT,
    "structureTubeQuantity" DOUBLE PRECISION,
    "structureTubeDiameter" DOUBLE PRECISION,
    "structureTubeLength" DOUBLE PRECISION,
    "structureTubeThickness" DOUBLE PRECISION,
    "structureTubeMaterial" "public"."BoilerTubeMaterial",
    "structureTubeCertificateOfManufacturer" TEXT,
    "structureTubeIsNaturalOrForced" TEXT,
    "structureQuantityOfSafetyFuse" DOUBLE PRECISION,
    "examinationsPerformedTests" TEXT,
    "examinationsPerformedObservations" TEXT,
    "externalExaminationsPerformedTests" TEXT,
    "externalExaminationsPerformedObservations" TEXT,
    "internalExaminationsPerformedTests" TEXT,
    "internalExaminationsPerformedObservations" TEXT,
    "localInstallationExaminationsPerformedTests" TEXT,
    "localInstallationExaminationsPerformedObservations" TEXT,
    "injectorGaugeSerialNumber" TEXT,
    "injectorGaugeMark" TEXT,
    "injectorGaugeDiameter" DOUBLE PRECISION,
    "injectorGaugeFuel" "public"."InjectorGaugeFuel",
    "injectorGaugeTests" TEXT,
    "injectorGaugeObservations" TEXT,
    "powerSupplyBombs" TEXT,
    "powerSupplyTests" TEXT,
    "powerSupplyObservations" TEXT,
    "calibrationOfTheLevelIndicatorAssemblyTests" TEXT,
    "calibrationOfTheLevelIndicatorAssemblyObservations" TEXT,
    "calibrationOfTheLevelIndicatorAssemblyMark" TEXT,
    "calibrationOfTheLevelIndicatorAssemblyGlassDiameter" DOUBLE PRECISION,
    "calibrationOfTheLevelIndicatorAssemblyGlassLength" DOUBLE PRECISION,
    "safetyValveGaugeQuantity" TEXT,
    "safetyValveGaugeValves" TEXT,
    "safetyValveGaugeIsThereSafetyValveRedundancy" TEXT,
    "safetyValveGaugeObservations" TEXT,
    "gaugeOfElectricOrElectronicControlDevicesAndCommandsTests" TEXT,
    "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservations" TEXT,
    "waterQualityTests" TEXT,
    "waterQualityObservations" TEXT,
    "waterQualityPh" TEXT,
    "bottomDischargeSystemChecksTests" TEXT,
    "bottomDischargeSystemChecksObservations" TEXT,
    "hydrostaticTestTests" TEXT,
    "hydrostaticTestObservations" TEXT,
    "hydrostaticTestPressure" DOUBLE PRECISION,
    "hydrostaticTestDuration" DOUBLE PRECISION,
    "hydrostaticTestProcedure" TEXT,
    "accumulationTestTests" TEXT,
    "accumulationTestObservations" TEXT,
    "accumulationTestPressure" DOUBLE PRECISION,
    "accumulationTestDuration" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationATotal" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationAMean" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationAThicknessProvidedByManufacturer" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationACorrosionRate" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationAAllowableThickness" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationAIsRegularizedAccordingToASME1" BOOLEAN,
    "ultrasoundTestsBodyExaminationBTotal" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationBMean" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationBThicknessProvidedByManufacturer" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationBCorrosionRate" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationBAllowableThickness" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationCTotal" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationCMean" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationCThicknessProvidedByManufacturer" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationCCorrosionRate" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationCAllowableThickness" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationDTotal" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationDMean" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationDThicknessProvidedByManufacturer" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationDCorrosionRate" DOUBLE PRECISION,
    "ultrasoundTestsBodyExaminationDAllowableThickness" DOUBLE PRECISION,
    "pmtaCanBeMaintained" BOOLEAN,
    "pmtaMustBeIncreasedTo" TEXT,
    "pmtaMustBeDecreasedTo" TEXT,
    "pmtaObservations" TEXT,
    "conclusionsDeadlineForNextInspection" TEXT,
    "conclusionsNrItemsThatNotBeingMet" TEXT,
    "conclusionsImmediateMeasuresNecessary" TEXT,
    "conclusionsNecessaryRecommendations" TEXT,
    "conclusionsCanBeOperateNormally" BOOLEAN,

    CONSTRAINT "BoilerReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BoilerReportAttachment_reportId_fieldName_sortOrder_idx" ON "public"."BoilerReportAttachment"("reportId", "fieldName", "sortOrder");

-- CreateIndex
CREATE INDEX "BoilerReportAttachment_documentId_idx" ON "public"."BoilerReportAttachment"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "BoilerReportAttachment_reportId_documentId_fieldName_key" ON "public"."BoilerReportAttachment"("reportId", "documentId", "fieldName");

-- CreateIndex
CREATE INDEX "BoilerReport_companyId_date_idx" ON "public"."BoilerReport"("companyId", "date");

-- CreateIndex
CREATE INDEX "BoilerReport_companyId_type_date_idx" ON "public"."BoilerReport"("companyId", "type", "date");

-- CreateIndex
CREATE INDEX "BoilerReport_companyId_nextInspectionDate_idx" ON "public"."BoilerReport"("companyId", "nextInspectionDate");

-- CreateIndex
CREATE INDEX "BoilerReport_clientId_date_idx" ON "public"."BoilerReport"("clientId", "date");

-- CreateIndex
CREATE INDEX "BoilerReport_engineerId_date_idx" ON "public"."BoilerReport"("engineerId", "date");

-- CreateIndex
CREATE INDEX "BoilerReport_companyId_idx" ON "public"."BoilerReport"("companyId");

-- CreateIndex
CREATE INDEX "BoilerReport_clientId_idx" ON "public"."BoilerReport"("clientId");

-- CreateIndex
CREATE INDEX "BoilerReport_engineerId_idx" ON "public"."BoilerReport"("engineerId");

-- CreateIndex
CREATE INDEX "BoilerReport_createdAt_idx" ON "public"."BoilerReport"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."BoilerReportAttachment" ADD CONSTRAINT "BoilerReportAttachment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."BoilerReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BoilerReportAttachment" ADD CONSTRAINT "BoilerReportAttachment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BoilerReport" ADD CONSTRAINT "BoilerReport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BoilerReport" ADD CONSTRAINT "BoilerReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BoilerReport" ADD CONSTRAINT "BoilerReport_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
