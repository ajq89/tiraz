import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Shirt, 
  HelpCircle, 
  PhoneCall, 
  ShieldCheck, 
  HeartHandshake, 
  Clock, 
  Truck 
} from 'lucide-react';
import { FAQS } from '../data/initialData';
import { StoreSettings } from '../types';

interface FaqAboutProps {
  settings: StoreSettings;
  onGoToStudio: () => void;
}

export const FaqAbout: React.FC<FaqAboutProps> = ({ settings, onGoToStudio }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Brand About Story Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 border border-slate-800 shadow-md space-y-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">عن طراز tiraz.bh</span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
            تطريز وطباعة فاخرة حسب الطلب في المملكة 🇧🇭
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl font-medium">
            نحن في <span className="font-bold text-white">طراز (tiraz.bh)</span> نؤمن بأن ملابسك تعكس هويتك وأفكارك. نقدم خدمات التطريز الآلي الدقيق والطباعة المباشرة على الأوفرسايز والقمصان والهوديات بأعلى مقاييس الجودة والإتقان مع التوصيل لكافة مناطق البحرين.
          </p>
        </div>

        {/* Feature Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 relative z-10 text-xs">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
            <h3 className="font-extrabold text-white text-xs">🧵 تطريز بدقة عالية</h3>
            <p className="text-slate-400">
              استخدام مكائن متطورة وخيوط فائقة القوة تتحمل الغسيل والاستخدام اليومي.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
            <h3 className="font-extrabold text-white text-xs">🚚 توصيل شامل للبحرين</h3>
            <p className="text-slate-400">
              خدمة توصيل سريعة ومباشرة إلى باب منزلكم في أي منطقة بالمملكة بسعر ثابت.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
            <h3 className="font-extrabold text-white text-xs">🎨 تصاميم مخصصة</h3>
            <p className="text-slate-400">
              اختر من الكتالوج المتجدد أو ارفع صورتك وشعارك الخاص مباشرة للتطبيق على القطعة.
            </p>
          </div>
        </div>

        <div className="pt-1 flex justify-start">
          <button
            onClick={onGoToStudio}
            className="bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow flex items-center gap-2"
          >
            <Shirt className="w-4 h-4" />
            <span>صمم قطعتك الآن في الاستوديو المباشر</span>
          </button>
        </div>
      </div>

      {/* Accordion FAQ Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="section-title-sleek block mb-1">الأسئلة الشائعة</span>
          <h3 className="font-extrabold text-lg text-slate-900">كل ما تحتاج معرفته عن الطلب والجودة والتوصيل</h3>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-right p-3.5 font-bold text-slate-900 text-xs flex items-center justify-between gap-3 hover:bg-slate-100 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-700 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-3.5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Contact Line */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-slate-700" />
            <span className="font-bold text-slate-800">هل لديك استفسار خاص أو طلب كميات للمؤسسات؟</span>
          </div>

          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً طراز، أود الاستفسار عن طلبات الجملة والتطريز المخصص 🇧🇭')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25d366] hover:bg-[#20bd5a] text-white font-bold py-2 px-4 rounded-lg shadow-sm text-xs transition-all"
          >
            تواصل معنا عبر الواتساب مباشرة
          </a>
        </div>
      </div>

    </section>
  );
};
