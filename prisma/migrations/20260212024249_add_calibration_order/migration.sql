-- CreateTable
CREATE TABLE "CalibrationOrder" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,
    "capacity" TEXT,
    "diameter" TEXT,
    "mark" TEXT,
    "serialNumber" TEXT,

    CONSTRAINT "CalibrationOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalibrationOrder_boilerReportId_key" ON "CalibrationOrder"("boilerReportId");

-- AddForeignKey
ALTER TABLE "CalibrationOrder" ADD CONSTRAINT "CalibrationOrder_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
