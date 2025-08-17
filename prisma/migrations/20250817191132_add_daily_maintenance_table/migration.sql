-- CreateTable
CREATE TABLE "public"."DailyMaintenance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "operatorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyMaintenance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."DailyMaintenance" ADD CONSTRAINT "DailyMaintenance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
