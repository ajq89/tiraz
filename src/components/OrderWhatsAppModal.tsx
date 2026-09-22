import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  PhoneCall, 
  MapPin, 
  User, 
  FileText, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  Sparkles,
  Shirt,
  Truck,
  Palette,
  Ruler,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { GarmentOption, GarmentColor, GarmentSize, CustomDesignState, StoreSettings, PlacementPosition, TechniqueType, CartItem } from '../types';
import { GARMENTS, GARMENT_COLORS } from '../data/initialData';

interface OrderWhatsAppModalProps {
  orderData?: {
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
  } | null;
  cart?: CartItem[];
  settings: StoreSettings;
  onClose: () => void;
  onOrderSuccess?: () => void;
}

const AVAILABLE_SIZES: GarmentSize[] = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export const OrderWhatsAppModal: React.FC<OrderWhatsAppModalProps> = ({
  orderData,
  cart = [],
  settings,
  onClose,
  onOrderSuccess,
}) => {
  const isCartMode = cart.length > 0;
  
  // Stable Order ID for modal duration
  const [orderId] = useState(() => `TRZ-${Math.floor(1000 + Math.random() * 9000)}`);

  // Interactive Live Order Controls (Only for single item mode)
  const [selectedGarment, setSelectedGarment] = useState<GarmentOption>(orderData?.garment || GARMENTS[0]);
  const [selectedColor, setSelectedColor] = useState<GarmentColor>(orderData?.color || GARMENT_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState<GarmentSize>(orderData?.size || 'L');
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueType>(orderData?.customization.technique || 'printing');
  const [selectedPlacement, setSelectedPlacement] = useState<PlacementPosition>(orderData?.customization.placement || 'center-chest');

  // Customer Delivery Info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerArea, setCustomerArea] = useState('الرفاع');
  const [customerAddress, setCustomerAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  // Dynamic Live Price Calculations
  const subtotal = isCartMode 
    ? cart.reduce((sum, item) => sum + (item.subtotal * item.quantity), 0)
    : (selectedGarment.basePrice + (orderData?.customization.catalogItem?.price || 1.5) + ((orderData?.hasSecondarySide && orderData?.secondaryCustomization) ? (orderData?.secondaryCustomization.catalogItem?.price || 1.5) : 0)) * quantity;

  const isFreeDelivery = !!settings.enablePromoFreeDelivery || (settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold);
  const deliveryFee = isFreeDelivery ? 0 : settings.deliveryFee;
  const grandTotal = subtotal + deliveryFee;

  // Design name summary
  const getDesignName = (custom: CustomDesignState) => {
    if (custom.designType === 'catalog' && custom.catalogItem) {
      return `تصميم كتالوج: ${custom.catalogItem.title}`;
    }
    if (custom.designType === 'upload') {
      return 'تصميم مخصص مرفوع من الزبون 🖼️';
    }
    if (custom.designType === 'full-upload') {
      return 'طلب مباشر: صورة منتج كاملة جاهزة 📸';
    }
    if (custom.designType === 'text') {
      return `نص مخصص: "${custom.customText}"`;
    }
    return 'تصميم مخصص';
  };

  // Helper to get summary for a customization
  const getSideSummary = (custom: CustomDesignState, label: string) => {
    const tech = custom.technique === 'embroidery' ? 'تطريز 🧵' : 'طباعة 🎨';
    const place = 
      custom.placement === 'left-chest' ? 'الصدر الأيسر' :
      custom.placement === 'center-chest' ? 'منتصف الصدر' :
      custom.placement === 'back-full' ? 'الظهر كاملاً' : 'الكم';
    
    return `*${label}:* ${getDesignName(custom)} (${tech} - ${place})`;
  };

  // Generate live formatted WhatsApp message that reflects all selections instantly
  const generateMessage = () => {
    const deliveryFeeText = deliveryFee === 0 ? 'مجاني (عرض التوصيل) 🚚' : `${deliveryFee.toFixed(3)} ${settings.currency}`;
    
    let itemsSummary = '';
    if (isCartMode) {
      itemsSummary = cart.map((item, idx) => {
        const designSum = item.hasSecondarySide && item.secondaryCustomization
          ? `\n  - ${getSideSummary(item.customization, 'الجهة الأولى')}\n  - ${getSideSummary(item.secondaryCustomization, 'الجهة الثانية')}`
          : `\n  - 🎨 *التقنية:* ${item.customization.technique === 'embroidery' ? 'تطريز 🧵' : 'طباعة 🎨'}\n  - 📍 *الموقع:* ${item.customization.placement === 'center-chest' ? 'منتصف الصدر' : item.customization.placement}\n  - 🖼️ *التصميم:* ${getDesignName(item.customization)}`;

        return `${idx + 1}. *${item.garment.nameAr}*\n  🎨 اللون: ${item.color.nameAr}\n  📏 المقاس: ${item.size}\n  🔢 الكمية: ${item.quantity}${designSum}\n  💰 السعر: ${(item.subtotal * item.quantity).toFixed(3)} ${settings.currency}`;
      }).join('\n\n');
    } else if (orderData) {
      const designSum = orderData.hasSecondarySide && orderData.secondaryCustomization
        ? `\n${getSideSummary(orderData.customization, 'الجهة الأولى')}\n${getSideSummary(orderData.secondaryCustomization, 'الجهة الثانية')}`
        : `\n🧵 *التقنية:* ${selectedTechnique === 'embroidery' ? 'تطريز 🧵' : 'طباعة 🎨'}\n📍 *الموقع:* ${selectedPlacement}\n🖼️ *التصميم:* ${getDesignName(orderData.customization)}`;

      itemsSummary = `👕 *المنتج:* ${selectedGarment.nameAr}\n🎨 *اللون:* ${selectedColor.nameAr}\n📏 *المقاس:* ${selectedSize}\n🔢 *الكمية:* ${quantity} قطعة${designSum}`;
    }

    return `مرحباً فريق *طراز | tiraz.bh* 🇧🇭
أود إرسال طلب جديد كالتالي:

*رقم الطلب:* #${orderId}
---
${itemsSummary}

---
👤 *اسم الزبون:* ${customerName.trim() || 'لم يحدد بعد'}
📞 *رقم التواصل:* ${customerPhone.trim() || 'لم يحدد بعد'}
🏙️ *المنطقة:* ${customerArea}
🏠 *العنوان التفصيلي:* ${customerAddress.trim() || 'سيتم تقديمه عند التواصل'}
📝 *ملاحظات وإضافات:* ${notes.trim() || 'لا يوجد'}

---
💰 *إجمالي المنتجات:* ${subtotal.toFixed(3)} ${settings.currency}
🚚 *أجور التوصيل:* ${deliveryFeeText}
💵 *المبلغ الإجمالي النهائي:* *${grandTotal.toFixed(3)} ${settings.currency}*

بانتظار تأكيدكم للبدء بالتنفيذ والتوصيل. شكراً لكم!`.trim();
  };

  // Launch WhatsApp Action
  const handleSendWhatsApp = () => {
    // Fire celebratory confetti
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });

    const msg = generateMessage();
    const phone = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    if (onOrderSuccess) onOrderSuccess();
  };

  // Copy Message to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(generateMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-t sm:border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#25d366] flex items-center justify-center text-white font-bold shadow-md shadow-emerald-900/30 shrink-0">
              <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white font-['Cairo']">تأكيد ومراجعة الطلب للواتساب</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">tiraz.bh - التوصيل لجميع مناطق البحرين 🇧🇭</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto grow">
          
          {/* Detailed Boutique Invoice Receipt Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-800" />
                <span className="font-extrabold text-sm text-slate-900 font-['Cairo']">
                  {isCartMode ? 'فاتورة سلة المشتريات' : 'الفاتورة التفاعلية لطلبك الحالية'}
                </span>
              </div>
              <span className="text-[10px] bg-slate-900 text-amber-400 font-mono font-bold px-2.5 py-1 rounded-full border border-slate-800">
                #{orderId}
              </span>
            </div>

            {/* Itemized Breakdown Rows */}
            <div className="space-y-2.5 text-xs">
              {!isCartMode && orderData ? (
                <>
                  {/* Single Item Details */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5 max-w-[70%]">
                      <span className="font-bold text-slate-900 block">{selectedGarment.nameAr}</span>
                      <span className="text-[11px] text-slate-500 block">
                        اللون: <span className="font-semibold text-slate-800">{selectedColor.nameAr}</span> • المقاس: <span className="font-semibold text-slate-800">{selectedSize}</span>
                      </span>
                    </div>
                    <div className="text-left font-mono font-bold text-slate-800">
                      {quantity} × {(subtotal/quantity).toFixed(3)} = {subtotal.toFixed(3)} {settings.currency}
                    </div>
                  </div>

                  <div className="pt-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block text-xs">الجهة الأولى:</span>
                        <span className="text-[11px] text-slate-500 block">
                          {getDesignName(orderData.customization)} • بموقع ({selectedPlacement === 'left-chest' ? 'الصدر الأيسر' :
                            selectedPlacement === 'center-chest' ? 'منتصف الصدر' :
                            selectedPlacement === 'back-full' ? 'الظهر كاملاً' : 'الكم'})
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          التقنية: {selectedTechnique === 'embroidery' ? '🧵 تطريز' : '🎨 طباعة'}
                        </span>
                      </div>
                    </div>

                    {orderData.hasSecondarySide && orderData.secondaryCustomization && (
                      <div className="flex items-start justify-between border-t border-slate-100 pt-2">
                        <div className="space-y-0.5">
                          <span className="font-bold text-emerald-700 block text-xs">الجهة الثانية (الإضافية):</span>
                          <span className="text-[11px] text-slate-500 block">
                            {getDesignName(orderData.secondaryCustomization)} • بموقع ({orderData.secondaryCustomization.placement === 'left-chest' ? 'الصدر الأيسر' :
                              orderData.secondaryCustomization.placement === 'center-chest' ? 'منتصف الصدر' :
                              orderData.secondaryCustomization.placement === 'back-full' ? 'الظهر كاملاً' : 'الكم'})
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            التقنية: {orderData.secondaryCustomization.technique === 'embroidery' ? '🧵 تطريز' : '🎨 طباعة'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="text-[11px]">
                        <span className="font-black text-slate-900">{idx+1}. {item.garment.nameAr}</span>
                        <p className="text-slate-400 font-bold">{item.color.nameAr} | {item.size} | {item.quantity} قطع</p>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{(item.subtotal * item.quantity).toFixed(3)} {settings.currency}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-slate-300 my-3"></div>

              {/* 4. Delivery Fee */}
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium">أجور التوصيل الشاملة (البحرين 🇧🇭):</span>
                <span className="font-mono font-bold">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">مجاني 🚚</span>
                  ) : (
                    `${deliveryFee.toFixed(3)} ${settings.currency}`
                  )}
                </span>
              </div>

              {/* Total Due Row Highlighted */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between mt-3 shadow-inner">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold block">المبلغ الإجمالي المستحق للدفع:</span>
                  <span className="text-[10px] text-emerald-400 font-bold block"> شامل الشحن وتفاصيل التطريز والتجهيز</span>
                </div>
                <div className="text-left">
                  <span className="text-xl font-black text-amber-400 font-mono tracking-tight">
                    {grandTotal.toFixed(3)} {settings.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Garment Adjustment Selectors inside Modal - Now Static and Unchangeable as requested */}
          {!isCartMode && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 border-b border-stone-200/60 pb-2">
                <Shirt className="w-4 h-4 text-amber-600" />
                <span>تفاصيل القطعة المطلوبة للتنفيذ (ثابتة):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Garment Details Display */}
                <div className="bg-white p-2.5 rounded-lg border border-stone-200/40 flex flex-col justify-center">
                  <span className="text-[10px] text-stone-500 font-bold block mb-0.5">نوع القطعة:</span>
                  <span className="text-xs font-black text-stone-800">{selectedGarment.nameAr}</span>
                </div>

                {/* Color Details Display */}
                <div className="bg-white p-2.5 rounded-lg border border-stone-200/40 flex flex-col justify-center">
                  <span className="text-[10px] text-stone-500 font-bold block mb-0.5">اللون المفضل:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-stone-200 shadow-sm" style={{ backgroundColor: selectedColor.hex }} />
                    <span className="text-xs font-black text-stone-800">{selectedColor.nameAr}</span>
                  </div>
                </div>

                {/* Size Details Display */}
                <div className="bg-white p-2.5 rounded-lg border border-stone-200/40 flex flex-col justify-center">
                  <span className="text-[10px] text-stone-500 font-bold block mb-0.5">المقاس المطلوب:</span>
                  <span className="text-xs font-black text-stone-800">المقاس {selectedSize}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Inputs: Customer & Address */}
          <div className="space-y-4">
            <h4 className="section-title-sleek flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>معلومات العميل والتوصيل:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>الاسم الكريم: *</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="أدخل اسمك الكريم..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>رقم الاتصال / الواتساب: *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="33XXXXXX"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-slate-900 font-mono font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Area */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-700" />
                  <span>المنطقة في البحرين:</span>
                </label>
                <select
                  value={customerArea}
                  onChange={(e) => setCustomerArea(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-slate-900 font-medium"
                >
                  {[
                    'الرفاع',
                    'المنامة',
                    'المحرق',
                    'سار',
                    'مدينة عيسى',
                    'مدينة حمد',
                    'سترة',
                    'البسيتين',
                    'الحد',
                    'أم الحصم',
                    'عالي',
                    'منطقة أخرى',
                  ].map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address Details */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  العنوان التفصيلي (المجمع / الشارع / المنزل):
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="مجمع 900، طريق 1234، منزل 56"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Quantity Selector */}
            {!isCartMode && (
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">عدد القطع المطلوبة:</span>
                  <span className="text-[11px] text-slate-500">خصم خاص متوفر للكميات الكبيرة</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 text-sm shadow-2xs"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-slate-900 font-mono text-base px-2">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 text-sm shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-700" />
                <span>ملاحظات إضافية للطلب:</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="أضف أي إضافات خاصة (مثال: ألوان الخيوط، موعد التوصيل، تغليف)..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Live Dynamic Message Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5 font-['Cairo']">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                <span>معاينة النص المرسل عبر الواتساب (يتغير تلقائياً):</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-slate-900 hover:text-emerald-700 flex items-center gap-1 font-bold text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-amber-300 rounded-xl text-[11px] leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-slate-800 shadow-inner dir-rtl text-right">
              {generateMessage()}
            </pre>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-600 animate-bounce" />
            <span className="font-medium text-slate-600">سيتم فتح الواتساب مباشرة وتمرير كامل تفاصيل طلبك</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-initial relative overflow-hidden bg-gradient-to-r from-[#25d366] via-[#128c7e] to-[#075e54] text-white font-extrabold py-3 px-6 rounded-xl text-xs transition-all duration-300 shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_25px_rgba(37,211,102,0.65)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
              
              <PhoneCall className="w-4 h-4 text-white group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200" />
              <span>تأكيد وإرسال الطلب عبر الواتساب الآن ⚡</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

