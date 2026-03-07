import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const wishlistedItems = data.filter((p: any) => wishlist.includes(p.id));
        setProducts(wishlistedItems);
        setLoading(false);
      });
  }, [wishlist]);

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-20 flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-8">
          <Heart className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">WISHLIST IS EMPTY</h2>
        <p className="text-white/40 font-bold tracking-widest mb-10 uppercase">SAVE YOUR FAVORITES FOR LATER</p>
        <button onClick={() => navigate('/')} className="px-10 py-4 bg-white text-black rounded-full font-black tracking-widest hover:bg-white/90 transition-all">
          EXPLORE SHOP
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic mb-2 uppercase">MY WISHLIST</h1>
            <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Items you've been eyeing</p>
          </div>
          <p className="text-[10px] font-black text-white/20 tracking-widest uppercase">{products.length} ITEMS</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map(product => {
            const Card = ProductCard as any;
            return <Card key={product.id} product={product} />;
          })}
        </div>
      </div>
    </div>
  );
}
