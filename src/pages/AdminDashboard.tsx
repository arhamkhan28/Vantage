import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Truck, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  Search,
  Filter,
  Download,
  Settings as SettingsIcon,
  X,
  Eye,
  MoreVertical,
  Activity,
  CreditCard,
  MapPin,
  Calendar,
  Shield,
  Bell
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

type View = 'dashboard' | 'orders' | 'products' | 'users' | 'settings' | 'logs';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [view, setView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form States
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category: '', sizes: ['S', 'M', 'L', 'XL'], stock: '', image: ''
  });

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes, productsRes, usersRes, chartRes, settingsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/products'),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/revenue-chart', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/settings', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const statsData = await statsRes.json();
      setStats(statsData);
      setOrders(await ordersRes.json());
      setProducts(await productsRes.json());
      setUsers(await usersRes.json());
      setRevenueData(await chartRes.json());
      setSettings(await settingsRes.json());
      setLogs(statsData.recentActivity || []);
      setLoading(false);
    } catch (e) {
      toast.error('Failed to load admin data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) })
      });
      if (res.ok) {
        toast.success(editingProduct ? 'Product updated' : 'Product added');
        setIsAdding(false);
        setEditingProduct(null);
        fetchData();
      }
    } catch (e) {
      toast.error('Failed to save product');
    }
  };

  const updateOrder = async (id: number, status?: string, tracking?: string) => {
    const finalStatus = (tracking && tracking.trim() !== '' && !status) ? 'Shipped' : status;
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: finalStatus, trackingNumber: tracking })
      });
      if (res.ok) {
        toast.success('Order updated');
        fetchData();
      }
    } catch (e) {
      toast.error('Failed to update order');
    }
  };

  const bulkUpdateOrders = async (status: string) => {
    if (selectedOrderIds.length === 0) return;
    try {
      const res = await fetch('/api/admin/orders/bulk-update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedOrderIds, status })
      });
      if (res.ok) {
        toast.success(`Updated ${selectedOrderIds.length} orders`);
        setSelectedOrderIds([]);
        fetchData();
      }
    } catch (e) {
      toast.error('Failed to bulk update orders');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Product deleted');
        fetchData();
      }
    } catch (e) {
      toast.error('Failed to delete product');
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('User deleted');
        fetchData();
      }
    } catch (e) {
      toast.error('Failed to delete user');
    }
  };

  const updateUserRole = async (id: number, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        toast.success('User role updated');
        fetchData();
      }
    } catch (e) {
      toast.error('Failed to update user role');
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => 
        typeof val === 'object' ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : `"${val}"`
      ).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateSettings = async (updates: any) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        toast.success('Settings updated');
        fetchData();
      }
    } catch (e) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
      <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
      <p className="text-[10px] font-black tracking-[0.5em] uppercase">Initializing Vantage OS...</p>
    </div>
  );

  const filteredOrders = orders.filter(o => 
    o.paymentId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-white selection:text-black">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-black border-r border-white/5 flex flex-col h-screen sticky top-0 z-30">
        <div className="p-10">
          <div className="flex items-center space-x-4 mb-2 group cursor-pointer">
            <div className="w-12 h-12 bg-white flex items-center justify-center rounded-2xl group-hover:rotate-12 transition-transform duration-500">
              <Shield className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter italic group-hover:text-glow transition-all duration-500">VANTAGE</h1>
              <p className="text-[8px] font-black text-white/20 tracking-[0.5em] uppercase">OS v4.0 PRO</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-3">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'DASHBOARD' },
            { id: 'orders', icon: ShoppingBag, label: 'ORDERS' },
            { id: 'products', icon: Package, label: 'PRODUCTS' },
            { id: 'users', icon: Users, label: 'USERS' },
            { id: 'logs', icon: Activity, label: 'ACTIVITY LOGS' },
            { id: 'settings', icon: SettingsIcon, label: 'SETTINGS' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center justify-between px-6 py-5 rounded-[1.5rem] transition-all group relative overflow-hidden ${
                view === item.id 
                  ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
                  : 'text-white/30 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-4 relative z-10">
                <item.icon className={`w-5 h-5 transition-all duration-500 ${view === item.id ? 'text-black scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase">{item.label}</span>
              </div>
              {view === item.id && <motion.div layoutId="active-pill" className="absolute inset-0 bg-white z-0" />}
              {view === item.id && <ArrowRight className="w-4 h-4 relative z-10" />}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="glass-dark rounded-[2rem] p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-black tracking-[0.2em] text-white/20 uppercase">SYSTEM HEALTH</p>
              <p className="text-[9px] font-black text-emerald-500">OPTIMAL</p>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500/50 to-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[#050505]">
        <header className="h-28 border-b border-white/5 flex items-center justify-between px-12 sticky top-0 glass-dark z-20">
          <div className="flex items-center space-x-8">
            <div className="w-1.5 h-10 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
            <div>
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-black font-luxury tracking-tight uppercase text-glow">{view}</h2>
                {settings?.maintenanceMode === 'true' && (
                  <span className="px-4 py-1.5 bg-red-500/20 border border-red-500/20 text-red-500 text-[8px] font-black tracking-[0.2em] rounded-full animate-pulse">MAINTENANCE ACTIVE</span>
                )}
              </div>
              <p className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase">VANTAGE ENTERPRISE CONTROL</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-10">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-all duration-500" />
              <input 
                type="text" 
                placeholder="COMMAND SEARCH..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-2xl pl-16 pr-8 py-4 text-[10px] font-black tracking-[0.3em] outline-none focus:border-white/30 w-80 transition-all focus:w-[30rem] placeholder:text-zinc-700"
              />
            </div>
            <div className="flex items-center space-x-6">
              <button className="p-4 glass rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all relative group">
                <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <div className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black"></div>
              </button>
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform cursor-pointer">
                <Users className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-12 max-w-[1600px] mx-auto">
          {view === 'dashboard' && (
            <div className="space-y-12">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'GROSS REVENUE', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', trend: '+12.5%' },
                  { label: 'TOTAL ORDERS', value: stats.orders, icon: ShoppingBag, color: 'text-blue-500', trend: '+8.2%' },
                  { label: 'ACTIVE USERS', value: stats.users, icon: Users, color: 'text-purple-500', trend: '+15.1%' },
                  { label: 'LOW STOCK', value: stats.lowStock, icon: AlertTriangle, color: stats.lowStock > 0 ? 'text-red-500' : 'text-zinc-500', trend: stats.lowStock > 0 ? 'CRITICAL' : 'STABLE' },
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-dark p-10 rounded-[3.5rem] relative overflow-hidden group hover:border-white/20 transition-all duration-700 cursor-default"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className={`p-5 rounded-2xl ${stat.color.replace('text-', 'bg-')}/10 ${stat.color} shadow-xl`}>
                          <stat.icon className="w-7 h-7" />
                        </div>
                        <span className={`text-[10px] font-black tracking-[0.2em] ${stat.trend.includes('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                          {stat.trend}
                        </span>
                      </div>
                      <p className="text-[10px] font-black text-white/20 tracking-[0.4em] mb-3 uppercase">{stat.label}</p>
                      <p className="text-5xl font-black tracking-tighter text-glow">{stat.value}</p>
                    </div>
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/[0.02] rounded-full blur-[60px] group-hover:bg-white/[0.05] transition-all duration-700"></div>
                  </motion.div>
                ))}
              </div>

              {/* Chart & Top Products */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 glass-dark p-12 rounded-[4rem] border border-white/5">
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <h3 className="text-3xl font-black font-luxury tracking-tighter mb-2 text-glow">REVENUE ANALYTICS</h3>
                      <p className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase">PERFORMANCE METRICS • LAST 30 DAYS</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-black tracking-[0.2em]">REVENUE</span>
                      </div>
                      <button className="p-4 glass rounded-2xl text-white/40 hover:text-white transition-all duration-500">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#ffffff10" 
                          fontSize={10} 
                          tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis 
                          stroke="#ffffff10" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `₹${val}`}
                          dx={-10}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '20px', padding: '20px' }}
                          itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
                          labelStyle={{ color: '#ffffff40', fontSize: '10px', marginBottom: '8px', fontWeight: 'bold' }}
                          cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#10b981" 
                          strokeWidth={6}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                          animationDuration={2000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-dark p-12 rounded-[4rem] border border-white/5 flex flex-col">
                  <div className="flex items-center justify-between mb-12">
                    <h3 className="text-2xl font-black font-luxury tracking-tighter text-glow">TOP PRODUCTS</h3>
                    <div className="p-3 glass rounded-xl">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                  <div className="space-y-10 flex-1">
                    {stats.topProducts.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center space-x-6">
                          <div className="relative">
                            <img src={p.image} className="w-20 h-20 rounded-[1.5rem] object-cover grayscale group-hover:grayscale-0 transition-all duration-700 border border-white/5 group-hover:border-white/20" referrerPolicy="no-referrer" />
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-white text-black rounded-xl flex items-center justify-center text-[10px] font-black shadow-xl">
                              {i + 1}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-black mb-1.5 group-hover:text-glow transition-all duration-500">{p.name}</p>
                            <div className="flex items-center space-x-3">
                              <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-widest">{p.sales} SALES</span>
                              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">₹{p.price}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-white transition-all duration-500 group-hover:translate-x-2" />
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setView('products')} className="w-full py-5 glass rounded-2xl text-[10px] font-black tracking-[0.4em] hover:bg-white/10 transition-all duration-500 mt-12 uppercase">
                    INVENTORY CONTROL
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="glass-dark p-10 rounded-[3rem] border border-white/5">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 glass rounded-xl">
                        <Users className="w-5 h-5 text-purple-500" />
                      </div>
                      <h3 className="text-xl font-black font-luxury tracking-tighter text-glow">TOP CUSTOMERS</h3>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {users.slice(0, 4).map((user, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/5 transition-all duration-500 group cursor-pointer">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center font-black text-xs text-purple-500 border border-purple-500/20 group-hover:scale-110 transition-transform">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black group-hover:text-glow transition-all">{user.name}</p>
                            <p className="text-[9px] font-bold text-white/20 tracking-widest uppercase">{user.email}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white transition-all" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-dark p-10 rounded-[3rem] border border-white/5">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 glass rounded-xl">
                        <Activity className="w-5 h-5 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-black font-luxury tracking-tighter text-glow">RECENT LOGS</h3>
                    </div>
                    <button onClick={() => setView('logs')} className="text-[9px] font-black tracking-[0.3em] text-white/20 hover:text-white transition-colors uppercase">VIEW ALL</button>
                  </div>
                  <div className="space-y-5">
                    {stats.recentActivity.slice(0, 4).map((log: any) => (
                      <div key={log.id} className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/5 transition-all duration-500">
                        <p className="text-xs font-black mb-2">{log.action}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">{new Date(log.createdAt).toLocaleTimeString()}</p>
                          <span className="text-[8px] font-black text-blue-500/50 uppercase tracking-widest">SYSTEM</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-dark p-10 rounded-[3rem] border border-white/5">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 glass rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                      <h3 className="text-xl font-black font-luxury tracking-tighter text-glow">ALERTS</h3>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {products.filter(p => p.stock < 10).slice(0, 4).map(p => (
                      <div key={p.id} className="flex items-center justify-between p-5 bg-red-500/[0.02] border border-red-500/10 rounded-2xl group hover:bg-red-500/5 transition-all duration-500">
                        <div className="flex items-center space-x-4">
                          <img src={p.image} className="w-10 h-10 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                          <div>
                            <p className="text-xs font-black group-hover:text-red-500 transition-colors">{p.name}</p>
                            <p className="text-[9px] font-bold text-red-500/50 uppercase tracking-[0.2em]">{p.stock} UNITS REMAINING</p>
                          </div>
                        </div>
                        <button onClick={() => { setEditingProduct(p); setProductForm({ ...p, price: String(p.price), stock: String(p.stock) }); setIsAdding(true); }} className="p-3 glass text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-500">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {products.filter(p => p.stock < 10).length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-white/5 py-16">
                        <CheckCircle2 className="w-12 h-12 mb-4" />
                        <p className="text-[10px] font-black tracking-[0.4em] uppercase">ALL SYSTEMS NOMINAL</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'orders' && (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black italic tracking-tighter mb-2">ORDER MANAGEMENT</h2>
                  <p className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">PROCESSING {filteredOrders.length} ACTIVE SHIPMENTS</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] tracking-widest hover:bg-white/10 transition-all">
                    <Filter className="w-4 h-4" />
                    <span>ADVANCED FILTER</span>
                  </button>
                  <button 
                    onClick={() => exportToCSV(orders, 'orders')}
                    className="flex items-center space-x-3 px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] tracking-widest hover:scale-105 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>EXPORT CSV</span>
                  </button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
                <AnimatePresence>
                  {selectedOrderIds.length > 0 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white text-black px-8 py-4 flex items-center justify-between border-b border-black/10"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-[10px] font-black tracking-widest uppercase">{selectedOrderIds.length} ORDERS SELECTED</span>
                        <div className="w-px h-4 bg-black/10"></div>
                        <button onClick={() => setSelectedOrderIds([])} className="text-[10px] font-black tracking-widest uppercase hover:underline">DESELECT ALL</button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => bulkUpdateOrders('Shipped')} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-[8px] font-black tracking-widest uppercase hover:bg-blue-600 transition-all">MARK AS SHIPPED</button>
                        <button onClick={() => bulkUpdateOrders('Delivered')} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-[8px] font-black tracking-widest uppercase hover:bg-emerald-600 transition-all">MARK AS DELIVERED</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="p-8 w-10">
                        <input 
                          type="checkbox" 
                          checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedOrderIds(filteredOrders.map(o => o.id));
                            else setSelectedOrderIds([]);
                          }}
                          className="w-4 h-4 rounded border-white/10 bg-white/5 accent-white"
                        />
                      </th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">ORDER ID</th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">CUSTOMER</th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">ITEMS</th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">TOTAL</th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">STATUS</th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">TRACKING</th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className={`hover:bg-white/[0.03] transition-all group ${selectedOrderIds.includes(order.id) ? 'bg-white/[0.05]' : ''}`}>
                        <td className="p-8">
                          <input 
                            type="checkbox" 
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, order.id]);
                              else setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                            }}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 accent-white"
                          />
                        </td>
                        <td className="p-8">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-white/40" />
                            </div>
                            <div>
                              <p className="text-xs font-black">#{order.paymentId}</p>
                              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <p className="text-xs font-black mb-1">{order.userName}</p>
                          <p className="text-[10px] font-bold text-white/30">{order.userEmail}</p>
                        </td>
                        <td className="p-8">
                          <div className="flex -space-x-3">
                            {order.products.map((p: any, i: number) => (
                              <div key={i} className="relative group/item">
                                <img src={p.image} className="w-10 h-10 rounded-xl border-4 border-black object-cover hover:z-10 transition-all hover:scale-110" referrerPolicy="no-referrer" />
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover/item:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20">
                                  {p.name} ({p.size})
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-8">
                          <p className="text-sm font-black">₹{order.totalAmount}</p>
                          <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">{order.paymentMethod}</p>
                        </td>
                        <td className="p-8">
                          <span className={`px-4 py-2 rounded-xl text-[8px] font-black tracking-[0.2em] uppercase ${
                            order.orderStatus === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                            order.orderStatus === 'Shipped' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="p-8">
                          <div className="relative">
                            <Truck className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                            <input 
                              type="text"
                              defaultValue={order.trackingNumber || ''}
                              onBlur={(e) => updateOrder(order.id, undefined, e.target.value)}
                              placeholder="TRACKING #"
                              className="bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-[10px] text-white font-black outline-none focus:border-white/30 w-48 transition-all"
                            />
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="flex items-center space-x-3">
                            <button onClick={() => setSelectedOrder(order)} className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"><Eye className="w-4 h-4" /></button>
                            <div className="w-px h-6 bg-white/5"></div>
                            <button onClick={() => updateOrder(order.id, 'Pending')} className={`p-3 rounded-xl transition-all ${order.orderStatus === 'Pending' ? 'bg-amber-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}><Clock className="w-4 h-4" /></button>
                            <button onClick={() => updateOrder(order.id, 'Shipped')} className={`p-3 rounded-xl transition-all ${order.orderStatus === 'Shipped' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}><Truck className="w-4 h-4" /></button>
                            <button onClick={() => updateOrder(order.id, 'Delivered')} className={`p-3 rounded-xl transition-all ${order.orderStatus === 'Delivered' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}><CheckCircle2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'products' && (
            <div className="space-y-12">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-black italic tracking-tighter mb-2">INVENTORY CONTROL</h2>
                  <p className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">MANAGING {filteredProducts.length} UNIQUE SKUs</p>
                </div>
                <button 
                  onClick={() => { setIsAdding(true); setEditingProduct(null); setProductForm({ name: '', description: '', price: '', category: '', sizes: ['S', 'M', 'L', 'XL'], stock: '', image: '' }); }}
                  className="flex items-center space-x-4 px-10 py-5 bg-white text-black rounded-[2rem] font-black text-xs tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                >
                  <Plus className="w-6 h-6" />
                  <span>NEW PRODUCT</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {filteredProducts.map(p => (
                  <motion.div 
                    layout
                    key={p.id} 
                    className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden group relative"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img src={p.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center space-y-4 backdrop-blur-sm">
                        <button 
                          onClick={() => { setEditingProduct(p); setProductForm({ ...p, price: String(p.price), stock: String(p.stock) }); setIsAdding(true); }}
                          className="w-40 py-4 bg-white text-black rounded-2xl font-black text-[10px] tracking-widest hover:scale-105 transition-all"
                        >
                          EDIT PRODUCT
                        </button>
                        <button 
                          onClick={() => deleteProduct(p.id)}
                          className="w-40 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] tracking-widest hover:scale-105 transition-all"
                        >
                          DELETE
                        </button>
                      </div>
                      <div className="absolute top-8 left-8 flex flex-col space-y-3">
                        <div className="px-4 py-2 bg-black/80 backdrop-blur-md text-white text-[8px] font-black tracking-[0.2em] rounded-full border border-white/10 uppercase">
                          {p.category}
                        </div>
                        {p.stock < 10 && (
                          <div className="px-4 py-2 bg-red-500 text-white text-[8px] font-black tracking-[0.2em] rounded-full uppercase animate-pulse">
                            LOW STOCK
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-10">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="font-black text-lg tracking-tight leading-tight">{p.name}</h3>
                        <p className="font-black text-2xl text-emerald-500">₹{p.price}</p>
                      </div>
                      <div className="flex justify-between items-center pt-8 border-t border-white/5">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-white/20 tracking-widest uppercase">AVAILABILITY</p>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            <p className="text-xs font-black">{p.stock} UNITS</p>
                          </div>
                        </div>
                        <button className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {view === 'users' && (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black italic tracking-tighter mb-2">USER DIRECTORY</h2>
                  <p className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">MANAGING {users.length} REGISTERED ACCOUNTS</p>
                </div>
                <button className="flex items-center space-x-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] tracking-widest hover:bg-white/10 transition-all">
                  <Users className="w-4 h-4" />
                  <span>EXPORT USER DATA</span>
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">USER IDENTITY</th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">ACCESS LEVEL</th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">AUTH PROVIDER</th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">REGISTRATION DATE</th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-white/[0.03] transition-all">
                        <td className="p-8">
                          <div className="flex items-center space-x-5">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center font-black text-xl border border-white/5">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black mb-1">{user.name}</p>
                              <p className="text-[10px] font-bold text-white/30">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <select 
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className={`px-4 py-2 rounded-xl text-[8px] font-black tracking-[0.2em] uppercase outline-none border transition-all ${
                              user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-white/5 text-white/40 border-white/5'
                            }`}
                          >
                            <option value="user" className="bg-black text-white">USER</option>
                            <option value="admin" className="bg-black text-white">ADMIN</option>
                          </select>
                        </td>
                        <td className="p-8">
                          <div className="flex items-center space-x-3">
                            <Shield className="w-4 h-4 text-white/20" />
                            <span className="text-[10px] font-black tracking-widest uppercase text-white/40">{user.provider}</span>
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-4 h-4 text-white/20" />
                            <span className="text-[10px] font-bold text-white/30 uppercase">{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="flex items-center space-x-3">
                            <button className="p-4 bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                            <button 
                              onClick={() => deleteUser(user.id)}
                              disabled={user.role === 'admin'}
                              className="p-4 bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all disabled:opacity-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'logs' && (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black italic tracking-tighter mb-2">ACTIVITY AUDIT</h2>
                  <p className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">SYSTEM LOGS & SECURITY EVENTS</p>
                </div>
                <button 
                  onClick={() => exportToCSV(logs, 'activity_logs')}
                  className="flex items-center space-x-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] tracking-widest hover:bg-white/10 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>EXPORT LOGS</span>
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">ACTION</th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">DETAILS</th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">ADMIN ID</th>
                      <th className="p-8 text-[10px] font-black tracking-widest text-white/30 uppercase">TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-white/[0.03] transition-all">
                        <td className="p-8">
                          <span className={`px-3 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase ${
                            log.action.includes('DELETED') ? 'bg-red-500/10 text-red-500' :
                            log.action.includes('CREATED') ? 'bg-emerald-500/10 text-emerald-500' :
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-8 text-xs font-bold text-white/60">{log.details}</td>
                        <td className="p-8 text-[10px] font-black text-white/30">ID: {log.adminId}</td>
                        <td className="p-8 text-[10px] font-bold text-white/30 uppercase">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-20 text-center">
                          <Activity className="w-12 h-12 mx-auto mb-4 opacity-10" />
                          <p className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">NO ACTIVITY LOGS FOUND</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'settings' && (
            <div className="space-y-12 max-w-4xl">
              <div>
                <h2 className="text-4xl font-black italic tracking-tighter mb-2">SYSTEM SETTINGS</h2>
                <p className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">CONFIGURE GLOBAL PLATFORM PARAMETERS</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] space-y-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <Shield className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-xl font-black tracking-tighter">GENERAL CONFIGURATION</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black tracking-widest text-white/30 uppercase">SITE NAME</label>
                      <input 
                        type="text" 
                        value={settings?.siteName || ''} 
                        onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-xs font-black outline-none focus:border-white/30 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black tracking-widest text-white/30 uppercase">MAINTENANCE MODE</label>
                      <div className="flex items-center space-x-4 p-2 bg-black/40 border border-white/10 rounded-2xl">
                        <button 
                          onClick={() => setSettings({...settings, maintenanceMode: 'true'})}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${settings?.maintenanceMode === 'true' ? 'bg-red-500 text-white' : 'text-white/20 hover:text-white'}`}
                        >ON</button>
                        <button 
                          onClick={() => setSettings({...settings, maintenanceMode: 'false'})}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${settings?.maintenanceMode === 'false' ? 'bg-emerald-500 text-white' : 'text-white/20 hover:text-white'}`}
                        >OFF</button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black tracking-widest text-white/30 uppercase">SHIPPING FEE (₹)</label>
                      <input 
                        type="number" 
                        value={settings?.shippingFee || ''} 
                        onChange={(e) => setSettings({...settings, shippingFee: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-xs font-black outline-none focus:border-white/30 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black tracking-widest text-white/30 uppercase">TAX RATE (%)</label>
                      <input 
                        type="number" 
                        value={settings?.taxRate || ''} 
                        onChange={(e) => setSettings({...settings, taxRate: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-xs font-black outline-none focus:border-white/30 transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => updateSettings(settings)}
                    className="w-full py-6 bg-white text-black rounded-3xl font-black tracking-[0.3em] hover:scale-[1.02] transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                  >
                    SAVE ALL CHANGES
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center">
                      <Trash2 className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tighter mb-1">DANGER ZONE</h3>
                      <p className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase">IRREVERSIBLE SYSTEM ACTIONS</p>
                    </div>
                  </div>
                  <button className="px-10 py-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black tracking-widest hover:bg-red-500 hover:text-white transition-all">
                    PURGE ALL DATA
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              <div className="p-12">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <p className="text-[10px] font-black text-white/30 tracking-[0.5em] uppercase mb-2">ORDER DETAILS</p>
                    <h2 className="text-4xl font-black tracking-tighter italic">#{selectedOrder.paymentId}</h2>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="md:col-span-2 space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-sm font-black tracking-widest uppercase border-b border-white/5 pb-4">ORDERED ITEMS</h3>
                      <div className="space-y-4">
                        {selectedOrder.products.map((p: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                            <div className="flex items-center space-x-5">
                              <img src={p.image} className="w-16 h-16 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                              <div>
                                <p className="text-xs font-black mb-1">{p.name}</p>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">SIZE: {p.size} • QTY: {p.quantity}</p>
                              </div>
                            </div>
                            <p className="text-sm font-black">₹{p.price * p.quantity}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                        <div className="flex items-center space-x-3 mb-4">
                          <MapPin className="w-5 h-5 text-blue-500" />
                          <h4 className="text-[10px] font-black tracking-widest uppercase">SHIPPING ADDRESS</h4>
                        </div>
                        <p className="text-xs font-bold leading-relaxed text-white/60">
                          {selectedOrder.shippingAddress.address}<br />
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br />
                          {selectedOrder.shippingAddress.zipCode}
                        </p>
                      </div>
                      <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                        <div className="flex items-center space-x-3 mb-4">
                          <CreditCard className="w-5 h-5 text-emerald-500" />
                          <h4 className="text-[10px] font-black tracking-widest uppercase">PAYMENT INFO</h4>
                        </div>
                        <p className="text-xs font-black mb-1">{selectedOrder.paymentMethod}</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{selectedOrder.paymentStatus}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="p-10 bg-white text-black rounded-[3rem] space-y-6">
                      <h3 className="text-[10px] font-black tracking-widest uppercase text-black/40">ORDER SUMMARY</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span>SUBTOTAL</span>
                          <span>₹{selectedOrder.totalAmount - (Number(settings?.shippingFee) || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span>SHIPPING</span>
                          <span>₹{settings?.shippingFee || 0}</span>
                        </div>
                        <div className="pt-4 border-t border-black/10 flex justify-between items-center">
                          <span className="text-[10px] font-black tracking-widest uppercase">TOTAL</span>
                          <span className="text-2xl font-black tracking-tighter">₹{selectedOrder.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black tracking-widest text-white/30 uppercase text-center">UPDATE STATUS</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => updateOrder(selectedOrder.id, 'Pending')} className={`p-4 rounded-2xl flex flex-col items-center space-y-2 transition-all ${selectedOrder.orderStatus === 'Pending' ? 'bg-amber-500 text-white' : 'bg-white/5 text-white/40'}`}>
                          <Clock className="w-5 h-5" />
                          <span className="text-[8px] font-black">PENDING</span>
                        </button>
                        <button onClick={() => updateOrder(selectedOrder.id, 'Shipped')} className={`p-4 rounded-2xl flex flex-col items-center space-y-2 transition-all ${selectedOrder.orderStatus === 'Shipped' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40'}`}>
                          <Truck className="w-5 h-5" />
                          <span className="text-[8px] font-black">SHIPPED</span>
                        </button>
                        <button onClick={() => updateOrder(selectedOrder.id, 'Delivered')} className={`p-4 rounded-2xl flex flex-col items-center space-y-2 transition-all ${selectedOrder.orderStatus === 'Delivered' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40'}`}>
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-[8px] font-black">DELIVERED</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-[4rem] overflow-hidden"
            >
              <div className="p-12">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <p className="text-[10px] font-black text-white/30 tracking-[0.5em] uppercase mb-2">PRODUCT MANAGEMENT</p>
                    <h2 className="text-4xl font-black tracking-tighter italic">{editingProduct ? 'EDIT PRODUCT' : 'NEW PRODUCT'}</h2>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest text-white/30 uppercase">PRODUCT NAME</label>
                      <input placeholder="E.G. MIDNIGHT OVERSIZE TEE" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xs font-black w-full outline-none focus:border-white/30" required />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-white/30 uppercase">PRICE (₹)</label>
                        <input placeholder="1299" type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xs font-black w-full outline-none focus:border-white/30" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-white/30 uppercase">STOCK</label>
                        <input placeholder="50" type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xs font-black w-full outline-none focus:border-white/30" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest text-white/30 uppercase">CATEGORY</label>
                      <input placeholder="E.G. OVERSIZE" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xs font-black w-full outline-none focus:border-white/30" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest text-white/30 uppercase">IMAGE URL</label>
                      <input placeholder="HTTPS://IMAGES.UNSPLASH.COM/..." value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xs font-black w-full outline-none focus:border-white/30" required />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest text-white/30 uppercase">DESCRIPTION</label>
                      <textarea placeholder="PREMIUM 240GSM COTTON..." value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xs font-black w-full h-64 outline-none focus:border-white/30 resize-none" required />
                    </div>
                    <button type="submit" className="w-full py-6 bg-white text-black rounded-3xl font-black tracking-[0.3em] hover:scale-[1.02] transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                      {editingProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
