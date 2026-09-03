import { prisma } from "@/lib/prisma";

const RETENTION = 30; // keep the last N daily backups

// Metadata-only snapshot — no photos (re-importable from the shop's Excel
// file), no password hashes.
export async function createBackup() {
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
      },
    }),
    prisma.order.findMany({ include: { items: { select: { code: true, rentPrice3: true } } } }),
    prisma.bookingRequest.findMany({ include: { items: { select: { code: true } } } }),
    prisma.user.findMany({ select: { id: true, username: true, name: true, role: true, createdAt: true } }),
  ]);

  const snapshot = {
    version: 1,
    createdAt: new Date().toISOString(),
    counts: { products: products.length, orders: orders.length, bookingRequests: bookingRequests.length, users: users.length },
    products,
    orders,
    bookingRequests,
    users,
  };

  const backup = await prisma.backup.create({ data: { data: JSON.stringify(snapshot) } });

  const old = await prisma.backup.findMany({
    orderBy: { createdAt: "desc" },
    skip: RETENTION,
    select: { id: true },
  });
  if (old.length > 0) {
    await prisma.backup.deleteMany({ where: { id: { in: old.map((b) => b.id) } } });
  }

  return { id: backup.id, createdAt: backup.createdAt, counts: snapshot.counts, pruned: old.length };
}
