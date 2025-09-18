/*
  Warnings:

  - You are about to drop the column `gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation` on the `BoilerReport` table. All the data in the column will be lost.
  - You are about to drop the column `equipment` on the `DailyMaintenance` table. All the data in the column will be lost.
  - Added the required column `equipmentId` to the `DailyMaintenance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."BoilerReport" DROP COLUMN "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation",
ADD COLUMN     "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservations" TEXT;

-- AlterTable
ALTER TABLE "public"."DailyMaintenance" DROP COLUMN "equipment",
ADD COLUMN     "equipmentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."DailyMaintenance" ADD CONSTRAINT "DailyMaintenance_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
