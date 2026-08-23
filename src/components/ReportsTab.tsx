"use client";

import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS } from "@/lib/constants";
import { formatVND, formatDateVN, todayISO, monthKey } from "@/lib/format";
import { Field, EmptyState, OrderStatusBadge, inputCls } from "@/components/ui";
import type { Order } from "@/lib/types";

export function ReportsTab({ orders }: { orders: Order[] }) {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(todayISO());

  const inRange = useMemo(
    () => orders.filter((o) => o.status !== "Đã hủy" && o.invoiceDate >= from && o.invoiceDate <= to),
    [orders, from, to]
  );

  const totalCash = inRange.reduce((s, o) => s + (o.paymentCash || 0), 0);
  const totalTransfer = inRange.reduce((s, o) => s + (o.paymentTransfer || 0), 0);
  const depositHeld = orders
    .filter((o) => ["Đã đặt", "Đang thuê"].includes(o.status))
    .reduce((s, o) => s + (o.depositAmount || 0), 0);

  const monthly = useMemo(() => {
    const map = new Map<string, { month: string; "Tiền mặt": number; "Chuyển khoản": number }>();
    for (const o of orders) {
      if (o.status === "Đã hủy") continue;
      const k = monthKey(o.invoiceDate);
      if (!k) continue;
      if (!map.has(k)) map.set(k, { month: k, "Tiền mặt": 0, "Chuyển khoản": 0 });
      const row = map.get(k)!;
      row["Tiền mặt"] += o.paymentCash || 0;
      row["Chuyển khoản"] += o.paymentTransfer || 0;
    }
    return [...map.values()].sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [orders]);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-5">
        <Field label="Từ ngày">
          <input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="Đến ngày">
          <input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(
          [
            ["Tiền mặt", totalCash, COLORS.sage, COLORS.sageSoft],
            ["Chuyển khoản", totalTransfer, COLORS.rose, COLORS.roseSoft],
            ["Tổng thu", totalCash + totalTransfer, COLORS.plum, "#EFEAEC"],
            ["Cọc đang giữ", depositHeld, "#93731F", COLORS.goldSoft],
          ] as [string, number, string, string][]
        ).map(([label, val, fg, bg]) => (
          <div key={label} className="rounded-xl p-4" style={{ backgroundColor: bg }}>
            <div className="text-xs mb-1" style={{ color: fg, opacity: 0.8 }}>
              {label}
            </div>
            <div className="text-lg font-semibold" style={{ color: fg, fontFamily: "'Fraunces', serif" }}>
              {formatVND(val)}
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm font-medium text-stone-600 mb-2">Doanh thu 6 tháng gần nhất</div>
      <div className="rounded-xl border border-stone-100 p-3 mb-6" style={{ height: 260 }}>
        {monthly.length === 0 ? (
          <EmptyState icon={BarChart3} text="Chưa có dữ liệu doanh thu." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE7" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#A8A29E" }} />
              <YAxis tick={{ fontSize: 11, fill: "#A8A29E" }} width={70} tickFormatter={(v) => v / 1000 + "k"} />
              <Tooltip formatter={(v) => formatVND(typeof v === "number" ? v : Number(v))} />
              <Bar dataKey="Tiền mặt" stackId="a" fill={COLORS.sage} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Chuyển khoản" stackId="a" fill={COLORS.rose} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="text-sm font-medium text-stone-600 mb-2">Đơn hàng trong khoảng ({inRange.length})</div>
      <div className="overflow-x-auto rounded-xl border border-stone-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-stone-400 border-b border-stone-100">
              <th className="py-2 pl-3 pr-3">Ngày</th>
              <th className="py-2 pr-3">Khách</th>
              <th className="py-2 pr-3">Sản phẩm</th>
              <th className="py-2 pr-3">TM</th>
              <th className="py-2 pr-3">CK</th>
              <th className="py-2 pr-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {[...inRange]
              .sort((a, b) => (b.invoiceDate || "").localeCompare(a.invoiceDate || ""))
              .map((o) => (
                <tr key={o.id} className="border-b border-stone-100">
                  <td className="py-2 pl-3 pr-3 whitespace-nowrap text-stone-500">{formatDateVN(o.invoiceDate)}</td>
                  <td className="py-2 pr-3 text-stone-700">{o.customerName}</td>
                  <td className="py-2 pr-3 text-stone-500">{o.items.map((i) => i.code).join(", ")}</td>
                  <td className="py-2 pr-3 text-stone-600 whitespace-nowrap">{formatVND(o.paymentCash)}</td>
                  <td className="py-2 pr-3 text-stone-600 whitespace-nowrap">{formatVND(o.paymentTransfer)}</td>
                  <td className="py-2 pr-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
