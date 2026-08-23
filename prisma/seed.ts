import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SeedProduct = {
  code: string;
  category: string;
  brand: string;
  costPrice: number | null;
  rentPrice3: number | null;
  rentPriceDay: number | null;
  size: string;
  deposit: string;
  notes: string;
  status: string;
};

async function seedProducts() {
  const file = path.join(__dirname, "seed-data", "products.json");
  const data: SeedProduct[] = JSON.parse(fs.readFileSync(file, "utf8"));

  let created = 0;
  let skipped = 0;
  for (const p of data) {
    if (!p.code) continue;
    const existing = await prisma.product.findUnique({ where: { code: p.code } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.product.create({
      data: {
        code: p.code,
        category: p.category || "Váy đầm",
        brand: p.brand || null,
        costPrice: p.costPrice ?? null,
        rentPrice3: p.rentPrice3 ?? null,
        rentPriceDay: p.rentPriceDay ?? null,
        size: p.size || null,
        deposit: p.deposit || null,
        notes: p.notes || null,
        status: p.status || "available",
      },
    });
    created++;
  }
  console.log(`Sản phẩm: đã tạo ${created}, bỏ qua (đã tồn tại) ${skipped}.`);
}

async function seedUsers() {
  const accounts = [
    { username: "hao", name: "Anh Hảo", role: "owner", password: process.env.SEED_PASSWORD_HAO || "lullaby123" },
    { username: "ngoc", name: "Chị Ngọc", role: "staff", password: process.env.SEED_PASSWORD_NGOC || "lullaby123" },
  ];

  for (const acc of accounts) {
    const existing = await prisma.user.findUnique({ where: { username: acc.username } });
    if (existing) continue;
    const passwordHash = await bcrypt.hash(acc.password, 10);
    await prisma.user.create({
      data: { username: acc.username, name: acc.name, role: acc.role, passwordHash },
    });
    console.log(`Tạo tài khoản: ${acc.username} / mật khẩu tạm: ${acc.password} (đổi ngay sau khi đăng nhập lần đầu).`);
  }
}

async function main() {
  await seedUsers();
  await seedProducts();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
