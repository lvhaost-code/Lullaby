"use client";

import { useState } from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { CATEGORIES, STATUS_KEYS, STATUS_LABELS, COLORS } from "@/lib/constants";
import { resizeImageFile } from "@/lib/format";
import { Field, inputCls } from "@/components/ui";
import type { Product } from "@/lib/types";

type FormState = {
  code: string;
  category: string;
  brand: string;
  costPrice: string | number;
  rentPrice3: string | number;
  rentPriceDay: string | number;
  size: string;
  deposit: string;
  notes: string;
  status: string;
};

export function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Product | null;
  onSave: (data: Omit<Product, "id" | "photoUrl">, photoUrl: string | null | undefined) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<FormState>(
    initial
      ? {
          code: initial.code,
          category: initial.category,
          brand: initial.brand ?? "",
          costPrice: initial.costPrice ?? "",
          rentPrice3: initial.rentPrice3 ?? "",
          rentPriceDay: initial.rentPriceDay ?? "",
          size: initial.size ?? "",
          deposit: initial.deposit ?? "",
          notes: initial.notes ?? "",
          status: initial.status,
        }
      : {
          code: "",
          category: "Váy đầm",
          brand: "",
          costPrice: "",
          rentPrice3: "",
          rentPriceDay: "",
          size: "",
          deposit: "",
          notes: "",
          status: "available",
        }
  );
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const [photo, setPhoto] = useState<string | null>(initial?.photoUrl ?? null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoChanged, setPhotoChanged] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setPhotoBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      setPhoto(dataUrl);
      setPhotoChanged(true);
    } catch {
      // ignore — user can just try another photo
    } finally {
      setPhotoBusy(false);
    }
  }
  function removePhoto() {
    setPhoto(null);
    setPhotoChanged(true);
  }

  function submit() {
    if (!f.code.trim()) return;
    onSave(
      {
        code: f.code,
        category: f.category,
        brand: f.brand,
        costPrice: f.costPrice === "" ? null : Number(f.costPrice),
        rentPrice3: f.rentPrice3 === "" ? null : Number(f.rentPrice3),
        rentPriceDay: f.rentPriceDay === "" ? null : Number(f.rentPriceDay),
        size: f.size,
        deposit: f.deposit,
        notes: f.notes,
        status: f.status,
      },
      photoChanged ? photo : undefined
    );
  }

  return (
    <div>
      <Field label="Ảnh sản phẩm">
        <div className="flex items-center gap-3">
          <div
            style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", backgroundColor: "#F1E9E4" }}
            className="flex items-center justify-center shrink-0"
          >
            {photoBusy ? (
              <Loader2 size={18} className="animate-spin text-stone-300" />
            ) : photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
            ) : (
              <ImageIcon size={22} className="text-stone-300" />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer text-center"
              style={{ backgroundColor: COLORS.roseSoft, color: COLORS.roseDark }}
            >
              {photo ? "Đổi ảnh" : "Tải ảnh lên"}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            {photo && (
              <button type="button" onClick={removePhoto} className="text-xs text-stone-400 hover:text-red-500">
                Xóa ảnh
              </button>
            )}
          </div>
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-x-3">
        <Field label="Mã sản phẩm *">
          <input className={inputCls} value={f.code} onChange={set("code")} placeholder="VD: M24" />
        </Field>
        <Field label="Loại">
          <select className={inputCls} value={f.category} onChange={set("category")}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Brand / mô tả">
        <input className={inputCls} value={f.brand} onChange={set("brand")} placeholder="VD: Xipi, Glamdoll..." />
      </Field>
      <div className="grid grid-cols-3 gap-x-3">
        <Field label="Giá vốn">
          <input type="number" className={inputCls} value={f.costPrice} onChange={set("costPrice")} />
        </Field>
        <Field label="Giá thuê 3 ngày">
          <input type="number" className={inputCls} value={f.rentPrice3} onChange={set("rentPrice3")} />
        </Field>
        <Field label="Giá thuê 1 ngày">
          <input type="number" className={inputCls} value={f.rentPriceDay} onChange={set("rentPriceDay")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-x-3">
        <Field label="Size">
          <input className={inputCls} value={f.size} onChange={set("size")} />
        </Field>
        <Field label="Tiền cọc">
          <input className={inputCls} value={f.deposit} onChange={set("deposit")} placeholder="VD: 500k" />
        </Field>
      </div>
      <Field label="Tình trạng">
        <select className={inputCls} value={f.status} onChange={set("status")}>
          {STATUS_KEYS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Ghi chú">
        <textarea className={inputCls} rows={2} value={f.notes} onChange={set("notes")} />
      </Field>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-100">
          Hủy
        </button>
        <button onClick={submit} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: COLORS.rose }}>
          Lưu sản phẩm
        </button>
      </div>
    </div>
  );
}
