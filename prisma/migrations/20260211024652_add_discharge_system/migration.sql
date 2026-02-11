-- CreateTable
CREATE TABLE "DischargeSystem" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,

    CONSTRAINT "DischargeSystem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DischargeSystem_boilerReportId_key" ON "DischargeSystem"("boilerReportId");

-- AddForeignKey
ALTER TABLE "DischargeSystem" ADD CONSTRAINT "DischargeSystem_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
