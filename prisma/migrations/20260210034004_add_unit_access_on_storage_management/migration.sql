-- CreateTable
CREATE TABLE "StorageUnit" (
    "id" TEXT NOT NULL,
    "storageId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,

    CONSTRAINT "StorageUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StorageUnit_storageId_unitId_key" ON "StorageUnit"("storageId", "unitId");

-- AddForeignKey
ALTER TABLE "StorageUnit" ADD CONSTRAINT "StorageUnit_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageUnit" ADD CONSTRAINT "StorageUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "CompanyUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
