import { prisma } from "@/lib/prisma";

// "metadata" backups are cheap (no photos) so we keep a deep history.
// "full" backups include every product photo — the bulk of DB storage —
// so only a few are kept, just enough to cover a recent accidental delete
// of a photo staff added by hand in the app (photos that came from the
// shop's Excel file can always be re-imported from there instead).
const RETENTION: Record<BackupKind, number> = { metadata: 30, full: 3 };

export type BackupKind = "metadata" | "full";

async function buildSnapshot(kind: BackupKind) {
  const [products, orders, bookingRequests, users] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        code: true,
        category: true,
        brand: true,
        costPrice: true,
        rentPrice3: true,
        rentPriceDay: true,
        size: true,
        deposit: true,
        notes: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        ...(kind === "full" ? { photos: { orderBy: { sortOrder: "asc" as const }, select: { url: true, sortOrder: true } } } : {}),
      },
    }),
    prisma.order.findMany({ include: { items: { select: { code: true, rentPrice3: true } } } }),
    prisma.bookingRequest.findMany({ include: { items: { select: { code: true } } } }),
    prisma.user.findMany({ select: { id: true, username: true, name: true, role: true, createdAt: true } }),
  ]);

  return {
    version: 2,
    kind,
    createdAt: new Date().toISOString(),
    counts: { products: products.length, orders: orders.length, bookingRequests: bookingRequests.length, users: users.length },
    products,
    orders,
    bookingRequests,
    users,
  };
}

export async function createBackup(kind: BackupKind) {
  const snapshot = await buildSnapshot(kind);
  const backup = await prisma.backup.create({ data: { kind, data: JSON.stringify(snapshot) } });

  const old = await prisma.backup.findMany({
    where: { kind },
    orderBy: { createdAt: "desc" },
    skip: RETENTION[kind],
    select: { id: true },
  });
  if (old.length > 0) {
    await prisma.backup.deleteMany({ where: { id: { in: old.map((b) => b.id) } } });
  }

  return { id: backup.id, createdAt: backup.createdAt, kind, counts: snapshot.counts, pruned: old.length };
}

// For the on-demand download — builds fresh, doesn't write to the DB (the
// daily cron already handles persisted retention), so clicking it
// repeatedly can't run up storage.
export async function buildDownloadSnapshot() {
  return buildSnapshot("full");
}
