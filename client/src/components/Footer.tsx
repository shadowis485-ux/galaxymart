export default function Footer() {
  return (
    <footer className="border-t border-neon-500/10 bg-[#050505] mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🌌</span>
              <span className="font-mono text-sm font-bold text-neon-500">GALAXY<span className="text-white">MART</span></span>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed max-w-xs">
              Premium digital products delivered instantly. Secured by crypto payments.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 bg-neon-500 rounded-full animate-pulse" />
              <span className="text-neon-500 text-xs font-mono">SYSTEMS ONLINE</span>
            </div>
          </div>
          <div>
            <h4 className="text-neon-500 font-mono text-xs uppercase tracking-widest mb-3">Navigation</h4>
            <ul className="space-y-1.5">
              {['Home', 'Products', 'Reviews', 'Status', 'Terms'].map(item => (
                <li key={item}>
                  <span className="text-gray-600 hover:text-neon-500 text-xs cursor-pointer transition-colors font-mono">
                    {'>'} {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-neon-500 font-mono text-xs uppercase tracking-widest mb-3">Payment</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-neon-500 text-xs">⚡</span>
                <span className="text-gray-500 text-xs">Crypto Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neon-500 text-xs">🔒</span>
                <span className="text-gray-500 text-xs">Secure checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neon-500 text-xs">📧</span>
                <span className="text-gray-500 text-xs">Instant email delivery</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-700 text-xs font-mono">© 2024 GalaxyMart. All rights reserved.</p>
          <p className="text-gray-700 text-xs font-mono">Instant Delivery · 24/7</p>
        </div>
      </div>
    </footer>
  );
}
