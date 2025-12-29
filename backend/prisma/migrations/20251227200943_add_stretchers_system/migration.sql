-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientName" TEXT,
    "userId" TEXT NOT NULL,
    "linearLength" DOUBLE PRECISION NOT NULL,
    "openingSystem" TEXT NOT NULL DEFAULT 'HANDLE',
    "defaultEdgeId" TEXT,
    "thumbnail" TEXT,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HardwareItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "compatibility" TEXT[],
    "discountRules" JSONB NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "brand" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HardwareItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawerSystem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "isMetal" BOOLEAN NOT NULL DEFAULT false,
    "slideClearance" DOUBLE PRECISION NOT NULL DEFAULT 12.7,
    "bottomConstruction" TEXT NOT NULL DEFAULT 'RANURADO',
    "backendClearance" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrawerSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleTemplate" (
    "id" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "tipoApertura" TEXT,
    "piezas" JSONB NOT NULL,
    "thumbnail" TEXT,
    "descripcion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegSystem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "brand" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'BASE',
    "width" DOUBLE PRECISION NOT NULL,
    "isFixed" BOOLEAN NOT NULL DEFAULT false,
    "doorCount" INTEGER NOT NULL DEFAULT 0,
    "drawerCount" INTEGER NOT NULL DEFAULT 0,
    "hingeType" TEXT NOT NULL DEFAULT 'Estándar',
    "sliderType" TEXT NOT NULL DEFAULT 'Estándar',
    "hingeId" TEXT,
    "sliderId" TEXT,
    "drawerSystemId" TEXT,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 720,
    "depth" DOUBLE PRECISION NOT NULL DEFAULT 560,
    "openingSystem" TEXT,
    "templateId" TEXT,
    "legSystemId" TEXT,
    "customPieces" JSONB,
    "calculationRules" JSONB,
    "hasTopStretcher" BOOLEAN DEFAULT false,
    "hasBottomStretcher" BOOLEAN DEFAULT false,
    "hasFrontStretcher" BOOLEAN DEFAULT false,
    "hasBackPanel" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Piece" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "finalWidth" DOUBLE PRECISION NOT NULL,
    "finalHeight" DOUBLE PRECISION NOT NULL,
    "cutWidth" DOUBLE PRECISION NOT NULL,
    "cutHeight" DOUBLE PRECISION NOT NULL,
    "materialId" TEXT,
    "edgeTopId" TEXT,
    "edgeBottomId" TEXT,
    "edgeLeftId" TEXT,
    "edgeRightId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Piece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "thickness" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdgeBand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "thickness" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EdgeBand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Piece" ADD CONSTRAINT "Piece_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Piece" ADD CONSTRAINT "Piece_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;
