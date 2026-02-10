-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "unitId" TEXT;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "CompanyUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
