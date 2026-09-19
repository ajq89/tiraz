import React from 'react';
import { Palette, Sparkles, Shirt, MessageSquare, Settings, ShoppingBag, PhoneCall } from 'lucide-react';
import { StoreSettings } from '../types';

interface HeaderProps {
  activeTab: 'catalog' | 'studio' | 'about' | 'admin';
  setActiveTab: (tab: 'catalog' | 'studio' | 'about' | 'admin') => void;
  settings: StoreSettings;
  cartCount?: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  cartCount = 0,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200 shadow-sm">
      {/* Top Banner Notice */}
      {settings.enablePromoFreeDelivery ? (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white text-xs py-2 px-4 text-center font-bold flex items-center justify-center gap-2 shadow-inner select-none relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none animate-pulse"></div>
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="tracking-wide relative z-10 font-['Cairo']">
            {settings.promoFreeDeliveryText || 'بمناسبة الافتتاح: توصيل مجاني لكافة مناطق البحرين لمدة أسبوعين! 🇧🇭🚚'}
          </span>
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse hidden sm:inline" />
        </div>
      ) : (
        <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>تطريز وطباعة حسب الطلب مع خدمة التوصيل لجميع مناطق المملكة 🇧🇭</span>
          <span className="hidden sm:inline-block opacity-40">|</span>
          <span className="hidden sm:inline font-bold text-amber-400">TIRAZ.BH</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <button
            onClick={() => setActiveTab('catalog')}
            className="flex items-center gap-3 group text-right focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Palette className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                  TIRAZ<span className="text-slate-500">.BH</span>
                </span>
                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  طراز
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                استوديو التطريز والطباعة العصرية
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>كتالوج الأعمال</span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${
                activeTab === 'studio'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Shirt className="w-3.5 h-3.5 text-amber-500" />
              <span>استوديو التصميم الحي</span>
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">
                صمم
              </span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'about'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>عن المتجر والأسئلة</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl transition-all active:scale-95 group"
              title="سلة التسوق"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-white animate-in zoom-in-50 duration-300">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Quick WhatsApp button */}
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً طراز، أود الاستفسار عن خدمة التطريز والطباعة 🇧🇭')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 bg-[#25d366] hover:bg-[#20bd5a] text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>واتساب المباشر</span>
            </a>

            {/* Admin Toggle */}
            <button
              onClick={() => setActiveTab('admin')}
              title="لوحة التحكم والتحكم بالتوصيل"
              className={`hidden md:inline-flex p-2 rounded-lg border transition-all ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden border-t border-slate-200 py-2 justify-around text-xs font-semibold">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'catalog' ? 'text-slate-900 font-bold' : 'text-slate-500'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>الكتالوج</span>
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors relative ${
              activeTab === 'studio' ? 'text-slate-900 font-bold' : 'text-slate-500'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>المصمم</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-0 right-2"></span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'about' ? 'text-slate-900 font-bold' : 'text-slate-500'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>عن المتجر</span>
          </button>
        </div>

      </div>
    </header>
  );
};
