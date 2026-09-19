import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { CartItem, StoreSettings } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
  settings: StoreSettings;
}

export const Cart: React.FC<CartProps> = ({
  isOpen,
  onClose,
  cart,
  onRemove,
  onUpdateQuantity,
  onCheckout,
  settings,
}) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.subtotal * item.quantity), 0);
  const isFreeDelivery = !!settings.enablePromoFreeDelivery || (settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold);
  const deliveryFee = cart.length > 0 ? (isFreeDelivery ? 0 : settings.deliveryFee) : 0;
  const total = subtotal + deliveryFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 font-['Cairo']">سلة التسوق</h2>
                  <p className="text-xs text-slate-400 font-bold">{cart.length} منتجات في السلة</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-slate-900 font-['Cairo']">سلتك فارغة حالياً</h3>
                    <p className="text-xs text-slate-400 font-bold max-w-[200px]">أضف بعض التصاميم المميزة لتبدأ في طلبك</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black font-['Cairo'] shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    ابدأ في التصميم الآن
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-4 group"
                  >
                    {/* Item Image Preview */}
                    <div className="w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex-shrink-0 relative">
                      {item.previewUrl ? (
                        <img 
                          src={item.previewUrl} 
                          alt={item.garment.nameAr} 
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                           {/* Simple visual representation if no image */}
                           <div className="w-16 h-16 bg-slate-200 rounded-md animate-pulse" />
                        </div>
                      )}
                      
                      {/* Color indicator dot */}
                      <div 
                        className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: item.color.hex }}
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-slate-900 text-sm font-['Cairo'] leading-tight">
                            {item.garment.nameAr}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold">
                            {item.color.nameAr} | مقاس {item.size}
                          </p>
                          <div className="flex gap-1.5 mt-1">
                            <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold">
                              {item.customization.technique === 'embroidery' ? '🧵 تطريز' : '🎨 طباعة'}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold">
                              {item.customization.placement === 'center-chest' ? 'منتصف الصدر' : 
                               item.customization.placement === 'left-chest' ? 'الصدر الأيسر' :
                               item.customization.placement === 'back-full' ? 'الظهر كاملاً' : 'الكم'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm rounded-md transition-all active:scale-90"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm rounded-md transition-all active:scale-90"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-mono text-slate-900 font-black text-sm">
                          {(item.subtotal * item.quantity).toFixed(3)} {settings.currency}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            {cart.length > 0 && (
              <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>المجموع الفرعي:</span>
                    <span className="font-mono text-slate-900">{subtotal.toFixed(3)} {settings.currency}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>رسوم التوصيل:</span>
                    {isFreeDelivery ? (
                      <span className="text-emerald-500 font-black">مجاني!</span>
                    ) : (
                      <span className="font-mono text-slate-900">{deliveryFee.toFixed(3)} {settings.currency}</span>
                    )}
                  </div>
                  {settings.freeDeliveryThreshold > 0 && !isFreeDelivery && (
                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                      <p className="text-[9px] text-amber-700 font-bold">
                        أضف بقيمة <span className="font-mono">{(settings.freeDeliveryThreshold - subtotal).toFixed(3)} {settings.currency}</span> للحصول على توصيل مجاني!
                      </p>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-black text-slate-900 font-['Cairo']">الإجمالي النهائي:</span>
                    <span className="text-xl font-black text-slate-900 font-mono tracking-tighter">
                      {total.toFixed(3)} {settings.currency}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group"
                >
                  <span className="font-['Cairo']">تأكيد الطلب عبر الواتساب</span>
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
