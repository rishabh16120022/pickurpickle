
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Star, ShoppingCart, User, Plus, Minus, ArrowLeft, Send } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, user, addToCart, addReview, getProductReviews, getAverageRating } = useStore();
    
    const product = products.find(p => p.id === id);
    const reviews = id ? getProductReviews(id) : [];
    const { average, count } = id ? getAverageRating(id) : { average: 0, count: 0 };

    const [qty, setQty] = useState(1);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('reviews');

    if (!product) {
        return <div className="p-10 text-center">Product not found. <button onClick={() => navigate('/shop')} className="text-primary underline">Go Back</button></div>;
    }
    
    // Determine stock status for display
    const isOutOfStock = product.stockQuantity <= 0;
    const isLowStock = product.stockQuantity > 0 && product.stockQuantity < 5;

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (id && comment.trim()) {
            addReview(id, rating, comment);
            setComment('');
            setRating(5);
        }
    };

    const handleAddToCart = () => {
        // Prevent adding more than available
        if (isOutOfStock) return;
        
        // Loop is simpler than passing qty to addToCart if context doesn't support bulk add directly yet,
        // but StoreContext's addToCart handles "add 1". 
        // We will call it loop times, or better yet, just once if we update context to accept qty.
        // Given current context implementation:
        for(let i=0; i<qty; i++) {
            // Check handled in StoreContext but good to check here too
            if (i >= product.stockQuantity) break;
            addToCart(product);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition">
                <ArrowLeft size={20} /> Back
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                {/* Image Section */}
                <div className="bg-bg-subtle rounded-3xl overflow-hidden shadow-inner p-8 flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full max-w-md object-contain mix-blend-multiply drop-shadow-xl hover:scale-105 transition-transform duration-500" />
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-accent/20 text-accent-darker text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">{product.category}</span>
                        {!isOutOfStock ? (
                            <span className="text-green-600 text-xs font-bold flex items-center gap-1">● In Stock</span>
                        ) : (
                            <span className="text-red-600 text-xs font-bold flex items-center gap-1">● Out of Stock</span>
                        )}
                        {isLowStock && <span className="text-orange-600 text-xs font-bold animate-pulse">● Only {product.stockQuantity} Left!</span>}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-main mb-4 leading-tight">{product.name}</h1>
                    
                    <div className="flex items-center gap-4 mb-6">
                         <div className="flex items-center text-accent">
                             {[1, 2, 3, 4, 5].map((s) => (
                                 <Star key={s} size={20} fill={s <= Math.round(average) ? "currentColor" : "none"} className={s <= Math.round(average) ? "text-accent" : "text-gray-300"} />
                             ))}
                         </div>
                         <span className="text-gray-500 text-sm font-medium">({count} reviews)</span>
                    </div>

                    <div className="flex items-end gap-4 mb-8">
                        <span className="text-4xl font-bold text-primary">₹{product.offerPrice || product.price}</span>
                        {product.offerPrice && <span className="text-xl text-gray-400 line-through mb-1">₹{product.price}</span>}
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-8 text-lg">{product.description}</p>
                    
                    {!isOutOfStock && (
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-sm font-bold text-gray-700">Quantity:</span>
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
                                <button 
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="w-8 h-8 rounded bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-primary transition"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="w-8 text-center font-bold text-sm">{qty}</span>
                                <button 
                                    onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))}
                                    className="w-8 h-8 rounded bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-primary transition"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <span className="text-xs text-gray-400">Max: {product.stockQuantity}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`flex-1 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition transform hover:-translate-y-1 ${isOutOfStock ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none' : 'bg-primary text-white hover:bg-primary-dark shadow-primary/30'}`}
                        >
                            <ShoppingCart size={20} /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="border-t border-gray-100 pt-12">
                <div className="flex gap-8 border-b border-gray-200 mb-8">
                    <button 
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-4 text-lg font-bold transition ${activeTab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Customer Reviews ({count})
                    </button>
                    <button 
                        onClick={() => setActiveTab('desc')}
                        className={`pb-4 text-lg font-bold transition ${activeTab === 'desc' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Product Details
                    </button>
                </div>

                {activeTab === 'desc' && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-serif font-bold text-2xl mb-4">Authentic Taste</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Our {product.name} is made using traditional methods passed down through generations. 
                            We source the finest ingredients directly from farmers to ensure the authentic taste and aroma.
                        </p>
                        <h3 className="font-serif font-bold text-2xl mb-4 mt-8">Ingredients</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Natural spices, oil, salt, and the main ingredient of love. No artificial preservatives.
                        </p>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Reviews List */}
                        <div className="md:col-span-2 space-y-6">
                            {reviews.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl">
                                    <Star className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                                </div>
                            ) : (
                                reviews.map(review => (
                                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition hover:shadow-md">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-4">
                                                {/* Profile Picture */}
                                                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm">
                                                    {review.userImage ? (
                                                        <img src={review.userImage} alt={review.userName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                                                            {review.userName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-lg leading-tight">{review.userName}</h4>
                                                    <div className="flex items-center text-accent mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                                                        ))}
                                                        <span className="ml-2 text-xs text-gray-400 font-medium">{review.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pl-16">
                                            <p className="text-gray-600 leading-relaxed text-sm">"{review.comment}"</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Review Form */}
                        <div className="md:col-span-1">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary/10 sticky top-24">
                                <h3 className="font-serif font-bold text-xl mb-4">Write a Review</h3>
                                {user ? (
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button 
                                                        key={star} 
                                                        type="button"
                                                        onClick={() => setRating(star)}
                                                        className="transition-transform hover:scale-110 focus:outline-none"
                                                    >
                                                        <Star size={28} fill={star <= rating ? "#fbbf24" : "none"} className={star <= rating ? "text-accent" : "text-gray-300"} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
                                            <textarea 
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="What did you like or dislike?"
                                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none h-32"
                                                required
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition shadow-lg flex items-center justify-center gap-2">
                                            <Send size={16} /> Submit Review
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 mb-4 text-sm">Please login to write a review.</p>
                                        <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">Login Now</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
