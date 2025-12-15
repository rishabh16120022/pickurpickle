
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, User, Order, SiteConfig, CategoryItem, Coupon, Review } from '../types';
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
  config: SiteConfig;
  notification: { message: string; type: 'success' | 'error' } | null;
  login: (email: string, role: 'admin' | 'customer') => void;
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
  updateConfig: (config: SiteConfig) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingId?: string) => void;
  generateLabel: (orderId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [config, setConfig] = useState<SiteConfig>(INITIAL_CONFIG);

  // --- API Fetching ---
  const fetchData = async () => {
     try {
         const [prodRes, catRes, revRes, ordRes, coupRes, confRes] = await Promise.all([
             fetch('/api/products').then(r => r.json()),
             fetch('/api/categories').then(r => r.json()),
             fetch('/api/reviews').then(r => r.json()),
             fetch('/api/orders').then(r => r.json()),
             fetch('/api/coupons').then(r => r.json()),
             fetch('/api/config').then(r => r.json())
         ]);
         
         setProducts(prodRes.length ? prodRes : INITIAL_PRODUCTS);
         setCategories(catRes.length ? catRes : INITIAL_CATEGORIES);
         setReviews(revRes.length ? revRes : INITIAL_REVIEWS);
         setOrders(ordRes);
         setCoupons(coupRes.length ? coupRes : INITIAL_COUPONS);
         if(confRes && confRes.id) setConfig(confRes);

     } catch (error) {
         console.error("Failed to fetch data from backend", error);
         // Fallback to constants if backend fails
         setProducts(INITIAL_PRODUCTS);
         setCategories(INITIAL_CATEGORIES);
         setReviews(INITIAL_REVIEWS);
         setCoupons(INITIAL_COUPONS);
     }
  };

  useEffect(() => {
     fetchData();
  }, []);

  // --- Effects for Local Persistence (Only User & Cart) ---
  useEffect(() => localStorage.setItem('pyp_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('pyp_cart', JSON.stringify(cart)), [cart]);

  // --- Helper to refresh data ---
  const refreshOrders = () => fetch('/api/orders').then(r => r.json()).then(setOrders);
  const refreshProducts = () => fetch('/api/products').then(r => r.json()).then(setProducts);

  // --- User Actions ---
  const login = async (email: string, role: 'admin' | 'customer') => {
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, role })
        });
        const userData = await res.json();
        setUser(userData);
        showNotification(`Welcome back, ${userData.name}!`);
    } catch (e) {
        showNotification("Login failed", 'error');
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
      user, products, categories, coupons, cart, orders, reviews, config, notification,
      login, logout, addToCart, removeFromCart, updateCartQuantity, clearCart, placeOrder,
      cancelOrder, requestReturn, processReturnAction,
      addReview, deleteReview, adminAddReview, getProductReviews, getAverageRating,
      addProduct, updateProduct, deleteProduct, 
      addCategory, deleteCategory, addCoupon, deleteCoupon,
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
