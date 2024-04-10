-- AlterTable
ALTER TABLE "User" ADD COLUMN     "discordAccountEmail" TEXT;

-- CreateTable
CREATE TABLE "DiscordAccount" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordAccount_user_id_key" ON "DiscordAccount"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordAccount_email_key" ON "DiscordAccount"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_discordAccountEmail_fkey" FOREIGN KEY ("discordAccountEmail") REFERENCES "DiscordAccount"("email") ON DELETE SET NULL ON UPDATE CASCADE;
