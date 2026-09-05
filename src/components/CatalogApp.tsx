"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Search, Phone, Loader2, Calendar, Check, AlertTriangle } from "lucide-react";
import { CATEGORIES, COLORS, TIER_STYLE, SHOP_PHONE, SIZE_ORDER } from "@/lib/constants";
import { formatVND, formatDateVN, todayISO, tierOfDress, rangesOverlap, sortByCategoryOrder, sizeSortIndex } from "@/lib/format";
import { Modal, Field, EmptyState, Badge, inputCls } from "@/components/ui";
import { ProductThumb } from "@/components/ProductThumb";
import type { PublicProduct } from "@/lib/types";

function ProductCard({ p, onOpen }: { p: PublicProduct; onOpen: () => void }) {
  const tier = p.category === "Váy đầm" ? tierOfDress(p.rentPrice3) : null;
  const name = p.brand || p.notes || p.category;
  return (
    <button
      onClick={onOpen}
      className="text-left rounded-xl overflow-hidden border border-stone-100 bg-white hover:shadow-md transition-shadow"
    >
      <div style={{ aspectRatio: "3/4", backgroundColor: "#F1E9E4" }}>
        <ProductThumb photoUrl={p.hasPhoto ? `/api/public/products/${p.code}/thumb` : null} fill rounded={0} />
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-stone-700 truncate">{name}</span>
          {tier && (
            <Badge bg={TIER_STYLE[tier].bg} fg={TIER_STYLE[tier].fg}>
              {TIER_STYLE[tier].label}
            </Badge>
          )}
        </div>
        <div className="text-xs text-stone-400 mt-0.5">
          {p.code}
          {p.size ? ` · Size ${p.size}` : ""}
        </div>
        <div className="text-sm mt-1.5" style={{ color: COLORS.roseDark }}>
          {formatVND(p.rentPrice3)} <span className="text-xs text-stone-400">/ 3 ngày</span>
        </div>
      </div>
    </button>
  );
}

function ProductDetailModal({ p, onClose }: { p: PublicProduct; onClose: () => void }) {
  const [ranges, setRanges] = useState<{ pickupDate: string; returnDate: string }[] | null>(null);
  // Show the list thumbnail immediately (already browser-cached from the
  // grid card), then swap in the full gallery once it loads.
  const [photos, setPhotos] = useState<string[]>(p.hasPhoto ? [`/api/public/products/${p.code}/thumb`] : []);

  useEffect(() => {
    let alive = true;
    fetch(`/api/public/products/${encodeURIComponent(p.code)}/availability`)
      .then((r) => r.json())
      .then((d) => alive && setRanges(d))
      .catch(() => alive && setRanges([]));
    fetch(`/api/public/products/${encodeURIComponent(p.code)}`)
      .then((r) => r.json())
      .then((detail: { photos: string[] }) => alive && detail.photos.length > 0 && setPhotos(detail.photos))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [p.code]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const conflict = useMemo(() => {
    if (!ranges || !pickupDate || !returnDate) return false;
    return ranges.some((r) => rangesOverlap(pickupDate, returnDate, r.pickupDate, r.returnDate));
  }, [ranges, pickupDate, returnDate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim() || !pickupDate || !returnDate) {
      setError("Vui lòng điền đủ thông tin bắt buộc.");
      return;
    }
    if (pickupDate > returnDate) {
      setError("Ngày lấy phải trước ngày trả.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          items: [{ code: p.code }],
          pickupDate,
          returnDate,
          note,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Gửi yêu cầu thất bại, thử lại nhé.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Gửi yêu cầu thất bại, thử lại nhé.");
    } finally {
      setSubmitting(false);
    }
  }

  const tier = p.category === "Váy đầm" ? tierOfDress(p.rentPrice3) : null;
  const productName = p.brand || p.notes || p.category;
  const [activePhoto, setActivePhoto] = useState(0);

  return (
    <Modal title={`${productName} · ${p.code}`} onClose={onClose}>
      {success ? (
        <div className="text-center py-6">
          <div
            className="mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: COLORS.sageSoft }}
          >
            <Check size={22} style={{ color: COLORS.sage }} />
          </div>
          <p className="text-sm font-medium text-stone-700 mb-1">Đã gửi yêu cầu đặt trước!</p>
          <p className="text-xs text-stone-500 mb-4">
            Shop sẽ gọi hoặc nhắn Zalo cho bạn qua số {phone} để xác nhận lịch còn trống và chốt đơn.
          </p>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: COLORS.rose }}>
            Đóng
          </button>
        </div>
      ) : (
        <>
          <div style={{ aspectRatio: "1/1", borderRadius: 10, overflow: "hidden", backgroundColor: "#F1E9E4" }}>
            <ProductThumb photoUrl={photos[activePhoto] ?? photos[0] ?? null} fill rounded={0} />
          </div>
          {photos.length > 1 && (
            <div className="flex gap-1.5 mt-1.5 overflow-x-auto">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className="shrink-0 rounded-md overflow-hidden"
                  style={{ width: 44, height: 44, outline: i === activePhoto ? `2px solid ${COLORS.rose}` : "none" }}
                >
                  <ProductThumb photoUrl={photo} size={44} rounded={6} />
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-stone-700">{productName}</span>
              {tier && (
                <Badge bg={TIER_STYLE[tier].bg} fg={TIER_STYLE[tier].fg}>
                  {TIER_STYLE[tier].label}
                </Badge>
              )}
            </div>
            <div className="text-xs text-stone-400 mt-0.5">
              {p.code}
              {p.size ? ` · Size ${p.size}` : ""}
            </div>
            <div className="text-sm mt-1" style={{ color: COLORS.roseDark }}>
              {formatVND(p.rentPrice3)} / 3 ngày
              {p.rentPriceDay ? <span className="text-stone-400"> · {formatVND(p.rentPriceDay)} / ngày</span> : null}
            </div>
            {p.deposit && <div className="text-xs text-stone-400 mt-0.5">Cọc: {p.deposit}</div>}
          </div>

          <div className="text-xs text-stone-500 mb-4">
            <div className="font-medium text-stone-600 mb-1 flex items-center gap-1.5">
              <Calendar size={12} /> Lịch sắp tới
            </div>
            {ranges === null ? (
              <span className="text-stone-400">Đang tải...</span>
            ) : ranges.length === 0 ? (
              <span className="text-stone-400">Hiện đang trống lịch.</span>
            ) : (
              <ul className="space-y-0.5">
                {ranges.map((r, i) => (
                  <li key={i}>
                    {formatDateVN(r.pickupDate)} – {formatDateVN(r.returnDate)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={submit}>
            <div className="grid grid-cols-2 gap-x-3">
              <Field label="Tên của bạn *">
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Số điện thoại / Zalo *">
                <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-x-3">
              <Field label="Ngày lấy *">
                <input type="date" className={inputCls} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
              </Field>
              <Field label="Ngày trả *">
                <input type="date" className={inputCls} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </Field>
            </div>
            {conflict && (
              <div className="rounded-lg p-2.5 mb-3 text-xs flex items-start gap-1.5" style={{ backgroundColor: "#FDECEA", color: "#B0453F" }}>
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                Ngày bạn chọn có thể trùng lịch đã đặt. Bạn vẫn có thể gửi yêu cầu — shop sẽ tư vấn thêm lựa chọn khác nếu cần.
              </div>
            )}
            <Field label="Ghi chú (tùy chọn)">
              <textarea className={inputCls} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            {error && (
              <p className="text-xs mb-2" style={{ color: "#B0453F" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: COLORS.rose }}
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Gửi yêu cầu đặt trước
            </button>
          </form>
        </>
      )}
    </Modal>
  );
}

export function CatalogApp() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>("Váy đầm");
  const [size, setSize] = useState<string>("Tất cả");
  const [selected, setSelected] = useState<PublicProduct | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 24;

  useEffect(() => {
    fetch("/api/public/products")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  // Sizes available within the current category pick, so switching to
  // e.g. "Giày" doesn't leave a dress size selected and filtering to zero.
  const availableSizes = useMemo(() => {
    const inCategory = cat === "Tất cả" ? products : products.filter((p) => p.category === cat);
    const set = new Set(inCategory.map((p) => p.size).filter((s): s is string => !!s));
    return [...set].sort((a, b) => sizeSortIndex(a, SIZE_ORDER) - sizeSortIndex(b, SIZE_ORDER));
  }, [products, cat]);

  useEffect(() => {
    if (size !== "Tất cả" && !availableSizes.includes(size)) setSize("Tất cả");
  }, [availableSizes, size]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (cat !== "Tất cả" && p.category !== cat) return false;
      if (size !== "Tất cả" && p.size !== size) return false;
      if (s && !(p.code.toLowerCase().includes(s) || (p.brand || "").toLowerCase().includes(s))) return false;
      return true;
    });
    return sortByCategoryOrder(list, CATEGORIES);
  }, [products, search, cat, size]);

  useEffect(() => setPage(1), [search, cat, size]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ backgroundColor: COLORS.cream, minHeight: "100%" }} className="min-h-full flex flex-col">
      <div className="sticky top-0 z-40" style={{ backgroundColor: COLORS.plum }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: COLORS.gold }} />
            <span style={{ fontFamily: "'Fraunces', serif", color: "white" }} className="text-lg">
              Lullaby
            </span>
          </div>
          <a href={`tel:${SHOP_PHONE}`} className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white">
            <Phone size={13} /> {SHOP_PHONE}
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        <div className="mb-5">
          <h1 style={{ fontFamily: "'Fraunces', serif", color: COLORS.plum }} className="text-2xl mb-1">
            Cho thuê váy đầm &amp; phụ kiện
          </h1>
          <p className="text-sm text-stone-500">Xem sản phẩm, chọn ngày và gửi yêu cầu — shop sẽ gọi lại xác nhận sớm nhất.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
            <input
              className={inputCls + " pl-9 bg-white"}
              placeholder="Tìm theo mã, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className={inputCls + " w-auto bg-white"} value={cat} onChange={(e) => setCat(e.target.value)}>
            <option>Tất cả</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {availableSizes.length > 0 && (
            <select className={inputCls + " w-auto bg-white"} value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="Tất cả">Tất cả size</option>
              {availableSizes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-stone-400 gap-2">
            <Loader2 size={18} className="animate-spin" /> Đang tải sản phẩm...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Search} text="Không tìm thấy sản phẩm nào." />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {paged.map((p) => (
                <ProductCard key={p.id} p={p} onOpen={() => setSelected(p)} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6 text-sm text-stone-500">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-2 py-1 rounded disabled:opacity-30 hover:bg-white"
                >
                  ←
                </button>
                Trang {page}/{totalPages}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-2 py-1 rounded disabled:opacity-30 hover:bg-white"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && <ProductDetailModal p={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
