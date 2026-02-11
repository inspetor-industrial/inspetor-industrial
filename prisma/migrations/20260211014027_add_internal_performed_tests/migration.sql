-- CreateTable
CREATE TABLE "InternalPerformedTests" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,

    CONSTRAINT "InternalPerformedTests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InternalPerformedTests_boilerReportId_key" ON "InternalPerformedTests"("boilerReportId");

-- AddForeignKey
ALTER TABLE "InternalPerformedTests" ADD CONSTRAINT "InternalPerformedTests_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
