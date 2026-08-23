"use client";

import { X, Check, AlertTriangle } from "lucide-react";
import { COLORS, STATUS_LABELS } from "@/lib/constants";
import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:border-transparent";

export function Badge({ children, bg, fg }: { children: ReactNode; bg: string; fg: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: bg, color: fg }}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    available: { bg: COLORS.sageSoft, fg: COLORS.sage },
    cleaning: { bg: COLORS.goldSoft, fg: "#93731F" },
    damaged: { bg: "#F5E1E1", fg: "#B0453F" },
    retired: { bg: "#EDEDED", fg: "#777" },
  };
  const s = map[status] || map.available;
  return (
    <Badge bg={s.bg} fg={s.fg}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    "Đã đặt": { bg: COLORS.goldSoft, fg: "#93731F" },
    "Đang thuê": { bg: COLORS.roseSoft, fg: COLORS.roseDark },
    "Đã trả": { bg: COLORS.sageSoft, fg: COLORS.sage },
    "Đã hủy": { bg: "#EDEDED", fg: "#888" },
  };
  const s = map[status] || map["Đã đặt"];
  return (
    <Badge bg={s.bg} fg={s.fg}>
      {status}
    </Badge>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
      style={{ backgroundColor: "rgba(63,36,54,0.45)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={"bg-white rounded-2xl shadow-xl w-full mt-4 mb-8 " + (wide ? "max-w-3xl" : "max-w-lg")}
        style={{ maxHeight: "92vh", display: "flex", flexDirection: "column" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 shrink-0">
          <h3 className="text-lg" style={{ fontFamily: "'Fraunces', serif", color: COLORS.plum }}>
            {title}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100 text-stone-400">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-medium text-stone-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

export type ToastState = { msg: string; type?: "error" } | null;

export function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-full shadow-lg text-sm font-medium flex items-center gap-2"
      style={{ backgroundColor: isErr ? "#B0453F" : COLORS.plum, color: "white" }}
    >
      {isErr ? <AlertTriangle size={15} /> : <Check size={15} />}
      {toast.msg}
    </div>
  );
}

export function EmptyState({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number; className?: string }>; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-stone-400">
      <Icon size={30} className="mb-2 opacity-60" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
