/*
  Warnings:

  - You are about to alter the column `salaryDesired` on the `Application` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `positionDates` on the `ApplicationHistory` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `yearsKnown` on the `ApplicationReference` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Application` MODIFY `salaryDesired` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ApplicationHistory` MODIFY `positionDates` JSON NOT NULL;

-- AlterTable
ALTER TABLE `ApplicationReference` MODIFY `yearsKnown` INTEGER NOT NULL;
