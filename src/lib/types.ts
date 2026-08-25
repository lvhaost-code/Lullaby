export type Product = {
  id: string;
  code: string;
  category: string;
  brand: string | null;
  costPrice: number | null;
  rentPrice3: number | null;
  rentPriceDay: number | null;
  size: string | null;
  deposit: string | null;
  notes: string | null;
  status: string;
  photos: string[]; // ordered, first = cover photo
};

export type OrderItemInput = {
  code: string;
  rentPrice3: number | null;
};

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string | null;
  items: OrderItemInput[];
  invoiceDate: string;
  pickupDate: string;
  returnDate: string;
  depositMethod: string | null;
  depositAmount: number | null;
  paymentCash: number | null;
  paymentTransfer: number | null;
  note: string | null;
  status: string;
};

// Public-safe product shape for the customer catalog — no costPrice.
export type PublicProduct = {
  id: string;
  code: string;
  category: string;
  brand: string | null;
  notes: string | null;
  rentPrice3: number | null;
  rentPriceDay: number | null;
  size: string | null;
  deposit: string | null;
  status: string;
  photos: string[];
};

export type BookingRequest = {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { code: string }[];
  pickupDate: string;
  returnDate: string;
  note: string | null;
  status: string;
  createdAt: string;
};
