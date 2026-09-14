export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  short_description: string | null;
  selling_price: number;
  old_price: number | null;
  stock_quantity: number;
  unlimited_stock: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unlimited';
  visibility: 'published' | 'hidden' | 'paused';
  featured: boolean;
  bestseller: boolean;
  is_new: boolean;
  on_sale: boolean;
  seasonal: boolean;
  display_order: number;
  product_images?: { image_url: string; is_primary: boolean; display_order: number }[];
};

export type CartLine = {
  product_id: string;
  name: string;
  slug: string;
  image_url: string | null;
  unit_price: number;
  quantity: number;
};

export type ShippingZone = {
  id: string;
  name: string;
  standard_price: number;
  express_price: number | null;
  standard_eta_text: string | null;
  express_eta_text: string | null;
  additional_fee: number;
};

export type DeliverySlot = {
  id: string;
  label: string;
  speed: 'standard' | 'express';
};
