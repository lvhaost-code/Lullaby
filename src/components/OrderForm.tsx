"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ORDER_STATUSES, DEPOSIT_METHODS, COLORS } from "@/lib/constants";
import { formatVND, formatDateVN, todayISO, rangesOverlap } from "@/lib/format";
import { Field, inputCls } from "@/components/ui";
import { ItemPicker } from "@/components/ItemPicker";
import type { Order, Product, OrderItemInput } from "@/lib/types";

type FormState = {
  customerName: string;
  customerPhone: string;
  items: OrderItemInput[];
  invoiceDate: string;
  pickupDate: string;
  returnDate: string;
  depositMethod: string;
  depositAmount: string | number;
  paymentCash: string | number;
  paymentTransfer: string | number;
  note: string;
  status: string;
};

export function OrderForm({
  initial,
  products,
  orders,
  onSave,
  onCancel,
}: {
  initial: Order | null;
  products: Product[];
  orders: Order[];
  onSave: (data: Omit<Order, "id">) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<FormState>(
    initial
      ? {
          customerName: initial.customerName,
          customerPhone: initial.customerPhone ?? "",
          items: initial.items,
          invoiceDate: initial.invoiceDate,
          pickupDate: initial.pickupDate,
          returnDate: initial.returnDate,
          depositMethod: initial.depositMethod ?? "Tiền mặt",
          depositAmount: initial.depositAmount ?? "",
          paymentCash: initial.paymentCash ?? "",
          paymentTransfer: initial.paymentTransfer ?? "",
          note: initial.note ?? "",
          status: initial.status,
        }
      : {
          customerName: "",
          customerPhone: "",
          items: [],
          invoiceDate: todayISO(),
          pickupDate: "",
          returnDate: "",
          depositMethod: "Tiền mặt",
          depositAmount: "",
          paymentCash: "",
          paymentTransfer: "",
          note: "",
          status: "Đã đặt",
        }
  );
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const conflicts = useMemo(() => {
    if (!f.pickupDate || !f.returnDate || f.items.length === 0) return [];
    const list: { code: string; order: Order }[] = [];
    for (const it of f.items) {
      for (const o of orders) {
        if (initial && o.id === initial.id) continue;
        if (o.status === "Đã hủy") continue;
        if (!o.items.some((x) => x.code === it.code)) continue;
        if (rangesOverlap(f.pickupDate, f.returnDate, o.pickupDate, o.returnDate)) {
          list.push({ code: it.code, order: o });
        }
      }
    }
    return list;
  }, [f.items, f.pickupDate, f.returnDate, orders, initial]);

  const [ackConflict, setAckConflict] = useState(false);
  useEffect(() => setAckConflict(false), [conflicts.length]);

  const suggestedTotal = f.items.reduce((s, it) => s + (it.rentPrice3 || 0), 0);

  function addItem(p: Product) {
    setF({ ...f, items: [...f.items, { code: p.code, rentPrice3: p.rentPrice3 }] });
  }
  function removeItem(code: string) {
    setF({ ...f, items: f.items.filter((i) => i.code !== code) });
  }

  function submit() {
    if (!f.customerName.trim() || !f.pickupDate || !f.returnDate) return;
    onSave({
      ...f,
      customerName: f.customerName.trim(),
      customerPhone: f.customerPhone || null,
      depositAmount: f.depositAmount === "" ? 0 : Number(f.depositAmount),
      paymentCash: f.paymentCash === "" ? 0 : Number(f.paymentCash),
      paymentTransfer: f.paymentTransfer === "" ? 0 : Number(f.paymentTransfer),
      note: f.note,
    });
  }

  const canSubmit = f.customerName.trim() && f.pickupDate && f.returnDate && (conflicts.length === 0 || ackConflict);

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-3">
        <Field label="Tên khách *">
          <input className={inputCls} value={f.customerName} onChange={set("customerName")} />
        </Field>
        <Field label="Số điện thoại">
          <input className={inputCls} value={f.customerPhone} onChange={set("customerPhone")} />
        </Field>
      </div>

      <Field label="Sản phẩm thuê">
        <ItemPicker products={products} selected={f.items} onAdd={addItem} onRemove={removeItem} />
      </Field>
      {f.items.length > 0 && (
        <div className="text-xs text-stone-400 -mt-2 mb-3">
          Gợi ý tổng tiền thuê: <span className="font-medium text-stone-600">{formatVND(suggestedTotal)}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-x-3">
        <Field label="Ngày lập hóa đơn">
          <input type="date" className={inputCls} value={f.invoiceDate} onChange={set("invoiceDate")} />
        </Field>
        <Field label="Ngày lấy *">
          <input type="date" className={inputCls} value={f.pickupDate} onChange={set("pickupDate")} />
        </Field>
        <Field label="Ngày trả *">
          <input type="date" className={inputCls} value={f.returnDate} onChange={set("returnDate")} />
        </Field>
      </div>

      {conflicts.length > 0 && (
        <div className="rounded-lg p-3 mb-3 text-xs" style={{ backgroundColor: "#FDECEA", color: "#B0453F" }}>
          <div className="flex items-center gap-1.5 font-medium mb-1">
            <AlertTriangle size={14} /> Trùng lịch!
          </div>
          <ul className="space-y-0.5 mb-2">
            {conflicts.map((c, i) => (
              <li key={i}>
                Mã <b>{c.code}</b> đang được <b>{c.order.customerName || "khách khác"}</b> giữ từ {formatDateVN(c.order.pickupDate)} đến{" "}
                {formatDateVN(c.order.returnDate)} ({c.order.status})
              </li>
            ))}
          </ul>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={ackConflict} onChange={(e) => setAckConflict(e.target.checked)} />
            Tôi biết và vẫn muốn tạo đơn này
          </label>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-3">
        <Field label="Hình thức cọc">
          <select className={inputCls} value={f.depositMethod} onChange={set("depositMethod")}>
            {DEPOSIT_METHODS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Số tiền cọc">
          <input type="number" className={inputCls} value={f.depositAmount} onChange={set("depositAmount")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-x-3">
        <Field label="Thanh toán tiền mặt">
          <input type="number" className={inputCls} value={f.paymentCash} onChange={set("paymentCash")} />
        </Field>
        <Field label="Thanh toán chuyển khoản">
          <input type="number" className={inputCls} value={f.paymentTransfer} onChange={set("paymentTransfer")} />
        </Field>
      </div>
      <Field label="Trạng thái đơn">
        <select className={inputCls} value={f.status} onChange={set("status")}>
          {ORDER_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Field label="Ghi chú (phụ thu, hoàn tiền, địa chỉ ship...)">
        <textarea className={inputCls} rows={2} value={f.note} onChange={set("note")} />
      </Field>

      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-100">
          Hủy
        </button>
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
          style={{ backgroundColor: conflicts.length > 0 ? "#B0453F" : COLORS.rose }}
        >
          {conflicts.length > 0 ? "Vẫn tạo đơn (bỏ qua trùng lịch)" : "Lưu đơn hàng"}
        </button>
      </div>
    </div>
  );
}
