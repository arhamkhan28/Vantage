import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'result'>('details');
  const [paymentResult, setPaymentResult] = useState<'success' | 'failure' | null>(null);
  const [address, setAddress] = useState({ 
    street: user?.address?.street || '', 
    city: user?.address?.city || '', 
    zip: user?.address?.zip || '' 
  });
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  useEffect(() => {
    if (user?.address) {
      setAddress({
        street: user.address.street || '',
        city: user.address.city || '',
        zip: user.address.zip || ''
      });
    }
  }, [user]);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    if (!address.street || !address.city || !address.zip) {
      toast.error('Please fill in shipping details');
      return;
    }
    
    setPaymentStep('processing');
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const success = Math.random() < 0.9;
    
    if (success) {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            products: cart,
            totalAmount: total,
            paymentMethod,
            shippingAddress: address
          })
        });
        
        if (res.ok) {
          setPaymentResult('success');
          setPaymentStep('result');
          clearCart();
        } else {
          setPaymentResult('failure');
          setPaymentStep('result');
        }
      } catch (e) {
        setPaymentResult('failure');
        setPaymentStep('result');
      }
    } else {
      setPaymentResult('failure');
      setPaymentStep('result');
    }
  };

  if (cart.length === 0 && paymentStep === 'details') {
    return (
      <div className="min-h-screen bg-black pt-32 pb-20 flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-10 h-10 text-zinc-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">YOUR BAG IS EMPTY</h2>
        <p className="text-zinc-400 font-bold tracking-widest mb-10">START ADDING SOME HEAT TO YOUR WARDROBE</p>
        <button onClick={() => navigate('/')} className="px-10 py-4 bg-white text-black rounded-full font-black tracking-widest hover:bg-white/90 transition-all">
          SHOP NOW
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-12 tracking-tighter italic">YOUR BAG</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.size}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-6 bg-zinc-900/40 border border-white/5 p-4 rounded-2xl"
                >
                  <img src={item.image} alt={item.name} className="w-24 h-32 object-cover rounded-xl" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white">{item.name}</h3>
                        <p className="text-xs font-bold text-zinc-400 tracking-widest uppercase">SIZE: {item.size}</p>
                      </div>
                      <p className="text-lg font-black text-white">₹{item.price}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4 bg-black/40 rounded-lg p-1 border border-white/10">
                        <button onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} className="p-1 hover:text-white text-zinc-400 transition-colors"><Minus className="w-4 h-4" /></button>
                        <span className="text-sm font-black text-white w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} className="p-1 hover:text-white text-zinc-400 transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.productId, item.size)} className="text-zinc-500 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary / Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-8 sticky top-32">
              <h2 className="text-xl font-black text-white mb-8 tracking-widest uppercase">ORDER SUMMARY</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm font-bold tracking-widest">
                  <span className="text-zinc-400">SUBTOTAL</span>
                  <span className="text-white">₹{total}</span>
                </div>
                <div className="flex justify-between text-sm font-bold tracking-widest">
                  <span className="text-zinc-400">SHIPPING</span>
                  <span className="text-emerald-400">FREE</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between">
                  <span className="text-lg font-black text-white tracking-widest">TOTAL</span>
                  <span className="text-2xl font-black text-white">₹{total}</span>
                </div>
              </div>

              {paymentStep === 'details' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-zinc-400 tracking-widest">SHIPPING ADDRESS</p>
                    <input
                      type="text"
                      placeholder="STREET ADDRESS"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold outline-none focus:border-white/40 placeholder:text-zinc-600"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="CITY"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold outline-none focus:border-white/40 placeholder:text-zinc-600"
                      />
                      <input
                        type="text"
                        placeholder="ZIP CODE"
                        value={address.zip}
                        onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold outline-none focus:border-white/40 placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-zinc-400 tracking-widest">PAYMENT METHOD</p>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold outline-none focus:border-white/40 appearance-none"
                    >
                      <option value="Credit Card">CREDIT CARD</option>
                      <option value="Debit Card">DEBIT CARD</option>
                      <option value="UPI">UPI</option>
                      <option value="Net Banking">NET BANKING</option>
                      <option value="COD">CASH ON DELIVERY</option>
                    </select>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-5 bg-white text-black rounded-2xl font-black tracking-widest hover:bg-white/90 transition-all flex items-center justify-center space-x-3"
                  >
                    <span>CHECKOUT</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="w-12 h-12 text-white animate-spin mb-6" />
                  <p className="text-sm font-black text-white tracking-widest animate-pulse">PROCESSING PAYMENT...</p>
                  <p className="text-[10px] text-zinc-400 mt-2">DO NOT REFRESH THIS PAGE</p>
                </div>
              )}

              {paymentStep === 'result' && (
                <div className="text-center py-6">
                  {paymentResult === 'success' ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
                      <h3 className="text-2xl font-black text-white mb-2">ORDER PLACED!</h3>
                      <p className="text-xs text-zinc-400 font-bold tracking-widest mb-8 uppercase">YOUR DRIP IS ON THE WAY</p>
                      <button onClick={() => navigate('/orders')} className="w-full py-4 bg-white text-black rounded-xl font-black tracking-widest">VIEW ORDERS</button>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                      <h3 className="text-2xl font-black text-white mb-2">PAYMENT FAILED</h3>
                      <p className="text-xs text-zinc-400 font-bold tracking-widest mb-8 uppercase">SOMETHING WENT WRONG. TRY AGAIN.</p>
                      <button onClick={() => setPaymentStep('details')} className="w-full py-4 bg-white text-black rounded-xl font-black tracking-widest">TRY AGAIN</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
