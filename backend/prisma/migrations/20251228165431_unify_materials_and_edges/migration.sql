/*
  Warnings:

  - You are about to drop the column `edgeBottomId` on the `Piece` table. All the data in the column will be lost.
  - You are about to drop the column `edgeLeftId` on the `Piece` table. All the data in the column will be lost.
  - You are about to drop the column `edgeRightId` on the `Piece` table. All the data in the column will be lost.
  - You are about to drop the column `edgeTopId` on the `Piece` table. All the data in the column will be lost.
  - You are about to drop the `EdgeBand` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('BOARD', 'EDGE', 'HARDWARE');

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "colorHex" TEXT,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "MaterialType" NOT NULL,
ALTER COLUMN "cost" SET DEFAULT 0,
ALTER COLUMN "height" DROP NOT NULL,
ALTER COLUMN "width" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Piece" DROP COLUMN "edgeBottomId",
DROP COLUMN "edgeLeftId",
DROP COLUMN "edgeRightId",
DROP COLUMN "edgeTopId",
ADD COLUMN     "edgeA1Id" TEXT,
ADD COLUMN     "edgeA2Id" TEXT,
ADD COLUMN     "edgeL1Id" TEXT,
ADD COLUMN     "edgeL2Id" TEXT;

-- DropTable
DROP TABLE "EdgeBand";

-- AddForeignKey
ALTER TABLE "Piece" ADD CONSTRAINT "Piece_edgeL1Id_fkey" FOREIGN KEY ("edgeL1Id") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Piece" ADD CONSTRAINT "Piece_edgeL2Id_fkey" FOREIGN KEY ("edgeL2Id") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Piece" ADD CONSTRAINT "Piece_edgeA1Id_fkey" FOREIGN KEY ("edgeA1Id") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Piece" ADD CONSTRAINT "Piece_edgeA2Id_fkey" FOREIGN KEY ("edgeA2Id") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;
