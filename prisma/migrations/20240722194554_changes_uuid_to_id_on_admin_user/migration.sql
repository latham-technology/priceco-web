/*
  Warnings:

  - The primary key for the `AdminUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `AdminUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `AdminUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `ApplicationLog` DROP FOREIGN KEY `ApplicationLog_adminUserId_fkey`;

-- DropIndex
DROP INDEX `AdminUser_uuid_key` ON `AdminUser`;

-- AlterTable
ALTER TABLE `AdminUser` DROP PRIMARY KEY,
    DROP COLUMN `uuid`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `AdminUser_id_key` ON `AdminUser`(`id`);

-- AddForeignKey
ALTER TABLE `ApplicationLog` ADD CONSTRAINT `ApplicationLog_adminUserId_fkey` FOREIGN KEY (`adminUserId`) REFERENCES `AdminUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
