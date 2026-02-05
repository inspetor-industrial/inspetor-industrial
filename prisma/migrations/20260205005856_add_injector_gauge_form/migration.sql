-- CreateTable
CREATE TABLE "InjectorGauge" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "observations" TEXT,
    "fuelType" "InjectorGaugeFuel" NOT NULL,
    "mark" TEXT NOT NULL,
    "diameter" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InjectorGauge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InjectorGauge_boilerReportId_key" ON "InjectorGauge"("boilerReportId");

-- AddForeignKey
ALTER TABLE "InjectorGauge" ADD CONSTRAINT "InjectorGauge_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
