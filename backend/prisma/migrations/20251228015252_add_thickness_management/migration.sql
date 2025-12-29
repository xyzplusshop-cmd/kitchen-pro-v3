-- AlterTable
ALTER TABLE "ModuleTemplate" ADD COLUMN     "externalDepth" DOUBLE PRECISION,
ADD COLUMN     "externalHeight" DOUBLE PRECISION,
ADD COLUMN     "externalWidth" DOUBLE PRECISION,
ADD COLUMN     "hasBackPanel" BOOLEAN DEFAULT true,
ADD COLUMN     "hasBottomStretcher" BOOLEAN DEFAULT false,
ADD COLUMN     "hasFrontStretcher" BOOLEAN DEFAULT false,
ADD COLUMN     "hasTopStretcher" BOOLEAN DEFAULT false,
ADD COLUMN     "pieceTemplates" JSONB,
ADD COLUMN     "referenceThickness" INTEGER NOT NULL DEFAULT 18;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "carcassThickness" INTEGER NOT NULL DEFAULT 18,
ADD COLUMN     "frontsThickness" INTEGER NOT NULL DEFAULT 18;
