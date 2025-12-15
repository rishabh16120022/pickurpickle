
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, SiteConfig, CategoryItem, Coupon, Review, Banner } from '../types';
import { 
  LayoutDashboard, ShoppingBag, Package, Settings, Tags, Percent, MessageSquare,
  Plus, Edit, Trash2, Save, X, Truck, FileText, ExternalLink, RefreshCcw, Check, XCircle, Star, AlertTriangle, Image as ImageIcon, Eye, EyeOff
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { 
    products, categories, coupons, orders, reviews, banners, config, 
    addProduct, updateProduct, deleteProduct, 
    addCategory, deleteCategory, addCoupon, deleteCoupon,
    addBanner, deleteBanner, updateBanner,
    updateConfig, updateOrderStatus, generateLabel, processReturnAction,
    deleteReview, adminAddReview
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'coupons' | 'orders' | 'reviews' | 'settings' | 'banners'>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Stats for Overview
  const totalRevenue = orders.reduce((acc, order) => acc + (order.finalAmount || order.totalAmount), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  
  const chartData = categories.map(cat => ({
    name: cat.name,
    sales: orders.flatMap(o => o.items).filter(i => i.category === cat.slug).reduce((acc, i) => acc + i.quantity, 0)
  }));

  const ProductForm = ({ initialData, onClose }: { initialData?: Product, onClose: () => void }) => {
      const [formData, setFormData] = useState<Partial<Product>>(initialData || {
          category: categories[0]?.slug || 'pickles',
          inStock: true,
          stockQuantity: 10,
          isFeatured: false
      });

      const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const product: Product = {
              id: initialData?.id || Date.now().toString(),
              name: formData.name!,
              description: formData.description!,
              price: Number(formData.price),
              offerPrice: formData.offerPrice ? Number(formData.offerPrice) : undefined,
              image: formData.image || 'https://picsum.photos/400',
              category: formData.category!,
              inStock: formData.inStock!,
              stockQuantity: Number(formData.stockQuantity || 0),
              isFeatured: formData.isFeatured!
          };

          if (initialData) updateProduct(product);
          else addProduct(product);
          onClose();
      };

      return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">{initialData ? 'Edit Product' : 'Add New Product'}</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <input type="text" placeholder="Product Name" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" />
                      <textarea placeholder="Description" required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded" />
                      <div className="grid grid-cols-2 gap-4">
                          <input type="number" placeholder="Price" required value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border p-2 rounded" />
                          <input type="number" placeholder="Offer Price (Optional)" value={formData.offerPrice || ''} onChange={e => setFormData({...formData, offerPrice: e.target.value ? Number(e.target.value) : undefined})} className="w-full border p-2 rounded" />
                      </div>
                      <input type="url" placeholder="Image URL" required value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border p-2 rounded" />
                      
                      <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="border p-2 rounded w-full">
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                             <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity</label>
                             <input type="number" required min="0" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} className="border p-2 rounded w-full" />
                        </div>
                      </div>

                      <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                              <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} /> Active for Sale
                          </label>
                          <label className="flex items-center gap-2">
                              <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} /> Featured
                          </label>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Product</button>
                      </div>
                  </form>
              </div>
          </div>
      );
  };
  
  const CategoryForm = ({ onClose }: { onClose: () => void }) => {
      const [formData, setFormData] = useState<Partial<CategoryItem>>({});

      const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const category: CategoryItem = {
              id: Date.now().toString(),
              name: formData.name!,
              slug: formData.slug || formData.name!.toLowerCase().replace(/\s+/g, '-'),
              description: formData.description,
              image: formData.image || 'https://picsum.photos/400'
          };
          addCategory(category);
          onClose();
      };

      return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Add New Category</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <input type="text" placeholder="Category Name" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" />
                      <input type="text" placeholder="Slug (e.g., mango-pickles)" required value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full border p-2 rounded" />
                      <input type="text" placeholder="Description" required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded" />
                      <input type="url" placeholder="Image URL" value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border p-2 rounded" />
                      <div className="flex justify-end gap-2 mt-4">
                          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Category</button>
                      </div>
                  </form>
              </div>
          </div>
      );
  };

  const CouponForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState<Partial<Coupon>>({ isActive: true });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const coupon: Coupon = {
            id: Date.now().toString(),
            code: formData.code!.toUpperCase(),
            discountPercent: Number(formData.discountPercent),
            description: formData.description!,
            isActive: formData.isActive!
        };
        addCoupon(coupon);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Create New Coupon</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Coupon Code (e.g., NEW20)" required value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full border p-2 rounded uppercase" />
                    <div className="flex items-center gap-2">
                        <input type="number" placeholder="Discount %" required min="1" max="100" value={formData.discountPercent || ''} onChange={e => setFormData({...formData, discountPercent: Number(e.target.value)})} className="w-full border p-2 rounded" />
                        <span className="font-bold">%</span>
                    </div>
                    <input type="text" placeholder="Description" required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded" />
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} /> Active
                    </label>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Coupon</button>
                    </div>
                </form>
            </div>
        </div>
    );
  };

  const ReviewForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState<Partial<Review>>({
        rating: 5,
        date: new Date().toISOString().split('T')[0],
        productId: products[0]?.id
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.productId || !formData.userName || !formData.comment) return;
        
        adminAddReview({
            productId: formData.productId,
            userId: `admin-gen-${Date.now()}`,
            userName: formData.userName,
            userImage: formData.userImage,
            rating: Number(formData.rating),
            comment: formData.comment,
            date: formData.date || new Date().toISOString().split('T')[0]
        });
        onClose();
    };

    const presetImages = [
        'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1621592484082-2d05b1290d7a?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1586083702768-190ae093d34d?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1615813967515-e1838c1c5116?auto=format&fit=crop&w=150&q=80',
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Add Custom Review</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Product</label>
                        <select 
                            value={formData.productId} 
                            onChange={e => setFormData({...formData, productId: e.target.value})} 
                            className="w-full border p-2 rounded"
                        >
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Reviewer Name</label>
                        <input type="text" placeholder="e.g. Ramesh Kumar" required value={formData.userName || ''} onChange={e => setFormData({...formData, userName: e.target.value})} className="w-full border p-2 rounded" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Reviewer Image (Optional)</label>
                        <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                             {presetImages.map((img, i) => (
                                 <img 
                                    key={i} 
                                    src={img} 
                                    className={`w-10 h-10 rounded-full cursor-pointer border-2 ${formData.userImage === img ? 'border-blue-600' : 'border-transparent'}`}
                                    onClick={() => setFormData({...formData, userImage: img})}
                                    alt="preset"
                                 />
                             ))}
                        </div>
                        <input type="text" placeholder="Or paste image URL" value={formData.userImage || ''} onChange={e => setFormData({...formData, userImage: e.target.value})} className="w-full border p-2 rounded text-sm" />
                    </div>

                    <div className="flex gap-4">
                         <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Rating</label>
                            <select value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="w-full border p-2 rounded">
                                {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                            </select>
                         </div>
                         <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                            <input type="date" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border p-2 rounded" />
                         </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Comment</label>
                        <textarea placeholder="Review content..." required value={formData.comment || ''} onChange={e => setFormData({...formData, comment: e.target.value})} className="w-full border p-2 rounded h-24"></textarea>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Review</button>
                    </div>
                </form>
            </div>
        </div>
    );
  };

  const BannerForm = ({ initialData, onClose }: { initialData?: Banner, onClose: () => void }) => {
    const [formData, setFormData] = useState<Partial<Banner>>(initialData || {
        active: true,
        buttonText: "Shop Collection",
        link: "/shop"
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const banner: Banner = {
            id: initialData?.id || Date.now().toString(),
            imageUrl: formData.imageUrl!,
            title: formData.title!,
            subtitle: formData.subtitle!,
            link: formData.link!,
            buttonText: formData.buttonText!,
            active: formData.active!
        };

        if(initialData) updateBanner(banner);
        else addBanner(banner);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
             <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">{initialData ? 'Edit Banner' : 'Add New Banner'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Title" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-2 rounded" />
                    <input type="text" placeholder="Subtitle" required value={formData.subtitle || ''} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full border p-2 rounded" />
                    <input type="url" placeholder="Image URL (High Quality)" required value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full border p-2 rounded" />
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Redirect Link</label>
                        <input type="text" placeholder="e.g. /shop?cat=pickles" required value={formData.link || ''} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full border p-2 rounded" />
                        <p className="text-xs text-gray-500 mt-1">Tip: Use '/shop?cat=slug' or '/product/id'</p>
                    </div>

                    <input type="text" placeholder="Button Text" required value={formData.buttonText || ''} onChange={e => setFormData({...formData, buttonText: e.target.value})} className="w-full border p-2 rounded" />

                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} /> Active
                    </label>

                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Banner</button>
                    </div>
                </form>
             </div>
        </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-blue-600">Admin Panel</h2>
            </div>
            <nav className="p-4 space-y-2">
                <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <LayoutDashboard size={20} /> Overview
                </button>
                <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'products' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <ShoppingBag size={20} /> Products
                </button>
                <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'categories' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Tags size={20} /> Categories
                </button>
                <button onClick={() => setActiveTab('banners')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'banners' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <ImageIcon size={20} /> Banners
                </button>
                <button onClick={() => setActiveTab('coupons')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'coupons' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Percent size={20} /> Coupons
                </button>
                <button onClick={() => setActiveTab('reviews')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'reviews' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <MessageSquare size={20} /> Reviews
                </button>
                <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Package size={20} /> Orders <span className="ml-auto bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{pendingOrders + processingOrders}</span>
                </button>
                <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Settings size={20} /> Settings
                </button>
            </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto h-screen">
            {activeTab === 'overview' && (
                <div className="space-y-6">
                     <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                            <p className="text-3xl font-bold text-gray-800 mt-2">₹{totalRevenue}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{orders.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-medium">Shipments Pending</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{processingOrders}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                        <h3 className="text-lg font-bold mb-4">Sales by Category</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sales" fill="#2874f0" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                        <button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                            <Plus size={20} /> Add Product
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-medium text-gray-500">Image</th>
                                    <th className="p-4 font-medium text-gray-500">Name</th>
                                    <th className="p-4 font-medium text-gray-500">Price</th>
                                    <th className="p-4 font-medium text-gray-500">Category</th>
                                    <th className="p-4 font-medium text-gray-500">Stock</th>
                                    <th className="p-4 font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4"><img src={product.image} alt="" className="w-10 h-10 rounded object-cover" /></td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-800">{product.name}</div>
                                        </td>
                                        <td className="p-4">
                                            {product.offerPrice ? (
                                                <div>
                                                    <span className="text-green-600 font-bold">₹{product.offerPrice}</span>
                                                    <span className="text-gray-400 text-xs line-through ml-2">₹{product.price}</span>
                                                </div>
                                            ) : (
                                                <span>₹{product.price}</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs uppercase tracking-wide">{product.category}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold ${product.stockQuantity === 0 ? 'text-red-600' : product.stockQuantity < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                                                    {product.stockQuantity} items
                                                </span>
                                                {product.stockQuantity === 0 && <span className="text-xs text-red-500">Out of Stock</span>}
                                                {!product.inStock && <span className="text-xs text-gray-400">Inactive</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <button onClick={() => setEditingProduct(product)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                                            <button onClick={() => deleteProduct(product.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {(isAdding || editingProduct) && (
                        <ProductForm 
                            initialData={editingProduct || undefined} 
                            onClose={() => { setIsAdding(false); setEditingProduct(null); }} 
                        />
                    )}
                </div>
            )}

            {activeTab === 'categories' && (
                 <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
                        <button onClick={() => setIsAddingCategory(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                            <Plus size={20} /> Add Category
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-medium text-gray-500">Name</th>
                                    <th className="p-4 font-medium text-gray-500">Slug</th>
                                    <th className="p-4 font-medium text-gray-500">Description</th>
                                    <th className="p-4 font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-bold">{cat.name}</td>
                                        <td className="p-4 text-gray-500">{cat.slug}</td>
                                        <td className="p-4 text-gray-600">{cat.description}</td>
                                        <td className="p-4">
                                            <button onClick={() => deleteCategory(cat.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {isAddingCategory && <CategoryForm onClose={() => setIsAddingCategory(false)} />}
                </div>
            )}
            
            {activeTab === 'coupons' && (
                 <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Coupon Management</h1>
                        <button onClick={() => setIsAddingCoupon(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                            <Plus size={20} /> Create Coupon
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-medium text-gray-500">Code</th>
                                    <th className="p-4 font-medium text-gray-500">Discount</th>
                                    <th className="p-4 font-medium text-gray-500">Description</th>
                                    <th className="p-4 font-medium text-gray-500">Status</th>
                                    <th className="p-4 font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map(coupon => (
                                    <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-bold font-mono text-gray-800">{coupon.code}</td>
                                        <td className="p-4 font-bold text-green-600">{coupon.discountPercent}%</td>
                                        <td className="p-4 text-gray-600">{coupon.description}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {coupon.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => deleteCoupon(coupon.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {isAddingCoupon && <CouponForm onClose={() => setIsAddingCoupon(false)} />}
                </div>
            )}
            
            {activeTab === 'banners' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Banner Slider Management</h1>
                        <button onClick={() => setIsAddingBanner(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                            <Plus size={20} /> Add Slide
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {banners.map(banner => (
                            <div key={banner.id} className={`group relative bg-white rounded-xl overflow-hidden border ${banner.active ? 'border-gray-200' : 'border-red-200 bg-red-50'}`}>
                                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-end p-6">
                                        <div className="text-white">
                                            <h3 className="text-xl font-bold">{banner.title}</h3>
                                            <p className="text-sm opacity-90">{banner.subtitle}</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button onClick={() => setEditingBanner(banner)} className="p-2 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-full backdrop-blur-sm transition">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => deleteBanner(banner.id)} className="p-2 bg-white/20 hover:bg-white text-white hover:text-red-600 rounded-full backdrop-blur-sm transition">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 flex justify-between items-center text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        {banner.active ? <Eye size={16} className="text-green-600" /> : <EyeOff size={16} className="text-gray-400" />}
                                        <span>{banner.active ? 'Visible' : 'Hidden'}</span>
                                    </div>
                                    <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[150px]">
                                        Link: {banner.link}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {banners.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No banners active. The homepage will be boring!</p>
                        </div>
                    )}
                    {(isAddingBanner || editingBanner) && (
                        <BannerForm 
                            initialData={editingBanner || undefined} 
                            onClose={() => { setIsAddingBanner(false); setEditingBanner(null); }} 
                        />
                    )}
                </div>
            )}

            {activeTab === 'reviews' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Reviews Management</h1>
                        <button onClick={() => setIsAddingReview(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                            <Plus size={20} /> Add Custom Review
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-medium text-gray-500">Product</th>
                                    <th className="p-4 font-medium text-gray-500">Reviewer</th>
                                    <th className="p-4 font-medium text-gray-500">Rating</th>
                                    <th className="p-4 font-medium text-gray-500">Comment</th>
                                    <th className="p-4 font-medium text-gray-500">Date</th>
                                    <th className="p-4 font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map(review => {
                                    const prod = products.find(p => p.id === review.productId);
                                    return (
                                    <tr key={review.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 flex items-center gap-2">
                                            {prod && <img src={prod.image} className="w-8 h-8 rounded object-cover" />}
                                            <span className="font-medium text-sm text-gray-800">{prod?.name || 'Unknown Product'}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {review.userImage && <img src={review.userImage} className="w-6 h-6 rounded-full object-cover" />}
                                                <span className="text-sm">{review.userName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center text-yellow-500 gap-1">
                                                <span className="font-bold text-gray-800">{review.rating}</span>
                                                <Star size={14} fill="currentColor" />
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                                        <td className="p-4 text-sm text-gray-500">{review.date}</td>
                                        <td className="p-4">
                                            <button onClick={() => deleteReview(review.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete Review"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                    {isAddingReview && <ReviewForm onClose={() => setIsAddingReview(false)} />}
                </div>
            )}
            
            {activeTab === 'orders' && (
                <div>
                     <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h1>
                     <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                {/* Order details same as before */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            {order.id}
                                            {order.shiprocketOrderId && (
                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200">
                                                    Shiprocket: {order.shiprocketOrderId}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</div>
                                        <div className="text-sm text-gray-500 mt-1">{order.city} - {order.pincode}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">₹{order.finalAmount ?? order.totalAmount}</div>
                                        {order.discountAmount && order.discountAmount > 0 && (
                                            <div className="text-xs text-green-600">
                                                (Discount: -₹{order.discountAmount} {order.couponCode ? `via ${order.couponCode}` : ''})
                                            </div>
                                        )}
                                        <div className="text-sm text-gray-600">{order.paymentMethod}</div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <h4 className="font-medium text-sm text-gray-700 mb-2">Items:</h4>
                                    <div className="text-sm text-gray-600">
                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                    </div>
                                </div>
                                {/* Return Info Block */}
                                {order.status === 'return_requested' && (
                                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-4 text-sm">
                                        <strong className="text-orange-800 flex items-center gap-1 mb-1"><RefreshCcw size={14} /> Return Requested</strong>
                                        <p className="text-gray-700">Reason: {order.returnReason}</p>
                                    </div>
                                )}
                                
                                {/* Logistics Actions */}
                                <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg gap-4">
                                    <div>
                                        <span className="text-sm font-medium mr-2">Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold 
                                            ${['delivered', 'returned', 'refunded'].includes(order.status) ? 'bg-green-100 text-green-700' : 
                                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                                              order.status === 'return_requested' ? 'bg-orange-100 text-orange-700' :
                                              'bg-yellow-100 text-yellow-700'}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                        {order.awbCode && (
                                            <div className="mt-1 text-xs text-gray-500 font-mono">
                                                AWB: {order.awbCode}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        {/* Shiprocket Actions */}
                                        {order.status === 'pending' && !order.awbCode && (
                                            <button onClick={() => generateLabel(order.id)} className="flex items-center gap-1 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">
                                                <FileText size={14} /> Generate Label
                                            </button>
                                        )}
                                        
                                        {order.status === 'processing' && order.awbCode && (
                                            <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="flex items-center gap-1 text-sm bg-orange-600 text-white px-3 py-1.5 rounded hover:bg-orange-700">
                                                <Truck size={14} /> Request Pickup
                                            </button>
                                        )}
                                        
                                        {order.status === 'shipped' && (
                                            <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                                                Mark Delivered
                                            </button>
                                        )}

                                        {/* Return/Refund Actions */}
                                        {order.status === 'return_requested' && (
                                            <>
                                                <button onClick={() => processReturnAction(order.id, 'approve')} className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                                                    <Check size={14} /> Approve Return
                                                </button>
                                                <button onClick={() => processReturnAction(order.id, 'reject')} className="flex items-center gap-1 text-sm bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </>
                                        )}

                                        {order.status === 'returned' && (
                                            <button onClick={() => processReturnAction(order.id, 'refund')} className="flex items-center gap-1 text-sm bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700">
                                                <RefreshCcw size={14} /> Issue Refund
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && <p className="text-gray-500">No orders yet.</p>}
                     </div>
                </div>
            )}
            
            {activeTab === 'settings' && (
                <div className="max-w-2xl">
                     <h1 className="text-2xl font-bold text-gray-800 mb-6">Store Settings</h1>
                     
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <h3 className="font-bold text-lg mb-4 text-blue-600">Floating Marquee Text</h3>
                        <div className="space-y-4">
                            <label className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    checked={config.marqueeActive} 
                                    onChange={e => updateConfig({...config, marqueeActive: e.target.checked})}
                                />
                                Enable Marquee Strip
                            </label>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Marquee Content</label>
                                <input 
                                    type="text" 
                                    value={config.marqueeText} 
                                    onChange={e => updateConfig({...config, marqueeText: e.target.value})}
                                    className="w-full border p-2 rounded" 
                                    placeholder="Enter scrolling text..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Animation Duration (Seconds)</label>
                                <input 
                                    type="number" 
                                    value={config.marqueeSpeed} 
                                    onChange={e => updateConfig({...config, marqueeSpeed: Number(e.target.value)})}
                                    className="w-full border p-2 rounded" 
                                    placeholder="20"
                                />
                                <p className="text-xs text-gray-500 mt-1">Lower number = Faster speed</p>
                            </div>
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <h3 className="font-bold text-lg mb-4 text-blue-600">Announcement Bar (Top)</h3>
                        <div className="space-y-4">
                            <label className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    checked={config.announcementActive} 
                                    onChange={e => updateConfig({...config, announcementActive: e.target.checked})}
                                />
                                Show Announcement
                            </label>
                            <input 
                                type="text" 
                                value={config.announcementText} 
                                onChange={e => updateConfig({...config, announcementText: e.target.value})}
                                className="w-full border p-2 rounded" 
                                placeholder="Enter announcement text"
                            />
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4 text-blue-600">Payment Methods</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={config.paymentMethods.upi} onChange={e => updateConfig({...config, paymentMethods: {...config.paymentMethods, upi: e.target.checked}})} />
                                UPI Payment
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={config.paymentMethods.card} onChange={e => updateConfig({...config, paymentMethods: {...config.paymentMethods, card: e.target.checked}})} />
                                Debit / Credit Cards
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={config.paymentMethods.cod} onChange={e => updateConfig({...config, paymentMethods: {...config.paymentMethods, cod: e.target.checked}})} />
                                Cash On Delivery
                            </label>
                        </div>
                     </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default AdminDashboard;