/*
  Warnings:

  - You are about to drop the column `gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation` on the `BoilerReport` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."BoilerReportAttachmentFieldName" ADD VALUE 'PRESSURE_GAUGE_CALIBRATION_PHOTOS';

-- AlterTable
ALTER TABLE "public"."BoilerReport" DROP COLUMN "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation",
ADD COLUMN     "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservations" TEXT,
ADD COLUMN     "pressureGaugeCalibrationBrand" TEXT,
ADD COLUMN     "pressureGaugeCalibrationCapacity" DOUBLE PRECISION,
ADD COLUMN     "pressureGaugeCalibrationDiameter" DOUBLE PRECISION,
ADD COLUMN     "pressureGaugeCalibrationObservations" TEXT,
ADD COLUMN     "pressureGaugeCalibrationOrderNumber" TEXT,
ADD COLUMN     "pressureGaugeCalibrationTests" TEXT;
