import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Heart, Zap, Plus, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  stock: number;
}

export default function ProductCard({ product }: { product: any }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isWishlisted = isInWishlist(product.id);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.image,
      size,
      quantity: 1
    });
    toast.success(`Added ${size} to cart`);
    setShowQuickAdd(false);
  };

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative glass-dark rounded-[2rem] overflow-hidden hover:border-white/20 transition-all duration-700"
    >
      {/* Badges */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        {discountPercentage > 0 && (
          <span className="bg-white text-black text-[8px] font-black px-3 py-1.5 rounded-full tracking-[0.2em] uppercase shadow-xl">{discountPercentage}% OFF</span>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <span className="bg-zinc-800 text-white text-[8px] font-black px-3 py-1.5 rounded-full tracking-[0.2em] uppercase border border-white/10">Limited</span>
        )}
        {product.id % 3 === 0 && (
          <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-400 text-[8px] font-black px-3 py-1.5 rounded-full tracking-[0.2em] uppercase border border-emerald-500/20 flex items-center gap-1.5">
            <Zap className="w-2.5 h-2.5 fill-current" /> Best Seller
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={handleWishlist}
        className="absolute top-6 right-6 z-10 p-3 glass border border-white/10 rounded-full hover:bg-white hover:text-black transition-all duration-500 group/wish"
      >
        <Heart className={`w-4 h-4 transition-all duration-500 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white group-hover/wish:scale-110'}`} />
      </button>

      <Link to={`/product/${product.id}`} className="block aspect-[4/5] overflow-hidden relative bg-zinc-900">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/vantage/800/1000';
          }}
        />
        
        {product.image2 && (
          <img
            src={product.image2}
            alt={`${product.name} alternate`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-110 opacity-0 group-hover:opacity-100"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/vantage2/800/1000';
            }}
          />
        )}
        
        {/* Quick Add Overlay */}
        <AnimatePresence>
          {showQuickAdd && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8"
            >
              <p className="text-[10px] font-black text-zinc-500 tracking-[0.4em] uppercase mb-8">Select Size</p>
              <div className="flex flex-wrap justify-center gap-4">
                {product.sizes?.map((s: string) => (
                  <button 
                    key={s} 
                    onClick={(e) => handleQuickAdd(e, s)}
                    className="w-14 h-14 rounded-2xl border border-white/10 text-white font-black text-xs hover:bg-white hover:text-black hover:border-white transition-all duration-500"
                  >
                    {s}
                  </button>
                ))}
              </div>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickAdd(false); }}
                  className="mt-10 text-[10px] font-black text-zinc-500 hover:text-white transition-colors tracking-[0.3em] uppercase"
                >
                  Cancel
                </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Size Preview on Hover */}
        {!showQuickAdd && (
          <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-700 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10">
            <p className="text-[8px] font-black text-zinc-500 tracking-[0.3em] uppercase mb-3">Available Sizes</p>
            <div className="flex gap-2.5">
              {product.sizes?.map((s: string) => (
                <span key={s} className="text-[10px] font-black text-white border border-white/10 px-3 py-1.5 rounded-lg glass">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0" />
      </Link>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            <div className="flex items-center justify-between mb-2">
              <Link 
                to={`/?filter=${product.category}#product-grid`}
                onClick={(e) => {
                  // If we are already on home page, we might want to just scroll
                  if (window.location.pathname === '/') {
                    const el = document.getElementById('product-grid');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] hover:text-emerald-400 transition-colors"
              >
                {product.category}
              </Link>
              {product.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-[9px] font-black text-white">{product.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <h3 className="text-xl font-medium font-luxury text-white group-hover:text-glow transition-all duration-500 line-clamp-1">
              {product.name}
            </h3>
          </div>
          <div className="text-right">
            {product.discountPrice ? (
              <>
                <p className="text-2xl font-black text-white tracking-tighter">₹{product.discountPrice}</p>
                <p className="text-[10px] font-bold text-zinc-600 line-through tracking-tighter">₹{product.price}</p>
              </>
            ) : (
              <p className="text-2xl font-black text-white tracking-tighter">₹{product.price}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3 transform translate-y-0 opacity-100 sm:translate-y-4 sm:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 flex items-center justify-center h-14 glass-dark text-white rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all duration-500"
          >
            DETAILS
          </Link>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickAdd(true); }}
            className="flex-1 flex items-center justify-center h-14 bg-white text-black rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-zinc-200 transition-all duration-500 shadow-xl"
          >
            QUICK ADD
          </button>
        </div>
      </div>
    </motion.div>
  );
}
