import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const handleNavClick = (sort: string) => {
    if (location.pathname === '/') {
      const el = document.getElementById('product-grid');
      el?.scrollIntoView({ behavior: 'smooth' });
      setSearchParams({ sort });
    } else {
      navigate(`/?sort=${sort}&scroll=products`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-black tracking-tighter text-white italic group-hover:text-glow transition-all duration-500">VANTAGE</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-[10px] font-black tracking-[0.2em] text-zinc-400 hover:text-white transition-all uppercase">SHOP ALL</Link>
            <button 
              onClick={() => {
                if (location.pathname === '/') {
                  const el = document.getElementById('categories-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/?scroll=categories');
                }
              }}
              className="text-[10px] font-black tracking-[0.2em] text-zinc-400 hover:text-white transition-all uppercase"
            >
              CATEGORIES
            </button>
            <button 
              onClick={() => handleNavClick('Newest')}
              className="text-[10px] font-black tracking-[0.2em] text-zinc-400 hover:text-white transition-all uppercase"
            >
              NEW ARRIVALS
            </button>
            <button 
              onClick={() => handleNavClick('Popularity')}
              className="text-[10px] font-black tracking-[0.2em] text-zinc-400 hover:text-white transition-all uppercase"
            >
              BEST SELLERS
            </button>
            {user && (
              <Link to="/orders" className="text-[10px] font-black tracking-[0.2em] text-zinc-400 hover:text-white transition-all uppercase">ORDERS</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-[10px] font-black tracking-[0.2em] text-emerald-400 hover:text-emerald-300 transition-all uppercase">ADMIN</Link>
            )}
            <div className="flex items-center space-x-6 pl-6 border-l border-white/5">
              <Link to="/wishlist" className="relative group">
                <Heart className={`w-4 h-4 transition-all duration-500 ${wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'text-zinc-500 group-hover:text-white'}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative group">
                <ShoppingBag className="w-4 h-4 text-zinc-500 group-hover:text-white transition-all duration-500" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              {user ? (
                <div className="flex items-center space-x-6">
                  <Link to="/profile" className="hidden lg:flex flex-col items-end group">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-hover:text-zinc-300 transition-colors">
                      {user.currentProfileId ? user.profiles?.find(p => p.id === user.currentProfileId)?.name : user.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-black text-white tracking-[0.2em] uppercase">ACCOUNT</span>
                  </Link>
                  <Link to="/profile" className="p-0.5 bg-white/5 border border-white/10 rounded-full hover:border-white/40 transition-all overflow-hidden w-7 h-7 flex items-center justify-center">
                    {user.currentProfileId ? (
                      user.profiles?.find(p => p.id === user.currentProfileId)?.avatar ? (
                        <img src={user.profiles.find(p => p.id === user.currentProfileId)!.avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[9px] font-black text-white">
                          {user.profiles?.find(p => p.id === user.currentProfileId)?.name.charAt(0).toUpperCase()}
                        </div>
                      )
                    ) : user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </Link>
                  <button onClick={() => { logout(); navigate('/'); }} className="text-zinc-600 hover:text-red-500 transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-[10px] font-black tracking-[0.2em] px-6 py-2 bg-white text-black rounded-full hover:bg-zinc-200 transition-all">
                  LOGIN
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <ShoppingBag className="w-6 h-6 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-black border-b border-white/10 px-4 py-6 space-y-4"
          >
            <Link to="/" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-white">SHOP ALL</Link>
            <button 
              onClick={() => {
                setIsOpen(false);
                handleNavClick('Newest');
              }}
              className="block text-lg font-medium text-zinc-400 text-left w-full"
            >
              NEW ARRIVALS
            </button>
            <button 
              onClick={() => {
                setIsOpen(false);
                handleNavClick('Popularity');
              }}
              className="block text-lg font-medium text-zinc-400 text-left w-full"
            >
              BEST SELLERS
            </button>
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-emerald-400">ADMIN</Link>
            )}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-white">MY PROFILE</Link>
                <Link to="/orders" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-white">MY ORDERS</Link>
                <button onClick={() => { logout(); setIsOpen(false); navigate('/'); }} className="block text-lg font-medium text-red-400">LOGOUT</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-white">LOGIN</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
