/*
  Warnings:

  - You are about to drop the column `likeCount` on the `review` table. All the data in the column will be lost.
  - You are about to drop the `_liked` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_tagged` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_liked` DROP FOREIGN KEY `_liked_ibfk_1`;

-- DropForeignKey
ALTER TABLE `_liked` DROP FOREIGN KEY `_liked_ibfk_2`;

-- DropForeignKey
ALTER TABLE `_tagged` DROP FOREIGN KEY `_tagged_ibfk_1`;

-- DropForeignKey
ALTER TABLE `_tagged` DROP FOREIGN KEY `_tagged_ibfk_2`;

-- DropForeignKey
ALTER TABLE `alert` DROP FOREIGN KEY `alert_ibfk_2`;

-- DropForeignKey
ALTER TABLE `alert` DROP FOREIGN KEY `alert_ibfk_1`;

-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `comment_ibfk_1`;

-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `comment_ibfk_2`;

-- DropForeignKey
ALTER TABLE `profile` DROP FOREIGN KEY `profile_ibfk_1`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `review_ibfk_1`;

-- AlterTable
ALTER TABLE `alert` MODIFY `type` ENUM('LIKE', 'COMMENT') NOT NULL;

-- AlterTable
ALTER TABLE `review` DROP COLUMN `likeCount`;

-- AlterTable
ALTER TABLE `user` MODIFY `social` ENUM('GITHUB', 'GOOGLE') NOT NULL;

-- CreateTable
CREATE TABLE `UserLikeReview` (
    `userId` INT NOT NULL,
    `reviewId` INT NOT NULL,

    PRIMARY KEY (`userId`,`reviewId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserTaggedComment` (
    `userId` INT NOT NULL,
    `commentId` INT NOT NULL,

    PRIMARY KEY (`userId`,`commentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- DropTable
DROP TABLE `_liked`;

-- DropTable
DROP TABLE `_tagged`;

-- AddForeignKey
ALTER TABLE `UserLikeReview` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserLikeReview` ADD FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTaggedComment` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTaggedComment` ADD FOREIGN KEY (`commentId`) REFERENCES `Comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alert` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alert` ADD FOREIGN KEY (`commentId`) REFERENCES `Comment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD FOREIGN KEY (`writerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profile` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD FOREIGN KEY (`writerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
