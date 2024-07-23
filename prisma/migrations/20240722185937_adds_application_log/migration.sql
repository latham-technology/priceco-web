-- AlterTable
ALTER TABLE `Application` ADD COLUMN `archived` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `ApplicationLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adminUserId` INTEGER NOT NULL,
    `applicationId` INTEGER NOT NULL,
    `action` ENUM('ARCHIVE', 'VIEW') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ApplicationLog` ADD CONSTRAINT `ApplicationLog_adminUserId_fkey` FOREIGN KEY (`adminUserId`) REFERENCES `AdminUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationLog` ADD CONSTRAINT `ApplicationLog_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
