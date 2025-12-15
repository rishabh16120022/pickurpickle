import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, User, Order, SiteConfig, CategoryItem, Coupon, Review, Banner } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CONFIG, INITIAL_CATEGORIES, INITIAL_COUPONS, INITIAL_REVIEWS } from '../constants';
import { createShiprocketOrder } from '../services/shiprocketService';

interface StoreContextType {
  user: User | null;
  products: Product[];
  categories: CategoryItem[];
  coupons: Coupon[];
  cart: CartItem[];
  orders: Order[];
  reviews: Review[];
  banners: Banner[];
  config: SiteConfig;
  notification: { message: string; type: 'success' | 'error' } | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: 'admin' | 'customer') => Promise<boolean>;
  logout: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (shippingAddress: string, city: string, pincode: string, paymentMethod: string, discount?: number, couponCode?: string) => Promise<void>;
  // Order Management Actions
  cancelOrder: (orderId: string) => void;
  requestReturn: (orderId: string, reason: string) => void;
  processReturnAction: (orderId: string, action: 'approve' | 'reject' | 'refund') => void;
  // Review Actions
  addReview: (productId: string, rating: number, comment: string) => void;
  deleteReview: (reviewId: string) => void;
  adminAddReview: (review: Omit<Review, 'id'>) => void;
  getProductReviews: (productId: string) => Review[];
  getAverageRating: (productId: string) => { average: number, count: number };
  // Admin Functions
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (category: CategoryItem) => void;
  deleteCategory: (categoryId: string) => void;
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;
  addBanner: (banner: Banner) => void;
  deleteBanner: (bannerId: string) => void;
  updateBanner: (banner: Banner) => void;
  updateConfig: (config: SiteConfig) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingId?: string) => void;
  generateLabel: (orderId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to safely fetch JSON
const fetchSafe = async (url: string, defaultValue: any) => {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`Backend endpoint ${url} not available (${res.status}). Using fallback.`);
            return defaultValue;
        }
        return await res.json();
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error);
        return defaultValue;
    }
};

const INITIAL_BANNERS: Banner[] = [
    {
        id: '1',
        imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=2000",
        title: "Bring the Spice Home.",
        subtitle: "Authentic Guntur pickles handcrafted with love.",
        link: "/shop",
        buttonText: "Shop Now",
        active: true
    },
    {
        id: '2',
        imageUrl: "https://images.unsplash.com/photo-1589135233689-d538605df0c7?auto=format&fit=crop&q=80&w=2000",
        title: "Mango Mania!",
        subtitle: "The season's best raw mango pickle is back in stock.",
        link: "/shop?cat=pickles&search=mango",
        buttonText: "Grab Yours",
        active: true
    },
    {
        id: '3',
        imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=2000",
        title: "Crunchy Snacks",
        subtitle: "Perfect tea-time companions.",
        link: "/shop?cat=snacks",
        buttonText: "Explore Snacks",
        active: true
    }
];

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  // --- State Initialization ---
  
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // State
  const [user, setUser] = useState<User | null>(() => {
     try {
       const saved = localStorage.getItem('pyp_user');
       return saved ? JSON.parse(saved) : null;
     } catch { return null; }
  });
  
  // Cart remains in localStorage for performance/simplicity
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pyp_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  // Data from API
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [config, setConfig] = useState<SiteConfig>(INITIAL_CONFIG);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);

  // --- API Fetching ---
  const fetchData = async () => {
     try {
         // We use Promise.all to fetch everything, but wrapped in fetchSafe so one failure doesn't kill the app
         const [prodRes, catRes, revRes, ordRes, coupRes, confRes, bannerRes] = await Promise.all([
             fetchSafe('/api/products', []),
             fetchSafe('/api/categories', []),
             fetchSafe('/api/reviews', []),
             fetchSafe('/api/orders', []),
             fetchSafe('/api/coupons', []),
             fetchSafe('/api/config', {}),
             fetchSafe('/api/banners', [])
         ]);
         
         if (prodRes && prodRes.length > 0) setProducts(prodRes);
         if (catRes && catRes.length > 0) setCategories(catRes);
         if (revRes && revRes.length > 0) setReviews(revRes);
         if (ordRes && ordRes.length > 0) setOrders(ordRes);
         if (coupRes && coupRes.length > 0) setCoupons(coupRes);
         if (bannerRes && bannerRes.length > 0) setBanners(bannerRes);
         if (confRes && confRes._id) setConfig(confRes); // Check for DB ID to ensure it's not empty

     } catch (error) {
         console.error("Critical error during data fetch:", error);
         // Fallbacks are already set in initial state
     }
  };

  useEffect(() => {
     fetchData();
  }, []);

  // --- Effects for Local Persistence (Only User & Cart) ---
  useEffect(() => localStorage.setItem('pyp_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('pyp_cart', JSON.stringify(cart)), [cart]);

  // --- Helper to refresh data ---
  const refreshProducts = () => fetchSafe('/api/products', []).then(data => { if(data.length) setProducts(data); });

  // --- User Actions ---
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            setUser(data);
            showNotification(`Welcome back, ${data.name}!`);
            return true;
        } else {
            showNotification(data.message || "Login failed", 'error');
            return false;
        }
    } catch (e) {
        showNotification("Login connection failed", 'error');
        return false;
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'admin' | 'customer'): Promise<boolean> => {
    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, email, password, role })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            setUser(data);
            showNotification(`Account created! Welcome, ${data.name}.`);
            return true;
        } else {
            showNotification(data.message || "Signup failed", 'error');
            return false;
        }
    } catch (e) {
        showNotification("Signup connection failed", 'error');
        return false;
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    showNotification("Logged out successfully");
  };

  // --- Cart Actions ---
  const addToCart = (product: Product) => {
    // Check if product has available stock
    if (product.stockQuantity <= 0) {
        showNotification("Sorry, this item is out of stock!", 'error');
        return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stockQuantity) {
             showNotification(`Only ${product.stockQuantity} items available in stock!`, 'error');
             return prev;
        }
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showNotification(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showNotification("Item removed from cart");
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(productId);
    
    // Check stock limit
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stockQuantity) {
        showNotification(`Only ${product.stockQuantity} items available!`, 'error');
        return;
    }

    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (shippingAddress: string, city: string, pincode: string, paymentMethod: string, discount: number = 0, couponCode?: string) => {
    if (!user) return;
    const totalAmount = cart.reduce((sum, item) => sum + ((item.offerPrice || item.price) * item.quantity), 0);
    const finalAmount = Math.max(0, totalAmount - discount);
    
    // Simulate Shiprocket API
    const shiprocketData = await createShiprocketOrder({});

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: user.id,
      items: [...cart],
      totalAmount,
      discountAmount: discount,
      couponCode,
      finalAmount,
      status: 'processing',
      paymentMethod,
      shippingAddress,
      city,
      pincode,
      date: new Date().toISOString(),
      shiprocketOrderId: shiprocketData.shiprocket_order_id,
      shipmentId: shiprocketData.shipment_id,
      awbCode: shiprocketData.awb_code,
      courierName: shiprocketData.courier_name,
    };

    // Send to Backend
    await fetch('/api/orders', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newOrder)
    });

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    
    // IMPORTANT: Refresh products to update stock quantities on frontend
    await refreshProducts();
    
    showNotification("Order placed & shipment created!");
  };

  // --- Order Management Actions ---

  const cancelOrder = async (orderId: string) => {
      // Optimistic Update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      
      await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ status: 'cancelled' })
      });
      showNotification("Order Cancelled");
  };

  const requestReturn = async (orderId: string, reason: string) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'return_requested', returnReason: reason } : o));
      
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: 'return_requested', returnReason: reason })
      });
      showNotification("Return requested successfully");
  };

  const processReturnAction = async (orderId: string, action: 'approve' | 'reject' | 'refund') => {
      const statusMap: Record<string, Order['status']> = {
          'approve': 'returned',
          'reject': 'return_rejected',
          'refund': 'refunded'
      };
      const newStatus = statusMap[action];

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: newStatus })
      });
      showNotification(`Order marked as ${newStatus}`);
  };

  // --- Review Actions ---
  const addReview = async (productId: string, rating: number, comment: string) => {
      if (!user) return;
      const newReview: Review = {
          id: Date.now().toString(),
          productId,
          userId: user.id,
          userName: user.name,
          rating,
          comment,
          date: new Date().toISOString().split('T')[0]
      };
      setReviews(prev => [newReview, ...prev]);
      
      await fetch('/api/reviews', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(newReview)
      });
      showNotification("Thank you for your review!");
  };

  const deleteReview = async (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
    showNotification("Review deleted");
  };

  const adminAddReview = async (reviewData: Omit<Review, 'id'>) => {
      const newReview: Review = { ...reviewData, id: Date.now().toString() };
      setReviews(prev => [newReview, ...prev]);
      await fetch('/api/reviews', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(newReview)
      });
      showNotification("Review added successfully");
  };

  const getProductReviews = (productId: string) => {
      return reviews.filter(r => r.productId === productId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getAverageRating = (productId: string) => {
      const productReviews = reviews.filter(r => r.productId === productId);
      if (productReviews.length === 0) return { average: 0, count: 0 };
      const sum = productReviews.reduce((acc, curr) => acc + curr.rating, 0);
      return { average: parseFloat((sum / productReviews.length).toFixed(1)), count: productReviews.length };
  };

  // --- Admin Functions ---
  const addProduct = async (product: Product) => {
    setProducts(prev => [...prev, product]);
    await fetch('/api/products', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(product)
    });
    showNotification("Product added successfully");
  };

  const updateProduct = async (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(product)
    });
    showNotification("Product updated successfully");
  };

  const deleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    showNotification("Product deleted");
  };

  const addCategory = async (category: CategoryItem) => {
    setCategories(prev => [...prev, category]);
    await fetch('/api/categories', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(category)
    });
    showNotification(`Category ${category.name} added`);
  };

  const deleteCategory = async (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
    showNotification("Category deleted");
  };

  const addCoupon = async (coupon: Coupon) => {
    setCoupons(prev => [...prev, coupon]);
    await fetch('/api/coupons', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(coupon)
    });
    showNotification(`Coupon ${coupon.code} created`);
  };

  const deleteCoupon = async (couponId: string) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
    await fetch(`/api/coupons/${couponId}`, { method: 'DELETE' });
    showNotification("Coupon deleted");
  };

  const addBanner = async (banner: Banner) => {
    setBanners(prev => [...prev, banner]);
    await fetch('/api/banners', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(banner)
    });
    showNotification("Banner added successfully");
  };

  const deleteBanner = async (bannerId: string) => {
    setBanners(prev => prev.filter(b => b.id !== bannerId));
    await fetch(`/api/banners/${bannerId}`, { method: 'DELETE' });
    showNotification("Banner deleted");
  };

  const updateBanner = async (banner: Banner) => {
    setBanners(prev => prev.map(b => b.id === banner.id ? banner : b));
    await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(banner)
    });
    showNotification("Banner updated");
  };

  const updateConfig = async (newConfig: SiteConfig) => {
    setConfig(newConfig);
    await fetch('/api/config', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newConfig)
    });
    showNotification("Settings saved");
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], trackingId?: string) => {
    const update = { status, ...(trackingId && { trackingId }) };
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...update } : o));
    await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(update)
    });
    showNotification(`Order status updated to ${status}`);
  };

  const generateLabel = async (orderId: string) => {
    const data = await createShiprocketOrder({});
    const update = {
        status: 'processing' as const,
        shiprocketOrderId: data.shiprocket_order_id,
        shipmentId: data.shipment_id,
        awbCode: data.awb_code,
        courierName: data.courier_name
    };

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...update } : o));
    
    await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(update)
    });
    showNotification("AWB Generated & Label Created");
  };

  return (
    <StoreContext.Provider value={{
      user, products, categories, coupons, cart, orders, reviews, banners, config, notification,
      login, signup, logout, addToCart, removeFromCart, updateCartQuantity, clearCart, placeOrder,
      cancelOrder, requestReturn, processReturnAction,
      addReview, deleteReview, adminAddReview, getProductReviews, getAverageRating,
      addProduct, updateProduct, deleteProduct, 
      addCategory, deleteCategory, addCoupon, deleteCoupon,
      addBanner, deleteBanner, updateBanner,
      updateConfig, updateOrderStatus, generateLabel
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};