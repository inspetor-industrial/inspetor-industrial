/*
  Warnings:

  - You are about to drop the column `gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation` on the `BoilerReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BoilerReport" DROP COLUMN "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation",
ADD COLUMN     "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservations" TEXT;

-- AlterTable
ALTER TABLE "BoilerReportAttachment" ADD COLUMN     "configs" JSONB;
