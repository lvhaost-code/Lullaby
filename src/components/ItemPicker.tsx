"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { formatVND } from "@/lib/format";
import { inputCls } from "@/components/ui";
import type { Product, OrderItemInput } from "@/lib/types";

export function ItemPicker({
  products,
  selected,
  onAdd,
  onRemove,
}: {
  products: Product[];
  selected: OrderItemInput[];
  onAdd: (p: Product) => void;
  onRemove: (code: string) => void;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return products
      .filter((p) => p.code.toLowerCase().includes(s) || (p.brand || "").toLowerCase().includes(s) || (p.notes || "").toLowerCase().includes(s))
      .filter((p) => !selected.some((sel) => sel.code === p.code))
      .slice(0, 8);
  }, [q, products, selected]);

  return (
    <div>
      <div className="relative">
        <input
          className={inputCls}
          placeholder="Gõ mã sản phẩm để thêm (VD: M24)..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {results.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-stone-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
            {results.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => {
                  onAdd(p);
                  setQ("");
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50 flex justify-between"
              >
                <span>
                  <span className="font-medium">{p.code}</span>{" "}
                  <span className="text-stone-400">
                    · {p.category} {p.brand ? "· " + p.brand : ""}
                  </span>
                </span>
                <span className="text-stone-400">{formatVND(p.rentPrice3)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {selected.map((it) => (
          <span
            key={it.code}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
            style={{ backgroundColor: COLORS.roseSoft, color: COLORS.roseDark }}
          >
            {it.code} · {formatVND(it.rentPrice3)}
            <button type="button" onClick={() => onRemove(it.code)} className="hover:opacity-60">
              <X size={11} />
            </button>
          </span>
        ))}
        {selected.length === 0 && <span className="text-xs text-stone-300">Chưa chọn sản phẩm nào</span>}
      </div>
    </div>
  );
}
