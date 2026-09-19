import React from 'react';
import { Palette, PhoneCall, Instagram, Heart, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings;
  setActiveTab: (tab: 'catalog' | 'studio' | 'about' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, setActiveTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-10 pb-8 mt-16 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-black">
                <Palette className="w-4 h-4 text-slate-200" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                tiraz<span className="text-slate-400">.bh</span>
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-md">
              {settings.subTitle}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>الواتساب المباشر</span>
              </a>

              <a
                href={`https://instagram.com/tiraz.bh`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
              >
                <Instagram className="w-3.5 h-3.5 text-slate-300" />
                <span>الانستغرام {settings.instagramHandle}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">روابط سريعة</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => setActiveTab('catalog')} className="hover:text-white transition-colors">
                  كتالوج أعمال التطريز والطباعة
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('studio')} className="hover:text-white transition-colors">
                  استوديو التصميم الحي على الملابس
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-white transition-colors">
                  عن طراز والأسئلة الشائعة
                </button>
              </li>
              <li className="hidden md:block">
                <button onClick={() => setActiveTab('admin')} className="hover:text-white transition-colors">
                  لوحة التحكم والأسعار
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Delivery Notice */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">خدمة التوصيل 🇧🇭</h4>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
              <span className="font-bold text-white block">توصيل فقط داخل البحرين</span>
              <p className="text-[11px] text-slate-400 leading-snug">
                سعر التوصيل ثابت لكل مناطق البحرين بـ {settings.deliveryFee.toFixed(3)} {settings.currency} فقط.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} tiraz.bh | جميع الحقوق محفوظة لاستوديو طراز للتطريز والطباعة.</p>
          <div className="flex items-center gap-1">
            <span>صُنع بحب وإتقان في مملكة البحرين</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>

      </div>
    </footer>
  );
};
