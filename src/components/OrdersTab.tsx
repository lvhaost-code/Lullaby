"use client";

import { useMemo, useState } from "react";
import { Plus, Search, ClipboardList, Edit2, Trash2, Phone } from "lucide-react";
import { ORDER_STATUSES, COLORS } from "@/lib/constants";
import { formatVND, formatDateVN } from "@/lib/format";
import { Modal, EmptyState, OrderStatusBadge, inputCls } from "@/components/ui";
import { OrderForm } from "@/components/OrderForm";
import type { Order, Product } from "@/lib/types";

export function OrdersTab({
  products,
  orders,
  onSave,
  onDelete,
}: {
  products: Product[];
  orders: Order[];
  onSave: (data: Omit<Order, "id">, id: string | null) => void;
  onDelete: (o: Order) => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tất cả");
  const [editing, setEditing] = useState<Order | "new" | null>(null);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return orders
      .filter((o) => status === "Tất cả" || o.status === status)
      .filter(
        (o) =>
          !s ||
          (o.customerName || "").toLowerCase().includes(s) ||
          (o.customerPhone || "").includes(s) ||
          o.items.some((it) => it.code.toLowerCase().includes(s))
      )
      .sort((a, b) => (b.invoiceDate || "").localeCompare(a.invoiceDate || ""));
  }, [orders, search, status]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
          <input
            className={inputCls + " pl-9"}
            placeholder="Tìm theo tên, SĐT, mã sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className={inputCls + " w-auto"} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Tất cả</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white shrink-0"
          style={{ backgroundColor: COLORS.rose }}
        >
          <Plus size={15} /> Tạo đơn mới
        </button>
      </div>

      <div className="text-xs text-stone-400 mb-2">{filtered.length} đơn hàng</div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} text="Chưa có đơn hàng nào phù hợp." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-400 border-b border-stone-100">
                <th className="py-2 pl-3 pr-3">Ngày lập</th>
                <th className="py-2 pr-3">Khách hàng</th>
                <th className="py-2 pr-3">Sản phẩm</th>
                <th className="py-2 pr-3">Lấy – Trả</th>
                <th className="py-2 pr-3">Thu (TM/CK)</th>
                <th className="py-2 pr-3">Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-stone-100 hover:bg-stone-50/70">
                  <td className="py-2 pl-3 pr-3 whitespace-nowrap text-stone-500">{formatDateVN(o.invoiceDate)}</td>
                  <td className="py-2 pr-3">
                    <div className="font-medium text-stone-700">{o.customerName}</div>
                    {o.customerPhone && (
                      <div className="text-xs text-stone-400 flex items-center gap-1">
                        <Phone size={10} />
                        {o.customerPhone}
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-stone-500">{o.items.map((i) => i.code).join(", ") || "—"}</td>
                  <td className="py-2 pr-3 whitespace-nowrap text-stone-500">
                    {formatDateVN(o.pickupDate)} → {formatDateVN(o.returnDate)}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap text-stone-600">
                    {formatVND(o.paymentCash)} / {formatVND(o.paymentTransfer)}
                  </td>
                  <td className="py-2 pr-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(o)} className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => onDelete(o)} className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Tạo đơn hàng mới" : `Sửa đơn — ${editing.customerName}`} onClose={() => setEditing(null)} wide>
          <OrderForm
            initial={editing === "new" ? null : editing}
            products={products}
            orders={orders}
            onCancel={() => setEditing(null)}
            onSave={(data) => {
              onSave(data, editing === "new" ? null : editing.id);
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
