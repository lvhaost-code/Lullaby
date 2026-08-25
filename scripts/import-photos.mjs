// Bulk-import product photos embedded in the master Excel workbook.
//
// Usage:
//   node scripts/import-photos.mjs "C:/path/to/KHÁCH HÀNG LULLABY.xlsx"
//
// Reads the embedded images from the VÁY ĐẦM, GIÀY - TÚI, and Phụ kiện free
// sheets, matches each one to its product code by cell position (see the
// per-sheet column rules below — figured out by inspecting the workbook's
// drawing anchors), resizes/compresses it the same way the admin app's own
// upload does, and adds it as a ProductPhoto by code.
//
// Only fills in products that currently have zero photos, so re-running
// this later (e.g. the Excel file gets new images) never clobbers photos
// staff have since added or reordered by hand in the app.
import ExcelJS from "exceljs";
import sharp from "sharp";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/import-photos.mjs <path-to-excel-file>");
  process.exit(1);
}

// For a sheet, given an image's 1-indexed anchor row/col, where is the
// product code cell? header: 1-indexed row the column titles are on (used
// only for reporting), dataStartRow: first row with product data,
// codeColOffset: codeColumn = imageColumn + codeColOffset.
const SHEET_RULES = {
  "VÁY ĐẦM": { dataStartRow: 3, codeColOffset: -1 },
  "GIÀY - TÚI": { dataStartRow: 3, codeColOffset: -2 },
  "Phụ kiện free": { dataStartRow: 1, codeColOffset: 1 },
};

async function resizeToDataUrl(buffer, maxDim = 480, quality = 72) {
  const out = await sharp(buffer)
    .rotate() // respect EXIF orientation
    .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();
  return `data:image/jpeg;base64,${out.toString("base64")}`;
}

async function main() {
  console.log(`Đọc file: ${filePath}`);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);

  const codeToImageId = new Map();

  for (const [sheetName, rule] of Object.entries(SHEET_RULES)) {
    const ws = wb.getWorksheet(sheetName);
    if (!ws) {
      console.warn(`Không tìm thấy sheet "${sheetName}", bỏ qua.`);
      continue;
    }
    const images = ws.getImages();
    let matched = 0;
    for (const img of images) {
      const excelRow = img.range.tl.nativeRow + 1;
      const excelCol = img.range.tl.nativeCol + 1;
      if (excelRow < rule.dataStartRow) continue;
      const codeCell = ws.getRow(excelRow).getCell(excelCol + rule.codeColOffset);
      const code = codeCell.value ? String(codeCell.value).trim() : "";
      if (!code) continue;
      codeToImageId.set(code, img.imageId);
      matched++;
    }
    console.log(`${sheetName}: ${images.length} ảnh, khớp được ${matched} mã sản phẩm.`);
  }

  console.log(`\nTổng cộng: ${codeToImageId.size} mã sản phẩm có ảnh trong file Excel.`);

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const products = await prisma.product.findMany({ select: { id: true, code: true, _count: { select: { photos: true } } } });
  const productByCode = new Map(products.map((p) => [p.code, p]));

  let updated = 0;
  let skippedNoProduct = 0;
  let skippedHasPhoto = 0;
  let failed = 0;

  for (const [code, imageId] of codeToImageId) {
    const product = productByCode.get(code);
    if (!product) {
      skippedNoProduct++;
      continue;
    }
    if (product._count.photos > 0) {
      skippedHasPhoto++;
      continue;
    }
    try {
      const image = wb.getImage(imageId);
      const url = await resizeToDataUrl(image.buffer);
      await prisma.productPhoto.create({ data: { productId: product.id, url, sortOrder: 0 } });
      updated++;
      if (updated % 25 === 0) console.log(`  ...đã xử lý ${updated} ảnh`);
    } catch (e) {
      failed++;
      console.warn(`Lỗi xử lý ảnh cho mã ${code}:`, e.message);
    }
  }

  console.log(`\nHoàn tất:`);
  console.log(`  Đã thêm ảnh: ${updated} sản phẩm`);
  console.log(`  Bỏ qua (đã có ảnh sẵn): ${skippedHasPhoto} mã`);
  console.log(`  Bỏ qua (không có trong kho hiện tại): ${skippedNoProduct} mã`);
  if (failed) console.log(`  Lỗi: ${failed} ảnh`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
