-- DropForeignKey
ALTER TABLE `ApplicationEducation` DROP FOREIGN KEY `ApplicationEducation_applicationId_fkey`;

-- DropForeignKey
ALTER TABLE `ApplicationHistory` DROP FOREIGN KEY `ApplicationHistory_applicationId_fkey`;

-- DropForeignKey
ALTER TABLE `ApplicationReference` DROP FOREIGN KEY `ApplicationReference_applicationId_fkey`;

-- AddForeignKey
ALTER TABLE `ApplicationEducation` ADD CONSTRAINT `ApplicationEducation_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationHistory` ADD CONSTRAINT `ApplicationHistory_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationReference` ADD CONSTRAINT `ApplicationReference_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
