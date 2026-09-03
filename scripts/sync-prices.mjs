// Sync price fields (costPrice, rentPrice3, rentPriceDay, deposit) from the
// master Excel workbook into the DB, for products whose values changed.
//
// Usage:
//   node scripts/sync-prices.mjs "C:/path/to/KHÁCH HÀNG LULLABY.xlsx"
//
// Reads VÁY ĐẦM and GIÀY - TÚI (Phụ kiện free has no prices — all free).
// Only touches price fields; never touches photos, brand, status, etc.
import ExcelJS from "exceljs";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const filePath = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
if (!filePath) {
  console.error("Usage: node scripts/sync-prices.mjs <path-to-excel-file> [--dry-run]");
  process.exit(1);
}

function cellNum(row, col) {
  const v = row.getCell(col).value;
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
function cellStr(row, col) {
  const v = row.getCell(col).value;
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

async function main() {
  console.log(`Đọc file: ${filePath}`);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);

  // { code -> { costPrice, rentPrice3, rentPriceDay, deposit, size, brand } }
  const rows = new Map();

  const vay = wb.getWorksheet("VÁY ĐẦM");
  for (let r = 3; r <= vay.rowCount; r++) {
    const row = vay.getRow(r);
    const code = cellStr(row, 3);
    if (!code) continue;
    rows.set(code, {
      brand: cellStr(row, 2),
      costPrice: cellNum(row, 5),
      rentPrice3: cellNum(row, 6),
      rentPriceDay: cellNum(row, 7),
      size: cellStr(row, 8),
      deposit: cellStr(row, 9),
    });
  }

  const giayTui = wb.getWorksheet("GIÀY - TÚI");
  // block A: Giày — code col 1, price cols 4/5. block B: Túi — code col 22, price cols 25/26.
  for (let r = 3; r <= giayTui.rowCount; r++) {
    const row = giayTui.getRow(r);
    const codeA = cellStr(row, 1);
    if (codeA) {
      rows.set(codeA, { costPrice: cellNum(row, 4), rentPrice3: cellNum(row, 5), rentPriceDay: null, deposit: null, size: null, brand: null });
    }
    const codeB = cellStr(row, 22);
    if (codeB) {
      rows.set(codeB, { costPrice: cellNum(row, 25), rentPrice3: cellNum(row, 26), rentPriceDay: null, deposit: null, size: null, brand: null });
    }
  }

  console.log(`Đọc được ${rows.size} mã sản phẩm có giá từ Excel.`);

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const products = await prisma.product.findMany({
    select: { id: true, code: true, costPrice: true, rentPrice3: true, rentPriceDay: true, deposit: true },
  });
  const productByCode = new Map(products.map((p) => [p.code, p]));

  let updated = 0;
  let unchanged = 0;
  let notInDb = 0;
  const changes = [];
  const notInDbCodes = [];

  for (const [code, excelData] of rows) {
    const product = productByCode.get(code);
    if (!product) {
      notInDb++;
      notInDbCodes.push(code);
      continue;
    }
    const data = {};
    const diffParts = [];
    if (excelData.costPrice !== null && excelData.costPrice !== product.costPrice) {
      data.costPrice = excelData.costPrice;
      diffParts.push(`giá vốn ${product.costPrice ?? "—"}→${excelData.costPrice}`);
    }
    if (excelData.rentPrice3 !== null && excelData.rentPrice3 !== product.rentPrice3) {
      data.rentPrice3 = excelData.rentPrice3;
      diffParts.push(`giá thuê 3 ngày ${product.rentPrice3 ?? "—"}→${excelData.rentPrice3}`);
    }
    if (excelData.rentPriceDay !== null && excelData.rentPriceDay !== product.rentPriceDay) {
      data.rentPriceDay = excelData.rentPriceDay;
      diffParts.push(`giá thuê 1 ngày ${product.rentPriceDay ?? "—"}→${excelData.rentPriceDay}`);
    }
    if (excelData.deposit !== null && excelData.deposit !== product.deposit) {
      data.deposit = excelData.deposit;
      diffParts.push(`cọc ${product.deposit ?? "—"}→${excelData.deposit}`);
    }

    if (Object.keys(data).length === 0) {
      unchanged++;
      continue;
    }

    if (!dryRun) {
      await prisma.product.update({ where: { id: product.id }, data });
    }
    updated++;
    changes.push(`${code}: ${diffParts.join(", ")}`);
  }

  console.log(`\nHoàn tất${dryRun ? " (dry run — chưa ghi vào DB)" : ""}:`);
  console.log(`  ${dryRun ? "Sẽ cập nhật" : "Đã cập nhật"} giá: ${updated} sản phẩm`);
  console.log(`  Không đổi: ${unchanged} sản phẩm`);
  console.log(`  Có trong Excel nhưng không có trong kho: ${notInDb} mã${notInDbCodes.length ? " (" + notInDbCodes.join(", ") + ")" : ""}`);
  if (changes.length > 0) {
    console.log(`\nChi tiết thay đổi:`);
    changes.forEach((c) => console.log(`  ${c}`));
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
