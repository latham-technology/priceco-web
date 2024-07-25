/*
  Warnings:

  - You are about to alter the column `salaryDesired` on the `Application` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Application` MODIFY `salaryDesired` DOUBLE NOT NULL;
