import React, { useState } from 'react';
import { 
  Settings, 
  Truck, 
  PhoneCall, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  Check, 
  PlusCircle, 
  DollarSign, 
  Shirt,
  Sparkles,
  Layers,
  Upload,
  Palette,
  CheckCircle2,
  Lock,
  Unlock,
  Sliders,
  Maximize2
} from 'lucide-react';
import { StoreSettings, CatalogItem, CatalogCategory, TechniqueType, GarmentColor, GarmentOption, GarmentSize, GarmentType, PlacementPosition, SideOption } from '../types';

interface AdminPanelProps {
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  catalogItems: CatalogItem[];
  onAddCatalogItem: (item: CatalogItem) => void;
  onUpdateCatalogItem: (item: CatalogItem) => void;
  onDeleteCatalogItem: (id: string) => void;
  onResetDefaultCatalog: () => void;
  colors: GarmentColor[];
  onUpdateColors: (colors: GarmentColor[]) => void;
  garments: GarmentOption[];
  onUpdateGarments: (garments: GarmentOption[]) => void;
  user: any;
  onSignIn: () => Promise<any>;
  onSignOut: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  settings,
  onUpdateSettings,
  catalogItems,
  onAddCatalogItem,
  onUpdateCatalogItem,
  onDeleteCatalogItem,
  onResetDefaultCatalog,
  colors,
  onUpdateColors,
  garments,
  onUpdateGarments,
  user,
  onSignIn,
  onSignOut,
}) => {
  const [localSettings, setLocalSettings] = useState<StoreSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync settings when they are updated in parent/firestore
  React.useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  // Passcode Authorization state
  const [isAuthorized, setIsAuthorized] = useState(() => {
    try {
      return sessionStorage.getItem('tiraz_admin_authorized') === 'true';
    } catch {
      return false;
    }
  });
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // New Catalog Item Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CatalogCategory>(() => 
    settings.categories && settings.categories.length > 0 ? settings.categories[0].id : 'embroidery'
  );
  const [newTechnique, setNewTechnique] = useState<TechniqueType>('embroidery');
  const [newAllowedTechnique, setNewAllowedTechnique] = useState<'embroidery' | 'printing' | 'both'>('both');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newPrice, setNewPrice] = useState(2.0);
  const [newPriceTwoSides, setNewPriceTwoSides] = useState(3.5);
  const [newSideOption, setNewSideOption] = useState<SideOption>('one-side');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('تطريز, بحرين, فاخر');
  const [selectedGarmentsForNewItem, setSelectedGarmentsForNewItem] = useState<string[]>(() =>
    garments.map((g) => g.id)
  );
  const [newIsFixed, setNewIsFixed] = useState(false);
  const [newFixedPlacement, setNewFixedPlacement] = useState<PlacementPosition | 'free'>('free');
  const [newFrontScale, setNewFrontScale] = useState<number>(0.6);
  const [newBackScale, setNewBackScale] = useState<number>(1.4);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // New Color Form State
  const [newColorNameAr, setNewColorNameAr] = useState('');
  const [newColorNameEn, setNewColorNameEn] = useState('');
  const [newColorHex, setNewColorHex] = useState('#1d4ed8');

  // New Garment Product Form State
  const [newGarmentId, setNewGarmentId] = useState('');
  const [newGarmentNameAr, setNewGarmentNameAr] = useState('');
  const [newGarmentNameEn, setNewGarmentNameEn] = useState('');
  const [newGarmentPrice, setNewGarmentPrice] = useState(6.0);
  const [newGarmentDesc, setNewGarmentDesc] = useState('');

  // Active product selected for size/color editing
  const [selectedEditGarmentId, setSelectedEditGarmentId] = useState<string>('oversized-tee');

  // Handle Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Image upload for new item
  const handleItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewImageUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add/Update Item Submit
  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const primaryTechnique: TechniqueType = newAllowedTechnique === 'printing' ? 'printing' : 'embroidery';

    const newItem: CatalogItem = {
      id: editingItemId || `cat-custom-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      technique: primaryTechnique,
      allowedTechniqueOption: newAllowedTechnique,
      imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
      price: newPrice,
      priceTwoSides: newPriceTwoSides,
      sideOption: newSideOption,
      description: newDescription || 'تصميم فاخر منفذ بدقة عالية في استوديو طراز.',
      tags: newTags.split(',').map((t) => t.trim()),
      isNew: editingItemId ? false : true,
      allowedGarments: selectedGarmentsForNewItem,
      isFixed: newIsFixed,
      fixedPlacement: newFixedPlacement === 'free' ? undefined : newFixedPlacement,
      frontScale: newFrontScale,
      backScale: newBackScale,
    };

    if (editingItemId) {
      onUpdateCatalogItem(newItem);
    } else {
      onAddCatalogItem(newItem);
    }

    setShowAddForm(false);
    setEditingItemId(null);
    setNewTitle('');
    setNewImageUrl('');
    setNewDescription('');
    setNewPrice(2.0);
    setNewPriceTwoSides(3.5);
    setNewSideOption('one-side');
    setSelectedGarmentsForNewItem(garments.map((g) => g.id));
    setNewIsFixed(false);
    setNewFixedPlacement('free');
    setNewFrontScale(0.6);
    setNewBackScale(1.4);
    setNewAllowedTechnique('both');
  };

  const ALL_SIZES: GarmentSize[] = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const activeEditGarment = garments.find((g) => g.id === selectedEditGarmentId);

  // Handle Passcode Unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234' || passcode === 'admin' || passcode === 'tiraz2026') {
      setIsAuthorized(true);
      setPasscodeError(false);
      try {
        sessionStorage.setItem('tiraz_admin_authorized', 'true');
      } catch (err) {
        console.error(err);
      }
    } else {
      setPasscodeError(true);
      setPasscode('');
    }
  };

  const isGoogleAdmin = user && user.email === 'mursal.bh@gmail.com' && user.emailVerified;
  const isAuthorizedFull = isAuthorized || isGoogleAdmin;

  if (!isAuthorizedFull) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-800 shadow-inner">
            <Lock className="w-8 h-8 text-slate-900 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900 font-['Cairo']">
              لوحة التحكم محمية 🔐
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              الرجاء إدخال رمز المرور أو تسجيل الدخول بجوجل كمسؤول لإجراء التعديلات سحابياً وحفظها فوراً للجميع.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 text-right">
            <div className="space-y-1.5">
              <label htmlFor="passcode-input" className="text-xs font-bold text-slate-700">
                رمز المرور للوحة الإدارة:
              </label>
              <input
                id="passcode-input"
                type="password"
                placeholder="••••"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (passcodeError) setPasscodeError(false);
                }}
                className={`w-full text-center tracking-widest text-lg font-bold py-3 px-4 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                  passcodeError 
                    ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/35' 
                    : 'border-slate-200 focus:border-slate-900'
                }`}
                autoFocus
              />
              {passcodeError && (
                <p className="text-[11px] font-bold text-rose-600 text-center mt-1 animate-shake">
                  ❌ رمز المرور غير صحيح! الرجاء المحاولة مرة أخرى.
                </p>
              )}
            </div>

            <button
              id="unlock-button"
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active-spring shadow-sm cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>دخول سريع (عرض محلي)</span>
            </button>
          </form>

          {/* OR Google Sign-In */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold font-['Cairo']">أو للربط السحابي</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={async () => {
                try {
                  const loggedInUser = await onSignIn();
                  if (loggedInUser && loggedInUser.email === 'mursal.bh@gmail.com') {
                    // Correct admin logged in!
                  } else {
                    alert('هذا الحساب غير مصرح له كمدير للمتجر. الرجاء تسجيل الدخول بالبريد الإلكتروني المعتمد mursal.bh@gmail.com');
                    await onSignOut();
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>تسجيل دخول المسؤول بجوجل ⚡</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed font-['Cairo']">
              * تسجيل الدخول كمسؤول يضمن حفظ التعديلات سحابياً وتفعيل الحفظ المشترك لجميع الأجهزة والزبائن تلقائياً!
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="bg-amber-50 border border-amber-200/65 rounded-xl p-3 text-right">
              <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                💡 تلميح للتجربة والتقييم:
              </p>
              <p className="text-[10px] text-amber-700 font-medium leading-relaxed mt-0.5">
                يمكنك استخدام الرمز الافتراضي <strong className="font-extrabold text-amber-900">1234</strong> لفتح لوحة التحكم فوراً واستعراض الخيارات بشكل محلي.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Page Title */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1 text-center sm:text-right">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">لوحة إدارة tiraz.bh</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            لوحة التحكم بالمخزون، الأسعار، والمقاسات
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            تعديل رسوم التوصيل، رقم الواتساب، المقاسات والألوان المتوفرة لكل تيشيرت، وإضافة أعمال الكتالوج.
          </p>
        </div>

        <button
          onClick={onResetDefaultCatalog}
          className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة الكتالوج الافتراضي</span>
        </button>
      </div>

      {/* Firebase Sync Status Banner */}
      {isGoogleAdmin ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-extrabold text-emerald-900 font-['Cairo']">
                الربط السحابي نشط وتلقائي ⚡
              </p>
              <p className="text-xs text-emerald-700 font-medium font-['Cairo']">
                أنت مسجل الدخول كمدير ({user?.email}). جميع تعديلاتك تُحفظ وتظهر فوراً لكافة الزوار والأجهزة.
              </p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            تسجيل الخروج من الإدارة سحابياً
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-extrabold text-amber-900 font-['Cairo']">
                ⚠️ وضع الاستعراض والتحكم المحلي
              </p>
              <p className="text-xs text-amber-700 font-medium font-['Cairo']">
                التعديلات ستُحفظ في متصفحك هذا فقط ولن تظهر للزبائن والزوار. لتفعيل الحفظ الدائم سحابياً للجميع، يرجى تسجيل الدخول.
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                const loggedInUser = await onSignIn();
                if (loggedInUser && loggedInUser.email === 'mursal.bh@gmail.com') {
                  // Success
                } else {
                  alert('هذا الحساب غير مصرح له كمدير للمتجر. الرجاء تسجيل الدخول بالبريد الإلكتروني المعتمد mursal.bh@gmail.com');
                  await onSignOut();
                }
              } catch (err) {
                console.error(err);
              }
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            تسجيل الدخول بالمسؤول (جوجل)
          </button>
        </div>
      )}

      {/* Store Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-700" />
            <span>إعدادات التوصيل والواتساب والعملة</span>
          </h2>

          {saveSuccess && (
            <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>تم حفظ التغييرات بنجاح!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Delivery Fee Input */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-700" />
                <span>سعر التوصيل (بالدينار البحريني):</span>
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={localSettings.deliveryFee}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, deliveryFee: parseFloat(e.target.value) || 0 })
                }
                className="w-full pl-12 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:ring-2 focus:ring-slate-900"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {localSettings.currency}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              يظهر هذا السعر للزبون عند طلب القطع ويكون ثابت لجميع مناطق البحرين.
            </p>
          </div>

          {/* WhatsApp Phone Number */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-slate-700" />
              <span>رقم الواتساب لاستلام الطلبات:</span>
            </label>
            <input
              type="text"
              value={localSettings.whatsappNumber}
              onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
              placeholder="97333000000"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:ring-2 focus:ring-slate-900"
            />
            <p className="text-[11px] text-slate-500">
              أدخل الرقم مع مفتاح البحرين (مثال: 97333000000)
            </p>
          </div>

          {/* Free Delivery Threshold */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-slate-700" />
              <span>حد التوصيل المجاني (اختياري):</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                value={localSettings.freeDeliveryThreshold}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })
                }
                className="w-full pl-12 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:ring-2 focus:ring-slate-900"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {localSettings.currency}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              إذا بلغت قيمة الطلب هذا المبلغ يكون التوصيل مجاناً (ضع 0 لإلغائها).
            </p>
          </div>

          {/* Promo Free Delivery Config */}
          <div className="bg-slate-50 p-4 rounded-xl border border-amber-200 bg-amber-50/25 sm:col-span-2 lg:col-span-3 space-y-3 text-right">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>عرض التوصيل المجاني الترويجي (بمناسبة الافتتاح):</span>
              </label>
              <label htmlFor="promo-free-delivery-toggle" className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!localSettings.enablePromoFreeDelivery}
                  onChange={(e) => {
                    const updated = { ...localSettings, enablePromoFreeDelivery: e.target.checked };
                    setLocalSettings(updated);
                    onUpdateSettings(updated);
                  }}
                  className="sr-only peer"
                  id="promo-free-delivery-toggle"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                <span className="ms-3 text-xs font-bold text-slate-900 select-none">
                  {localSettings.enablePromoFreeDelivery ? 'نشط 🟢' : 'ملغى 🔴'}
                </span>
              </label>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="promo-text-input" className="text-[11px] font-bold text-slate-700 block">
                نص شريط الإعلان التشجيعي (أعلى الموقع):
              </label>
              <input
                id="promo-text-input"
                type="text"
                value={localSettings.promoFreeDeliveryText || ''}
                onChange={(e) => {
                  const updated = { ...localSettings, promoFreeDeliveryText: e.target.value };
                  setLocalSettings(updated);
                  onUpdateSettings(updated);
                }}
                placeholder="بمناسبة الافتتاح: توصيل مجاني لكافة مناطق البحرين لمدة أسبوعين! 🇧🇭🚚"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 text-right"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              عند تفعيل هذا الخيار، سيتم تطبيق التوصيل المجاني تلقائياً على جميع الطلبات دون النظر للحد الأدنى، وسيظهر شريط إعلاني تشجيعي ملفت أعلى الموقع للزبائن.
            </p>
          </div>

        </div>

        {/* Base Prices Adjustment & Products Management Section */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 font-['Cairo']">
              <span className="w-1.5 h-3.5 bg-amber-500 rounded-full inline-block"></span>
              <span>إدارة المنتجات وتسعير الملابس الأساسي:</span>
            </h3>
            <span className="text-[10px] text-slate-400">إجمالي المنتجات: {Object.keys(localSettings.basePrices).length}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            {Object.entries(localSettings.basePrices).map(([key, price]) => {
              const garmentName = garments.find(g => g.id === key)?.nameAr || 
                (key === 'oversized-tee' ? 'تيشيرت أوفرسايز' :
                 key === 'classic-tee' ? 'تيشيرت كلاسيك' :
                 key === 'hoodie' ? 'هودي ثقيل' :
                 key === 'sweatshirt' ? 'بلوفر' :
                 key === 'shirt' ? 'قميص' :
                 key === 'cap' ? 'قبعة' :
                 key === 'long-sleeve' ? 'تيشيرت كم طويل' : key);

              return (
                <div key={key} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-700 block truncate" title={garmentName}>
                      {garmentName}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">ID: {key}</span>
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={price}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          basePrices: {
                            ...localSettings.basePrices,
                            [key]: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-900 font-bold text-xs"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (garments.length <= 1) {
                          alert('لا يمكن حذف جميع المنتجات! يجب بقاء منتج واحد على الأقل للمتجر.');
                          return;
                        }
                        if (confirm(`هل أنت متأكد من حذف منتج "${garmentName}" بالكامل من المتجر والاستوديو؟`)) {
                          // 1. Remove price entry
                          const updatedPrices = { ...localSettings.basePrices };
                          delete updatedPrices[key];
                          setLocalSettings({
                            ...localSettings,
                            basePrices: updatedPrices
                          });

                          // 2. Update garments state
                          onUpdateGarments(garments.filter(g => g.id !== key));
                        }
                      }}
                      className="w-full py-1 text-[10px] text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-200 hover:border-rose-500 rounded font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف المنتج</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Elegant Form to Add New Garment Product */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 text-right space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <PlusCircle className="w-4 h-4 text-slate-700" />
              <span className="font-extrabold text-xs text-slate-800 font-['Cairo']">أضف منتجاً جديداً للمتجر والاستوديو ➕</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold block">الاسم باللغة العربية: *</label>
                <input
                  type="text"
                  placeholder="مثال: تيشيرت بولو فاخر"
                  value={newGarmentNameAr}
                  onChange={(e) => setNewGarmentNameAr(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold block">الاسم بالإنجليزية: *</label>
                <input
                  type="text"
                  placeholder="مثال: Luxury Polo Shirt"
                  value={newGarmentNameEn}
                  onChange={(e) => setNewGarmentNameEn(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold block">كود المعرّف (ID بالإنجليزي): *</label>
                <input
                  type="text"
                  placeholder="مثال: polo-shirt"
                  value={newGarmentId}
                  onChange={(e) => setNewGarmentId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold block">السعر الأساسي (BHD): *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={newGarmentPrice}
                  onChange={(e) => setNewGarmentPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold block">وصف قصير للمنتج: *</label>
                <input
                  type="text"
                  placeholder="مثال: قماش قطني منسوج..."
                  value={newGarmentDesc}
                  onChange={(e) => setNewGarmentDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  const id = newGarmentId.trim();
                  const nameAr = newGarmentNameAr.trim();
                  const nameEn = newGarmentNameEn.trim();
                  const desc = newGarmentDesc.trim();

                  if (!id || !nameAr || !nameEn || !desc) {
                    alert('يرجى تعبئة كافة الحقول المطلوبة لإنشاء منتج ملابس جديد!');
                    return;
                  }

                  if (garments.some(g => g.id === id)) {
                    alert('هذا كود المعرّف (ID) مستخدم لمنتج آخر مسبقاً! يرجى اختيار معرّف فريد.');
                    return;
                  }

                  // 1. Add to localSettings.basePrices immediately
                  const updatedPrices = {
                    ...localSettings.basePrices,
                    [id]: newGarmentPrice
                  };
                  setLocalSettings({
                    ...localSettings,
                    basePrices: updatedPrices
                  });

                  // 2. Add to global garments
                  const newGarmentItem = {
                    id,
                    nameAr,
                    nameEn,
                    basePrice: newGarmentPrice,
                    description: desc,
                    availableColors: colors.slice(0, 6), // default to first 6 standard colors
                    availableSizes: id === 'cap' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']
                  };
                  onUpdateGarments([...garments, newGarmentItem]);

                  // Reset form states
                  setNewGarmentId('');
                  setNewGarmentNameAr('');
                  setNewGarmentNameEn('');
                  setNewGarmentPrice(6.0);
                  setNewGarmentDesc('');

                  alert(`تمت إضافة منتج "${nameAr}" بنجاح! تذكر الضغط على زر "حفظ التغييرات" لتثبيت تعديلات الأسعار الإجمالية.`);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-2 rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>أضف هذا المنتج للمتجر</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Category Management Section */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2 pb-1">
            <span className="w-1.5 h-3.5 bg-slate-900 rounded-full inline-block"></span>
            <h3 className="text-xs font-extrabold text-slate-800 font-['Cairo']">إدارة تصنيفات الكتالوج:</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Add Category Form */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-xs text-slate-700 block font-['Cairo']">أضف تصنيفاً جديداً ➕</span>
              <div className="space-y-2 text-right">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold block">اسم التصنيف باللغة العربية: *</label>
                  <input
                    type="text"
                    id="new-category-ar"
                    placeholder="مثال: تراثيات، رياضي، إلخ"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold block">اسم التصنيف باللغة الإنجليزية (معرّف): *</label>
                  <input
                    type="text"
                    id="new-category-en"
                    placeholder="مثال: heritage, sports, etc"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const arInput = document.getElementById('new-category-ar') as HTMLInputElement;
                    const enInput = document.getElementById('new-category-en') as HTMLInputElement;
                    const arVal = arInput?.value.trim();
                    const enVal = enInput?.value.trim().toLowerCase().replace(/\s+/g, '-');
                    if (!arVal || !enVal) {
                      alert('يرجى ملء جميع الحقول المطلوبة!');
                      return;
                    }
                    
                    const currentCats = localSettings.categories || [];
                    if (currentCats.some(c => c.id === enVal)) {
                      alert('هذا التصنيف موجود بالفعل!');
                      return;
                    }
                    
                    const updatedCategories = [
                      ...currentCats,
                      { id: enVal, nameAr: arVal, nameEn: enVal }
                    ];
                    setLocalSettings({
                      ...localSettings,
                      categories: updatedCategories
                    });
                    
                    if (arInput) arInput.value = '';
                    if (enInput) enInput.value = '';
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>أضف هذا التصنيف</span>
                </button>
              </div>
            </div>

            {/* 2. Existing Categories List */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-xs text-slate-700 block font-['Cairo']">التصنيفات الحالية للكتالوج ({(localSettings.categories || []).length}) 📋</span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-right font-medium">
                {(localSettings.categories || []).map((cat) => (
                  <div key={cat.id} className="bg-white px-3 py-2 rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex flex-col text-right">
                      <span className="font-bold text-slate-900 text-xs font-['Cairo']">{cat.nameAr}</span>
                      <span className="text-[10px] text-slate-400 font-mono">#{cat.id}</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف تصنيف "${cat.nameAr}"؟ لن يتم حذف أعمال الكتالوج المندرجة تحته.`)) {
                          const updated = (localSettings.categories || []).filter(c => c.id !== cat.id);
                          setLocalSettings({
                            ...localSettings,
                            categories: updated
                          });
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md border border-transparent hover:border-rose-200/50 transition-all"
                      title="حذف هذا التصنيف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {(localSettings.categories || []).length === 0 && (
                  <p className="text-[11px] text-slate-400 text-center py-4">لا توجد تصنيفات مخصصة حالياً.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-lg text-xs transition-all flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات والأسعار</span>
          </button>
        </div>
      </form>

      {/* ⚙️ AVAILABLE COLORS & SIZES STOCK INVENTORY */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-700" />
              <span>إدارة الألوان والمقاسات المتوفرة للزبائن</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              تحكّم بجميع الألوان المتوفرة في المتجر، وحدّد المقاسات والألوان المتاحة لكل قطعة ملابس على حدة.
            </p>
          </div>
        </div>

        {/* Dynamic Store Colors Palette Management */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-slate-900 rounded-full inline-block"></span>
            <span>1. الألوان العامة المتوفرة في المتجر:</span>
          </h3>

          {/* Current Colors Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {colors.map((col) => (
              <div 
                key={col.id} 
                className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col items-center justify-between gap-2 shadow-sm text-center"
              >
                <div 
                  className="w-7 h-7 rounded-full border border-slate-300 shadow-inner"
                  style={{ backgroundColor: col.hex }}
                />
                <div className="overflow-hidden w-full">
                  <span className="font-bold text-[11px] text-slate-900 block truncate" title={col.nameAr}>
                    {col.nameAr}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono block uppercase truncate">
                    {col.hex}
                  </span>
                </div>
                {colors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = colors.filter(c => c.id !== col.id);
                      onUpdateColors(updated);
                      // Make sure garments don't keep references to deleted colors
                      const updatedGarments = garments.map(g => ({
                        ...g,
                        availableColors: g.availableColors.filter(ac => ac.id !== col.id)
                      }));
                      onUpdateGarments(updatedGarments);
                    }}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded w-full transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>إزالة</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Color Form Collapse */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة لون جديد متوفر بالمتجر:</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم اللون بالعربي: *</label>
                <input
                  type="text"
                  value={newColorNameAr}
                  onChange={(e) => setNewColorNameAr(e.target.value)}
                  placeholder="مثال: رمادي ميتاليك"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الاسم بالإنجليزي: *</label>
                <input
                  type="text"
                  value={newColorNameEn}
                  onChange={(e) => setNewColorNameEn(e.target.value)}
                  placeholder="e.g., Metallic Gray"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="font-bold text-slate-700 block mb-1">رمز اللون (HEX): *</label>
                  <input
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    placeholder="#808080"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="flex flex-col items-center justify-end">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-8 h-8 border border-slate-300 rounded cursor-pointer p-0"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newColorNameAr.trim() || !newColorNameEn.trim()) return;
                    const hexCode = newColorHex.trim();
                    const colId = newColorNameEn.trim().toLowerCase().replace(/\s+/g, '-');
                    
                    // Simple luminance calculation to find textColor
                    const cleanHex = hexCode.replace('#', '');
                    let isLight = true;
                    if (cleanHex.length === 6) {
                      const r = parseInt(cleanHex.substring(0, 2), 16);
                      const g = parseInt(cleanHex.substring(2, 4), 16);
                      const b = parseInt(cleanHex.substring(4, 6), 16);
                      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                      isLight = luminance > 0.6;
                    }

                    const newCol: GarmentColor = {
                      id: colId,
                      nameAr: newColorNameAr.trim(),
                      nameEn: newColorNameEn.trim(),
                      hex: hexCode,
                      bgClass: `bg-[${hexCode}]`,
                      textColor: isLight ? '#18181b' : '#ffffff'
                    };

                    onUpdateColors([...colors, newCol]);
                    // Auto-enable for all garments
                    const updatedGarments = garments.map(g => ({
                      ...g,
                      availableColors: [...g.availableColors, newCol]
                    }));
                    onUpdateGarments(updatedGarments);

                    // Reset form
                    setNewColorNameAr('');
                    setNewColorNameEn('');
                    setNewColorHex('#000000');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold w-full py-1.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1 h-[34px] shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة اللون للمتجر</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sizes and Colors Toggle per Garment Product */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-slate-900 rounded-full inline-block"></span>
            <span>2. تخصيص مقاسات وألوان كل منتج بالتحديد:</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pb-2">
            {garments.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedEditGarmentId(g.id)}
                className={`py-2 px-3 rounded-lg border text-center font-bold text-xs transition-all ${
                  selectedEditGarmentId === g.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                {g.id === 'oversized-tee' ? 'تيشيرت أوفرسايز' :
                 g.id === 'classic-tee' ? 'تيشيرت كلاسيك' :
                 g.id === 'hoodie' ? 'هودي ثقيل' :
                 g.id === 'sweatshirt' ? 'بلوفر' : 'قميص'}
              </button>
            ))}
          </div>

          {/* Active Product Inventory Configuration */}
          {activeEditGarment && (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Size inventory checklist */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Shirt className="w-4 h-4 text-slate-600" />
                  <span>المقاسات المتوفرة لـ ({activeEditGarment.nameAr}):</span>
                </h4>
                
                <div className="grid grid-cols-3 gap-2">
                  {ALL_SIZES.map((size) => {
                    const isAvailable = activeEditGarment.availableSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          let updatedSizes: GarmentSize[];
                          if (isAvailable) {
                            if (activeEditGarment.availableSizes.length <= 1) return;
                            updatedSizes = activeEditGarment.availableSizes.filter(s => s !== size);
                          } else {
                            updatedSizes = [...activeEditGarment.availableSizes, size];
                            const order: GarmentSize[] = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
                            updatedSizes.sort((a, b) => order.indexOf(a) - order.indexOf(b));
                          }

                          const updatedGarments = garments.map(g => {
                            if (g.id === activeEditGarment.id) {
                              return { ...g, availableSizes: updatedSizes };
                            }
                            return g;
                          });
                          onUpdateGarments(updatedGarments);
                        }}
                        className={`py-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          isAvailable
                            ? 'bg-slate-900 text-white border-slate-900 shadow'
                            : 'bg-white hover:bg-slate-100 text-slate-400 border-slate-200 line-through'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-amber-400' : 'bg-slate-300'}`} />
                        <span>{size}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500">
                  انقر على المقاس لتفعيله أو تعطيله لزبائن هذا المنتج بالتحديد.
                </p>
              </div>

              {/* Color inventory checklist */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-slate-600" />
                  <span>الألوان المتوفرة لـ ({activeEditGarment.nameAr}):</span>
                </h4>

                <div className="flex flex-wrap gap-2">
                  {colors.map((col) => {
                    const isAvailable = activeEditGarment.availableColors.some(ac => ac.id === col.id);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          let updatedColors: GarmentColor[];
                          if (isAvailable) {
                            if (activeEditGarment.availableColors.length <= 1) return;
                            updatedColors = activeEditGarment.availableColors.filter(c => c.id !== col.id);
                          } else {
                            updatedColors = [...activeEditGarment.availableColors, col];
                          }

                          const updatedGarments = garments.map(g => {
                            if (g.id === activeEditGarment.id) {
                              return { ...g, availableColors: updatedColors };
                            }
                            return g;
                          });
                          onUpdateGarments(updatedGarments);
                        }}
                        className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-2 ${
                          isAvailable
                            ? 'bg-white text-slate-950 border-slate-900 shadow-sm ring-1 ring-slate-900/10'
                            : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                        }`}
                      >
                        <span 
                          className="w-3 h-3 rounded-full border border-slate-300 shadow-inner inline-block"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.nameAr}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500">
                  انقر لتفعيل أو تعطيل توفر اللون لمنتج ({activeEditGarment.nameAr}) في صفحة التصميم.
                </p>
              </div>

              {/* Real Photo Mockups */}
              <div className="md:col-span-2 border-t border-slate-200 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4 text-slate-600" />
                    <span>صور حقيقية للمنتج (Real Photography):</span>
                  </h4>
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                    <input
                      type="checkbox"
                      id="useRealPhoto"
                      checked={activeEditGarment.useRealPhoto || false}
                      onChange={(e) => {
                        const updatedGarments = garments.map(g => 
                          g.id === activeEditGarment.id ? { ...g, useRealPhoto: e.target.checked } : g
                        );
                        onUpdateGarments(updatedGarments);
                      }}
                      className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
                    />
                    <label htmlFor="useRealPhoto" className="text-[10px] font-bold text-amber-800 cursor-pointer">
                      تفعيل الصور الحقيقية
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 block">رابط صورة الواجهة (Front):</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="أدخل رابط صورة PNG شفافة..."
                        value={activeEditGarment.realImageUrlFront || ''}
                        onChange={(e) => {
                          const updatedGarments = garments.map(g => 
                            g.id === activeEditGarment.id ? { ...g, realImageUrlFront: e.target.value } : g
                          );
                          onUpdateGarments(updatedGarments);
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 block">رابط صورة الظهر (Back):</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="أدخل رابط صورة PNG شفافة..."
                        value={activeEditGarment.realImageUrlBack || ''}
                        onChange={(e) => {
                          const updatedGarments = garments.map(g => 
                            g.id === activeEditGarment.id ? { ...g, realImageUrlBack: e.target.value } : g
                          );
                          onUpdateGarments(updatedGarments);
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {activeEditGarment.realImageUrlFront && (
                    <div className="relative group aspect-square bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
                      <img src={activeEditGarment.realImageUrlFront} alt="Front preview" className="max-w-full max-h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">معاينة الواجهة</span>
                      </div>
                    </div>
                  )}
                  {activeEditGarment.realImageUrlBack && (
                    <div className="relative group aspect-square bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
                      <img src={activeEditGarment.realImageUrlBack} alt="Back preview" className="max-w-full max-h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">معاينة الظهر</span>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[9px] text-slate-400 bg-slate-100 p-2 rounded border border-slate-200/50">
                  💡 نصيحة: للحصول على أفضل نتيجة، استخدم صوراً بصيغة PNG وبخلفية شفافة. سيتم عرض التصميم فوق هذه الصور مباشرة في صفحة التصميم.
                </p>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Catalog Items Management */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <span>إدارة أعمال الكتالوج ({catalogItems.length} تصميم)</span>
            </h2>
            <p className="text-xs text-slate-500">
              يمكنك تنزيل وإضافة أعمال جديدة أو حذف التصاميم القديمة المعروضة للمستخدمين.
            </p>
          </div>

          <button
            onClick={() => {
              if (showAddForm && editingItemId) {
                // Just toggle if we were editing, but don't reset unless we want a fresh add
                setEditingItemId(null);
                setNewTitle('');
                setNewImageUrl('');
                setNewDescription('');
                setSelectedGarmentsForNewItem(garments.map((g) => g.id));
                setNewIsFixed(false);
                setNewFixedPlacement('free');
                setNewFrontScale(0.6);
                setNewBackScale(1.4);
                setNewAllowedTechnique('both');
              } else {
                setShowAddForm(!showAddForm);
                if (!showAddForm) {
                  setEditingItemId(null);
                  setNewTitle('');
                  setNewImageUrl('');
                  setNewDescription('');
                  setSelectedGarmentsForNewItem(garments.map((g) => g.id));
                  setNewIsFixed(false);
                  setNewFixedPlacement('free');
                  setNewAllowedTechnique('both');
                }
              }
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{editingItemId ? 'إيقاف التعديل وإضافة جديد' : 'إضافة عمل جديد للكتالوج'}</span>
          </button>
        </div>

        {/* Add Item Form Collapse */}
        {showAddForm && (
          <form onSubmit={handleAddItemSubmit} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 animate-fade-in">
            <h3 className="section-title-sleek flex items-center gap-2">
              {editingItemId ? <Edit3 className="w-4 h-4 text-amber-600" /> : <Sparkles className="w-4 h-4 text-slate-700" />}
              <span>{editingItemId ? `تعديل العمل: ${newTitle}` : 'تنزيل وإضافة عمل جديد في الكتالوج'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان العمل: *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: تطريز شعار الصقر المذهب"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 font-['Cairo']">
                  تقنية التنفيذ المتاحة لهذا التصميم: *
                </label>
                <select
                  value={newAllowedTechnique}
                  onChange={(e) => setNewAllowedTechnique(e.target.value as 'embroidery' | 'printing' | 'both')}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-900 transition-all"
                >
                  <option value="both">تطريز أو طباعة (كلاهما متاح للزبون) 🧵🎨</option>
                  <option value="embroidery">تطريز فقط (Embroidery Only) 🧵</option>
                  <option value="printing">طباعة فقط (Printing Only) 🎨</option>
                </select>
                <span className="text-[10px] text-slate-500 block mt-1 font-medium">
                  حدّد ما إذا كان هذا التصميم للطباعة فقط، أو للتطريز فقط، أو يمكن للزبون خياطته بالتقنيتين.
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">تصنيف الكتالوج: *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CatalogCategory)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  {(settings.categories || []).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  خيار الطباعة/التطريز (جهة أو جهتين): *
                </label>
                <select
                  value={newSideOption}
                  onChange={(e) => setNewSideOption(e.target.value as SideOption)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="one-side">جهة واحدة فقط (One Side Only)</option>
                  <option value="two-sides">جهتين (إلزامي للزبون) (Two Sides)</option>
                </select>
                <span className="text-[10px] text-slate-500 block mt-1 font-medium">
                  حدد ما إذا كان هذا التصميم مخصصاً لجهة واحدة فقط، أو يتطلب من الزبون إدخال جهتين (أمام وخلف).
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {newAllowedTechnique === 'embroidery' ? 'سعر التطريز (جهة 1): *' : 
                     newAllowedTechnique === 'printing' ? 'سعر الطباعة (جهة 1): *' : 
                     'سعر العمل (جهة 1): *'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    placeholder="مثال: 2.0"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    سعر العمل (جهتين):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPriceTwoSides}
                    onChange={(e) => setNewPriceTwoSides(parseFloat(e.target.value) || 0)}
                    placeholder="مثال: 3.5"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">يُستخدم إذا قام الزبون بتفعيل جهتين.</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block mb-1">ارفع صورة العمل: (اختياري)</label>
                <div className="flex items-center gap-3">
                  <label className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors text-xs font-bold shadow-sm">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>اختر ملف صورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleItemImageUpload}
                      className="hidden"
                    />
                  </label>
                  {newImageUrl && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>تم تجهيز الصورة</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">أو رابط صورة مباشرة (URL):</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Garment Compatibility Selectors */}
            <div className="space-y-2 border-t border-slate-200/80 pt-4">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-2 font-['Cairo']">
                <Shirt className="w-4 h-4 text-slate-700" />
                <span>الملابس المتوافقة والمسموح بالطباعة/التطريز عليها: *</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {garments.map((g) => {
                  const isChecked = selectedGarmentsForNewItem.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          if (selectedGarmentsForNewItem.length > 1) {
                            setSelectedGarmentsForNewItem(prev => prev.filter((id) => id !== g.id));
                          }
                        } else {
                          setSelectedGarmentsForNewItem(prev => [...prev, g.id]);
                        }
                      }}
                      className={`py-2 px-3 rounded-lg border text-right text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isChecked
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-bold'
                          : 'bg-white hover:bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <span className="truncate leading-tight">
                        {g.id === 'oversized-tee' ? 'تيشيرت أوفرسايز' :
                         g.id === 'classic-tee' ? 'تيشيرت كلاسيك' :
                         g.id === 'hoodie' ? 'هودي ثقيل' :
                         g.id === 'sweatshirt' ? 'بلوفر' : 'قميص'}
                      </span>
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        isChecked ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-slate-300'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                ⚠️ التصاميم غير المحددة هنا لن تظهر كخيار متاح عندما يختار الزبون هذه القطعة الملبسية من الكتالوج.
              </p>
            </div>

            {/* Position and Movement Lock Selectors */}
            <div className="space-y-4 border-t border-slate-200/80 pt-4">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1 font-['Cairo']">
                <Sliders className="w-4 h-4 text-slate-700" />
                <span>تحكم موضع التصميم وقابلية الحركة (قفل أبعاد وحركة التصميم):</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Toggle Lock Movement */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-sm">
                  <div className="space-y-0.5 text-right">
                    <span className="font-bold text-xs text-slate-900 block font-['Cairo']">
                      قفل الحركة والتعديل 🔒
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-relaxed">
                      عند التفعيل، لا يستطيع الزبون تكبير، تدوير، أو سحب التصميم (سيكون ثابتاً تماماً في الاستوديو).
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNewIsFixed(!newIsFixed)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none flex items-center ${
                      newIsFixed ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        newIsFixed ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Lock Placement Selector */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-sm text-right">
                  <label className="font-bold text-xs text-slate-900 block font-['Cairo']">
                    موقع تنفيذ التصميم الإجباري:
                  </label>
                  <select
                    value={newFixedPlacement}
                    onChange={(e) => setNewFixedPlacement(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  >
                    <option value="free">حر (يختار الزبون الموضع بنفسه) 🧭</option>
                    <option value="center-chest">منتصف الصدر فقط (Center Chest) 👕</option>
                    <option value="left-chest">الصدر الأيسر / الجيب فقط (Left Chest) 🏷️</option>
                    <option value="back-full">الظهر كاملاً فقط (Back Full) 🧥</option>
                    <option value="sleeve">على الكم فقط (Sleeve) 🦾</option>
                  </select>
                  <span className="text-[10px] text-slate-500 block leading-relaxed font-medium">
                    يُحدد الموضع إجبارياً للتصميم ولا يملك المستخدم خيار نقله لجهة أخرى.
                  </span>
                </div>

                {/* 3. Scale Presets for Front/Back */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-sm text-right md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Maximize2 className="w-4 h-4 text-slate-700" />
                    <label className="font-bold text-xs text-slate-900 block font-['Cairo']">
                      إعدادات الحجم التلقائي (Presets):
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>حجم التصميم على الصدر (الأمام):</span>
                        <span className="text-slate-900 font-mono">{(newFrontScale * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="1.2"
                        step="0.05"
                        value={newFrontScale}
                        onChange={(e) => setNewFrontScale(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg accent-slate-900 cursor-pointer"
                      />
                      <p className="text-[9px] text-slate-400">يفضل أن يكون صغيراً (0.5 - 0.7) للمظهر الكلاسيكي.</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>حجم التصميم على الظهر (الخلف):</span>
                        <span className="text-slate-900 font-mono">{(newBackScale * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="2.0"
                        step="0.05"
                        value={newBackScale}
                        onChange={(e) => setNewBackScale(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg accent-slate-900 cursor-pointer"
                      />
                      <p className="text-[9px] text-slate-400">يفضل أن يكون كبيراً (1.3 - 1.6) ليغطي مساحة الظهر.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 font-['Cairo']">وصف العمل:</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                placeholder="اكتب وصفاً مختصراً للعمل وخيوط التطريز والألوان..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs shadow-sm"
              >
                {editingItemId ? 'حفظ التعديلات' : 'تنزيل وحفظ في الكتالوج'}
              </button>
            </div>
          </form>
        )}

        {/* Catalog Items List Table / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {catalogItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-12 h-12 object-cover rounded-md border border-slate-200 flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{item.title}</h4>
                  <span className="text-[10px] text-slate-500 block">
                    {item.technique === 'embroidery' ? '🧵 تطريز' : '🎨 طباعة'} • +{item.price.toFixed(3)} {settings.currency}
                  </span>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-medium block">#{item.category}</span>
                    {item.allowedGarments && item.allowedGarments.length > 0 ? (
                      <span className="text-[9px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 block truncate max-w-[150px] font-bold">
                        متاح لـ: {item.allowedGarments.map(id => {
                          if (id === 'oversized-tee') return 'أوفرسايز';
                          if (id === 'classic-tee') return 'كلاسيك';
                          if (id === 'hoodie') return 'هودي';
                          if (id === 'sweatshirt') return 'بلوفر';
                          if (id === 'shirt') return 'قميص';
                          if (id === 'cap') return 'قبعة';
                          if (id === 'long-sleeve') return 'كم طويل';
                          return id;
                        }).join('، ')}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500 block font-medium">متاح لـ: جميع الملابس</span>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.isFixed && (
                        <span className="text-[8px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/30 font-extrabold inline-block">
                          🔒 حركة ثابتة
                        </span>
                      )}
                      {item.fixedPlacement && (
                        <span className="text-[8px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200/30 font-extrabold inline-block">
                          📍 موضع: {item.fixedPlacement === 'center-chest' ? 'الصدر' : item.fixedPlacement === 'left-chest' ? 'اليسار' : item.fixedPlacement === 'back-full' ? 'الظهر' : 'الكم'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setEditingItemId(item.id);
                    setNewTitle(item.title);
                    setNewCategory(item.category);
                    setNewAllowedTechnique(item.allowedTechniqueOption || 'both');
                    setNewImageUrl(item.imageUrl);
                    setNewPrice(item.price);
                    setNewPriceTwoSides(item.priceTwoSides || (item.price * 1.5));
                    setNewSideOption(item.sideOption || 'one-side');
                    setNewDescription(item.description);
                    setNewIsFixed(item.isFixed || false);
                    setNewFixedPlacement(item.fixedPlacement || 'free');
                    setNewFrontScale(item.frontScale || 0.6);
                    setNewBackScale(item.backScale || 1.4);
                    setSelectedGarmentsForNewItem(item.allowedGarments || garments.map(g => g.id));
                    setShowAddForm(true);
                    // Scroll to top of form
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  title="تعديل هذا العمل"
                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors flex-shrink-0"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteCatalogItem(item.id)}
                  title="حذف هذا العمل من الكتالوج"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
