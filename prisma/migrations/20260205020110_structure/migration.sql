/*
  Warnings:

  - You are about to drop the column `createdAt` on the `StructureFurnaceInfo` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `StructureFurnaceInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StructureFurnaceInfo" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "StructureMirrorInfo" (
    "id" TEXT NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "thickness" DOUBLE PRECISION,
    "diameter" DOUBLE PRECISION,

    CONSTRAINT "StructureMirrorInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StructureMirrorInfo_boilerReportId_key" ON "StructureMirrorInfo"("boilerReportId");

-- AddForeignKey
ALTER TABLE "StructureMirrorInfo" ADD CONSTRAINT "StructureMirrorInfo_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
