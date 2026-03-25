CREATE TABLE `exerciseAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exerciseId` int NOT NULL,
	`studentId` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`isCompleted` int NOT NULL DEFAULT 0,
	CONSTRAINT `exerciseAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherId` int NOT NULL,
	`type` enum('quiz','fillInBlank','matching') NOT NULL,
	`language` enum('en','ar') NOT NULL,
	`level` enum('beginner','intermediate','advanced') NOT NULL,
	`topic` varchar(255),
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text,
	`estimatedTimeSeconds` int DEFAULT 300,
	`isGenerated` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`exerciseType` enum('quiz','fillInBlank','matching') NOT NULL,
	`language` enum('en','ar') NOT NULL,
	`level` enum('beginner','intermediate','advanced') NOT NULL,
	`score` int NOT NULL,
	`maxScore` int NOT NULL,
	`accuracy` decimal(5,2) NOT NULL,
	`timeSpentSeconds` int,
	`answers` text,
	`feedback` text,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`totalExercisesCompleted` int NOT NULL DEFAULT 0,
	`totalPoints` int NOT NULL DEFAULT 0,
	`averageAccuracy` decimal(5,2) NOT NULL DEFAULT '0',
	`quizAccuracy` decimal(5,2) NOT NULL DEFAULT '0',
	`fillInBlankAccuracy` decimal(5,2) NOT NULL DEFAULT '0',
	`matchingAccuracy` decimal(5,2) NOT NULL DEFAULT '0',
	`englishAccuracy` decimal(5,2) NOT NULL DEFAULT '0',
	`arabicAccuracy` decimal(5,2) NOT NULL DEFAULT '0',
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastActivityAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studentProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `studentProgress_studentId_unique` UNIQUE(`studentId`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`age` int,
	`level` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`nativeLanguage` enum('en','ar','other') NOT NULL DEFAULT 'other',
	`pin` varchar(10),
	`totalExercisesCompleted` int NOT NULL DEFAULT 0,
	`totalPoints` int NOT NULL DEFAULT 0,
	`currentStreak` int NOT NULL DEFAULT 0,
	`lastActiveAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
