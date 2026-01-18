/*
  Warnings:

  - You are about to drop the column `gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation` on the `BoilerReport` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserResponsibility" AS ENUM ('ENGINEER', 'SECRETARY', 'OPERATOR');

-- AlterTable
ALTER TABLE "BoilerReport" DROP COLUMN "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation",
ADD COLUMN     "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservations" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "responsibility" "UserResponsibility" DEFAULT 'OPERATOR';
