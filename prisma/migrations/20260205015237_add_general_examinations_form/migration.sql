-- CreateTable
CREATE TABLE "GeneralPerformedTests" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralPerformedTests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeneralPerformedTests_boilerReportId_key" ON "GeneralPerformedTests"("boilerReportId");

-- AddForeignKey
ALTER TABLE "GeneralPerformedTests" ADD CONSTRAINT "GeneralPerformedTests_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
