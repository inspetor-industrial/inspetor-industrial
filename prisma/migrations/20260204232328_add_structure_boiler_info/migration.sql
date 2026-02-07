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

-- CreateIndex
CREATE UNIQUE INDEX "StructureBodyInfo_boilerReportId_key" ON "StructureBodyInfo"("boilerReportId");

-- CreateIndex
CREATE UNIQUE INDEX "StructureBodyInfo_certificateId_key" ON "StructureBodyInfo"("certificateId");

-- AddForeignKey
ALTER TABLE "StructureBodyInfo" ADD CONSTRAINT "StructureBodyInfo_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureBodyInfo" ADD CONSTRAINT "StructureBodyInfo_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "BoilerReportAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
