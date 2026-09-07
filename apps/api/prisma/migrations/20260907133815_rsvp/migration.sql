-- CreateTable
CREATE TABLE "Rsvp" (
    "id" TEXT NOT NULL,
    "barbecueId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rsvp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rsvp_token_key" ON "Rsvp"("token");

-- CreateIndex
CREATE INDEX "Rsvp_barbecueId_idx" ON "Rsvp"("barbecueId");

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_barbecueId_fkey" FOREIGN KEY ("barbecueId") REFERENCES "Barbecue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
