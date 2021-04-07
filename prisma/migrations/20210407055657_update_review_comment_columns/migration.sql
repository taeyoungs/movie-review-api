/*
  Warnings:

  - You are about to drop the column `commentId` on the `alert` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `review` table. All the data in the column will be lost.
  - You are about to drop the column `posterPath` on the `review` table. All the data in the column will be lost.
  - You are about to drop the `usertaggedcomment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `movieId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `usertaggedcomment` DROP FOREIGN KEY `usertaggedcomment_ibfk_2`;

-- DropForeignKey
ALTER TABLE `usertaggedcomment` DROP FOREIGN KEY `usertaggedcomment_ibfk_1`;

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

-- DropForeignKey
ALTER TABLE `userlikereview` DROP FOREIGN KEY `userlikereview_ibfk_2`;

-- DropForeignKey
ALTER TABLE `userlikereview` DROP FOREIGN KEY `userlikereview_ibfk_1`;

-- AlterTable
ALTER TABLE `alert` DROP COLUMN `commentId`,
    MODIFY `type` ENUM('LIKE', 'COMMENT') NOT NULL;

-- AlterTable
ALTER TABLE `review` DROP COLUMN `title`,
    DROP COLUMN `posterPath`,
    ADD COLUMN     `movieId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `social` ENUM('GOOGLE', 'LOCAL') NOT NULL;

-- DropTable
DROP TABLE `usertaggedcomment`;

-- AddForeignKey
ALTER TABLE `Alert` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD FOREIGN KEY (`writerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profile` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD FOREIGN KEY (`writerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserLikeReview` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserLikeReview` ADD FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
