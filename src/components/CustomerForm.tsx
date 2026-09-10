"use client";

import { useState } from "react";
import { COLORS } from "@/lib/constants";
import { Field, inputCls } from "@/components/ui";
import type { Customer } from "@/lib/types";

type FormState = {
  name: string;
  phone: string;
  rentalCount: string | number;
  rentedItems: string;
  preferences: string;
  notes: string;
};

export function CustomerForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Customer | null;
  onSave: (data: Omit<Customer, "id">) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<FormState>(
    initial
      ? {
          name: initial.name,
          phone: initial.phone,
          rentalCount: initial.rentalCount ?? "",
          rentedItems: initial.rentedItems ?? "",
          preferences: initial.preferences ?? "",
          notes: initial.notes ?? "",
        }
      : { name: "", phone: "", rentalCount: "", rentedItems: "", preferences: "", notes: "" }
  );
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  function submit() {
    if (!f.name.trim() || !f.phone.trim()) return;
    onSave({
      name: f.name.trim(),
      phone: f.phone.trim(),
      rentalCount: f.rentalCount === "" ? null : Number(f.rentalCount),
      rentedItems: f.rentedItems,
      preferences: f.preferences,
      notes: f.notes,
    });
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-3">
        <Field label="Tên khách hàng *">
          <input className={inputCls} value={f.name} onChange={set("name")} />
        </Field>
        <Field label="Số điện thoại *">
          <input className={inputCls} value={f.phone} onChange={set("phone")} />
        </Field>
      </div>
      <Field label="Số lần thuê">
        <input type="number" className={inputCls} value={f.rentalCount} onChange={set("rentalCount")} placeholder="VD: 5" />
      </Field>
      <Field label="Các váy đã thuê">
        <textarea className={inputCls} rows={2} value={f.rentedItems} onChange={set("rentedItems")} placeholder="VD: M24, S17, đầm dạ hội đỏ..." />
      </Field>
      <Field label="Sở thích">
        <textarea className={inputCls} rows={2} value={f.preferences} onChange={set("preferences")} placeholder="VD: thích màu pastel, size M..." />
      </Field>
      <Field label="Lưu ý">
        <textarea className={inputCls} rows={2} value={f.notes} onChange={set("notes")} placeholder="VD: khách quen, hay trả trễ..." />
      </Field>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-100">
          Hủy
        </button>
        <button onClick={submit} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: COLORS.rose }}>
          Lưu khách hàng
        </button>
      </div>
    </div>
  );
}
