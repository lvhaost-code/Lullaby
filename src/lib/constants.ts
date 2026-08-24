export const CATEGORIES = ["Váy đầm", "Giày", "Túi", "Phụ kiện"] as const;

export const STATUS_LABELS: Record<string, string> = {
  available: "Còn hàng",
  cleaning: "Đang giặt ủi",
  damaged: "Hỏng / đang sửa",
  retired: "Ngừng cho thuê",
};
export const STATUS_KEYS = Object.keys(STATUS_LABELS);

export const ORDER_STATUSES = ["Đã đặt", "Đang thuê", "Đã trả", "Đã hủy"] as const;
export const DEPOSIT_METHODS = ["CCCD", "GPLX", "Tiền mặt", "Chuyển khoản"] as const;

export const COLORS = {
  rose: "#B3536A",
  roseDark: "#8B3F53",
  roseSoft: "#F3E3E7",
  plum: "#3F2436",
  cream: "#FBF6F2",
  gold: "#C9A15A",
  goldSoft: "#F5EBD8",
  sage: "#7C9473",
  sageSoft: "#E7EDE3",
};

export const TIER_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  Grace: { bg: COLORS.sageSoft, fg: COLORS.sage, label: "Grace" },
  Premium: { bg: COLORS.roseSoft, fg: COLORS.roseDark, label: "Premium" },
  Special: { bg: COLORS.goldSoft, fg: "#93731F", label: "Special" },
};

export const SHOP_PHONE = "0783742752";
