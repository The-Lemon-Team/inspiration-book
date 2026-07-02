-- CreateTable
CREATE TABLE "ReplaySchedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelChatId" TEXT NOT NULL,
    "signalTagId" TEXT NOT NULL,
    "scheduleTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Moscow',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "skipIfEmpty" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "lastRunLocalDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplaySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReplaySchedule_userId_idx" ON "ReplaySchedule"("userId");

-- CreateIndex
CREATE INDEX "ReplaySchedule_channelChatId_idx" ON "ReplaySchedule"("channelChatId");

-- CreateIndex
CREATE INDEX "ReplaySchedule_enabled_idx" ON "ReplaySchedule"("enabled");

-- AddForeignKey
ALTER TABLE "ReplaySchedule" ADD CONSTRAINT "ReplaySchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplaySchedule" ADD CONSTRAINT "ReplaySchedule_channelChatId_fkey" FOREIGN KEY ("channelChatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplaySchedule" ADD CONSTRAINT "ReplaySchedule_signalTagId_fkey" FOREIGN KEY ("signalTagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
