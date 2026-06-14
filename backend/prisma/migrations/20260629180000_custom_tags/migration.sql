-- CreateTable Tag
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- Seed default tags for existing users
INSERT INTO "Tag" ("id", "name", "slug", "color", "isDefault", "userId", "createdAt")
SELECT
    'tag_uznal_' || u."id",
    'Узнал',
    'uznal',
    '#2563eb',
    true,
    u."id",
    CURRENT_TIMESTAMP
FROM "User" u;

INSERT INTO "Tag" ("id", "name", "slug", "color", "isDefault", "userId", "createdAt")
SELECT
    'tag_vspomnil_' || u."id",
    'Вспомнил',
    'vspomnil',
    '#7c3aed',
    true,
    u."id",
    CURRENT_TIMESTAMP
FROM "User" u;

INSERT INTO "Tag" ("id", "name", "slug", "color", "isDefault", "userId", "createdAt")
SELECT
    'tag_sdelat_' || u."id",
    'Сделать',
    'sdelat',
    '#059669',
    true,
    u."id",
    CURRENT_TIMESTAMP
FROM "User" u;

-- Add tagId column
ALTER TABLE "Entry" ADD COLUMN "tagId" TEXT;

UPDATE "Entry" e
SET "tagId" = CASE e."category"::text
    WHEN 'LEARNED' THEN 'tag_uznal_' || e."userId"
    WHEN 'REMEMBERED' THEN 'tag_vspomnil_' || e."userId"
    WHEN 'TODO' THEN 'tag_sdelat_' || e."userId"
END;

ALTER TABLE "Entry" ALTER COLUMN "tagId" SET NOT NULL;

-- Drop old category column and enum
ALTER TABLE "Entry" DROP COLUMN "category";
DROP TYPE "EntryCategory";

-- Indexes and foreign keys
CREATE UNIQUE INDEX "Tag_userId_slug_key" ON "Tag"("userId", "slug");
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");
CREATE INDEX "Entry_tagId_idx" ON "Entry"("tagId");
DROP INDEX IF EXISTS "Entry_category_idx";

ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
