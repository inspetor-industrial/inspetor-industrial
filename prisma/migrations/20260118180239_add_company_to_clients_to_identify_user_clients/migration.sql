-- AlterTable
ALTER TABLE "Clients" ADD COLUMN     "companyId" TEXT;

-- AddForeignKey
ALTER TABLE "Clients" ADD CONSTRAINT "Clients_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
