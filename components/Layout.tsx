
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, ChevronDown, Package, Heart, Flower } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import AIChat from './AIChat';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, cart, config, logout, notification } = useStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const cartCount = cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(searchTerm) {
        navigate(`/shop?search=${searchTerm}`);
        setIsSearchOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-main font-sans selection:bg-primary selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-24 right-4 z-[80] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 animate-in slide-in-from-right border-l-4 ${notification.type === 'success' ? 'bg-white border-secondary text-secondary' : 'bg-white border-red-600 text-red-900'}`}>
            <span className="font-medium font-serif tracking-wide">{notification.message}</span>
        </div>
      )}

      {/* Elegant Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-primary/10 transition-all duration-300">
        
        {/* Top Strip - Announcement */}
        {config.announcementActive && (
             <div className="bg-primary text-white text-xs py-1.5 text-center tracking-widest uppercase font-medium">
                 {config.announcementText}
             </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Left: Mobile Menu & Search Trigger */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 text-secondary hover:bg-secondary/10 rounded-full md:hidden transition"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="hidden md:flex gap-6 text-sm font-medium tracking-wide text-text-muted">
                    <Link to="/shop" className="hover:text-primary transition-colors">SHOP</Link>
                    <Link to="/shop?cat=pickles" className="hover:text-primary transition-colors">PICKLES</Link>
                    <Link to="/track" className="hover:text-primary transition-colors">TRACK ORDER</Link>
                </div>
            </div>

            {/* Center: Logo */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <Link to="/" className="flex flex-col items-center group">
                <div className="relative">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary tracking-tight">
                        Pick Your Pickle
                    </h1>
                    <Flower size={16} className="absolute -top-1 -right-4 text-accent animate-spin-slow" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-secondary mt-1 group-hover:tracking-[0.4em] transition-all">Authentic & Homemade</span>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-4 flex-1">
               <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 text-text-main hover:text-primary transition">
                   <Search size={20} />
               </button>

               <div className="hidden md:flex items-center gap-4">
                   {user ? (
                       <div className="relative group">
                           <button className="flex items-center gap-1 text-sm font-medium hover:text-primary">
                               <User size={20} />
                           </button>
                           <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border border-gray-100 hidden group-hover:block p-2 animate-in fade-in slide-in-from-top-2">
                               <div className="px-4 py-2 text-xs text-gray-400 border-b mb-1">Hello, {user.name}</div>
                               {user.role === 'admin' && (
                                   <Link to="/admin" className="block px-4 py-2 hover:bg-bg rounded-lg text-sm">Dashboard</Link>
                               )}
                               <Link to="/orders" className="block px-4 py-2 hover:bg-bg rounded-lg text-sm">My Orders</Link>
                               <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-bg rounded-lg text-sm text-red-600">Logout</button>
                           </div>
                       </div>
                   ) : (
                    <Link to="/login" className="text-sm font-medium hover:text-primary">Login</Link>
                   )}
               </div>

               <Link to="/cart" className="relative p-2 text-text-main hover:text-primary transition group">
                   <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                   {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-primary rounded-full shadow-sm">
                        {cartCount}
                    </span>
                   )}
               </Link>
            </div>
          </div>

          {/* Search Overlay */}
          {isSearchOpen && (
              <div className="absolute top-full left-0 w-full bg-white border-b border-primary/10 shadow-lg p-4 animate-in slide-in-from-top-5 z-40">
                  <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for mango pickle, murukku..." 
                        className="w-full bg-bg-subtle border-none rounded-full py-3 px-6 focus:ring-2 focus:ring-primary/50 outline-none"
                        autoFocus
                      />
                      <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                          <Search size={20} />
                      </button>
                  </form>
              </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white text-black absolute w-full shadow-xl border-t h-screen z-50 animate-in slide-in-from-left">
            <div className="flex flex-col p-6 space-y-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif text-primary">Home</Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-lg">Shop All</Link>
              <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="text-lg">My Orders</Link>
              <Link to="/track" onClick={() => setIsMenuOpen(false)} className="text-lg">Track Order</Link>
              <hr className="border-gray-100" />
              {user ? (
                 <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-left text-red-600">Logout ({user.name})</button>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="font-bold text-primary">Login / Sign Up</Link>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Marquee Strip - Styled to look like a ribbon/seal tape */}
      {config.marqueeActive && config.marqueeText && (
        <div className="bg-secondary text-white py-2 overflow-hidden relative z-40 shadow-inner">
            <div 
                className="flex whitespace-nowrap animate-marquee"
                style={{ animationDuration: `${config.marqueeSpeed}s` }}
            >
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center mx-8 font-serif italic text-sm tracking-wider">
                       {config.marqueeText} <span className="mx-6 text-accent text-lg">✦</span>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-bg-paper mt-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[url('https://www.transparenttextures.com/patterns/saw-tooth.png')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-8 py-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-4">
                    <h3 className="font-serif text-2xl text-accent">Pick Your Pickle</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Preserving traditions, one jar at a time. Handcrafted with authentic spices and generational love.
                    </p>
                    <div className="flex gap-4 pt-4">
                        {/* Social Icons placeholders */}
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition cursor-pointer">IG</div>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition cursor-pointer">FB</div>
                    </div>
                </div>
                
                <div>
                    <h4 className="font-bold mb-6 text-accent text-sm tracking-widest uppercase">Shop</h4>
                    <ul className="space-y-3 text-sm text-gray-300">
                        <li><Link to="/shop?cat=pickles" className="hover:text-white transition">Pickles</Link></li>
                        <li><Link to="/shop?cat=snacks" className="hover:text-white transition">Snacks</Link></li>
                        <li><Link to="/shop?cat=grocery" className="hover:text-white transition">Spices</Link></li>
                        <li><Link to="/shop" className="hover:text-white transition">New Arrivals</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-6 text-accent text-sm tracking-widest uppercase">Company</h4>
                    <ul className="space-y-3 text-sm text-gray-300">
                        <li><a href="#" className="hover:text-white transition">Our Story</a></li>
                        <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                        <li><a href="#" className="hover:text-white transition">Shipping Policy</a></li>
                        <li><a href="#" className="hover:text-white transition">Returns</a></li>
                    </ul>
                </div>

                <div>
                     <h4 className="font-bold mb-6 text-accent text-sm tracking-widest uppercase">Newsletter</h4>
                     <p className="text-xs text-gray-400 mb-4">Subscribe for spicy updates and offers.</p>
                     <div className="flex">
                         <input type="email" placeholder="Your email" className="bg-white/10 border-none outline-none px-4 py-2 text-sm text-white rounded-l-md w-full placeholder-gray-500" />
                         <button className="bg-primary hover:bg-primary-light px-4 py-2 rounded-r-md transition">
                             <Package size={16} />
                         </button>
                     </div>
                </div>
            </div>
            <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                <span>&copy; {new Date().getFullYear()} Pick Your Pickle. Made with ❤️ in India.</span>
                <div className="flex gap-4">
                    <span>Privacy</span>
                    <span>Terms</span>
                    <span>Sitemap</span>
                </div>
            </div>
        </div>
      </footer>
      <AIChat />
    </div>
  );
};
