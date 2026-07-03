-- CreateEnum
CREATE TYPE "ChatLinkDirection" AS ENUM ('UP', 'DOWN');

-- CreateEnum
CREATE TYPE "FlowEventKind" AS ENUM ('REPLAY_UP', 'REPLAY_DOWN');

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN "parentChatId" TEXT;

-- CreateIndex
CREATE INDEX "Chat_parentChatId_idx" ON "Chat"("parentChatId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_parentChatId_fkey" FOREIGN KEY ("parentChatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ChatLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentChatId" TEXT NOT NULL,
    "childChatId" TEXT NOT NULL,
    "direction" "ChatLinkDirection" NOT NULL,
    "includePrefix" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatUpwardGrant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromChatId" TEXT NOT NULL,
    "toChatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatUpwardGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "FlowEventKind" NOT NULL,
    "sourceChatId" TEXT NOT NULL,
    "targetChatId" TEXT NOT NULL,
    "sourceMessageId" TEXT,
    "targetMessageId" TEXT,
    "entryCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlowEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatLink_childChatId_parentChatId_direction_key" ON "ChatLink"("childChatId", "parentChatId", "direction");

-- CreateIndex
CREATE INDEX "ChatLink_userId_idx" ON "ChatLink"("userId");

-- CreateIndex
CREATE INDEX "ChatLink_parentChatId_idx" ON "ChatLink"("parentChatId");

-- CreateIndex
CREATE INDEX "ChatLink_childChatId_idx" ON "ChatLink"("childChatId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatUpwardGrant_fromChatId_toChatId_key" ON "ChatUpwardGrant"("fromChatId", "toChatId");

-- CreateIndex
CREATE INDEX "ChatUpwardGrant_userId_idx" ON "ChatUpwardGrant"("userId");

-- CreateIndex
CREATE INDEX "FlowEvent_userId_idx" ON "FlowEvent"("userId");

-- CreateIndex
CREATE INDEX "FlowEvent_sourceChatId_idx" ON "FlowEvent"("sourceChatId");

-- CreateIndex
CREATE INDEX "FlowEvent_targetChatId_idx" ON "FlowEvent"("targetChatId");

-- CreateIndex
CREATE INDEX "FlowEvent_createdAt_idx" ON "FlowEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "ChatLink" ADD CONSTRAINT "ChatLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatLink" ADD CONSTRAINT "ChatLink_parentChatId_fkey" FOREIGN KEY ("parentChatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatLink" ADD CONSTRAINT "ChatLink_childChatId_fkey" FOREIGN KEY ("childChatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatUpwardGrant" ADD CONSTRAINT "ChatUpwardGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatUpwardGrant" ADD CONSTRAINT "ChatUpwardGrant_fromChatId_fkey" FOREIGN KEY ("fromChatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatUpwardGrant" ADD CONSTRAINT "ChatUpwardGrant_toChatId_fkey" FOREIGN KEY ("toChatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowEvent" ADD CONSTRAINT "FlowEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowEvent" ADD CONSTRAINT "FlowEvent_sourceChatId_fkey" FOREIGN KEY ("sourceChatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowEvent" ADD CONSTRAINT "FlowEvent_targetChatId_fkey" FOREIGN KEY ("targetChatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN "flowMeta" JSONB;
