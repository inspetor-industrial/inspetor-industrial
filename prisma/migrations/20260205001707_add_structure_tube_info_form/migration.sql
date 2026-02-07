-- AlterEnum
ALTER TYPE "BoilerReportAttachmentFieldName" ADD VALUE 'STRUCTURE_TUBE_CERTIFICATE';

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

-- CreateIndex
CREATE UNIQUE INDEX "StructureTubeInfo_boilerReportId_key" ON "StructureTubeInfo"("boilerReportId");

-- CreateIndex
CREATE UNIQUE INDEX "StructureTubeInfo_certificateId_key" ON "StructureTubeInfo"("certificateId");

-- AddForeignKey
ALTER TABLE "StructureTubeInfo" ADD CONSTRAINT "StructureTubeInfo_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureTubeInfo" ADD CONSTRAINT "StructureTubeInfo_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "BoilerReportAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
