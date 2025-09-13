/*
  Warnings:

  - You are about to drop the column `gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation` on the `BoilerReport` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."BoilerReport" DROP COLUMN "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation",
ADD COLUMN     "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservations" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");
