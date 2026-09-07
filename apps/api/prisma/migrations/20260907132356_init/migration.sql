-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barbecue" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventDay" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "eventAddress" TEXT NOT NULL,
    "eventCity" TEXT NOT NULL,
    "eventHint" TEXT NOT NULL,
    "alcoholMode" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "men" INTEGER NOT NULL,
    "women" INTEGER NOT NULL,
    "kids" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "perAdultCents" INTEGER NOT NULL,
    "meatListKg" DOUBLE PRECISION NOT NULL,
    "pixType" TEXT,
    "pixKey" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barbecue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarbecueItem" (
    "id" TEXT NOT NULL,
    "barbecueId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,

    CONSTRAINT "BarbecueItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Barbecue_slug_key" ON "Barbecue"("slug");

-- CreateIndex
CREATE INDEX "BarbecueItem_barbecueId_idx" ON "BarbecueItem"("barbecueId");

-- AddForeignKey
ALTER TABLE "Barbecue" ADD CONSTRAINT "Barbecue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarbecueItem" ADD CONSTRAINT "BarbecueItem_barbecueId_fkey" FOREIGN KEY ("barbecueId") REFERENCES "Barbecue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
