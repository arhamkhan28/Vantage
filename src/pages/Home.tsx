import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown, X, Shirt, Palette, Watch, Footprints, Sparkles, Home as HomeIcon, History, Tag, Layers, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'All');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'Newest');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const sort = searchParams.get('sort') || 'Newest';
    const f = searchParams.get('filter') || 'All';
    const s = searchParams.get('search') || '';
    const scroll = searchParams.get('scroll');
    
    setSortBy(sort);
    setFilter(f);
    setSearch(s);
    setVisibleCount(24); // Reset visible count on filter change

    if (scroll === 'categories') {
      setTimeout(() => {
        const el = document.getElementById('categories-section');
        el?.scrollIntoView({ behavior: 'smooth' });
        // Clear the scroll param
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('scroll');
        setSearchParams(newParams, { replace: true });
      }, 100);
    }

    if (scroll === 'products') {
      setTimeout(() => {
        const el = document.getElementById('product-grid');
        el?.scrollIntoView({ behavior: 'smooth' });
        // Clear the scroll param
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('scroll');
        setSearchParams(newParams, { replace: true });
      }, 100);
    }
  }, [searchParams]);

  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const categories: string[] = ['All', ...Array.from(new Set(products.map(p => p.category as string))) as string[]];
  
  let filteredProducts = products.filter(p => {
    const matchesCategory = filter === 'All' || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sorting logic
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Popularity') return (b.id * 7 % 10) - (a.id * 7 % 10); // Pseudo-random popularity
    return b.id - a.id; // Default to newest
  });

  const scrollToProducts = () => {
    const element = document.getElementById('product-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const categoryData = [
    { name: 'Oversize', icon: Shirt, image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop', desc: 'Relaxed silhouettes' },
    { name: 'Graphic', icon: Palette, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop', desc: 'Bold artistic prints' },
    { name: 'Accessories', icon: Watch, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop', desc: 'Essential additions' },
    { name: 'Footwear', icon: Footprints, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop', desc: 'Step into style' },
    { name: 'Fragrances', icon: Sparkles, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop', desc: 'Signature scents' },
    { name: 'Home Decor', icon: HomeIcon, image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop', desc: 'Elevate your space' },
    { name: 'Vintage', icon: History, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop', desc: 'Timeless classics' },
    { name: 'Logo', icon: Tag, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop', desc: 'Brand heritage' },
    { name: 'Basic', icon: Layers, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', desc: 'Everyday essentials' },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[80vh] flex items-center justify-center overflow-hidden mb-8 py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-40 grayscale"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/vantage-hero/1920/1080';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-7xl md:text-[10rem] lg:text-[12rem] font-black italic tracking-tighter text-white mb-2 leading-none"
          >
            VANTAGE
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-4 mb-8"
          >
            <p className="text-xs md:text-sm text-zinc-400 font-black tracking-[0.5em] uppercase">
              The Definitive Collection
            </p>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="font-luxury italic text-2xl md:text-4xl text-white/80 tracking-wide">
              Crafted for the Modern Vanguard
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button 
              onClick={() => { 
                setSearchParams({ filter: 'All', sort: 'Newest' });
                scrollToProducts();
              }}
              className="w-full sm:w-auto px-12 h-14 bg-white text-black text-[10px] font-black tracking-[0.3em] uppercase rounded-full hover:bg-emerald-400 hover:scale-105 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center"
            >
              EXPLORE ALL
            </button>
            <button 
              onClick={() => { 
                const el = document.getElementById('categories-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-12 h-14 glass-dark text-white text-[10px] font-black tracking-[0.3em] uppercase rounded-full hover:bg-white hover:text-black hover:scale-105 transition-all duration-500 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)]"
            >
              CATEGORIES
            </button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories Section */}
        <section id="categories-section" className="mb-32">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-xs font-black text-emerald-400 tracking-[0.5em] uppercase mb-4">Curated Collections</h2>
                <h3 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none mb-6">SHOP BY CATEGORY</h3>
                <p className="text-zinc-500 text-sm md:text-base font-medium max-w-lg leading-relaxed">
                  Explore our meticulously crafted collections, each designed to define a unique aspect of the modern vanguard aesthetic.
                </p>
              </motion.div>
            </div>
            <motion.button 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              onClick={() => {
                updateParams({ filter: 'All' });
                scrollToProducts();
              }}
              className="group flex items-center gap-4 text-[10px] font-black text-white tracking-[0.3em] uppercase transition-all"
            >
              <span className="border-b border-white/20 group-hover:border-white pb-1 transition-all">View All Collections</span>
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Featured Category Spotlight */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              onClick={() => {
                updateParams({ filter: 'Oversize' });
                scrollToProducts();
              }}
              className={`relative col-span-1 sm:col-span-2 aspect-[16/10] md:aspect-[21/10] rounded-[2.5rem] overflow-hidden group border transition-all duration-500 ${filter === 'Oversize' ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.15)]' : 'border-white/5 hover:border-white/20'}`}
            >
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop" 
                alt="Featured Collection"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/vantage-oversize/1200/800';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent opacity-90" />
              
              <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-between max-w-2xl">
                <div>
                  <div className="flex items-center gap-4 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                      <Shirt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Season Spotlight</span>
                  </div>
                  
                  <h4 className="text-4xl sm:text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none mb-4">THE OVERSIZE SERIES</h4>
                  <p className="text-zinc-400 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-lg mb-6">
                    Redefining volume and silhouette. Our flagship collection of premium heavyweight cotton essentials designed for the ultimate relaxed aesthetic.
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="px-6 sm:px-8 h-10 sm:h-12 bg-white text-black text-[8px] sm:text-[10px] font-black tracking-[0.3em] uppercase rounded-full flex items-center justify-center group-hover:bg-emerald-400 transition-colors">
                    Explore Collection
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase">200+ Pieces</span>
                </div>
              </div>
            </motion.button>

            {categoryData.filter(c => c.name !== 'Oversize').map((cat, idx) => (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -10 }}
                onClick={() => {
                  updateParams({ filter: cat.name });
                  scrollToProducts();
                }}
                className={`relative aspect-[16/10] md:aspect-[16/9] rounded-[2.5rem] overflow-hidden group border transition-all duration-500 ${filter === cat.name ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.15)]' : 'border-white/5 hover:border-white/20'}`}
              >
                <img 
                  src={cat.image} 
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${cat.name}/800/600`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-500">
                      <cat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5 text-[7px] sm:text-[8px] font-black text-zinc-400 tracking-[0.2em] uppercase">
                      {Math.floor(Math.random() * 50 + 20)} Items
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <h4 className="text-2xl sm:text-3xl md:text-4xl font-black text-white italic tracking-tighter mb-1 sm:mb-2 group-hover:text-emerald-400 transition-colors">{cat.name.toUpperCase()}</h4>
                    <p className="text-zinc-400 text-[8px] sm:text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      {cat.desc}
                    </p>
                  </div>
                </div>
                
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Quick Category Filter Bar */}
        <div className="mb-12 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-3 min-w-max">
            {categories.map((cat: string) => {
              const catInfo = categoryData.find(c => c.name === cat);
              const Icon = catInfo?.icon;
              
              return (
                <button
                  key={cat}
                  onClick={() => updateParams({ filter: cat })}
                  className={`px-8 h-12 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 border flex items-center gap-3 ${
                    filter === cat 
                      ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
                      : 'bg-zinc-900/40 text-zinc-500 border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Sort Bar */}
        <div id="product-grid" className="flex flex-col lg:flex-row gap-6 mb-12 items-stretch lg:items-center justify-between glass-dark p-6 sm:p-8 rounded-[2rem] border border-white/5">
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white transition-all duration-500" />
            <input 
              type="text" 
              placeholder="SEARCH COLLECTIONS..."
              value={search}
              onChange={(e) => updateParams({ search: e.target.value })}
              className="w-full h-14 bg-black/20 border border-white/10 rounded-2xl pl-14 pr-6 text-[10px] font-black text-white tracking-[0.2em] outline-none focus:border-white/40 placeholder:text-zinc-600 transition-all duration-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <select 
                value={sortBy}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="w-full h-14 bg-black/20 border border-white/10 rounded-2xl px-8 text-[10px] font-black text-white tracking-[0.2em] outline-none appearance-none cursor-pointer hover:border-white/40 transition-all duration-500 uppercase"
              >
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Popularity</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>

            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full sm:w-auto h-14 flex items-center justify-center gap-3 px-10 rounded-2xl border transition-all duration-500 ${showFilters ? 'bg-white text-black border-white' : 'bg-black/20 text-white border-white/10 hover:border-white/40'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">Filters</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black text-white tracking-[0.3em] uppercase">Refine Selection</h3>
                  <button onClick={() => updateParams({ filter: 'All', search: '', sort: 'Newest' })} className="text-[10px] font-bold text-zinc-400 hover:text-white underline tracking-widest">RESET ALL</button>
                </div>
                <div className="flex flex-wrap gap-4">
                  {categories.map((cat: string) => (
                    <button
                      key={cat}
                      onClick={() => updateParams({ filter: cat })}
                      className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${
                        filter === cat 
                          ? 'bg-emerald-500 text-white border-emerald-500' 
                          : 'bg-black/40 text-zinc-400 hover:text-white border border-white/20'
                      }`}
                    >
                      {(cat as string).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-8 px-2">
          <p className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">
            Showing {filteredProducts.length} products
          </p>
          {search && (
            <button onClick={() => updateParams({ search: '' })} className="flex items-center gap-2 text-[10px] font-black text-emerald-400 hover:text-emerald-300 transition-colors tracking-widest uppercase">
              <X className="w-3 h-3" /> Clear Search
            </button>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[4/5] bg-zinc-900 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.slice(0, visibleCount).map(product => {
                const Card = ProductCard as any;
                return <Card key={product.id} product={product} />;
              })}
            </div>
            
            {visibleCount < filteredProducts.length && (
              <div className="mt-20 flex flex-col items-center gap-6">
                <p className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">
                  Viewing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} Products
                </p>
                <button 
                  onClick={() => setVisibleCount(prev => prev + 24)}
                  className="px-16 h-16 bg-white text-black text-[10px] font-black tracking-[0.3em] uppercase rounded-full hover:bg-emerald-400 hover:scale-105 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                >
                  Load More Items
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-32 text-center">
            <Search className="w-12 h-12 text-white/10 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white mb-2">NO RESULTS FOUND</h3>
            <p className="text-white/40 font-bold tracking-widest uppercase text-xs">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}
