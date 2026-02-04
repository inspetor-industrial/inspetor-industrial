-- CreateTable
CREATE TABLE "Operator" (
    "id" SERIAL NOT NULL,
    "boilerReportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isAbleToOperateWithNR13" TEXT NOT NULL,
    "certificateId" TEXT,
    "provisionsForOperator" TEXT,
    "observations" TEXT,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Operator_boilerReportId_key" ON "Operator"("boilerReportId");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_certificateId_key" ON "Operator"("certificateId");

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_boilerReportId_fkey" FOREIGN KEY ("boilerReportId") REFERENCES "BoilerReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "BoilerReportAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
