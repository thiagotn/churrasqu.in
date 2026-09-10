-- AlterTable
ALTER TABLE "Barbecue" ADD COLUMN     "showPaidPublicly" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Rsvp" ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidAt" TIMESTAMP(3);
