"use client";

import { useMemo, useState } from "react";
import { Search, Users, ChevronDown, ChevronRight, Phone, Plus, Edit2, Trash2, Heart, StickyNote, Shirt } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { formatVND, formatDateVN } from "@/lib/format";
import { EmptyState, OrderStatusBadge, Modal, inputCls } from "@/components/ui";
import { CustomerForm } from "@/components/CustomerForm";
import type { Order, Customer } from "@/lib/types";

type CustomerRow = {
  key: string;
  name: string;
  phone: string | null;
  orders: Order[];
  total: number;
  lastDate: string;
  customer: Customer | null;
};

export function CustomersTab({
  orders,
  customers,
  onSaveCustomer,
  onDeleteCustomer,
}: {
  orders: Order[];
  customers: Customer[];
  onSaveCustomer: (data: Omit<Customer, "id">, id: string | null) => void;
  onDeleteCustomer: (c: Customer) => void;
}) {
  const [search, setSearch] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [editing, setEditing] = useState<Customer | "new" | null>(null);

  const rows = useMemo(() => {
    const map = new Map<string, CustomerRow>();
    for (const o of orders) {
      const key = (o.customerPhone && o.customerPhone.trim()) || `n:${o.customerName}`;
      if (!map.has(key)) {
        map.set(key, { key, name: o.customerName, phone: o.customerPhone, orders: [], total: 0, lastDate: "", customer: null });
      }
      const c = map.get(key)!;
      c.orders.push(o);
      c.total += (o.paymentCash || 0) + (o.paymentTransfer || 0);
      if (o.invoiceDate > c.lastDate) {
        c.lastDate = o.invoiceDate;
        c.name = o.customerName || c.name;
      }
    }
    for (const cust of customers) {
      const key = cust.phone;
      if (!map.has(key)) {
        map.set(key, { key, name: cust.name, phone: cust.phone, orders: [], total: 0, lastDate: "", customer: cust });
      } else {
        const row = map.get(key)!;
        row.customer = cust;
        row.name = cust.name || row.name;
      }
    }
    return [...map.values()].sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  }, [orders, customers]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((c) => (c.name || "").toLowerCase().includes(s) || (c.phone || "").includes(s));
  }, [rows, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
          <input className={inputCls + " pl-9"} placeholder="Tìm khách theo tên hoặc SĐT..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white shrink-0"
          style={{ backgroundColor: COLORS.rose }}
        >
          <Plus size={15} /> Thêm khách hàng
        </button>
      </div>
      <div className="text-xs text-stone-400 mb-2">{filtered.length} khách hàng</div>
      {filtered.length === 0 ? (
        <EmptyState icon={Users} text="Chưa có dữ liệu khách hàng." />
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.key} className="rounded-xl border border-stone-100 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50/70 text-left"
                onClick={() => setOpenKey(openKey === c.key ? null : c.key)}
              >
                <div className="flex items-center gap-3">
                  {openKey === c.key ? <ChevronDown size={14} className="text-stone-400" /> : <ChevronRight size={14} className="text-stone-400" />}
                  <div>
                    <div className="font-medium text-stone-700">{c.name || "(chưa rõ tên)"}</div>
                    {c.phone && (
                      <div className="text-xs text-stone-400 flex items-center gap-1">
                        <Phone size={10} />
                        {c.phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-stone-400 text-xs">
                    {c.customer?.rentalCount != null ? `${c.customer.rentalCount} lần thuê` : `${c.orders.length} đơn`}
                  </span>
                  <span className="font-medium" style={{ color: COLORS.rose }}>
                    {formatVND(c.total)}
                  </span>
                </div>
              </button>
              {openKey === c.key && (
                <div className="px-4 pb-3 pt-1 border-t border-stone-100 bg-stone-50/50">
                  {c.customer && (c.customer.rentedItems || c.customer.preferences || c.customer.notes || c.customer.rentalCount != null) && (
                    <div className="mb-3 pb-3 border-b border-stone-100 space-y-1.5 text-xs text-stone-600">
                      {c.customer.rentalCount != null && (
                        <div className="flex items-start gap-1.5">
                          <span className="text-stone-400 shrink-0">Số lần thuê (ghi nhận):</span>
                          <span>{c.customer.rentalCount}</span>
                        </div>
                      )}
                      {c.customer.rentedItems && (
                        <div className="flex items-start gap-1.5">
                          <Shirt size={12} className="text-stone-400 shrink-0 mt-0.5" />
                          <span>{c.customer.rentedItems}</span>
                        </div>
                      )}
                      {c.customer.preferences && (
                        <div className="flex items-start gap-1.5">
                          <Heart size={12} className="text-stone-400 shrink-0 mt-0.5" />
                          <span>{c.customer.preferences}</span>
                        </div>
                      )}
                      {c.customer.notes && (
                        <div className="flex items-start gap-1.5">
                          <StickyNote size={12} className="text-stone-400 shrink-0 mt-0.5" />
                          <span>{c.customer.notes}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {c.orders.length === 0 ? (
                    <div className="text-xs text-stone-400 mb-2">Chưa có đơn hàng nào trong app.</div>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-stone-500 mb-2">
                      {[...c.orders]
                        .sort((a, b) => (b.invoiceDate || "").localeCompare(a.invoiceDate || ""))
                        .map((o) => (
                          <li key={o.id} className="flex items-center gap-2 flex-wrap">
                            <span className="text-stone-400">{formatDateVN(o.invoiceDate)}</span>
                            <span>{o.items.map((i) => i.code).join(", ") || "—"}</span>
                            <span className="text-stone-400">
                              ({formatDateVN(o.pickupDate)} → {formatDateVN(o.returnDate)})
                            </span>
                            <OrderStatusBadge status={o.status} />
                          </li>
                        ))}
                    </ul>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setEditing(
                          c.customer ?? {
                            id: "",
                            name: c.name,
                            phone: c.phone ?? "",
                            rentalCount: null,
                            rentedItems: null,
                            preferences: null,
                            notes: null,
                          }
                        )
                      }
                      className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700"
                    >
                      <Edit2 size={12} /> {c.customer ? "Sửa thông tin" : "Thêm sở thích / lưu ý"}
                    </button>
                    {c.customer && (
                      <button onClick={() => onDeleteCustomer(c.customer!)} className="flex items-center gap-1 text-xs text-stone-400 hover:text-red-500">
                        <Trash2 size={12} /> Xóa hồ sơ
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Thêm khách hàng" : `Sửa hồ sơ — ${editing.name}`} onClose={() => setEditing(null)}>
          <CustomerForm
            initial={editing === "new" ? null : editing.id ? editing : null}
            onCancel={() => setEditing(null)}
            onSave={(data) => {
              onSaveCustomer(data, editing === "new" || !editing.id ? null : editing.id);
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
