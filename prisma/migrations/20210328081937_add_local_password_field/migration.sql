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

-- DropForeignKey
ALTER TABLE `usertaggedcomment` DROP FOREIGN KEY `usertaggedcomment_ibfk_2`;

-- DropForeignKey
ALTER TABLE `usertaggedcomment` DROP FOREIGN KEY `usertaggedcomment_ibfk_1`;

-- AlterTable
ALTER TABLE `alert` MODIFY `type` ENUM('LIKE', 'COMMENT') NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN     `password` VARCHAR(191),
    MODIFY `social` ENUM('GITHUB', 'GOOGLE', 'LOCAL') NOT NULL;

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

-- AddForeignKey
ALTER TABLE `UserLikeReview` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserLikeReview` ADD FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTaggedComment` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTaggedComment` ADD FOREIGN KEY (`commentId`) REFERENCES `Comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
