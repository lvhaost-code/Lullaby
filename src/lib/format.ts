export function formatVND(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString("vi-VN") + "đ";
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateVN(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function tierOfDress(rentPrice3: number | null | undefined): "Grace" | "Premium" | "Special" | null {
  if (rentPrice3 === null || rentPrice3 === undefined) return null;
  if (rentPrice3 <= 200000) return "Grace";
  if (rentPrice3 <= 350000) return "Premium";
  return "Special";
}

export function rangesOverlap(
  aStart: string | null | undefined,
  aEnd: string | null | undefined,
  bStart: string | null | undefined,
  bEnd: string | null | undefined
): boolean {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return aStart <= bEnd && bStart <= aEnd;
}

export function monthKey(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 7) : "";
}

// Stable sort: groups products by category in CATEGORIES order (dresses
// first, accessories last), keeping each group's existing relative order.
export function sortByCategoryOrder<T extends { category: string }>(items: T[], categoryOrder: readonly string[]): T[] {
  return [...items].sort((a, b) => {
    const ai = categoryOrder.indexOf(a.category);
    const bi = categoryOrder.indexOf(b.category);
    return (ai === -1 ? categoryOrder.length : ai) - (bi === -1 ? categoryOrder.length : bi);
  });
}

export function sizeSortIndex(size: string | null | undefined, sizeOrder: readonly string[]): number {
  if (!size) return sizeOrder.length;
  const i = sizeOrder.indexOf(size);
  return i === -1 ? sizeOrder.length : i;
}

// Resize + compress an uploaded image client-side so it stays small enough
// to store inline as a dataURL on the product row. 720px/0.8 balances
// visible quality against the free-tier DB storage budget (see
// scripts/import-photos.mjs for the equivalent server-side settings).
export function resizeImageFile(file: File, maxDim = 720, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không đọc được ảnh"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Ảnh không hợp lệ"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height >= width && height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Không tạo được canvas"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
