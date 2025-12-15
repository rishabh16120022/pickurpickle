
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ArrowRight, Sparkles, Award, ShieldCheck, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Home = () => {
  const { products, categories, addToCart, config, banners, getAverageRating } = useStore();
  const navigate = useNavigate();
  const featuredProducts = [...products].filter(p => p.isFeatured).slice(0, 4);

  // Filter only active banners
  const activeBanners = banners.filter(b => b.active);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % activeBanners.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);

  return (
    <div className="overflow-x-hidden">
      
      {/* 1. Dynamic Hero Slider */}
      <section className="relative h-[80vh] md:h-[90vh] bg-bg overflow-hidden group">
          
          {activeBanners.length > 0 ? (
            activeBanners.map((banner, index) => (
              <div 
                key={banner.id} 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                 {/* Background Image with Overlay */}
                 <div className="absolute inset-0">
                    <img 
                        src={banner.imageUrl} 
                        alt={banner.title} 
                        className={`w-full h-full object-cover transition-transform duration-[10000ms] ${index === currentSlide ? 'scale-105' : 'scale-100'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                 </div>
                 
                 {/* Content */}
                 <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
                    <div className="max-w-2xl text-white">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-md mb-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
                            <Sparkles size={14} className="text-accent" />
                            <span className="text-xs font-bold tracking-widest uppercase">Special Offer</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-6 animate-in slide-in-from-bottom-8 fade-in duration-1000 text-shadow-lg">
                            {banner.title}
                        </h1>
                        
                        <p className="text-lg md:text-xl text-gray-200 mb-10 font-light leading-relaxed max-w-lg animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-100">
                            {banner.subtitle}
                        </p>
                        
                        <Link 
                            to={banner.link} 
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-light text-white rounded-full font-bold tracking-wide transition-all hover:scale-105 shadow-lg shadow-primary/30 animate-in slide-in-from-bottom-16 fade-in duration-1000 delay-200"
                        >
                            {banner.buttonText || "Shop Collection"} <ArrowRight size={18} />
                        </Link>
                    </div>
                 </div>
              </div>
            ))
          ) : (
             // Fallback if no active banners
             <div className="h-full flex items-center justify-center bg-gray-900 text-white">
                 <p>No banners configured.</p>
             </div>
          )}

          {/* Navigation Arrows */}
          {activeBanners.length > 1 && (
              <>
                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition opacity-0 group-hover:opacity-100">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition opacity-0 group-hover:opacity-100">
                    <ChevronRight size={24} />
                </button>
                
                {/* Dots */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {activeBanners.map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setCurrentSlide(i)}
                            className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-accent w-8' : 'bg-white/50 hover:bg-white'}`}
                        />
                    ))}
                </div>
              </>
          )}

          {/* Floating Decorative Elements */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute top-20 right-[10%] w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-20 left-[20%] w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          </div>
      </section>

      {/* 2. Visual Categories - "The Pantry" */}
      <section className="py-20 bg-bg px-6">
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                  <span className="text-secondary text-sm font-bold tracking-widest uppercase">The Royal Pantry</span>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mt-3">Curated Collections</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {categories.map((cat, idx) => (
                      <Link to={`/shop?cat=${cat.slug}`} key={cat.id} className="group relative h-[450px] overflow-hidden rounded-2xl cursor-pointer shadow-xl">
                          <img 
                            src={cat.image} 
                            alt={cat.name} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 opacity-90 transition-opacity"></div>
                          
                          <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                              <h3 className="text-3xl font-serif font-bold text-white mb-2 italic">{cat.name}</h3>
                              <p className="text-gray-300 text-sm line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity delay-100 duration-500">{cat.description}</p>
                              <div className="inline-flex items-center gap-2 text-accent text-sm font-bold uppercase tracking-widest border-b border-accent pb-1">
                                  Shop {cat.name}
                              </div>
                          </div>
                      </Link>
                  ))}
              </div>
          </div>
      </section>

      {/* 3. Featured Bestsellers - "Uniquely Styled Cards" */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-text-main">Season Favorites</h2>
                    <p className="text-text-muted mt-2">Loved by thousands of families across India.</p>
                </div>
                <Link to="/shop" className="hidden md:flex items-center gap-2 text-primary font-bold hover:translate-x-1 transition-transform">
                    View All Products <ArrowRight size={20} />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => {
                    const { average } = getAverageRating(product.id);
                    return (
                    <div key={product.id} className="group bg-bg-paper rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                        <div className="relative aspect-[4/5] overflow-hidden bg-bg-subtle">
                             <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                             
                             {/* Floating Badges */}
                             {product.isFeatured && (
                                 <div className="absolute top-3 left-3 bg-accent text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                     Bestseller
                                 </div>
                             )}
                             {/* Rating Badge */}
                             <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <Star size={10} className="text-accent fill-accent" />
                                <span className="text-[10px] font-bold">{average || 'New'}</span>
                             </div>

                             {/* Quick Add Button */}
                             <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                                className="absolute bottom-4 right-4 w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center shadow-lg translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white"
                             >
                                <ArrowRight size={18} />
                             </button>
                        </div>
                        
                        <div className="p-5 text-center">
                             <h3 className="text-lg font-serif font-bold text-text-main mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                             <p className="text-xs text-text-muted mb-3 uppercase tracking-wider">{product.category}</p>
                             <div className="flex items-center justify-center gap-3">
                                <span className="text-xl font-bold text-primary">₹{product.offerPrice || product.price}</span>
                                {product.offerPrice && <span className="text-sm text-gray-400 line-through">₹{product.price}</span>}
                             </div>
                        </div>
                    </div>
                )})}
            </div>
            
            <div className="mt-12 text-center md:hidden">
                <Link to="/shop" className="inline-block px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg">View All Products</Link>
            </div>
        </div>
      </section>

      {/* 4. Story / Values Section */}
      <section className="py-24 bg-secondary text-white relative overflow-hidden">
          {/* Background Texture */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-accent/20 rounded-full blur-[100px]"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
             <div className="order-2 md:order-1">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-6 mt-12">
                        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                            <Award className="text-accent mb-4" size={32} />
                            <h4 className="text-xl font-serif font-bold mb-2">Authentic</h4>
                            <p className="text-sm text-gray-300">Made in Guntur using traditional family recipes.</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                            <ShieldCheck className="text-accent mb-4" size={32} />
                            <h4 className="text-xl font-serif font-bold mb-2">100% Natural</h4>
                            <p className="text-sm text-gray-300">Zero preservatives, artificial colors, or additives.</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                            <Truck className="text-accent mb-4" size={32} />
                            <h4 className="text-xl font-serif font-bold mb-2">Fresh</h4>
                            <p className="text-sm text-gray-300">Small batch production to ensure peak freshness.</p>
                        </div>
                         {/* Image */}
                         <div className="rounded-2xl overflow-hidden h-48 relative">
                             <img src="https://images.unsplash.com/photo-1623348128373-c60331003668?auto=format&fit=crop&q=80&w=600" alt="Ingredients" className="object-cover w-full h-full" />
                         </div>
                    </div>
                 </div>
             </div>
             
             <div className="order-1 md:order-2">
                 <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                     More than just <br/> a pickle jar.
                 </h2>
                 <p className="text-xl text-gray-300 mb-8 leading-relaxed font-light">
                     It started in a small kitchen in Guntur, where the aroma of roasting mustard seeds filled the air. Today, we bring that same authentic aroma to your dining table.
                 </p>
                 <div className="flex gap-8">
                     <div>
                         <h4 className="text-4xl font-bold text-accent mb-1 font-serif">50+</h4>
                         <p className="text-white/60 text-sm">Varieties</p>
                     </div>
                     <div>
                         <h4 className="text-4xl font-bold text-accent mb-1 font-serif">20k+</h4>
                         <p className="text-white/60 text-sm">Happy Families</p>
                     </div>
                 </div>
             </div>
          </div>
      </section>

      {/* 5. Newsletter / CTA */}
      <section className="py-24 bg-bg px-6">
          <div className="max-w-4xl mx-auto text-center bg-white rounded-3xl p-12 shadow-2xl relative overflow-hidden border border-primary/10">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-secondary"></div>
              
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Join the Spice Club</h2>
              <p className="text-text-muted mb-8 max-w-lg mx-auto">Get exclusive access to seasonal launches, secret grandma recipes, and flat 15% off your first order.</p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                  <input type="email" placeholder="Enter your email address" className="flex-1 px-6 py-3 rounded-full border border-gray-200 focus:border-primary outline-none bg-bg-subtle" />
                  <button className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-dark transition shadow-lg">Subscribe</button>
              </div>
          </div>
      </section>
    </div>
  );
};

export default Home;
