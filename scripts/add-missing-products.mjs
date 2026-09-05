// Add products that exist in the master Excel workbook (VÁY ĐẦM sheet) but
// not yet in the DB — the codes sync-prices.mjs reports as "không có trong
// kho". Pulls full row data (brand/prices/size/deposit) plus a photo if one
// is anchored at that row.
//
// Usage:
//   node scripts/add-missing-products.mjs "C:/path/to/file.xlsx" CODE1 CODE2 ...
import ExcelJS from "exceljs";
import sharp from "sharp";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const filePath = process.argv[2];
const codesToAdd = process.argv.slice(3);
if (!filePath || codesToAdd.length === 0) {
  console.error("Usage: node scripts/add-missing-products.mjs <path-to-excel-file> <code1> <code2> ...");
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

async function resizeToDataUrl(buffer, maxDim = 720, quality = 80) {
  const out = await sharp(buffer).rotate().resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true }).jpeg({ quality }).toBuffer();
  return `data:image/jpeg;base64,${out.toString("base64")}`;
}

async function resizeThumbnail(buffer, maxDim = 600, quality = 80) {
  const out = await sharp(buffer).rotate().resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true }).jpeg({ quality }).toBuffer();
  return `data:image/jpeg;base64,${out.toString("base64")}`;
}

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.getWorksheet("VÁY ĐẦM");

  const wanted = new Set(codesToAdd);
  const found = new Map();
  const photoRowByCode = new Map();

  for (let r = 3; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const code = cellStr(row, 3);
    if (!code || !wanted.has(code)) continue;
    found.set(code, {
      category: "Váy đầm",
      brand: cellStr(row, 2),
      costPrice: cellNum(row, 5),
      rentPrice3: cellNum(row, 6),
      rentPriceDay: cellNum(row, 7),
      size: cellStr(row, 8),
      deposit: cellStr(row, 9),
    });
    photoRowByCode.set(code, r);
  }

  // codeCol = imageCol - 1, same rule as import-photos.mjs for this sheet
  const images = ws.getImages();
  const photoByCode = new Map();
  for (const img of images) {
    const excelRow = img.range.tl.nativeRow + 1;
    for (const [code, row] of photoRowByCode) {
      if (row === excelRow) photoByCode.set(code, img.imageId);
    }
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  for (const code of codesToAdd) {
    const data = found.get(code);
    if (!data) {
      console.log(`Không tìm thấy ${code} trong sheet VÁY ĐẦM, bỏ qua.`);
      continue;
    }
    const existing = await prisma.product.findUnique({ where: { code } });
    if (existing) {
      console.log(`${code} đã tồn tại, bỏ qua.`);
      continue;
    }
    const product = await prisma.product.create({ data: { code, ...data, status: "available" } });
    let photoNote = "";
    const imageId = photoByCode.get(code);
    if (imageId !== undefined) {
      const image = wb.getImage(imageId);
      const url = await resizeToDataUrl(image.buffer);
      const thumbUrl = await resizeThumbnail(image.buffer);
      await prisma.$transaction([
        prisma.productPhoto.create({ data: { productId: product.id, url, sortOrder: 0 } }),
        prisma.product.update({ where: { id: product.id }, data: { thumbUrl } }),
      ]);
      photoNote = " (+ ảnh)";
    }
    console.log(`Đã thêm ${code}: ${JSON.stringify(data)}${photoNote}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
