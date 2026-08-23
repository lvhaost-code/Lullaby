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
  photoUrl: string | null;
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
