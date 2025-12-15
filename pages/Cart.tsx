
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart } = useStore();

  const total = cart.reduce((sum, item) => sum + ((item.offerPrice || item.price) * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalOriginalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = totalOriginalPrice - total;

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-bg m-4">
        <div className="w-48 h-48 mb-6 opacity-80">
             <img src="https://img.icons8.com/clouds/200/shopping-cart.png" alt="Empty Cart" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">Your cart is empty!</h2>
        <p className="text-text-muted mb-8">It looks like you haven't added any spices yet.</p>
        <Link to="/shop" className="bg-primary text-white px-10 py-3 rounded-full font-bold shadow-lg hover:bg-primary-dark transition hover:scale-105">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-text-main mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Cart Items */}
        <div className="flex-grow space-y-4">
            {cart.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition">
                    <div className="w-32 h-32 flex-shrink-0 bg-bg-subtle rounded-xl p-2">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-serif font-bold text-lg text-text-main mb-1">{item.name}</h3>
                                    <p className="text-xs text-text-muted uppercase tracking-wider">{item.category}</p>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-xl text-primary">₹{item.offerPrice || item.price}</span>
                                    {item.offerPrice && <div className="text-sm text-gray-400 line-through">₹{item.price}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
                                <button 
                                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-primary transition disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                <button 
                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-primary transition"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
                            >
                                <Trash2 size={16} /> Remove
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Right Side: Order Summary */}
        <div className="w-full lg:w-[400px]">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-primary/10 sticky top-24">
                <h2 className="font-serif font-bold text-xl text-text-main mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({totalItems} items)</span>
                        <span>₹{totalOriginalPrice}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Discount</span>
                        <span className="text-green-600">- ₹{totalDiscount}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="text-green-600">FREE</span>
                    </div>
                    <div className="h-px bg-gray-100 my-4"></div>
                    <div className="flex justify-between font-bold text-xl text-primary">
                        <span>Total</span>
                        <span>₹{total}</span>
                    </div>
                    <p className="text-xs text-gray-400 text-right">Inclusive of all taxes</p>
                </div>
                
                <Link to="/checkout" className="w-full block bg-primary text-white text-center py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition transform hover:-translate-y-1">
                    Proceed to Checkout
                </Link>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <ShieldCheck size={16} />
                    <span>Secure Checkout • 100% Authentic</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
