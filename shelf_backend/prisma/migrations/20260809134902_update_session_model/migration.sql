/*
  Warnings:

  - You are about to drop the column `expired` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token_hash` on the `Session` table. All the data in the column will be lost.
  - Added the required column `token_hash` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "expired",
DROP COLUMN "refresh_token_hash",
ADD COLUMN     "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "token_hash" TEXT NOT NULL,
ALTER COLUMN "ip" DROP NOT NULL,
ALTER COLUMN "last_seen_ip" DROP NOT NULL,
ALTER COLUMN "user_agent" DROP NOT NULL;
