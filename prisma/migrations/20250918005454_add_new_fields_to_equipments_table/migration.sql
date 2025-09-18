/*
  Warnings:

  - You are about to drop the column `gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation` on the `BoilerReport` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Equipment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[identificationNumber]` on the table `Equipment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identificationNumber` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manufactorYear` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mark` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pmta` to the `Equipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."BoilerReport" DROP COLUMN "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation",
ADD COLUMN     "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservations" TEXT;

-- AlterTable
ALTER TABLE "public"."Equipment" DROP COLUMN "description",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "identificationNumber" TEXT NOT NULL,
ADD COLUMN     "manufactorYear" VARCHAR(10) NOT NULL,
ADD COLUMN     "mark" TEXT NOT NULL,
ADD COLUMN     "pmta" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_identificationNumber_key" ON "public"."Equipment"("identificationNumber");
