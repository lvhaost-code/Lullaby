"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, X, Star } from "lucide-react";
import { CATEGORIES, STATUS_KEYS, STATUS_LABELS, COLORS } from "@/lib/constants";
import { resizeImageFile } from "@/lib/format";
import { Field, inputCls } from "@/components/ui";
import type { Product, ProductDetail } from "@/lib/types";

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

const THUMB = 72;

export function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Product | null;
  onSave: (data: Omit<Product, "id" | "thumbUrl">, photos: string[]) => void;
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

  const [photos, setPhotos] = useState<string[]>([]);
  const [photosLoading, setPhotosLoading] = useState(!!initial);
  const [photoBusy, setPhotoBusy] = useState(false);

  // The list view only carries a thumbnail — fetch the full gallery once,
  // when editing an existing product.
  useEffect(() => {
    if (!initial) return;
    let alive = true;
    fetch(`/api/products/${initial.id}`)
      .then((r) => r.json())
      .then((detail: ProductDetail) => {
        if (alive) setPhotos(detail.photos);
      })
      .finally(() => {
        if (alive) setPhotosLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (files.length === 0) return;
    setPhotoBusy(true);
    try {
      const dataUrls = await Promise.all(files.map((file) => resizeImageFile(file)));
      setPhotos((prev) => [...prev, ...dataUrls]);
    } catch {
      // ignore — user can just try again
    } finally {
      setPhotoBusy(false);
    }
  }
  function removePhoto(i: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  }
  function makeCover(i: number) {
    setPhotos((prev) => [prev[i], ...prev.filter((_, idx) => idx !== i)]);
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
      photos
    );
  }

  return (
    <div>
      <Field label={`Ảnh sản phẩm${photos.length > 1 ? " (ảnh đầu là ảnh bìa)" : ""}`}>
        <div className="flex items-center gap-2.5 flex-wrap">
          {photosLoading ? (
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: THUMB, height: THUMB, borderRadius: 10, backgroundColor: "#F1E9E4" }}
            >
              <Loader2 size={18} className="animate-spin text-stone-300" />
            </div>
          ) : (
            photos.map((photo, i) => (
            <div key={i} className="relative group" style={{ width: THUMB, height: THUMB }}>
              <div style={{ width: THUMB, height: THUMB, borderRadius: 10, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              </div>
              {i === 0 ? (
                <span
                  className="absolute -top-1.5 -left-1.5 rounded-full p-0.5"
                  style={{ backgroundColor: COLORS.gold }}
                  title="Ảnh bìa"
                >
                  <Star size={11} color="white" fill="white" />
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(i)}
                  className="absolute -top-1.5 -left-1.5 rounded-full p-0.5 bg-white border border-stone-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Đặt làm ảnh bìa"
                >
                  <Star size={11} className="text-stone-400" />
                </button>
              )}
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute -top-1.5 -right-1.5 rounded-full p-0.5 text-white"
                style={{ backgroundColor: "#B0453F" }}
                title="Xóa ảnh"
              >
                <X size={11} />
              </button>
            </div>
            ))
          )}
          {!photosLoading && (
            <label
              className="flex flex-col items-center justify-center gap-0.5 rounded-lg cursor-pointer shrink-0 text-stone-400"
              style={{ width: THUMB, height: THUMB, backgroundColor: "#F1E9E4" }}
            >
              {photoBusy ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              <span className="text-[10px]">{photos.length === 0 ? "Tải ảnh lên" : "Thêm ảnh"}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            </label>
          )}
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
