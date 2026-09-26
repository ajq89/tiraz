import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Shirt, Layers, Tag, Eye, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { CatalogItem, CatalogCategory, TechniqueType, StoreSettings } from '../types';

interface CatalogSectionProps {
  catalogItems: CatalogItem[];
  onSelectForCustomizer: (item: CatalogItem) => void;
  settings: StoreSettings;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  catalogItems,
  onSelectForCustomizer,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory>('all');
  const [selectedTechnique, setSelectedTechnique] = useState<'all' | TechniqueType>('all');
  const [activeModalItem, setActiveModalItem] = useState<CatalogItem | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const list = [
      { id: 'all', nameAr: 'جميع الأعمال' }
    ];
    if (settings.categories && settings.categories.length > 0) {
      settings.categories.forEach(cat => {
        list.push({ id: cat.id, nameAr: cat.nameAr });
      });
    } else {
      list.push(
        { id: 'embroidery', nameAr: 'أعمال التطريز 🧵' },
        { id: 'printing', nameAr: 'أعمال الطباعة 🎨' },
        { id: 'calligraphy', nameAr: 'الخط العربي والأسماء' },
        { id: 'bahraini', nameAr: 'تصاميم بحرينية وتراثية 🇧🇭' },
        { id: 'ramadan', nameAr: 'مناسبات ورمضانيات' },
        { id: 'minimalist', nameAr: 'مينيمال ولابن آرت' }
      );
    }
    return list;
  }, [settings.categories]);

  // Filter logic
  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) => {
      // Technique match
      if (selectedTechnique !== 'all' && item.technique !== selectedTechnique) {
        return false;
      }
      // Category match
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const descMatch = item.description.toLowerCase().includes(q);
        const tagMatch = item.tags.some((t) => t.toLowerCase().includes(q));
        return titleMatch || descMatch || tagMatch;
      }
      return true;
    });
  }, [catalogItems, searchQuery, selectedCategory, selectedTechnique]);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Showcase Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-slate-100 p-8 sm:p-10 border border-slate-800 shadow-lg">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-slate-800/50 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold px-3 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>كتالوج استوديو TIRAZ.BH</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              تطريز وطباعة <span className="text-amber-400">حسب الطلب</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed font-normal">
              اختر تصميماً جاهزاً من الكتالوج أو ارفع شعارك الخاص لنقوم بتنفيذه بأعلى جودة مع إمكانية المعاينة الحية على التيشيرت والهودي.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تطريز آلي ودقيق</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>طباعة حرارية DTF ثابتة</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>توصيل لجميع مناطق البحرين 🇧🇭</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center bg-slate-800/70 p-6 rounded-xl border border-slate-700/80">
            <Shirt className="w-10 h-10 text-amber-400 mb-3" />
            <h3 className="font-bold text-base text-white mb-1">تريد رفع تصميمك الخاص؟</h3>
            <p className="text-xs text-slate-300 mb-4">
              يمكنك رفع شعارك أو صورتك الخاصة واختيار لون القماش والمقاس بلمسة واحدة.
            </p>
            <button
              onClick={() => onSelectForCustomizer(catalogItems[0])}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold py-2.5 px-4 rounded-lg text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>افتح المصمم الحي الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Section Header & Filters */}
      <div className="space-y-4">
        <div>
          <h2 className="section-title-sleek mb-1">كتالوج الأعمال الجاهزة</h2>
          <p className="text-xs text-slate-500 font-medium">استعرض التصاميم الجاهزة أو ابحث بالاسم والنوع</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن تصميم، خط عربي، تطريز ورد، شعار..."
              className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
            />
          </div>

          {/* Technique Toggle Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setSelectedTechnique('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTechnique === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedTechnique('embroidery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedTechnique === 'embroidery'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>التطريز 🧵</span>
            </button>
            <button
              onClick={() => setSelectedTechnique('printing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedTechnique === 'printing'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>الطباعة 🎨</span>
            </button>
          </div>
        </div>

        {/* Category Tabs Scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat.nameAr}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid Display */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">لم نجد تصاميم تطابق بحثك</h3>
          <p className="text-xs text-slate-500">جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedTechnique('all');
            }}
            className="mt-2 text-xs text-slate-900 font-bold underline"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="sleek-card group flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Image & Technique Badge Container */}
                <div className="relative aspect-square overflow-hidden bg-slate-100 select-none">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                    loading="lazy"
                  />

                  {/* Anti-theft Translucent Brand Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-[14px] font-black text-white/25 border-2 border-white/15 px-3 py-1 rounded-xl uppercase tracking-widest font-['Plus_Jakarta_Sans'] select-none rotate-12 bg-black/15 backdrop-blur-[0.5px] border-dashed">
                      TIRAZ • طراز
                    </span>
                  </div>

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                    <button
                      onClick={() => setActiveModalItem(item)}
                      className="w-full bg-white text-slate-900 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-700" />
                      <span>معاينة التفاصيل</span>
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
                    {item.technique === 'embroidery' ? (
                      <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        تطريز
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        طباعة
                      </span>
                    )}
                  </div>

                  {item.isNew && (
                    <div className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded shadow">
                      جديد!
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div className="p-3.5 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-slate-700 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {item.allowedGarments && item.allowedGarments.length > 0 && (
                      <div className="text-[9px] text-amber-800 bg-amber-50/70 px-2 py-0.5 rounded border border-amber-200/35 inline-block font-bold self-start mt-0.5 leading-snug">
                        متوافق مع: {item.allowedGarments.map(id => {
                          if (id === 'oversized-tee') return 'الأوفرسايز';
                          if (id === 'classic-tee') return 'الكلاسيك';
                          if (id === 'hoodie') return 'الهودي';
                          if (id === 'sweatshirt') return 'البلوفر';
                          return 'القميص';
                        }).join('، ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Action Button Footer */}
              <div className="p-3.5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">سعر الطلب الحالي:</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {(item.price + (settings.basePrices['classic-tee'] || 5.0)).toFixed(3)} <span className="text-xs font-semibold text-slate-500">{settings.currency}</span>
                  </span>
                </div>

                <button
                  onClick={() => onSelectForCustomizer(item)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                >
                  <Shirt className="w-3.5 h-3.5" />
                  <span>اختر للتصميم</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-slate-200">
            <div className="relative aspect-video bg-slate-900 overflow-hidden select-none">
              <img
                src={activeModalItem.imageUrl}
                alt={activeModalItem.title}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Anti-theft Translucent Brand Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-[18px] font-black text-white/25 border-2 border-white/15 px-4 py-2 rounded-xl uppercase tracking-widest font-['Plus_Jakarta_Sans'] select-none rotate-12 bg-black/15 backdrop-blur-[0.5px] border-dashed">
                  TIRAZ • طراز
                </span>
              </div>

              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-3 left-3 bg-slate-900/80 text-white p-1.5 rounded-full backdrop-blur transition-colors"
              >
                ✕
              </button>
              <div className="absolute bottom-3 right-3 bg-slate-900 text-white px-3 py-1 rounded-md text-xs font-bold border border-slate-700">
                {activeModalItem.technique === 'embroidery' ? '🧵 تطريز عالي الدقة' : '🎨 طباعة حرارية ثابتة'}
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{activeModalItem.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">{activeModalItem.tags.join(' • ')}</span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-xs text-slate-400 block">سعر الطلب الحالي:</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {(activeModalItem.price + (settings.basePrices['classic-tee'] || 5.0)).toFixed(3)} {settings.currency}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {activeModalItem.description}
              </p>

              {activeModalItem.allowedGarments && activeModalItem.allowedGarments.length > 0 && (
                <div className="bg-amber-50/50 border border-amber-200/40 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] text-amber-800 font-extrabold block">💡 هذا التصميم مخصص لقطع معينة فقط:</span>
                  <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    يمكن طباعته أو تطريزه على: {activeModalItem.allowedGarments.map(id => {
                      if (id === 'oversized-tee') return 'تيشيرت أوفرسايز';
                      if (id === 'classic-tee') return 'تيشيرت كلاسيك';
                      if (id === 'hoodie') return 'هودي ثقيل';
                      if (id === 'sweatshirt') return 'بلوفر';
                      return 'قميص';
                    }).join('، ')}
                  </p>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    const item = activeModalItem;
                    setActiveModalItem(null);
                    onSelectForCustomizer(item);
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Shirt className="w-4 h-4" />
                  <span>تطبيق على التيشيرت</span>
                </button>
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
