import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

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
    <footer className="bg-black border-t border-white/5 py-32 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 lg:gap-24">
        <div className="space-y-8">
          <Link to="/" className="text-3xl font-black tracking-tighter text-white italic hover:text-glow transition-all duration-500">VANTAGE</Link>
          <p className="text-zinc-500 text-sm leading-relaxed font-light">
            Redefining contemporary streetwear through precision craftsmanship and avant-garde aesthetics. Designed for the modern vanguard.
          </p>
          <div className="flex space-x-4">
            {['IG', 'TW', 'FB'].map(social => (
              <a key={social} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-black text-zinc-500 hover:border-white hover:text-white transition-all duration-500">{social}</a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-black text-[10px] tracking-[0.4em] uppercase mb-10">COLLECTIONS</h4>
          <ul className="space-y-5 text-[11px] font-black text-zinc-500 tracking-[0.1em]">
            <li><Link to="/?filter=All&sort=Newest" className="hover:text-white transition-all duration-500 uppercase">ALL COLLECTIONS</Link></li>
            <li>
              <button 
                onClick={() => handleNavClick('Newest')}
                className="hover:text-white transition-all duration-500 uppercase text-left"
              >
                NEW ARRIVALS
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavClick('Popularity')}
                className="hover:text-white transition-all duration-500 uppercase text-left"
              >
                BEST SELLERS
              </button>
            </li>
            <li><Link to="/?filter=Limited" className="hover:text-white transition-all duration-500 uppercase">LIMITED EDITION</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-black text-[10px] tracking-[0.4em] uppercase mb-10">CLIENT SERVICES</h4>
          <ul className="space-y-5 text-[11px] font-black text-zinc-500 tracking-[0.1em]">
            <li><Link to="/profile" className="hover:text-white transition-all duration-500 uppercase">MY ACCOUNT</Link></li>
            <li><Link to="/orders" className="hover:text-white transition-all duration-500 uppercase">ORDER TRACKING</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-all duration-500 uppercase">SHOPPING BAG</Link></li>
            <li><Link to="/wishlist" className="hover:text-white transition-all duration-500 uppercase">WISHLIST</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-black text-[10px] tracking-[0.4em] uppercase mb-10">LEGAL & SUPPORT</h4>
          <ul className="space-y-5 text-[11px] font-black text-zinc-500 tracking-[0.1em]">
            <li><a href="#" className="hover:text-white transition-all duration-500 uppercase">SHIPPING & DELIVERY</a></li>
            <li><a href="#" className="hover:text-white transition-all duration-500 uppercase">RETURNS & EXCHANGES</a></li>
            <li><a href="#" className="hover:text-white transition-all duration-500 uppercase">PRIVACY POLICY</a></li>
            <li><a href="#" className="hover:text-white transition-all duration-500 uppercase">CONTACT US</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[9px] font-black text-zinc-600 tracking-[0.5em] uppercase">© 2026 VANTAGE ENTERPRISE. ALL RIGHTS RESERVED.</p>
        <div className="flex space-x-10 text-[9px] font-black text-zinc-600 tracking-[0.5em] uppercase">
          <a href="#" className="hover:text-white transition-all duration-500">PRIVACY</a>
          <a href="#" className="hover:text-white transition-all duration-500">TERMS</a>
          <a href="#" className="hover:text-white transition-all duration-500">ACCESSIBILITY</a>
        </div>
      </div>
    </footer>
  );
}
