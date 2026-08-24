import type { Metadata } from "next";
import { CatalogApp } from "@/components/CatalogApp";

export const metadata: Metadata = {
  title: "Lullaby · Cho thuê váy đầm & phụ kiện",
  description: "Xem sản phẩm và gửi yêu cầu đặt trước — Lullaby Cần Thơ",
};

export default function CatalogPage() {
  return <CatalogApp />;
}
