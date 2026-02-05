-- CreateTable
CREATE TABLE "StructureFurnaceInfo" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "heatingSurface" DOUBLE PRECISION,
    "surfaceType" "StructureFurnaceType" NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "diameter" DOUBLE PRECISION,
    "tubeDiameter" DOUBLE PRECISION,
    "tubeThickness" DOUBLE PRECISION,
    "freeLengthWithoutStays" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StructureFurnaceInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StructureFurnaceInfo_boilerReportId_key" ON "StructureFurnaceInfo"("boilerReportId");

-- AddForeignKey
ALTER TABLE "StructureFurnaceInfo" ADD CONSTRAINT "StructureFurnaceInfo_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
