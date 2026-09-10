-- CreateTable
CREATE TABLE "CatalogTier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "priceLabel" TEXT NOT NULL,
    "pitch" TEXT NOT NULL,
    "charcoalName" TEXT NOT NULL,
    "charcoalPriceCents" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "CatalogTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "proportion" DOUBLE PRECISION,
    "unit" TEXT,
    "per" TEXT,
    "factor" DOUBLE PRECISION,
    "qty" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogItem_tierId_kind_name_key" ON "CatalogItem"("tierId", "kind", "name");

-- AddForeignKey
ALTER TABLE "CatalogItem" ADD CONSTRAINT "CatalogItem_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "CatalogTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
