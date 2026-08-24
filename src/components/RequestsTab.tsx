"use client";

import { useMemo, useState } from "react";
import { Inbox, Phone, Check, X as XIcon, Calendar } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { formatDateVN } from "@/lib/format";
import { Modal, EmptyState, Badge } from "@/components/ui";
import { OrderForm } from "@/components/OrderForm";
import type { BookingRequest, Order, Product } from "@/lib/types";

export function RequestsTab({
  requests,
  products,
  orders,
  onConfirm,
  onDismiss,
}: {
  requests: BookingRequest[];
  products: Product[];
  orders: Order[];
  onConfirm: (request: BookingRequest, orderData: Omit<Order, "id">) => void;
  onDismiss: (request: BookingRequest) => void;
}) {
  const [confirming, setConfirming] = useState<BookingRequest | null>(null);

  const pending = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);
  const resolved = useMemo(() => requests.filter((r) => r.status !== "pending"), [requests]);

  const draftOrder: Order | null = confirming
    ? {
        id: "request:" + confirming.id,
        customerName: confirming.customerName,
        customerPhone: confirming.customerPhone,
        items: confirming.items.map((it) => {
          const p = products.find((x) => x.code === it.code);
          return { code: it.code, rentPrice3: p?.rentPrice3 ?? null };
        }),
        invoiceDate: new Date().toISOString().slice(0, 10),
        pickupDate: confirming.pickupDate,
        returnDate: confirming.returnDate,
        depositMethod: "Tiền mặt",
        depositAmount: null,
        paymentCash: null,
        paymentTransfer: null,
        note: confirming.note,
        status: "Đã đặt",
      }
    : null;

  return (
    <div>
      <div className="text-xs text-stone-400 mb-2">{pending.length} yêu cầu chờ xác nhận</div>

      {pending.length === 0 ? (
        <EmptyState icon={Inbox} text="Chưa có yêu cầu đặt trước nào." />
      ) : (
        <div className="space-y-2 mb-8">
          {pending.map((r) => (
            <div key={r.id} className="rounded-xl border border-stone-100 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-medium text-stone-700">{r.customerName}</div>
                  <div className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                    <Phone size={10} />
                    {r.customerPhone}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onDismiss(r)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-stone-500 hover:bg-stone-100"
                  >
                    <XIcon size={13} /> Từ chối
                  </button>
                  <button
                    onClick={() => setConfirming(r)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: COLORS.rose }}
                  >
                    <Check size={13} /> Xác nhận → tạo đơn
                  </button>
                </div>
              </div>
              <div className="text-xs text-stone-500 mt-2 flex items-center gap-2 flex-wrap">
                <Calendar size={12} className="text-stone-400" />
                {formatDateVN(r.pickupDate)} – {formatDateVN(r.returnDate)}
                <span className="text-stone-300">·</span>
                {r.items.map((it) => it.code).join(", ") || "—"}
              </div>
              {r.note && <div className="text-xs text-stone-400 mt-1 italic">"{r.note}"</div>}
            </div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <>
          <div className="text-sm font-medium text-stone-600 mb-2">Đã xử lý</div>
          <div className="space-y-1.5">
            {resolved.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs text-stone-500 px-3 py-2 rounded-lg bg-stone-50/60">
                <span>
                  {r.customerName} · {r.items.map((it) => it.code).join(", ")} · {formatDateVN(r.pickupDate)} – {formatDateVN(r.returnDate)}
                </span>
                {r.status === "confirmed" ? (
                  <Badge bg={COLORS.sageSoft} fg={COLORS.sage}>
                    Đã tạo đơn
                  </Badge>
                ) : (
                  <Badge bg="#EDEDED" fg="#888">
                    Đã từ chối
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {confirming && draftOrder && (
        <Modal title={`Xác nhận yêu cầu — ${confirming.customerName}`} onClose={() => setConfirming(null)} wide>
          <OrderForm
            initial={draftOrder}
            products={products}
            orders={orders}
            onCancel={() => setConfirming(null)}
            onSave={(data) => {
              onConfirm(confirming, data);
              setConfirming(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
