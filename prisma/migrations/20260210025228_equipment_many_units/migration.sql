/*
  Warnings:

  - You are about to drop the column `unitId` on the `Equipment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_unitId_fkey";

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "unitId";

-- CreateTable
CREATE TABLE "EquipmentUnit" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,

    CONSTRAINT "EquipmentUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentUnit_equipmentId_unitId_key" ON "EquipmentUnit"("equipmentId", "unitId");

-- AddForeignKey
ALTER TABLE "EquipmentUnit" ADD CONSTRAINT "EquipmentUnit_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentUnit" ADD CONSTRAINT "EquipmentUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "CompanyUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
