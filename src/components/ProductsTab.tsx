"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Package } from "lucide-react";
import { CATEGORIES, STATUS_KEYS, STATUS_LABELS, COLORS, SIZE_ORDER } from "@/lib/constants";
import { sortByCategoryOrder, sizeSortIndex } from "@/lib/format";
import { Modal, EmptyState, inputCls } from "@/components/ui";
import { ProductRow } from "@/components/ProductRow";
import { ProductForm } from "@/components/ProductForm";
import type { Product, Order } from "@/lib/types";

const PAGE_SIZE = 25;

export function ProductsTab({
  products,
  orders,
  onSave,
  onDelete,
}: {
  products: Product[];
  orders: Order[];
  onSave: (data: Omit<Product, "id" | "photos">, photos: string[], id: string | null) => void;
  onDelete: (p: Product) => void;
}) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tất cả");
  const [size, setSize] = useState("Tất cả");
  const [status, setStatus] = useState("Tất cả");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [page, setPage] = useState(1);

  const availableSizes = useMemo(() => {
    const inCategory = cat === "Tất cả" ? products : products.filter((p) => p.category === cat);
    const set = new Set(inCategory.map((p) => p.size).filter((s): s is string => !!s));
    return [...set].sort((a, b) => sizeSortIndex(a, SIZE_ORDER) - sizeSortIndex(b, SIZE_ORDER));
  }, [products, cat]);

  useEffect(() => {
    if (size !== "Tất cả" && !availableSizes.includes(size)) setSize("Tất cả");
  }, [availableSizes, size]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (cat !== "Tất cả" && p.category !== cat) return false;
      if (size !== "Tất cả" && p.size !== size) return false;
      if (status !== "Tất cả" && p.status !== status) return false;
      if (s && !(p.code.toLowerCase().includes(s) || (p.brand || "").toLowerCase().includes(s) || (p.notes || "").toLowerCase().includes(s)))
        return false;
      return true;
    });
    return sortByCategoryOrder(list, CATEGORIES);
  }, [products, search, cat, size, status]);

  useEffect(() => setPage(1), [search, cat, size, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
          <input
            className={inputCls + " pl-9"}
            placeholder="Tìm theo mã, brand, mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className={inputCls + " w-auto"} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option>Tất cả</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {availableSizes.length > 0 && (
          <select className={inputCls + " w-auto"} value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="Tất cả">Tất cả size</option>
            {availableSizes.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}
        <select className={inputCls + " w-auto"} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Tất cả</option>
          {STATUS_KEYS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white shrink-0"
          style={{ backgroundColor: COLORS.rose }}
        >
          <Plus size={15} /> Thêm sản phẩm
        </button>
      </div>

      <div className="text-xs text-stone-400 mb-2">{filtered.length} sản phẩm</div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} text="Không tìm thấy sản phẩm nào." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-400 border-b border-stone-100">
                <th></th>
                <th className="py-2 pr-3">Ảnh</th>
                <th className="py-2 pr-3">Mã</th>
                <th className="py-2 pr-3">Loại</th>
                <th className="py-2 pr-3">Brand / mô tả</th>
                <th className="py-2 pr-3">Size</th>
                <th className="py-2 pr-3">Giá thuê</th>
                <th className="py-2 pr-3">Dòng</th>
                <th className="py-2 pr-3">Tình trạng</th>
                <th className="py-2 pr-3">Lịch</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => (
                <ProductRow key={p.id} p={p} orders={orders} onEdit={() => setEditing(p)} onDelete={() => onDelete(p)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 text-sm text-stone-500">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-2 py-1 rounded disabled:opacity-30 hover:bg-stone-100">
            ←
          </button>
          Trang {page}/{totalPages}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 rounded disabled:opacity-30 hover:bg-stone-100"
          >
            →
          </button>
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Thêm sản phẩm mới" : `Sửa sản phẩm ${editing.code}`} onClose={() => setEditing(null)}>
          <ProductForm
            initial={editing === "new" ? null : editing}
            onCancel={() => setEditing(null)}
            onSave={(data, photos) => {
              onSave(data, photos, editing === "new" ? null : editing.id);
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
