import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, PenTool, LayoutDashboard, ChevronLeft, MessageSquare, Book } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from './UI';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isHome && (
              <Link to="/" className="p-3 hover:bg-pink-50 rounded-2xl transition-all active:scale-90">
                <ChevronLeft className="w-8 h-8 text-brand-pink" />
              </Link>
            )}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-pink to-brand-purple rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200/50">
                <PenTool className="w-7 h-7" />
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent">
                Trợ Lí Tập Làm Văn AI
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" icon={<Home className="w-6 h-6" />} label="Trang chủ" active={isHome} />
            <NavLink to="/library" icon={<Book className="w-6 h-6" />} label="Thư viện" active={location.pathname === '/library'} />
            <NavLink to="/dashboard" icon={<LayoutDashboard className="w-6 h-6" />} label="Tiến bộ" active={location.pathname === '/dashboard'} />
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="bg-white/50 py-12 border-t-4 border-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-400 font-display font-black text-lg mb-1.5">
            © 2026 Trợ Lí Tập Làm Văn AI – Đồng hành cùng con viết nên tương lai ✨
          </p>
          <p className="text-slate-400/70 font-display font-bold text-sm">
            Được phát triển bởi Nguyễn Thị Hải Duyên
          </p>
        </div>
      </footer>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 glass-nav rounded-[32px] px-8 py-4 flex justify-around items-center z-50 border-4 border-white shadow-2xl">
        <Link to="/" className={cn("p-3 rounded-2xl transition-all", isHome ? "text-brand-pink bg-pink-50 scale-110" : "text-slate-400")}>
          <Home className="w-8 h-8" />
        </Link>
        <Link to="/library" className={cn("p-3 rounded-2xl transition-all", location.pathname === '/library' ? "text-brand-pink bg-pink-50 scale-110" : "text-slate-400")}>
          <Book className="w-8 h-8" />
        </Link>
        <Link to="/dashboard" className={cn("p-3 rounded-2xl transition-all", location.pathname === '/dashboard' ? "text-brand-pink bg-pink-50 scale-110" : "text-slate-400")}>
          <LayoutDashboard className="w-8 h-8" />
        </Link>
      </div>
    </div>
  );
};

const NavLink = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-2 px-6 py-3 rounded-2xl font-display font-black text-lg transition-all",
      active ? "text-brand-pink bg-pink-50 shadow-sm" : "text-slate-500 hover:bg-white/80"
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);
