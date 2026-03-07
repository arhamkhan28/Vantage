import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ChevronLeft, ShieldCheck, Truck, RefreshCcw, Star, Send } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductAndReviews = async () => {
    try {
      const [prodRes, revRes] = await Promise.all([
        fetch(`/api/products/${id}`),
        fetch(`/api/products/${id}/reviews`)
      ]);
      const prodData = await prodRes.json();
      const revData = await revRes.json();
      setProduct(prodData);
      setReviews(revData);
      setActiveImage(prodData.image);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndReviews();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please login to submit a review');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      if (res.ok) {
        toast.success('Review submitted successfully');
        setComment('');
        setRating(5);
        fetchProductAndReviews();
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.image,
      size: selectedSize,
      quantity: 1
    });
    toast.success('Added to cart');
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (!product) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Product not found</div>;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-zinc-500 hover:text-white mb-12 transition-all duration-500 group">
          <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase">BACK TO COLLECTIONS</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Image Gallery */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="aspect-[4/5] rounded-[3rem] overflow-hidden glass-dark border border-white/5"
            >
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-all duration-1000"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/vantage/800/1000';
                }}
              />
            </motion.div>
            {product.image2 && (
              <div className="flex gap-6">
                {[product.image, product.image2].map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(img)}
                    className={`w-24 h-28 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${activeImage === img ? 'border-white scale-105 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-col"
          >
            <div className="mb-12">
              <p className="text-[10px] font-black text-emerald-500 tracking-[0.5em] uppercase mb-4">{product.category}</p>
              <h1 className="text-5xl md:text-7xl font-medium font-luxury text-white mb-6 tracking-tight leading-none text-glow">{product.name}</h1>
              <div className="flex items-end gap-6">
                {product.discountPrice ? (
                  <>
                    <p className="text-5xl font-black text-white tracking-tighter">₹{product.discountPrice}</p>
                    <p className="text-2xl font-bold text-zinc-600 line-through mb-1 tracking-tighter">₹{product.price}</p>
                    <span className="bg-white text-black text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.2em] uppercase mb-2 shadow-xl">
                      {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <p className="text-5xl font-black text-white tracking-tighter">₹{product.price}</p>
                )}
              </div>
            </div>

            <div className="mb-12">
              <p className="text-zinc-400 leading-relaxed text-xl font-light">{product.description}</p>
            </div>

            {/* Size Selection */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black text-white tracking-[0.3em] uppercase">
                  {['Fragrances', 'Accessories', 'Home Decor'].includes(product.category) ? 'SELECT OPTION' : 'SELECT SIZE'}
                </p>
                {!['Fragrances', 'Accessories', 'Home Decor'].includes(product.category) && (
                  <button className="text-[10px] font-black text-zinc-500 hover:text-white underline tracking-[0.2em] uppercase">SIZE GUIDE</button>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-16 h-16 rounded-2xl border-2 font-black text-xs transition-all duration-500 flex items-center justify-center ${
                      selectedSize === size
                        ? 'bg-white border-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                        : 'border-white/5 text-zinc-500 hover:border-white/20 hover:text-white glass-dark'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full h-16 bg-white text-black rounded-[2rem] font-black text-xs tracking-[0.4em] hover:bg-zinc-200 transform hover:scale-[1.02] transition-all duration-500 flex items-center justify-center space-x-4 mb-12 shadow-2xl uppercase"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>ADD TO CART</span>
            </button>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-white/5">
              <div className="flex flex-col items-center text-center group">
                <div className="p-4 glass rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                  <Truck className="w-6 h-6 text-zinc-400" />
                </div>
                <p className="text-[9px] font-black text-white tracking-[0.3em] uppercase">PRIORITY SHIPPING</p>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="p-4 glass rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                  <RefreshCcw className="w-6 h-6 text-zinc-400" />
                </div>
                <p className="text-[9px] font-black text-white tracking-[0.3em] uppercase">30 DAY RETURNS</p>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="p-4 glass rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck className="w-6 h-6 text-zinc-400" />
                </div>
                <p className="text-[9px] font-black text-white tracking-[0.3em] uppercase">SECURE CHECKOUT</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="mt-32 pt-32 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
            {/* Review Summary & Form */}
            <div className="lg:col-span-1">
              <div className="mb-12">
                <h2 className="text-4xl font-medium font-luxury text-white mb-6 tracking-tight">Customer Reviews</h2>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`w-5 h-5 ${s <= (product.averageRating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-800'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-2xl font-black text-white tracking-tighter">
                    {product.averageRating ? product.averageRating.toFixed(1) : '0.0'}
                  </p>
                </div>
                <p className="text-zinc-500 text-xs font-black tracking-[0.2em] uppercase">Based on {product.reviewCount || 0} reviews</p>
              </div>

              {user ? (
                <form onSubmit={handleReviewSubmit} className="glass-dark p-8 rounded-[2rem] border border-white/5">
                  <p className="text-[10px] font-black text-white tracking-[0.3em] uppercase mb-8 text-center">Write a Review</p>
                  
                  <div className="flex justify-center gap-3 mb-8">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="transition-transform hover:scale-125 duration-300"
                      >
                        <Star className={`w-8 h-8 ${s <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-800'}`} />
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full bg-black/50 border border-white/5 rounded-2xl p-6 text-white text-sm focus:outline-none focus:border-white/20 transition-all duration-500 placeholder:text-zinc-700 mb-6 min-h-[150px] resize-none"
                  />

                  <button
                    disabled={submittingReview}
                    className="w-full h-14 bg-white text-black rounded-2xl font-black text-[10px] tracking-[0.3em] hover:bg-zinc-200 transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 uppercase"
                  >
                    {submittingReview ? 'SUBMITTING...' : (
                      <>
                        <span>SUBMIT REVIEW</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="glass-dark p-12 rounded-[2rem] border border-white/5 text-center">
                  <p className="text-zinc-500 text-xs font-black tracking-[0.2em] uppercase mb-6">Login to share your thoughts</p>
                  <button 
                    onClick={() => navigate('/login')}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black tracking-[0.3em] transition-all duration-500 uppercase"
                  >
                    SIGN IN
                  </button>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              {reviews.length > 0 ? (
                <div className="space-y-12">
                  {reviews.map((review) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      key={review.id} 
                      className="pb-12 border-b border-white/5 last:border-0"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden glass border border-white/10">
                            <img 
                              src={review.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userName}`} 
                              alt={review.userName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-black text-white tracking-tight">{review.userName}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                              {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-800'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-400 leading-relaxed text-lg font-light italic">"{review.comment}"</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 glass-dark rounded-[3rem] border border-white/5">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Star className="w-8 h-8 text-zinc-700" />
                  </div>
                  <h3 className="text-xl font-medium font-luxury text-white mb-2">No reviews yet</h3>
                  <p className="text-zinc-500 text-sm font-light">Be the first to share your experience with this product.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
