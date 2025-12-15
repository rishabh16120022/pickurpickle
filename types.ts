
export type Category = string;

export interface CategoryItem {
  id: string;
  name: string;
  slug: string; // Used for filtering (e.g., 'pickles')
  description?: string;
  image?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  description: string;
  isActive: boolean;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  link: string; // Where to redirect: '/shop', '/shop?cat=pickles', etc.
  buttonText?: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  offerPrice?: number;
  image: string;
  category: Category;
  weight?: string;
  inStock: boolean; // General availability toggle
  stockQuantity: number; // Exact stock count
  isFeatured: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userImage?: string; // New field for DP
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  discountAmount?: number;
  couponCode?: string;
  finalAmount: number; // Amount after discount
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'return_requested' | 'returned' | 'refunded' | 'return_rejected';
  returnReason?: string;
  paymentMethod: string;
  shippingAddress: string;
  city: string;
  pincode: string;
  date: string;
  // Shiprocket Fields
  shiprocketOrderId?: string;
  shipmentId?: string;
  awbCode?: string;
  courierName?: string;
  estimatedDelivery?: string;
  trackingId?: string;
}

export interface SiteConfig {
  announcementText: string;
  announcementActive: boolean;
  marqueeText: string; // New: Customizable scrolling text
  marqueeActive: boolean;
  marqueeSpeed: number; // Seconds for animation
  heroBannerUrl: string; // Deprecated in favor of Banners array, kept for fallback
  paymentMethods: {
    upi: boolean;
    card: boolean;
    cod: boolean;
    bankTransfer: boolean;
  };
}

export interface TrackingStep {
  date: string;
  activity: string;
  location: string;
  status: string; // 'done' | 'current' | 'pending'
}