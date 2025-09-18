/*
  Warnings:

  - You are about to drop the column `gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation` on the `BoilerReport` table. All the data in the column will be lost.
  - Added the required column `type` to the `Equipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."BoilerReport" DROP COLUMN "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation",
ADD COLUMN     "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservations" TEXT;

-- AlterTable
ALTER TABLE "public"."Equipment" ADD COLUMN     "type" TEXT NOT NULL;
