import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Shield, Save, Loader2, Calendar, LogOut, 
  ArrowRight, Settings, Package, MapPin, CreditCard, 
  Heart, Headset, Phone, ChevronRight, X, Zap, Camera, Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, token, login, logout, switchProfile } = useAuth();
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection] = useState<'main' | 'security' | 'address' | 'profiles'>('main');
  
  // Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || { street: '', city: '', zip: '' });
  const [profiles, setProfiles] = useState(user?.profiles || []);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // New Profile Form
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileRelation, setNewProfileRelation] = useState('Family');
  const [newProfileAvatar, setNewProfileAvatar] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setAddress(user.address || { street: '', city: '', zip: '' });
      setProfiles(user.profiles || []);
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleUpdate = async (e?: React.FormEvent, updatedProfiles?: any[]) => {
    if (e) e.preventDefault();
    setIsUpdating(true);
    const profilesToSave = updatedProfiles || profiles;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, phone, address, profiles: profilesToSave, avatar })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        if (user) {
          login(token!, { ...user, name, email, phone, address, profiles: profilesToSave, avatar });
        }
        if (!updatedProfiles) setActiveSection('main');
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const addProfile = () => {
    if (!newProfileName.trim()) return toast.error('Please enter a name');
    const newProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProfileName,
      relation: newProfileRelation,
      avatar: newProfileAvatar
    };
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    setNewProfileName('');
    setNewProfileAvatar('');
    handleUpdate(undefined, updatedProfiles);
  };

  const removeProfile = (id: string) => {
    const updatedProfiles = profiles.filter((p: any) => p.id !== id);
    setProfiles(updatedProfiles);
    handleUpdate(undefined, updatedProfiles);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'sub') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File size too large (max 5MB)');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'main') {
        setAvatar(base64String);
      } else {
        setNewProfileAvatar(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const accountCards = [
    {
      id: 'orders',
      title: 'Your Orders',
      desc: 'Track, return, or buy things again',
      icon: <Package className="w-8 h-8 text-emerald-500" />,
      action: () => navigate('/orders')
    },
    {
      id: 'security',
      title: 'Login & Security',
      desc: 'Edit login, name, and mobile number',
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      action: () => setActiveSection('security')
    },
    {
      id: 'address',
      title: 'Your Addresses',
      desc: 'Edit addresses for orders and gifts',
      icon: <MapPin className="w-8 h-8 text-orange-500" />,
      action: () => setActiveSection('address')
    },
    {
      id: 'payments',
      title: 'Your Payments',
      desc: 'View all transactions and manage methods',
      icon: <CreditCard className="w-8 h-8 text-purple-500" />,
      action: () => toast.error('Payment management coming soon')
    },
    {
      id: 'wishlist',
      title: 'Your Wishlist',
      desc: 'View your saved items and lists',
      icon: <Heart className="w-8 h-8 text-red-500" />,
      action: () => navigate('/wishlist')
    },
    {
      id: 'elite',
      title: 'Vantage Elite',
      desc: 'Manage your premium membership and benefits',
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      action: () => toast.success('You are a Vantage Elite member! Enjoy free shipping and early access.')
    },
    {
      id: 'profiles',
      title: 'Your Profiles',
      desc: 'Manage profiles for family members',
      icon: <User className="w-8 h-8 text-indigo-400" />,
      action: () => setActiveSection('profiles')
    },
    {
      id: 'support',
      title: 'Customer Service',
      desc: 'Browse help topics or contact us',
      icon: <Headset className="w-8 h-8 text-zinc-400" />,
      action: () => toast.success('Support team is available 24/7 at support@vantage.com')
    }
  ];

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : 'N/A';

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        <AnimatePresence mode="wait">
          {activeSection === 'main' ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-zinc-900 rounded-full border border-white/20 flex items-center justify-center overflow-hidden shadow-2xl">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="w-10 h-10 text-zinc-500" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-black rounded-full cursor-pointer hover:bg-emerald-400 transition-all shadow-lg">
                      <Camera className="w-3 h-3" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'main')}
                      />
                    </label>
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-white tracking-tight italic">YOUR ACCOUNT</h1>
                    <p className="text-zinc-400 text-sm font-bold tracking-widest uppercase mt-1">
                      {user?.name} <span className="mx-2">•</span> Member Since {memberSince}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full text-xs font-black tracking-widest transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  LOGOUT SESSION
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accountCards.map((card, idx) => (
                  <motion.button
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={card.action}
                    className="flex items-start gap-6 p-8 bg-zinc-900/40 border border-white/10 rounded-[32px] hover:bg-zinc-900/60 hover:border-white/20 transition-all text-left group"
                  >
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">{card.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{card.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white transition-all mt-3" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <button 
                onClick={() => setActiveSection('main')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span className="text-xs font-black tracking-widest uppercase">Back to Account</span>
              </button>

              <div className="bg-zinc-900/40 border border-white/10 rounded-[40px] p-10 backdrop-blur-xl">
                <h2 className="text-3xl font-black text-white italic tracking-tighter mb-8">
                  {activeSection === 'security' ? 'LOGIN & SECURITY' : activeSection === 'address' ? 'YOUR ADDRESSES' : 'YOUR PROFILES'}
                </h2>

                {activeSection === 'profiles' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Main Profile (Read-only here) */}
                      <div 
                        onClick={() => switchProfile(null)}
                        className={`p-6 border rounded-3xl relative overflow-hidden group cursor-pointer transition-all ${
                          !user?.currentProfileId 
                            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5' 
                            : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black transition-all overflow-hidden ${
                            !user?.currentProfileId ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-white/40'
                          }`}>
                            {user?.avatar && !user?.currentProfileId ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              user?.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-black text-sm">{user?.name}</h4>
                            <p className="text-emerald-400/60 text-[10px] font-bold tracking-widest uppercase">Primary Profile</p>
                          </div>
                          {!user?.currentProfileId && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>

                      {/* Sub Profiles */}
                      {profiles.map((p: any) => (
                        <div 
                          key={p.id} 
                          onClick={() => switchProfile(p.id)}
                          className={`p-6 border rounded-3xl relative overflow-hidden group cursor-pointer transition-all ${
                            user?.currentProfileId === p.id 
                              ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5' 
                              : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black transition-all overflow-hidden ${
                              user?.currentProfileId === p.id ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {p.avatar ? (
                                <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                p.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-black text-sm">{p.name}</h4>
                              <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">{p.relation}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {user?.currentProfileId === p.id && (
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeProfile(p.id); }}
                                className="p-2 text-white/5 hover:text-red-400 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-8 border-t border-white/5">
                      <h3 className="text-xs font-black text-zinc-400 tracking-[0.2em] uppercase mb-6">Add New Profile</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            placeholder="Profile Name"
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold focus:border-white/40 focus:bg-black/60 transition-all outline-none"
                          />
                          <div className="relative">
                            <input
                              type="text"
                              value={newProfileAvatar}
                              onChange={(e) => setNewProfileAvatar(e.target.value)}
                              placeholder="Avatar URL or Upload"
                              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-white text-sm font-bold focus:border-white/40 focus:bg-black/60 transition-all outline-none placeholder:text-zinc-500"
                            />
                            <label className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-500 hover:text-white transition-colors">
                              <Upload className="w-4 h-4" />
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'sub')}
                              />
                            </label>
                          </div>
                          <select
                            value={newProfileRelation}
                            onChange={(e) => setNewProfileRelation(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold focus:border-white/40 focus:bg-black/60 transition-all outline-none appearance-none md:col-span-2"
                          >
                            <option value="Family">Family</option>
                            <option value="Friend">Friend</option>
                            <option value="Child">Child</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <button
                          onClick={addProfile}
                          disabled={isUpdating}
                          className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-black tracking-[0.1em] hover:bg-emerald-400 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>ADD PROFILE</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdate} className="space-y-8">
                  {activeSection === 'security' ? (
                    <>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase ml-1">PROFILE PICTURE</label>
                        <div className="flex items-center gap-6 p-6 bg-black/40 border border-white/10 rounded-2xl">
                          <div className="w-16 h-16 bg-zinc-900 rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
                            {avatar ? (
                              <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-zinc-500" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <label className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-center cursor-pointer transition-all">
                                UPLOAD IMAGE
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e, 'main')}
                                />
                              </label>
                              <button 
                                type="button"
                                onClick={() => setAvatar('')}
                                className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-black tracking-widest transition-all"
                              >
                                REMOVE
                              </button>
                            </div>
                            <input
                              type="text"
                              value={avatar}
                              onChange={(e) => setAvatar(e.target.value)}
                              className="w-full bg-transparent border-b border-white/5 py-2 text-[10px] text-zinc-400 font-mono focus:border-white/20 outline-none placeholder:text-zinc-600"
                              placeholder="Or paste image URL here..."
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase ml-1">FULL NAME</label>
                        <div className="relative group">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-sm font-bold focus:border-white/40 focus:bg-black/60 transition-all outline-none placeholder:text-zinc-600"
                            placeholder="Your Name"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase ml-1">EMAIL ADDRESS</label>
                        <div className="relative group">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-sm font-bold focus:border-white/40 focus:bg-black/60 transition-all outline-none placeholder:text-zinc-600"
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase ml-1">MOBILE NUMBER</label>
                        <div className="relative group">
                          <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-sm font-bold focus:border-white/40 focus:bg-black/60 transition-all outline-none placeholder:text-zinc-600"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase ml-1">STREET ADDRESS</label>
                        <div className="relative group">
                          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                          <input
                            type="text"
                            value={address.street}
                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-sm font-bold focus:border-white/40 focus:bg-black/60 transition-all outline-none placeholder:text-zinc-600"
                            placeholder="123 Street Name"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase ml-1">CITY</label>
                          <input
                            type="text"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-6 text-white text-sm font-bold focus:border-white/40 focus:bg-black/60 transition-all outline-none placeholder:text-zinc-600"
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase ml-1">ZIP CODE</label>
                          <input
                            type="text"
                            value={address.zip}
                            onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-6 text-white text-sm font-bold focus:border-white/40 focus:bg-black/60 transition-all outline-none placeholder:text-zinc-600"
                            placeholder="Zip Code"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-5 bg-white text-black rounded-2xl font-black tracking-[0.1em] hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-50 shadow-xl shadow-white/5"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span className="text-sm">SAVE CHANGES</span>
                      </>
                    )}
                  </button>
                </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
