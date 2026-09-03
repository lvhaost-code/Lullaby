-- AlterTable
ALTER TABLE "Backup" ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'metadata';

-- CreateIndex
CREATE INDEX "Backup_kind_createdAt_idx" ON "Backup"("kind", "createdAt");
