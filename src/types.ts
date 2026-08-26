export type SleeveType = 'Panjang' | 'Pendek';
export type SizeType = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';

export interface BatikProduct {
  id: string;
  name: string;
  imagePanjang?: string;
  imagePendek?: string;
  image?: string;
  sleeves: SleeveType[];
}

export interface PricingConfig {
  underDozen: number;
  dozen1: number;
  dozen2: number;
  dozen3: number;
  over48: number;
  remainderAfter1: number;
  remainderAfter2: number;
  remainderAfter3: number;
}

export interface AdminSettings {
  bankName: string;
  bankAcc: string;
  bankHolder: string;
  waNum: string;
  gasUrl: string;
}

export interface CartBreakdownItem {
  prodId: string;
  prodName: string;
  sleeve: SleeveType;
  sizes: Record<SizeType, number>;
  sizesStr: string;
  qty: number;
}

export interface PriceCalculationResult {
  quantity: number;
  fullDozen: number;
  remainder: number;
  total: number;
  averagePrice: number;
  normalPrice: number;
  saving: number;
  savingPercentage: number;
  remainderUnitPrice: number;
  items: CartBreakdownItem[];
}

export interface CustomerFormData {
  name: string;
  phone: string;
  address: string;
  note: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
