ALTER TABLE "Order"
  ADD COLUMN "loyaltyPointsUsed" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "loyaltyDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
  ADD COLUMN "bundleDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0.00;

ALTER TABLE "Category" ADD COLUMN "image" TEXT;

CREATE TABLE "ProductReview" (
  "id" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "productId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductBundle" (
  "id" TEXT NOT NULL,
  "name_fr" TEXT NOT NULL,
  "name_ar" TEXT,
  "slug" TEXT NOT NULL,
  "description_fr" TEXT,
  "image" TEXT,
  "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductBundle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BundleItem" (
  "id" TEXT NOT NULL,
  "bundleId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "BundleItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductReview_orderId_productId_key" ON "ProductReview"("orderId", "productId");
CREATE INDEX "ProductReview_productId_status_idx" ON "ProductReview"("productId", "status");
CREATE INDEX "ProductReview_clientId_idx" ON "ProductReview"("clientId");
CREATE UNIQUE INDEX "ProductBundle_slug_key" ON "ProductBundle"("slug");
CREATE UNIQUE INDEX "BundleItem_bundleId_productId_key" ON "BundleItem"("bundleId", "productId");
CREATE INDEX "BundleItem_productId_idx" ON "BundleItem"("productId");

ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "ProductBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
