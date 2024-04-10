-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_discordAccountEmail_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_discordAccountEmail_fkey" FOREIGN KEY ("discordAccountEmail") REFERENCES "DiscordAccount"("email") ON DELETE CASCADE ON UPDATE CASCADE;
