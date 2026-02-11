-- CreateTable
CREATE TABLE "ElectronicPanel" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,

    CONSTRAINT "ElectronicPanel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ElectronicPanel_boilerReportId_key" ON "ElectronicPanel"("boilerReportId");

-- AddForeignKey
ALTER TABLE "ElectronicPanel" ADD CONSTRAINT "ElectronicPanel_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
