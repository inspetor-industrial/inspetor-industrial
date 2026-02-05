-- AlterTable
ALTER TABLE "BoilerReportAttachment" ADD COLUMN     "injectorGaugeId" TEXT;

-- CreateIndex
CREATE INDEX "BoilerReportAttachment_injectorGaugeId_fieldName_idx" ON "BoilerReportAttachment"("injectorGaugeId", "fieldName");

-- AddForeignKey
ALTER TABLE "BoilerReportAttachment" ADD CONSTRAINT "BoilerReportAttachment_injectorGaugeId_fkey" FOREIGN KEY ("injectorGaugeId") REFERENCES "InjectorGauge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
