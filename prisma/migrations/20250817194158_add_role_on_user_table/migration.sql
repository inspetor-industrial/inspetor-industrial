-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'OPERATOR', 'USER');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'USER';
