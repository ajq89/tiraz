import React, { useState, useEffect } from 'react';
import { 
  Shirt, 
  Palette, 
  Sliders, 
  Upload, 
  Type, 
  Sparkles, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Ruler, 
  Check, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Info,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  ShoppingBag,
  Truck
} from 'lucide-react';
import { 
  GarmentOption, 
  GarmentColor, 
  GarmentSize, 
  TechniqueType, 
  PlacementPosition, 
  CustomDesignState, 
  CatalogItem, 
  StoreSettings 
} from '../types';
import { GarmentSvgMockup } from './GarmentSvgMockup';

interface StudioCustomizerProps {
  initialCatalogItem?: CatalogItem | null;
  catalogItems: CatalogItem[];
  settings: StoreSettings;
  garments: GarmentOption[];
  colors: GarmentColor[];
  onOpenOrderModal: (customizationData: {
    garment: GarmentOption;
    color: GarmentColor;
    size: GarmentSize;
    view: 'front' | 'back';
    customization: CustomDesignState;
    secondaryCustomization?: CustomDesignState | null;
    hasSecondarySide: boolean;
    subtotal: number;
    deliveryFee: number;
    total: number;
  }) => void;
  onAddToCart: (item: {
    garment: GarmentOption;
    color: GarmentColor;
    size: GarmentSize;
    customization: CustomDesignState;
    secondaryCustomization?: CustomDesignState | null;
    hasSecondarySide: boolean;
    quantity: number;
    subtotal: number;
    previewUrl?: string;
  }) => void;
  onOpenSizeGuide: () => void;
}

export const StudioCustomizer: React.FC<StudioCustomizerProps> = ({
  initialCatalogItem,
  catalogItems,
  settings,
  garments,
  colors,
  onOpenOrderModal,
  onAddToCart,
  onOpenSizeGuide,
}) => {
  // Garment selection state
  const [selectedGarment, setSelectedGarment] = useState<GarmentOption>(() => {
    const defaultItem = initialCatalogItem || null;
    if (defaultItem && defaultItem.allowedGarments && defaultItem.allowedGarments.length > 0) {
      const allowed = garments.find(g => defaultItem.allowedGarments?.includes(g.id));
      if (allowed) return allowed;
    }
    return garments.find(g => g.id === 'oversized-tee') || garments[0];
  });
  const [selectedColor, setSelectedColor] = useState<GarmentColor>(() => {
    const defaultColor = colors.find(c => c.id === 'black') || colors[0];
    return defaultColor;
  });
  const [selectedSize, setSelectedSize] = useState<GarmentSize>('L');
  const [view, setView] = useState<'front' | 'back'>(() => {
    const defaultItem = initialCatalogItem || null;
    if (defaultItem && defaultItem.fixedPlacement === 'back-full') {
      return 'back';
    }
    return 'front';
  });

  // Handle selected garment changing safely
  const handleGarmentChange = (garment: GarmentOption) => {
    setSelectedGarment(garment);
    const available = colors.filter(c => 
      garment.availableColors.some(ac => ac.id === c.id)
    );
    if (available.length > 0 && !available.some(c => c.id === selectedColor.id)) {
      setSelectedColor(available[0]);
    }
  };

  // Garment active colors filtered by enabled ones
  const garmentColors = colors.filter(c => 
    selectedGarment.availableColors.some(ac => ac.id === c.id)
  );

  // Customization state
  const [customization, setCustomization] = useState<CustomDesignState>(() => {
    const defaultItem = initialCatalogItem || null;
    return {
      designType: 'catalog',
      catalogItem: defaultItem,
      uploadedImageUrl: null,
      customText: 'طراز',
      textColor: '#f59e0b',
      fontFamily: 'Cairo',
      technique: defaultItem?.technique || 'embroidery',
      placement: defaultItem?.fixedPlacement || 'center-chest',
      scale: 1.0,
      positionX: 0,
      positionY: 0,
      rotation: 0,
    };
  });

  const [secondaryCustomization, setSecondaryCustomization] = useState<CustomDesignState | null>(null);
  const [hasSecondarySide, setHasSecondarySide] = useState(false);

  // Helper to handle customization updates based on current view
  const updateActiveCustomization = (updater: (prev: CustomDesignState) => CustomDesignState | any) => {
    if (view === 'front') {
      setCustomization(updater);
    } else if (view === 'back' && hasSecondarySide && secondaryCustomization) {
      setSecondaryCustomization(updater as any);
    } else {
      // Default to primary if not on an active secondary side
      setCustomization(updater);
    }
  };

  const activeCustomization = (view === 'back' && hasSecondarySide && secondaryCustomization) 
    ? secondaryCustomization 
    : customization;

  // Active Tab for Design Input (Catalog, Upload, Custom Text, Full Upload)
  const [designTab, setDesignTab] = useState<'catalog' | 'upload' | 'text' | 'full-upload'>(
    initialCatalogItem ? 'catalog' : 'catalog'
  );

  // Active Category Filter for Catalog items
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Effect to handle catalog item side requirements
  useEffect(() => {
    if (customization.designType === 'catalog' && customization.catalogItem) {
      if (customization.catalogItem.sideOption === 'two-sides' && !hasSecondarySide) {
        setSecondaryCustomization({ ...customization });
        setHasSecondarySide(true);
      } else if (customization.catalogItem.sideOption === 'one-side' && hasSecondarySide) {
        setHasSecondarySide(false);
        setSecondaryCustomization(null);
        setView('front');
      }
    }
  }, [customization.catalogItem, hasSecondarySide]);

  // Price Calculation Logic
  const garmentBasePrice = settings.basePrices[selectedGarment.id] || selectedGarment.basePrice;
  const placementExtra = 0.0;
  
  // Design pricing logic: 
  // If it's a catalog item and dual-sided is enabled, use priceTwoSides if available.
  // Otherwise, fallback to base price + secondary design price.
  let primaryDesignPrice = customization.designType === 'catalog' && customization.catalogItem 
    ? (hasSecondarySide && customization.catalogItem.priceTwoSides ? customization.catalogItem.priceTwoSides : customization.catalogItem.price)
    : (customization.designType === 'full-upload' ? 0 : 1.5);
    
  let secondaryDesignPrice = 0;
  
  // If we are NOT using the special "priceTwoSides" from the primary catalog item, 
  // and we have a secondary side enabled, calculate its independent price.
  const usingBulkTwoSidePrice = customization.designType === 'catalog' && customization.catalogItem && hasSecondarySide && customization.catalogItem.priceTwoSides;
  
  if (!usingBulkTwoSidePrice && hasSecondarySide && secondaryCustomization) {
    secondaryDesignPrice = secondaryCustomization.designType === 'catalog' && secondaryCustomization.catalogItem 
      ? secondaryCustomization.catalogItem.price 
      : 1.5;
  }

  const subtotal = garmentBasePrice + placementExtra + primaryDesignPrice + secondaryDesignPrice;
  const deliveryFee = settings.deliveryFee;
  const isFreeDelivery = !!settings.enablePromoFreeDelivery || (settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold);
  const finalDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const totalPrice = subtotal + finalDeliveryFee;

  // Image Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        updateActiveCustomization((prev) => ({
          ...prev,
          designType: designTab === 'full-upload' ? 'full-upload' : 'upload',
          uploadedImageUrl: url,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset Adjustments
  const handleResetAdjustments = () => {
    updateActiveCustomization((prev) => ({
      ...prev,
      scale: 1.0,
      positionX: 0,
      positionY: 0,
      rotation: 0,
    }));
  };

  const isDesignFixed = activeCustomization.designType === 'catalog' && !!activeCustomization.catalogItem?.isFixed;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="section-title-sleek block mb-1">استوديو التصميم المباشر</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            صمم ملابسك بالتطريز والطباعة
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            اختر نوع الملابس، اللون، المقاس، وضع تصميمك أو اختار من الكتالوج وشاهد النتيجة مباشرة.
          </p>
        </div>

        <button
          onClick={onOpenSizeGuide}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm"
        >
          <Ruler className="w-4 h-4 text-slate-700" />
          <span>جدول المقاسات (cm)</span>
        </button>
      </div>

      {/* Main Studio Grid: Mockup Canvas Left, Customizer Options Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Canvas Live Preview */}
        <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col items-center justify-between min-h-[540px] relative overflow-hidden">
          
          {/* Top Control Bar on Canvas */}
          <div className="w-full flex items-center justify-between z-10 gap-2 mb-2">
            
            {/* View Switcher (Front/Back) */}
            <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 text-xs font-bold">
              <button
                onClick={() => setView('front')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  view === 'front' ? 'bg-white text-slate-900 font-bold shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                الأمام (Front)
              </button>
              <button
                onClick={() => setView('back')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  view === 'back' ? 'bg-white text-slate-900 font-bold shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                الظهر (Back)
              </button>
            </div>

            {/* Technique Badge */}
            <div className="flex items-center gap-2">
              {hasSecondarySide && (
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-tight border border-emerald-500">
                  Dual Sided الطلب بجهتين
                </span>
              )}
              <span className="bg-slate-800 text-amber-400 border border-slate-700 text-xs font-bold px-3 py-1 rounded-md">
                {activeCustomization.technique === 'embroidery' ? '🧵 تطريز آلي' : '🎨 طباعة حرارية'}
              </span>
            </div>
          </div>

          {/* Canvas SVG Mockup Component */}
          <div className="w-full my-auto py-2 flex flex-col items-center justify-center min-h-[400px]">
            {activeCustomization.designType === 'full-upload' && activeCustomization.uploadedImageUrl ? (
              <div className="relative w-full max-w-md animate-in zoom-in-95 duration-500">
                <img 
                  src={activeCustomization.uploadedImageUrl} 
                  alt="Full Custom Design" 
                  className="w-full h-auto rounded-xl shadow-2xl border-4 border-slate-800"
                />
                <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-widest border border-emerald-400">
                  Full Preview
                </div>
              </div>
            ) : (
              <GarmentSvgMockup
                garmentType={selectedGarment.id}
                garment={selectedGarment}
                color={selectedColor}
                view={view}
                customization={activeCustomization}
                interactive={!isDesignFixed}
                onPositionChange={isDesignFixed ? undefined : (x, y) =>
                  updateActiveCustomization((prev) => ({ ...prev, positionX: x, positionY: y }))
                }
              />
            )}
            
            {/* Disclaimer Alert */}
            <div className="mt-4 px-4 py-1.5 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 font-['Cairo']">
                <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                تنبيه: هذه الصورة للمعاينة فقط، والمنتج في الحقيقة أفضل وبجودة أعلى
              </p>
            </div>
          </div>

          {/* Bottom Interactive Controls (Zoom, Rotate, Reset) */}
          <div className="w-full z-10 bg-slate-800/90 p-3 rounded-xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium px-1">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>التحكم بالحجم والتمركز فوق الملابس</span>
              </span>
              {!isDesignFixed && (
                <button
                  onClick={handleResetAdjustments}
                  className="text-slate-400 hover:text-white text-[11px] underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة ضبط</span>
                </button>
              )}
            </div>

            {isDesignFixed ? (
              <div className="bg-slate-900/40 border border-amber-500/10 p-2.5 rounded-lg text-center space-y-1">
                <span className="text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 font-['Cairo']">
                  <span>🔒 هذا التصميم بموضع وحجم ثابت لا يتغير</span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  تم تحديد حجم وموضع التطريز/الطباعة تلقائياً لضمان المظهر والمقاييس المثالية.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Scale Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>الحجم (Scale)</span>
                    <span className="text-amber-400 font-mono">{(activeCustomization.scale * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.05"
                      value={activeCustomization.scale}
                      onChange={(e) =>
                        updateActiveCustomization((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Rotation Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>التدوير (Rotate)</span>
                    <span className="text-amber-400 font-mono">{activeCustomization.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={activeCustomization.rotation}
                    onChange={(e) =>
                      updateActiveCustomization((prev) => ({ ...prev, rotation: parseInt(e.target.value) }))
                    }
                    className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customizer Controls & Options */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Real-time Price Sticky Summary (Top) */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-fade-in relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white rotate-3 shadow-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-slate-500 font-black uppercase tracking-tight font-['Cairo']">سعر طلبك الحالي:</span>
                <span className="text-xs text-slate-900 font-extrabold flex items-center gap-1">
                  شامل القطعة والتصميم 
                  {isFreeDelivery && <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>}
                </span>
              </div>
            </div>

            <div className="text-left relative z-10">
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tighter flex flex-col items-end">
                <span>{totalPrice.toFixed(3)} <span className="text-sm">{settings.currency}</span></span>
                {isFreeDelivery ? (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1 mt-0.5">
                    <Truck className="w-3 h-3" />
                    <span>توصيل مجاني 🚚</span>
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 font-bold mt-0.5">تطبق رسوم التوصيل ({finalDeliveryFee.toFixed(3)})</span>
                )}
              </div>
            </div>
          </div>

          {/* Step 1: Garment Type */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="section-title-sleek flex items-center gap-2">
                <Shirt className="w-4 h-4 text-slate-700" />
                <span>نوع الملابس</span>
              </label>
              <span className="text-xs text-slate-900 font-extrabold">
                {garmentBasePrice.toFixed(3)} {settings.currency}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {garments.map((garment) => {
                const price = settings.basePrices[garment.id] || garment.basePrice;
                const isAllowed = !activeCustomization.catalogItem || 
                                  !activeCustomization.catalogItem.allowedGarments || 
                                  activeCustomization.catalogItem.allowedGarments.length === 0 || 
                                  activeCustomization.catalogItem.allowedGarments.includes(garment.id) || 
                                  activeCustomization.designType !== 'catalog';
                return (
                  <button
                    key={garment.id}
                    disabled={!isAllowed}
                    onClick={() => handleGarmentChange(garment)}
                    className={`p-3 rounded-lg border text-right transition-all text-xs flex flex-col justify-between h-18 relative ${
                      selectedGarment.id === garment.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-bold'
                        : isAllowed
                          ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200/60 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span className="line-clamp-2 leading-tight">{garment.nameAr}</span>
                    <div className="flex items-center justify-between w-full mt-1">
                      <span className="text-[11px] opacity-80 font-extrabold">
                        {price.toFixed(3)} {settings.currency}
                      </span>
                      {!isAllowed && (
                        <span className="text-[8px] bg-rose-50 text-rose-600 border border-rose-200 px-1 py-0.5 rounded font-extrabold whitespace-nowrap">
                          غير متوافق ⚠️
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Garment Color */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <label className="section-title-sleek flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-700" />
              <span>لون القماش ({selectedColor ? selectedColor.nameAr : ''})</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {garmentColors.map((col) => {
                const isSelected = selectedColor && selectedColor.id === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => setSelectedColor(col)}
                    title={col.nameAr}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'scale-110 border-slate-900 ring-2 ring-slate-900/20 shadow-sm' : 'border-slate-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  >
                    {isSelected && (
                      <Check
                        className="w-3.5 h-3.5"
                        style={{ color: col.id === 'white' || col.id === 'cream' || col.id === 'sand' ? '#0f172a' : '#ffffff' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Size & Technique Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Size */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
              <label className="section-title-sleek flex items-center justify-between">
                <span>المقاس</span>
                <button onClick={onOpenSizeGuide} className="text-[11px] text-slate-900 underline font-semibold">
                  دليل المقاسات
                </button>
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {selectedGarment.availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`h-10 rounded-xl text-xs font-black border transition-all flex items-center justify-center ${
                      selectedSize === sz
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-[1.03]'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

          {/* Technique (Embroidery vs Print) */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="section-title-sleek">تقنية التنفيذ</label>
                {activeCustomization.designType === 'catalog' && activeCustomization.catalogItem?.allowedTechniqueOption && (
                  <span className="text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-extrabold font-['Cairo']">
                    {activeCustomization.catalogItem.allowedTechniqueOption === 'embroidery' ? '🧵 تطريز فقط' :
                     activeCustomization.catalogItem.allowedTechniqueOption === 'printing' ? '🎨 طباعة فقط' : '🧵🎨 تطريز أو طباعة'}
                  </span>
                )}
              </div>

              {(() => {
                const activeItem = activeCustomization.designType === 'catalog' ? activeCustomization.catalogItem : null;
                const opt = activeItem?.allowedTechniqueOption || 'both';
                const isEmbroideryDisabled = opt === 'printing';
                const isPrintingDisabled = opt === 'embroidery';

                return (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        disabled={isEmbroideryDisabled}
                        onClick={() =>
                          updateActiveCustomization((prev) => ({ ...prev, technique: 'embroidery' }))
                        }
                        className={`p-2.5 rounded-lg border font-bold transition-all flex flex-col items-center gap-1 ${
                          activeCustomization.technique === 'embroidery'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : isEmbroideryDisabled
                            ? 'bg-slate-50 text-slate-300 border-slate-200 opacity-50 cursor-not-allowed line-through'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>تطريز 🧵</span>
                        <span className="text-[10px] font-normal opacity-75">
                          {isEmbroideryDisabled ? 'غير متاح لهذا التصميم' : 'خيوط بارزة ودائمة'}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={isPrintingDisabled}
                        onClick={() => updateActiveCustomization((prev) => ({ ...prev, technique: 'printing' }))}
                        className={`p-2.5 rounded-lg border font-bold transition-all flex flex-col items-center gap-1 ${
                          activeCustomization.technique === 'printing'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : isPrintingDisabled
                            ? 'bg-slate-50 text-slate-300 border-slate-200 opacity-50 cursor-not-allowed line-through'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>طباعة 🎨</span>
                        <span className="text-[10px] font-normal opacity-75">
                          {isPrintingDisabled ? 'غير متاح لهذا التصميم' : 'ألوان حيوية ودقيقة'}
                        </span>
                      </button>
                    </div>

                    {(isEmbroideryDisabled || isPrintingDisabled) && (
                      <p className="text-[10px] font-bold text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/50 text-center font-['Cairo']">
                        💡 {isEmbroideryDisabled ? 'هذا التصميم متاح للطباعة فقط بناءً على خيارات المصمم.' : 'هذا التصميم متاح للتطريز فقط بناءً على خيارات المصمم.'}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Step 4: Placement Position */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="section-title-sleek">موقع التطريز / الطباعة</label>
              {activeCustomization.designType === 'catalog' && activeCustomization.catalogItem?.fixedPlacement && (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/40 font-bold flex items-center gap-1">
                  🔒 موضع ثابت من المصمم
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'center-chest', label: 'منتصف الصدر' },
                { id: 'left-chest', label: 'الصدر الأيسر (الجيب)' },
                { id: 'back-full', label: 'الظهر كاملاً' },
                { id: 'sleeve', label: 'على الكم' },
              ].map((pos) => {
                const isLocked = activeCustomization.designType === 'catalog' && 
                                 activeCustomization.catalogItem?.fixedPlacement && 
                                 activeCustomization.catalogItem.fixedPlacement !== pos.id;
                return (
                  <button
                    key={pos.id}
                    disabled={!!isLocked}
                    onClick={() => {
                      const newPos = pos.id as PlacementPosition;
                      if (newPos === 'back-full') setView('back');
                      else setView('front');

                      // Auto-adjust scale based on item presets or defaults
                      let newScale = activeCustomization.scale;
                      const activeItem = activeCustomization.designType === 'catalog' ? activeCustomization.catalogItem : null;
                      
                      if (activeItem) {
                        if (newPos === 'back-full' && activeItem.backScale) {
                          newScale = activeItem.backScale;
                        } else if ((newPos === 'left-chest' || newPos === 'sleeve') && activeItem.frontScale) {
                          newScale = activeItem.frontScale;
                        } else if (newPos === 'center-chest') {
                          newScale = 1.0; // Standard center chest size
                        }
                      } else {
                        // General defaults for custom uploads
                        if (newPos === 'back-full') newScale = 1.4;
                        else if (newPos === 'left-chest' || newPos === 'sleeve') newScale = 0.6;
                        else if (newPos === 'center-chest') newScale = 1.0;
                      }

                      updateActiveCustomization((prev) => ({ 
                        ...prev, 
                        placement: newPos,
                        scale: newScale 
                      }));
                    }}
                    className={`py-2 px-2 rounded-lg border text-center font-semibold text-xs transition-all ${
                      activeCustomization.placement === pos.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-bold'
                        : isLocked
                          ? 'bg-slate-50 text-slate-300 border-slate-200/40 opacity-40 cursor-not-allowed'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {pos.label}
                  </button>
                );
              })}
            </div>
            {activeCustomization.designType === 'catalog' && activeCustomization.catalogItem?.fixedPlacement && (
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                📌 تم تثبيت موضع هذا العمل على (
                {activeCustomization.catalogItem.fixedPlacement === 'center-chest' ? 'منتصف الصدر' :
                 activeCustomization.catalogItem.fixedPlacement === 'left-chest' ? 'الصدر الأيسر' :
                 activeCustomization.catalogItem.fixedPlacement === 'back-full' ? 'الظهر كاملاً' : 'الكم'}
                ) بتوصية المصمم للحصول على أعلى جودة للطباعة والتطريز.
              </p>
            )}
          </div>

          {/* Step 5: Choose Design Source (Catalog, Upload, Custom Text) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <label className="section-title-sleek flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-700" />
                <span>مصدر التصميم</span>
              </label>

              {/* Design Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto whitespace-nowrap max-w-full scrollbar-none gap-1 no-swipe">
                <button
                  onClick={() => {
                    setDesignTab('catalog');
                    updateActiveCustomization((prev) => ({ ...prev, designType: 'catalog' }));
                  }}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg transition-all ${
                    designTab === 'catalog' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الكتالوج
                </button>
                <button
                  onClick={() => {
                    setDesignTab('upload');
                    updateActiveCustomization((prev) => ({ ...prev, designType: 'upload' }));
                  }}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg transition-all ${
                    designTab === 'upload' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  رفع ملف خاص
                </button>
                <button
                  onClick={() => {
                    setDesignTab('text');
                    updateActiveCustomization((prev) => ({ ...prev, designType: 'text' }));
                  }}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg transition-all ${
                    designTab === 'text' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  نص / اسم
                </button>
                <button
                  onClick={() => {
                    setDesignTab('full-upload');
                    updateActiveCustomization((prev) => ({ ...prev, designType: 'full-upload' }));
                  }}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg transition-all ${
                    designTab === 'full-upload' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  صورة كاملة
                </button>
              </div>
            </div>

            {/* Tab 1: Catalog Picker */}
            {designTab === 'catalog' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">اختر تصميماً من كتالوج طراز الجاهز:</p>

                {/* Dynamic Category Filter Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none text-[11px] font-bold">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                      activeCategory === 'all'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    الكل 🌟
                  </button>
                  {(settings.categories || []).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                        activeCategory === cat.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.nameAr}
                    </button>
                  ))}
                </div>

                {/* Grid of Catalog Items */}
                {(() => {
                  const filteredItems = catalogItems.filter((item) => 
                    activeCategory === 'all' || item.category === activeCategory
                  );
                  if (filteredItems.length === 0) {
                    return (
                      <p className="text-[11px] text-slate-400 text-center py-8 font-medium">
                        لا توجد أعمال جاهزة في هذا التصنيف حالياً.
                      </p>
                    );
                  }
                  return (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                      {filteredItems.map((item) => {
                        const isSelected = activeCustomization.catalogItem?.id === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (item.allowedGarments && item.allowedGarments.length > 0) {
                                if (!item.allowedGarments.includes(selectedGarment.id)) {
                                  const firstAllowed = garments.find(g => item.allowedGarments?.includes(g.id));
                                  if (firstAllowed) {
                                    handleGarmentChange(firstAllowed);
                                  }
                                }
                              }
                              if (item.fixedPlacement) {
                                if (item.fixedPlacement === 'back-full') setView('back');
                                else setView('front');
                              }
                              const targetTech = item.allowedTechniqueOption === 'printing' ? 'printing' : 
                                                 item.allowedTechniqueOption === 'embroidery' ? 'embroidery' : 
                                                 item.technique || 'embroidery';
                              const targetPlacement = item.fixedPlacement || 'center-chest';
                              let targetScale = 1.0;
                              if (targetPlacement === 'back-full' && item.backScale) {
                                targetScale = item.backScale;
                              } else if ((targetPlacement === 'left-chest' || targetPlacement === 'sleeve') && item.frontScale) {
                                targetScale = item.frontScale;
                              }

                              updateActiveCustomization((prev) => ({
                                ...prev,
                                designType: 'catalog',
                                catalogItem: item,
                                technique: targetTech,
                                placement: targetPlacement,
                                scale: targetScale,
                                positionX: 0,
                                positionY: 0,
                                rotation: 0,
                              }));
                            }}
                            className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              isSelected ? 'border-slate-900 ring-2 ring-slate-900/20' : 'border-slate-200 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                              <span className="text-[10px] text-white font-bold text-center leading-tight line-clamp-2">
                                {item.title}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tab 2: Custom File Upload */}
            {designTab === 'upload' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  ارفع صورة لشعارك أو رسمتك الخاصة من جهازك (PNG / JPG / SVG):
                </p>

                <div className="upload-box relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      اسحب صورتك هنا أو انقر للرفع
                    </span>
                    <span className="text-[11px] text-slate-400">
                      يدعم الصور بدقة عالية بخلفية شفافة
                    </span>
                  </div>
                </div>

                {activeCustomization.uploadedImageUrl && (
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <img
                      src={activeCustomization.uploadedImageUrl}
                      alt="Uploaded preview"
                      className="w-12 h-12 object-cover rounded-md border border-slate-200"
                    />
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-emerald-700 block">تم رفع الصورة بنجاح!</span>
                      <span className="text-slate-500">يمكنك ضبط الحجم والتمركز من الشاشة.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Custom Text / Name */}
            {designTab === 'text' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">اكتب الاسم أو الكلمة المطلوبة للتطريز أو الطباعة:</p>

                <input
                  type="text"
                  value={activeCustomization.customText || ''}
                  onChange={(e) =>
                    updateActiveCustomization((prev) => ({ ...prev, customText: e.target.value }))
                  }
                  placeholder="اكتب اسمك أو عبارة بالخط العربي..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />

                {/* Preset words */}
                <div className="flex flex-wrap gap-1.5">
                  {['حُب', 'شغف', 'ناموس', 'البحرين 🇧🇭', 'TIRAZ.BH', 'Farid', '0973'].map((word) => (
                    <button
                      key={word}
                      onClick={() =>
                        updateActiveCustomization((prev) => ({ ...prev, customText: word }))
                      }
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium"
                    >
                      {word}
                    </button>
                  ))}
                </div>

                {/* Color picker for text */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-slate-600 font-bold">لون الخيط / الحبر:</span>
                  <div className="flex gap-2">
                    {['#f59e0b', '#ffffff', '#0f172a', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'].map((clr) => (
                      <button
                        key={clr}
                        onClick={() => updateActiveCustomization((prev) => ({ ...prev, textColor: clr }))}
                        className={`w-5 h-5 rounded-full border ${
                          activeCustomization.textColor === clr ? 'ring-2 ring-slate-900 scale-110' : ''
                        }`}
                        style={{ backgroundColor: clr }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Full Image Upload */}
            {designTab === 'full-upload' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] leading-relaxed text-amber-900 font-medium">
                    هذا الخيار مخصص إذا كان لديك صورة كاملة للمنتج (مثل تيشيرت مصمم مسبقاً) وتريد إرساله لنا للتنفيذ مباشرة دون استخدام المحاكي.
                  </div>
                </div>

                <div className="upload-box relative border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shadow-sm border border-slate-200">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">ارفع صورة المنتج الكاملة</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG لدقة عالية</span>
                  </div>
                </div>

                {activeCustomization.uploadedImageUrl && activeCustomization.designType === 'full-upload' && (
                  <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
                    <img
                      src={activeCustomization.uploadedImageUrl}
                      alt="Full product preview"
                      className="w-16 h-16 object-cover rounded-lg shadow-sm border border-white"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-black text-emerald-800 block mb-0.5">تم اعتماد الصورة الكاملة ✅</span>
                      <p className="text-[10px] text-emerald-600 leading-tight">
                        سنقوم بتنفيذ الطلب بناءً على هذه الصورة المرفقة.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Price Panel & Checkout */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-right">
            {/* Header title for breakdown */}
            <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-200">
              <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full inline-block"></span>
              <span className="font-extrabold text-xs text-slate-900 font-['Cairo']">تفصيل تسعيرة طلبك الحالية:</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Garment Base */}
              <div className="flex items-center justify-between py-0.5 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-slate-400 rounded-full inline-block"></span>
                  <span>القطعة ({selectedGarment.nameAr})</span>
                </div>
                <span className="font-mono text-slate-900 font-bold">{garmentBasePrice.toFixed(3)} {settings.currency}</span>
              </div>

              {/* Extra Placement */}
              {placementExtra > 0 && (
                <div className="flex items-center justify-between py-0.5 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-slate-400 rounded-full inline-block"></span>
                    <span>إضافة موقع (الظهر كاملاً 🛡️)</span>
                  </div>
                  <span className="font-mono text-slate-900 font-bold">+{placementExtra.toFixed(3)} {settings.currency}</span>
                </div>
              )}

              {/* Selected Design Cost */}
              <div className="flex items-center justify-between py-0.5 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-slate-400 rounded-full inline-block"></span>
                  <span>{customization.technique === 'embroidery' ? 'سعر التطريز' : 'سعر الطباعة'} {hasSecondarySide ? '(الجهة 1)' : 'المختار'}</span>
                </div>
                <span className="font-mono text-slate-900 font-bold">+{primaryDesignPrice.toFixed(3)} {settings.currency}</span>
              </div>

              {hasSecondarySide && secondaryCustomization && (
                <div className="flex items-center justify-between py-0.5 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-slate-400 rounded-full inline-block"></span>
                    <span>{secondaryCustomization.technique === 'embroidery' ? 'سعر التطريز' : 'سعر الطباعة'} (الجهة 2)</span>
                  </div>
                  <span className="font-mono text-slate-900 font-bold">+{secondaryDesignPrice.toFixed(3)} {settings.currency}</span>
                </div>
              )}

              {/* Delivery Cost */}
              <div className="flex items-center justify-between py-0.5 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-slate-400 rounded-full inline-block"></span>
                  <span>الشحن والتوصيل (داخل البحرين 🇧🇭)</span>
                </div>
                {isFreeDelivery ? (
                  <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-150 animate-pulse text-[10px]">مجاني 🚚</span>
                ) : (
                  <span className="font-mono text-slate-900 font-bold">+{deliveryFee.toFixed(3)} {settings.currency}</span>
                )}
              </div>
            </div>

            {/* Total Highlight Row */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-xl ring-4 ring-slate-100">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-black block font-['Cairo']">الإجمالي النهائي المستحق:</span>
                <span className="text-[10px] text-emerald-400 font-bold block flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>دفع آمن عند الاستلام بالبحرين</span>
                </span>
              </div>
              <div className="text-left">
                <span className="font-mono text-amber-400 font-black text-2xl tracking-tighter block">
                  {totalPrice.toFixed(3)} {settings.currency}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">السعر شامل الضريبة</span>
              </div>
            </div>

            {/* Outstanding Action Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  // Determine best preview image
                  let previewUrl = '';
                  if (customization.designType === 'catalog' && customization.catalogItem) {
                    previewUrl = customization.catalogItem.imageUrl;
                  } else if (customization.uploadedImageUrl) {
                    previewUrl = customization.uploadedImageUrl;
                  } else if (selectedGarment.useRealPhoto && selectedGarment.realImageUrlFront) {
                    previewUrl = selectedGarment.realImageUrlFront;
                  }

                  onAddToCart({
                    garment: selectedGarment,
                    color: selectedColor,
                    size: selectedSize,
                    customization,
                    secondaryCustomization,
                    hasSecondarySide,
                    quantity: 1,
                    subtotal,
                    previewUrl,
                  });
                }}
                className="flex-1 relative overflow-hidden bg-slate-900 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span className="font-black text-sm tracking-wide font-['Cairo']">إضافة إلى سلة الطلبات</span>
              </button>

              <button
                onClick={() =>
                  onOpenOrderModal({
                    garment: selectedGarment,
                    color: selectedColor,
                    size: selectedSize,
                    view,
                    customization,
                    secondaryCustomization,
                    hasSecondarySide,
                    subtotal,
                    deliveryFee: finalDeliveryFee,
                    total: totalPrice,
                  })
                }
                className="flex-1 relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs transition-all duration-300 shadow-[0_5px_20px_rgba(16,185,129,0.38)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.58)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                <span className="font-black text-sm tracking-wide font-['Cairo']">اطلب هذه القطعة فقط</span>
                <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
