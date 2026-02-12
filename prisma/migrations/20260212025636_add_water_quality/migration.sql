-- CreateTable
CREATE TABLE "WaterQuality" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,
    "waterPh" TEXT,

    CONSTRAINT "WaterQuality_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaterQuality_boilerReportId_key" ON "WaterQuality"("boilerReportId");

-- AddForeignKey
ALTER TABLE "WaterQuality" ADD CONSTRAINT "WaterQuality_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
