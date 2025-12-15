
import { Product, SiteConfig, CategoryItem, Coupon, Review } from './types';

export const INITIAL_CONFIG: SiteConfig = {
  announcementText: "Big Billion Days Sale is Live! Flat 20% OFF.",
  announcementActive: true,
  marqueeText: "Fresh Stock Arrived! • Free Shipping on orders above ₹500 • Authentic Homemade Taste • 100% Natural Ingredients •",
  marqueeActive: true,
  marqueeSpeed: 20,
  heroBannerUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=2000",
  paymentMethods: {
    upi: true,
    card: true,
    cod: true,
    bankTransfer: true,
  }
};

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { 
    id: '1', 
    name: 'Pickles', 
    slug: 'pickles', 
    description: 'Spicy, Tangy, Sweet', 
    image: 'https://images.unsplash.com/photo-1623348128373-c60331003668?auto=format&fit=crop&q=80&w=600' 
  },
  { 
    id: '2', 
    name: 'Snacks', 
    slug: 'snacks', 
    description: 'Murukku, Chips & More', 
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600' 
  },
  { 
    id: '3', 
    name: 'Spices', 
    slug: 'grocery', 
    description: 'Spices from the Source', 
    image: 'https://images.unsplash.com/photo-1622652614631-c4224c6d4834?auto=format&fit=crop&q=80&w=600' 
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  { id: '1', code: 'NEWPICK20', discountPercent: 20, description: '20% Off on your first order', isActive: true },
  { id: '2', code: 'FESTIVE10', discountPercent: 10, description: 'Flat 10% Off Festive Sale', isActive: true }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: "Spicy Mango Pickle",
    description: "Authentic Avakaya made with raw mangoes, mustard powder, and guntur chillies.",
    price: 350,
    offerPrice: 299,
    category: 'pickles',
    weight: '500g',
    image: 'https://images.unsplash.com/photo-1589135233689-d538605df0c7?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 50,
    isFeatured: true,
  },
  {
    id: '2',
    name: "Tangy Lemon Pickle",
    description: "Sun-dried lemons marinated in spices for 3 months. Good for digestion.",
    price: 250,
    category: 'pickles',
    weight: '500g',
    image: 'https://images.unsplash.com/photo-1622597467332-9860b73c3830?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 20,
    isFeatured: false,
  },
  {
    id: '3',
    name: "Crispy Murukku",
    description: "Traditional south Indian rice flour snack, crunchy and savory.",
    price: 150,
    category: 'snacks',
    weight: '250g',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 5,
    isFeatured: true,
  },
  {
    id: '4',
    name: "Turmeric Powder",
    description: "Pure Haldhi from the fields of Meghalaya. High curcumin content.",
    price: 400,
    offerPrice: 350,
    category: 'grocery',
    weight: '100g',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 0,
    isFeatured: false,
  },
  {
    id: '5',
    name: "Mixed Veg Pickle",
    description: "Carrot, cauliflower, and turnip pickled in mustard oil.",
    price: 300,
    category: 'pickles',
    weight: '500g',
    image: 'https://images.unsplash.com/photo-1623348128373-c60331003668?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 15,
    isFeatured: true,
  },
  {
    id: '6',
    name: "Banana Chips",
    description: "Kerala style banana chips fried in coconut oil.",
    price: 220,
    category: 'snacks',
    weight: '200g',
    image: 'https://images.unsplash.com/photo-1634547289947-6dfc8d451241?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 3,
    isFeatured: false,
  }
];

export const INITIAL_REVIEWS: Review[] = [
    // Product 1: Spicy Mango Pickle
    { id: '1', productId: '1', userId: '101', userName: 'Sachin Kumar', userImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80', rating: 5, comment: 'Absolutely authentic! Reminds me of my grandmother\'s recipe from Bihar. The mustard oil punch is real.', date: '2023-10-15' },
    { id: '2', productId: '1', userId: '102', userName: 'Priya Sharma', userImage: 'https://images.unsplash.com/photo-1621592484082-2d05b1290d7a?auto=format&fit=crop&w=150&q=80', rating: 5, comment: 'Very tasty. The mango pieces are firm and the spice level is just right for my family.', date: '2023-10-18' },
    { id: '3', productId: '1', userId: '103', userName: 'Rahul Raja', userImage: 'https://images.unsplash.com/photo-1586083702768-190ae093d34d?auto=format&fit=crop&w=150&q=80', rating: 4, comment: 'Good taste but slightly oily for my preference. Packaging was excellent.', date: '2023-10-20' },
    { id: '4', productId: '1', userId: '104', userName: 'Kavita Krishnan', userImage: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=150&q=80', rating: 5, comment: 'Best Avakaya I have bought online. Highly recommended!', date: '2023-11-05' },
    
    // ... existing reviews
];
