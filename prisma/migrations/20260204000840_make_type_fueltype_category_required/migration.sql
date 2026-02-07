/*
  Warnings:

  - Made the column `type` on table `BoilerInfo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fuelType` on table `BoilerInfo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category` on table `BoilerInfo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BoilerInfo" ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "fuelType" SET NOT NULL,
ALTER COLUMN "category" SET NOT NULL;
