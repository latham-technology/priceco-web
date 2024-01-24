/*
  Warnings:

  - You are about to alter the column `completed` on the `ApplicationEducation` table. The data in that column could be lost. The data in that column will be cast from `String` to `Boolean`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApplicationEducation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "type" TEXT,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "subjects" TEXT NOT NULL,
    "completed" BOOLEAN,
    CONSTRAINT "ApplicationEducation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ApplicationEducation" ("applicationId", "completed", "id", "location", "name", "subjects", "type") SELECT "applicationId", "completed", "id", "location", "name", "subjects", "type" FROM "ApplicationEducation";
DROP TABLE "ApplicationEducation";
ALTER TABLE "new_ApplicationEducation" RENAME TO "ApplicationEducation";
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "felonyDescription" TEXT,
    "positionDesired" TEXT NOT NULL,
    "dateAvailable" TEXT NOT NULL,
    "availability" TEXT,
    "salaryDesired" TEXT NOT NULL,
    "currentlyEmployed" BOOLEAN,
    CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("availability", "createdAt", "currentlyEmployed", "dateAvailable", "felonyDescription", "id", "positionDesired", "salaryDesired", "updatedAt", "userId") SELECT "availability", "createdAt", "currentlyEmployed", "dateAvailable", "felonyDescription", "id", "positionDesired", "salaryDesired", "updatedAt", "userId" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
