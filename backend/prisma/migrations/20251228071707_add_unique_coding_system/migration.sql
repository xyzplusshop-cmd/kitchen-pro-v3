/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `DrawerSystem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo]` on the table `EdgeBand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo]` on the table `HardwareItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo]` on the table `Material` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DrawerSystem" ADD COLUMN     "codigo" TEXT;

-- AlterTable
ALTER TABLE "EdgeBand" ADD COLUMN     "codigo" TEXT;

-- AlterTable
ALTER TABLE "HardwareItem" ADD COLUMN     "codigo" TEXT;

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "codigo" TEXT;

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "codigo" TEXT;

-- AlterTable
ALTER TABLE "Piece" ADD COLUMN     "codigo" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "codigo" TEXT;

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "brand" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accessory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accessory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tool_codigo_key" ON "Tool"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Accessory_codigo_key" ON "Accessory"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "DrawerSystem_codigo_key" ON "DrawerSystem"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "EdgeBand_codigo_key" ON "EdgeBand"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "HardwareItem_codigo_key" ON "HardwareItem"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Material_codigo_key" ON "Material"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Project_codigo_key" ON "Project"("codigo");
