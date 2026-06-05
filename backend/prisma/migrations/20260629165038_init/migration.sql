-- CreateEnum
CREATE TYPE "EntryCategory" AS ENUM ('LEARNED', 'REMEMBERED', 'TODO');

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "EntryCategory" NOT NULL,
    "usefulVotes" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageId" TEXT,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Entry_category_idx" ON "Entry"("category");

-- CreateIndex
CREATE INDEX "Entry_createdAt_idx" ON "Entry"("createdAt");

-- CreateIndex
CREATE INDEX "Entry_usefulVotes_idx" ON "Entry"("usefulVotes");

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
