/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[login]` on the table `User`. If there are existing duplicate values, the migration will fail.

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
ALTER TABLE `user` MODIFY `social` ENUM('GITHUB', 'GOOGLE') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User.login_unique` ON `User`(`login`);

-- AddForeignKey
ALTER TABLE `_liked` ADD FOREIGN KEY (`A`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_liked` ADD FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_tagged` ADD FOREIGN KEY (`A`) REFERENCES `Comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_tagged` ADD FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
