-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "hashedPassword" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" "Role";
