-- DropForeignKey
ALTER TABLE `ApplicationLog` DROP FOREIGN KEY `ApplicationLog_adminUserId_fkey`;

-- AlterTable
ALTER TABLE `ApplicationLog` MODIFY `adminUserId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `ApplicationLog` ADD CONSTRAINT `ApplicationLog_adminUserId_fkey` FOREIGN KEY (`adminUserId`) REFERENCES `AdminUser`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
