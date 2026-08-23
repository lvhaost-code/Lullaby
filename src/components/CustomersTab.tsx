"use client";

import { useMemo, useState } from "react";
import { Search, Users, ChevronDown, ChevronRight, Phone } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { formatVND, formatDateVN } from "@/lib/format";
import { EmptyState, OrderStatusBadge, inputCls } from "@/components/ui";
import type { Order } from "@/lib/types";

type CustomerGroup = {
  key: string;
  name: string;
  phone: string | null;
  orders: Order[];
  total: number;
  lastDate?: string;
};

export function CustomersTab({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const customers = useMemo(() => {
    const map = new Map<string, CustomerGroup>();
    for (const o of orders) {
      const key = (o.customerPhone && o.customerPhone.trim()) || `n:${o.customerName}`;
      if (!map.has(key)) {
        map.set(key, { key, name: o.customerName, phone: o.customerPhone, orders: [], total: 0 });
      }
      const c = map.get(key)!;
      c.orders.push(o);
      c.total += (o.paymentCash || 0) + (o.paymentTransfer || 0);
      if (o.invoiceDate > (c.lastDate || "")) {
        c.lastDate = o.invoiceDate;
        c.name = o.customerName || c.name;
      }
    }
    return [...map.values()].sort((a, b) => (b.lastDate || "").localeCompare(a.lastDate || ""));
  }, [orders]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter((c) => (c.name || "").toLowerCase().includes(s) || (c.phone || "").includes(s));
  }, [customers, search]);

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
        <input className={inputCls + " pl-9"} placeholder="Tìm khách theo tên hoặc SĐT..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  <span className="text-stone-400 text-xs">{c.orders.length} đơn</span>
                  <span className="font-medium" style={{ color: COLORS.rose }}>
                    {formatVND(c.total)}
                  </span>
                </div>
              </button>
              {openKey === c.key && (
                <div className="px-4 pb-3 pt-1 border-t border-stone-100 bg-stone-50/50">
                  <ul className="space-y-1.5 text-xs text-stone-500">
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
