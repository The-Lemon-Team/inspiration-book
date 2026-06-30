-- CreateEnum
CREATE TYPE "ChatKind" AS ENUM ('GENERAL', 'REGULAR');

-- CreateTable
CREATE TABLE "ChatCollection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "ChatKind" NOT NULL DEFAULT 'REGULAR',
    "collectionId" TEXT,
    "userId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatCollection_userId_slug_key" ON "ChatCollection"("userId", "slug");

-- CreateIndex
CREATE INDEX "ChatCollection_userId_idx" ON "ChatCollection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_userId_slug_key" ON "Chat"("userId", "slug");

-- CreateIndex
CREATE INDEX "Chat_userId_idx" ON "Chat"("userId");

-- CreateIndex
CREATE INDEX "Chat_collectionId_idx" ON "Chat"("collectionId");

-- AddForeignKey
ALTER TABLE "ChatCollection" ADD CONSTRAINT "ChatCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "ChatCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN "chatId" TEXT;
ALTER TABLE "Message" ADD COLUMN "originMessageId" TEXT;

-- Backfill: one general chat per user, attach existing messages
INSERT INTO "Chat" ("id", "name", "slug", "kind", "userId", "sortOrder", "createdAt")
SELECT
    'c' || substr(md5(u.id || ':general'), 1, 24),
    'general',
    'general',
    'GENERAL'::"ChatKind",
    u.id,
    0,
    NOW()
FROM "User" u;

UPDATE "Message" m
SET "chatId" = c.id
FROM "Chat" c
WHERE c."userId" = m."userId" AND c.kind = 'GENERAL';

ALTER TABLE "Message" ALTER COLUMN "chatId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "Message_originMessageId_idx" ON "Message"("originMessageId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_originMessageId_fkey" FOREIGN KEY ("originMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
