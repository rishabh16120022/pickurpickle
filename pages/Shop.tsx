
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Filter, Star, Sparkles, X, SlidersHorizontal, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { getRecipeSuggestion } from '../services/geminiService';

const Shop = () => {
  const { products, categories, addToCart, getAverageRating } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL Params
  const urlCategory = searchParams.get('cat');
  const searchTerm = searchParams.get('search') || '';

  // Local Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({ min: 0, max: 2000 });
  
  // UI States
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<string>('');
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  // Initialize categories from URL if present
  useEffect(() => {
    if (urlCategory && urlCategory !== 'all') {
        setSelectedCategories([urlCategory]);
    } else {
        setSelectedCategories([]);
    }
  }, [urlCategory]);

  // Derived Data
  const allWeights = useMemo(() => Array.from(new Set(products.map(p => p.weight).filter(Boolean))) as string[], [products]);
  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price)), [products]);

  // Filter Logic
  const filteredProducts = products.filter(p => {
      // Search
      const matchesSearch = searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      
      // Category
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      
      // Weight
      const matchesWeight = selectedWeights.length === 0 || (p.weight && selectedWeights.includes(p.weight));
      
      // Price
      const matchesPrice = (p.offerPrice || p.price) >= priceRange.min && (p.offerPrice || p.price) <= priceRange.max;

      return matchesSearch && matchesCategory && matchesWeight && matchesPrice;
  });

  const handleRecipeAsk = async (productName: string) => {
    setModalProduct(productName);
    setLoadingRecipe(true);
    setRecipe('');
    const result = await getRecipeSuggestion(productName);
    setRecipe(result);
    setLoadingRecipe(false);
  };

  const toggleCategory = (slug: string) => {
      setSelectedCategories(prev => 
        prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
      );
  };

  const toggleWeight = (weight: string) => {
      setSelectedWeights(prev => 
        prev.includes(weight) ? prev.filter(w => w !== weight) : [...prev, weight]
      );
  };

  const clearFilters = () => {
      setSelectedCategories([]);
      setSelectedWeights([]);
      setPriceRange({ min: 0, max: 2000 });
      setSearchParams({});
  };

  const FilterSidebar = ({ mobile = false }: { mobile?: boolean }) => (
      <div className={`space-y-8 ${mobile ? 'p-6' : ''}`}>
          <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-xl text-gray-800 flex items-center gap-2">
                  <SlidersHorizontal size={20} /> Filters
              </h3>
              {(selectedCategories.length > 0 || selectedWeights.length > 0 || priceRange.min > 0 || priceRange.max < 2000) && (
                  <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider">Clear All</button>
              )}
          </div>

          {/* Categories */}
          <div>
              <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Category</h4>
              <div className="space-y-2">
                  {categories.map(cat => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${selectedCategories.includes(cat.slug) ? 'bg-primary border-primary text-white' : 'border-gray-300 group-hover:border-primary'}`}>
                              {selectedCategories.includes(cat.slug) && <Check size={14} />}
                          </div>
                          <input 
                              type="checkbox" 
                              className="hidden"
                              checked={selectedCategories.includes(cat.slug)} 
                              onChange={() => toggleCategory(cat.slug)}
                          />
                          <span className={`text-sm ${selectedCategories.includes(cat.slug) ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{cat.name}</span>
                      </label>
                  ))}
              </div>
          </div>

          {/* Price Range */}
          <div>
              <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Price Range</h4>
              <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 font-medium">
                      <span>₹{priceRange.min}</span>
                      <span>₹{priceRange.max}</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full">
                      <div className="absolute h-full bg-primary rounded-full opacity-50" style={{ left: '0%', right: '0%' }}></div>
                  </div>
                  <div className="flex gap-4">
                      <div className="flex-1">
                          <label className="text-xs text-gray-400">Min</label>
                          <input 
                            type="number" 
                            value={priceRange.min} 
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-primary"
                          />
                      </div>
                      <div className="flex-1">
                           <label className="text-xs text-gray-400">Max</label>
                           <input 
                            type="number" 
                            value={priceRange.max} 
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-primary"
                          />
                      </div>
                  </div>
              </div>
          </div>

          {/* Weights */}
          {allWeights.length > 0 && (
              <div>
                  <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Net Weight</h4>
                  <div className="flex flex-wrap gap-2">
                      {allWeights.map(w => (
                          <button 
                            key={w}
                            onClick={() => toggleWeight(w)}
                            className={`px-3 py-1 text-xs border rounded-full transition ${selectedWeights.includes(w) ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                          >
                              {w}
                          </button>
                      ))}
                  </div>
              </div>
          )}
      </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-100 pb-8">
          <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-2">
                {searchTerm ? `Results for "${searchTerm}"` : 'Shop All'}
              </h1>
              <p className="text-text-muted">Showing {filteredProducts.length} items</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-4">
               {/* Mobile Filter Toggle */}
               <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold shadow-sm"
               >
                   <SlidersHorizontal size={16} /> Filters
               </button>

               <div className="flex items-center gap-2 text-sm text-gray-500">
                   <span>Sort by:</span>
                   <select className="bg-transparent font-bold text-gray-800 outline-none cursor-pointer">
                       <option>Featured</option>
                       <option>Price: Low to High</option>
                       <option>Price: High to Low</option>
                       <option>Newest First</option>
                   </select>
               </div>
          </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                  <FilterSidebar />
              </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
              {filteredProducts.length === 0 ? (
                  <div className="text-center py-24 bg-gray-50 rounded-3xl">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 shadow-sm">
                          <Filter size={32} />
                      </div>
                      <p className="text-2xl font-serif font-bold text-text-main">No products found</p>
                      <p className="text-text-muted mt-2">Try adjusting your filters.</p>
                      <button onClick={clearFilters} className="mt-6 text-primary font-bold hover:underline">Clear Filters</button>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => {
                        const { average, count } = getAverageRating(product.id);
                        const isOutOfStock = product.stockQuantity <= 0;
                        const isLowStock = product.stockQuantity > 0 && product.stockQuantity < 5;

                        return (
                        <div key={product.id} className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col relative cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                            
                            {/* Image Area */}
                            <div className="relative aspect-square overflow-hidden bg-bg-subtle p-4">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                                
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                        <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Out of Stock</span>
                                    </div>
                                )}
                                {product.offerPrice && (
                                    <div className="absolute top-3 left-3 bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                                        {(Math.round(((product.price - product.offerPrice) / product.price) * 100))}% Off
                                    </div>
                                )}
                                
                                {/* Ask AI Button */}
                                <button 
                                        onClick={(e) => {e.preventDefault(); e.stopPropagation(); handleRecipeAsk(product.name)}}
                                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow-md text-accent hover:text-primary transition-colors z-10"
                                        title="Get Recipe Ideas"
                                    >
                                        <Sparkles size={18} />
                                </button>
                            </div>
                            
                            {/* Content */}
                            <div className="p-6 flex flex-col flex-grow text-center">
                                <div className="text-[10px] text-accent font-bold uppercase tracking-widest mb-2">
                                    {product.category} {product.weight && `• ${product.weight}`}
                                </div>
                                <h3 className="text-xl font-serif font-bold text-text-main mb-2 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                
                                {/* Ratings */}
                                <div className="flex items-center justify-center gap-1 mb-3">
                                    <Star size={14} fill={average >= 1 ? "currentColor" : "none"} className="text-accent" />
                                    <span className="text-xs font-bold text-gray-700">{average || 'New'}</span>
                                    <span className="text-xs text-gray-400">({count})</span>
                                </div>

                                {isLowStock && (
                                    <div className="text-xs font-bold text-orange-600 mb-2 animate-pulse">
                                        Only {product.stockQuantity} items left!
                                    </div>
                                )}
                                
                                <div className="mt-auto pt-2">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        {product.offerPrice ? (
                                            <>
                                                <span className="text-2xl font-bold text-primary">₹{product.offerPrice}</span>
                                                <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                                            </>
                                        ) : (
                                            <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                                        )}
                                    </div>
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                        disabled={isOutOfStock}
                                        className={`w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all transform active:scale-95 ${isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'}`}
                                    >
                                        {isOutOfStock ? 'Notify Me' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )})}
                  </div>
              )}
          </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)}></div>
              <div className="relative bg-white w-80 max-w-[80vw] h-full shadow-2xl overflow-y-auto animate-in slide-in-from-left">
                   <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                       <h2 className="font-bold text-lg">Filters</h2>
                       <button onClick={() => setIsMobileFilterOpen(false)}><X size={24} /></button>
                   </div>
                   <FilterSidebar mobile />
                   <div className="p-6 sticky bottom-0 bg-white border-t">
                       <button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-primary text-white font-bold py-3 rounded-xl">Apply Filters</button>
                   </div>
              </div>
          </div>
      )}

      {/* AI Recipe Modal */}
      {modalProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full relative shadow-2xl overflow-hidden border border-white/20">
                {/* Header */}
                <div className="bg-secondary p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-full"><Sparkles size={20} className="text-accent" /></div>
                        <div>
                            <h3 className="text-lg font-serif font-bold">Chef AI Suggests</h3>
                            <p className="text-xs text-white/70">Pairings for {modalProduct}</p>
                        </div>
                    </div>
                    <button onClick={() => setModalProduct(null)} className="hover:bg-white/10 p-2 rounded-full transition"><X size={20} /></button>
                </div>

                {/* Content */}
                <div className="p-8 bg-bg">
                    {loadingRecipe ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
                            <span className="text-sm font-bold text-primary animate-pulse">Consulting Grandma's Recipes...</span>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none text-gray-700 bg-white p-6 rounded-xl border border-gray-100 shadow-sm leading-relaxed whitespace-pre-line font-medium">
                            {recipe}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
