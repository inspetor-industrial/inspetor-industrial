-- CreateTable
CREATE TABLE "HydrostaticTest" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,
    "pressure" TEXT,
    "duration" TEXT,
    "procedure" TEXT,

    CONSTRAINT "HydrostaticTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HydrostaticTest_boilerReportId_key" ON "HydrostaticTest"("boilerReportId");

-- AddForeignKey
ALTER TABLE "HydrostaticTest" ADD CONSTRAINT "HydrostaticTest_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
