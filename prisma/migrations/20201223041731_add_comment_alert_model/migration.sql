/*
  Warnings:

  - Made the column `token` on table `user` required. The migration will fail if there are existing NULL values in that column.
  - Made the column `login` on table `user` required. The migration will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `profile` DROP FOREIGN KEY `profile_ibfk_1`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `review_ibfk_1`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN     `avatar` VARCHAR(191),
    MODIFY `social` ENUM('GITHUB', 'GOOGLE') NOT NULL,
    MODIFY `token` VARCHAR(191) NOT NULL,
    MODIFY `login` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Comment` (
    `id` INT NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `reviewId` INT NOT NULL,
    `writerId` INT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alert` (
    `id` INT NOT NULL,
    `type` ENUM('LIKE', 'COMMENT') NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `check` BOOLEAN NOT NULL DEFAULT false,
    `userId` INT NOT NULL,
    `commentId` INT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_tagged` (
    `A` INT NOT NULL,
    `B` INT NOT NULL,
UNIQUE INDEX `_tagged_AB_unique`(`A`, `B`),
INDEX `_tagged_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_liked` (
    `A` INT NOT NULL,
    `B` INT NOT NULL,
UNIQUE INDEX `_liked_AB_unique`(`A`, `B`),
INDEX `_liked_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Comment` ADD FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD FOREIGN KEY (`writerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alert` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alert` ADD FOREIGN KEY (`commentId`) REFERENCES `Comment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_tagged` ADD FOREIGN KEY (`A`) REFERENCES `Comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_tagged` ADD FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_liked` ADD FOREIGN KEY (`A`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_liked` ADD FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profile` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD FOREIGN KEY (`writerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
