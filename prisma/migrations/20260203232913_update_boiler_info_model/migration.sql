/*
  Warnings:

  - The primary key for the `Operator` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "BoilerFuelType" AS ENUM ('FIRE_WOOD', 'WOOD_CHIPS', 'BAGASSE', 'STRAW', 'LPG', 'NG', 'DIESEL_OIL', 'BPF_OIL', 'BLACK_LIQUOR', 'BRIQUETTE');

-- AlterTable
ALTER TABLE "Operator" DROP CONSTRAINT "Operator_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Operator_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Operator_id_seq";

-- DropEnum
DROP TYPE "BoilerFuel";

-- CreateTable
CREATE TABLE "BoilerInfo" (
    "id" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "mark" TEXT NOT NULL,
    "type" "BoilerType" NOT NULL,
    "model" TEXT NOT NULL,
    "yearOfManufacture" INTEGER NOT NULL,
    "maximumWorkingPressure" TEXT NOT NULL,
    "maximumOperatingPressure" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "fuelType" "BoilerFuelType" NOT NULL,
    "category" "BoilerCategory" NOT NULL,
    "boilerReportId" TEXT NOT NULL,

    CONSTRAINT "BoilerInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoilerInfo_boilerReportId_key" ON "BoilerInfo"("boilerReportId");

-- AddForeignKey
ALTER TABLE "BoilerInfo" ADD CONSTRAINT "BoilerInfo_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
