"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Edit2, Trash2, Calendar } from "lucide-react";
import { COLORS, TIER_STYLE } from "@/lib/constants";
import { formatVND, formatDateVN, todayISO, tierOfDress } from "@/lib/format";
import { Badge, StatusBadge, OrderStatusBadge } from "@/components/ui";
import { ProductThumb } from "@/components/ProductThumb";
import type { Product, Order } from "@/lib/types";

export function ProductRow({
  p,
  orders,
  onEdit,
  onDelete,
}: {
  p: Product;
  orders: Order[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const bookings = useMemo(() => {
    const today = todayISO();
    return orders
      .filter((o) => o.status !== "Đã hủy" && o.items.some((it) => it.code === p.code))
      .filter((o) => o.returnDate >= today || !o.returnDate)
      .sort((a, b) => (a.pickupDate || "").localeCompare(b.pickupDate || ""));
  }, [orders, p.code]);

  const tier = p.category === "Váy đầm" ? tierOfDress(p.rentPrice3) : null;

  return (
    <>
      <tr className="border-b border-stone-100 hover:bg-stone-50/70 cursor-pointer" onClick={() => setOpen(!open)}>
        <td className="py-2 pl-3 pr-2 text-stone-400">{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</td>
        <td className="py-2 pr-3" onClick={(e) => e.stopPropagation()}>
          <ProductThumb photoUrl={p.photos[0] ?? null} size={36} rounded={7} />
        </td>
        <td className="py-2 pr-3 font-medium text-stone-700 whitespace-nowrap">{p.code}</td>
        <td className="py-2 pr-3 text-stone-500 whitespace-nowrap">{p.category}</td>
        <td className="py-2 pr-3 text-stone-500">{p.brand || p.notes || "—"}</td>
        <td className="py-2 pr-3 text-stone-500 whitespace-nowrap">{p.size || "—"}</td>
        <td className="py-2 pr-3 whitespace-nowrap">
          {formatVND(p.rentPrice3)}
          {p.rentPriceDay ? <span className="text-stone-400 text-xs"> / {formatVND(p.rentPriceDay)} (1 ngày)</span> : null}
        </td>
        <td className="py-2 pr-3">
          {tier && (
            <Badge bg={TIER_STYLE[tier].bg} fg={TIER_STYLE[tier].fg}>
              {TIER_STYLE[tier].label}
            </Badge>
          )}
        </td>
        <td className="py-2 pr-3">
          <StatusBadge status={p.status} />
        </td>
        <td className="py-2 pr-3">
          {bookings.length > 0 ? (
            <Badge bg={COLORS.roseSoft} fg={COLORS.roseDark}>
              {bookings.length} lịch sắp tới
            </Badge>
          ) : (
            <span className="text-xs text-stone-300">Trống lịch</span>
          )}
        </td>
        <td className="py-2 pr-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600">
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </td>
      </tr>
      {open && (
        <tr className="bg-stone-50/60">
          <td colSpan={11} className="px-8 py-3 text-xs text-stone-500">
            <div className="flex gap-4">
              <ProductThumb photoUrl={p.photos[0] ?? null} size={72} rounded={10} />
              <div className="flex-1">
                <div className="mb-1 font-medium text-stone-600">Lịch đã đặt (sắp tới):</div>
                {bookings.length === 0 ? (
                  <div className="text-stone-400">Chưa có lịch nào — sản phẩm đang trống.</div>
                ) : (
                  <ul className="space-y-1">
                    {bookings.map((o) => (
                      <li key={o.id} className="flex items-center gap-2">
                        <Calendar size={12} className="text-stone-400" />
                        {formatDateVN(o.pickupDate)} – {formatDateVN(o.returnDate)} · {o.customerName || "(chưa rõ tên)"}{" "}
                        {o.customerPhone ? `· ${o.customerPhone}` : ""}
                        <OrderStatusBadge status={o.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
