-- CreateTable
CREATE TABLE "LevelIndicator" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,
    "mark" TEXT,
    "glassDiameter" TEXT,
    "glassLength" TEXT,

    CONSTRAINT "LevelIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LevelIndicator_boilerReportId_key" ON "LevelIndicator"("boilerReportId");

-- AddForeignKey
ALTER TABLE "LevelIndicator" ADD CONSTRAINT "LevelIndicator_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
