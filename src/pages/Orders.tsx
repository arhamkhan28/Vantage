import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, Hash, Save, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTracking, setEditingTracking] = useState<number | null>(null);
  const [tempTracking, setTempTracking] = useState('');

  const fetchOrders = () => {
    fetch('/api/orders/my-orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const updateTracking = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/tracking`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trackingNumber: tempTracking })
      });

      if (res.ok) {
        toast.success('Tracking number updated');
        setEditingTracking(null);
        fetchOrders();
      } else {
        toast.error('Failed to update tracking number');
      }
    } catch (error) {
      toast.error('Error updating tracking number');
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-12 tracking-tighter italic">ORDER HISTORY</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5">
            <Package className="w-12 h-12 text-white/10 mx-auto mb-6" />
            <p className="text-white/40 font-bold tracking-widest">NO ORDERS YET</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden"
              >
                <div className="p-6 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 tracking-widest mb-1 uppercase">ORDER ID</p>
                    <p className="text-sm font-black text-white">#{order.paymentId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 tracking-widest mb-1 uppercase">DATE</p>
                    <p className="text-sm font-black text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 tracking-widest mb-1 uppercase">STATUS</p>
                    <div className="flex items-center space-x-2">
                      {order.orderStatus === 'Pending' && <Clock className="w-4 h-4 text-amber-400" />}
                      {order.orderStatus === 'Shipped' && <Truck className="w-4 h-4 text-blue-400" />}
                      {order.orderStatus === 'Delivered' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      <span className={`text-xs font-black tracking-widest uppercase ${
                        order.orderStatus === 'Pending' ? 'text-amber-400' : 
                        order.orderStatus === 'Shipped' ? 'text-blue-400' : 'text-emerald-400'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 tracking-widest mb-1 uppercase">TOTAL</p>
                    <p className="text-lg font-black text-white">₹{order.totalAmount}</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {order.products.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-4">
                      <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded-lg" referrerPolicy="no-referrer" />
                      <div>
                        <p className="text-sm font-bold text-white">{item.name}</p>
                        <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">SIZE: {item.size} | QTY: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-black/40 border-t border-white/5 flex flex-wrap justify-between items-center gap-6">
                  <div className="flex items-start space-x-3">
                    <Truck className="w-5 h-5 text-zinc-500 mt-1" />
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 tracking-widest mb-1 uppercase">SHIPPING TO</p>
                      <p className="text-xs font-bold text-zinc-300">
                        {order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.zip}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-black text-zinc-400 tracking-widest mb-1 uppercase">TRACKING NUMBER</p>
                      {editingTracking === order.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={tempTracking}
                            onChange={(e) => setTempTracking(e.target.value)}
                            className="bg-zinc-800 border border-white/20 rounded-lg px-3 py-1 text-xs text-white outline-none focus:border-white/40"
                            placeholder="Enter tracking #"
                          />
                          <button
                            onClick={() => updateTracking(order.id)}
                            className="p-1 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-zinc-300">
                            {order.trackingNumber || 'NOT AVAILABLE'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingTracking(order.id);
                              setTempTracking(order.trackingNumber || '');
                            }}
                            className="p-1 text-zinc-500 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
