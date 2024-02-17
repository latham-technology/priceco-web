/*
  Warnings:

  - You are about to drop the column `felonyDescription` on the `Application` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "positionDesired" TEXT NOT NULL,
    "dateAvailable" TEXT NOT NULL,
    "availability" TEXT,
    "salaryDesired" TEXT NOT NULL,
    "currentlyEmployed" BOOLEAN,
    CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("availability", "createdAt", "currentlyEmployed", "dateAvailable", "id", "positionDesired", "salaryDesired", "updatedAt", "userId") SELECT "availability", "createdAt", "currentlyEmployed", "dateAvailable", "id", "positionDesired", "salaryDesired", "updatedAt", "userId" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
