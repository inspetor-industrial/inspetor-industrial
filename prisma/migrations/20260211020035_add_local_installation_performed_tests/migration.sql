-- CreateTable
CREATE TABLE "LocalInstallationPerformedTests" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,

    CONSTRAINT "LocalInstallationPerformedTests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocalInstallationPerformedTests_boilerReportId_key" ON "LocalInstallationPerformedTests"("boilerReportId");

-- AddForeignKey
ALTER TABLE "LocalInstallationPerformedTests" ADD CONSTRAINT "LocalInstallationPerformedTests_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
