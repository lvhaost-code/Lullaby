"use client";

import { useEffect, useState } from "react";
import { Package, ClipboardList, Users, BarChart3, Loader2, Inbox } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { ProductsTab } from "@/components/ProductsTab";
import { OrdersTab } from "@/components/OrdersTab";
import { CustomersTab } from "@/components/CustomersTab";
import { ReportsTab } from "@/components/ReportsTab";
import { RequestsTab } from "@/components/RequestsTab";
import { Toast, type ToastState } from "@/components/ui";
import type { Product, Order, BookingRequest } from "@/lib/types";

const TABS = [
  { key: "products", label: "Kho sản phẩm", icon: Package },
  { key: "orders", label: "Đơn hàng", icon: ClipboardList },
  { key: "requests", label: "Yêu cầu đặt trước", icon: Inbox },
  { key: "customers", label: "Khách hàng", icon: Users },
  { key: "reports", label: "Báo cáo", icon: BarChart3 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function DashboardApp() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [tab, setTab] = useState<TabKey>("products");
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, oRes, rRes] = await Promise.all([fetch("/api/products"), fetch("/api/orders"), fetch("/api/booking-requests")]);
        setProducts(await pRes.json());
        setOrders(await oRes.json());
        setRequests(await rRes.json());
      } catch {
        showToast("Không tải được dữ liệu, thử tải lại trang.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pendingRequestCount = requests.filter((r) => r.status === "pending").length;

  function showToast(msg: string, type?: "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  async function saveProduct(data: Omit<Product, "id" | "photoUrl">, photoUrl: string | null | undefined, id: string | null) {
    try {
      const payload = { ...data, ...(photoUrl !== undefined ? { photoUrl } : {}) };
      const res = await fetch(id ? `/api/products/${id}` : "/api/products", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Lưu sản phẩm thất bại, thử lại nhé.", "error");
        return;
      }
      const saved: Product = await res.json();
      setProducts((prev) => (id ? prev.map((p) => (p.id === id ? saved : p)) : [saved, ...prev]));
      showToast(id ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm mới.");
    } catch {
      showToast("Lưu sản phẩm thất bại, thử lại nhé.", "error");
    }
  }

  async function deleteProduct(p: Product) {
    if (!window.confirm(`Xóa sản phẩm ${p.code}?`)) return;
    try {
      const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Xóa sản phẩm thất bại, thử lại nhé.", "error");
        return;
      }
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      showToast("Đã xóa sản phẩm.");
    } catch {
      showToast("Xóa sản phẩm thất bại, thử lại nhé.", "error");
    }
  }

  async function saveOrder(data: Omit<Order, "id">, id: string | null) {
    try {
      const res = await fetch(id ? `/api/orders/${id}` : "/api/orders", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Lưu đơn hàng thất bại, thử lại nhé.", "error");
        return;
      }
      const saved: Order = await res.json();
      setOrders((prev) => (id ? prev.map((o) => (o.id === id ? saved : o)) : [saved, ...prev]));
      showToast(id ? "Đã cập nhật đơn hàng." : "Đã tạo đơn hàng mới.");
    } catch {
      showToast("Lưu đơn hàng thất bại, thử lại nhé.", "error");
    }
  }

  async function deleteOrder(o: Order) {
    if (!window.confirm(`Xóa đơn hàng của ${o.customerName}?`)) return;
    try {
      const res = await fetch(`/api/orders/${o.id}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Xóa đơn hàng thất bại, thử lại nhé.", "error");
        return;
      }
      setOrders((prev) => prev.filter((x) => x.id !== o.id));
      showToast("Đã xóa đơn hàng.");
    } catch {
      showToast("Xóa đơn hàng thất bại, thử lại nhé.", "error");
    }
  }

  async function updateRequestStatus(id: string, status: "confirmed" | "dismissed") {
    try {
      const res = await fetch(`/api/booking-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      showToast("Cập nhật yêu cầu thất bại, thử lại nhé.", "error");
    }
  }

  async function confirmRequest(request: BookingRequest, orderData: Omit<Order, "id">) {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Tạo đơn hàng thất bại, thử lại nhé.", "error");
        return;
      }
      const saved: Order = await res.json();
      setOrders((prev) => [saved, ...prev]);
      await updateRequestStatus(request.id, "confirmed");
      showToast("Đã tạo đơn hàng từ yêu cầu đặt trước.");
    } catch {
      showToast("Tạo đơn hàng thất bại, thử lại nhé.", "error");
    }
  }

  function dismissRequest(request: BookingRequest) {
    if (!window.confirm(`Từ chối yêu cầu của ${request.customerName}?`)) return;
    updateRequestStatus(request.id, "dismissed");
  }

  return (
    <div style={{ backgroundColor: COLORS.cream, minHeight: "100%" }} className="min-h-full flex-1">
      <div className="sticky top-14 z-30 backdrop-blur-sm" style={{ backgroundColor: "rgba(251,246,242,0.92)", borderBottom: "1px solid #EEE3DD" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto pb-2 pt-3 -mb-px">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors"
                  style={active ? { backgroundColor: "white", color: COLORS.roseDark, boxShadow: "0 -1px 0 white inset" } : { color: "#A8988F" }}
                >
                  <Icon size={15} /> {t.label}
                  {t.key === "requests" && pendingRequestCount > 0 && (
                    <span
                      className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold text-white"
                      style={{ backgroundColor: COLORS.rose }}
                    >
                      {pendingRequestCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-stone-400 gap-2">
            <Loader2 size={18} className="animate-spin" /> Đang tải dữ liệu...
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6" style={{ boxShadow: "0 1px 3px rgba(63,36,54,0.06)" }}>
            {tab === "products" && <ProductsTab products={products} orders={orders} onSave={saveProduct} onDelete={deleteProduct} />}
            {tab === "orders" && <OrdersTab products={products} orders={orders} onSave={saveOrder} onDelete={deleteOrder} />}
            {tab === "requests" && (
              <RequestsTab requests={requests} products={products} orders={orders} onConfirm={confirmRequest} onDismiss={dismissRequest} />
            )}
            {tab === "customers" && <CustomersTab orders={orders} />}
            {tab === "reports" && <ReportsTab orders={orders} />}
          </div>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
