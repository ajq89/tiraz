import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from './components/Header';
import { CatalogSection } from './components/CatalogSection';
import { StudioCustomizer } from './components/StudioCustomizer';
import { OrderWhatsAppModal } from './components/OrderWhatsAppModal';
import { AdminPanel } from './components/AdminPanel';
import { SizeGuideModal } from './components/SizeGuideModal';
import { FaqAbout } from './components/FaqAbout';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { StoreSettings, CatalogItem, GarmentOption, GarmentColor, GarmentSize, CustomDesignState, CartItem } from './types';
import { DEFAULT_STORE_SETTINGS, INITIAL_CATALOG, GARMENTS, GARMENT_COLORS } from './data/initialData';
import dbData from './data/db.json';

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'studio' | 'about' | 'admin'>('catalog');

  // Store Settings with LocalStorage and db.json persistence
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('tiraz_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return (dbData && dbData.settings ? dbData.settings : DEFAULT_STORE_SETTINGS) as StoreSettings;
  });

  // Catalog Items with LocalStorage and db.json persistence
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem('tiraz_catalog');
      if (saved) return JSON.parse(saved);
    } catch {}
    return (dbData && dbData.catalogItems ? dbData.catalogItems : INITIAL_CATALOG) as CatalogItem[];
  });

  // Available global colors with LocalStorage and db.json persistence
  const [colors, setColors] = useState<GarmentColor[]>(() => {
    try {
      const saved = localStorage.getItem('tiraz_colors');
      if (saved) return JSON.parse(saved);
    } catch {}
    return (dbData && dbData.colors ? dbData.colors : GARMENT_COLORS) as GarmentColor[];
  });

  // Available global garments with LocalStorage and db.json persistence
  const [garments, setGarments] = useState<GarmentOption[]>(() => {
    try {
      const saved = localStorage.getItem('tiraz_garments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return (dbData && dbData.garments ? dbData.garments : GARMENTS) as GarmentOption[];
  });

  // Selected Catalog Item passed to Studio
  const [studioCatalogItem, setStudioCatalogItem] = useState<CatalogItem | null>(null);

  // Active Order Modal Data
  const [orderModalData, setOrderModalData] = useState<{
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
  } | null>(null);

  // Size Guide Modal state
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Cart State with LocalStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tiraz_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showCart, setShowCart] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('tiraz_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart:', err);
    }
  }, [cart]);

  const handleAddToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
    };
    setCart((prev) => [...prev, newItem]);
    setShowCart(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('tiraz_settings', JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }, [settings]);

  // Persist catalog
  useEffect(() => {
    try {
      localStorage.setItem('tiraz_catalog', JSON.stringify(catalogItems));
    } catch (err) {
      console.error('Failed to save catalog:', err);
    }
  }, [catalogItems]);

  // Persist colors
  useEffect(() => {
    try {
      localStorage.setItem('tiraz_colors', JSON.stringify(colors));
    } catch (err) {
      console.error('Failed to save colors:', err);
    }
  }, [colors]);

  // Persist garments
  useEffect(() => {
    try {
      localStorage.setItem('tiraz_garments', JSON.stringify(garments));
    } catch (err) {
      console.error('Failed to save garments:', err);
    }
  }, [garments]);

  // Synchronize state with backend filesystem in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      const timer = setTimeout(() => {
        fetch('/api/save-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            settings,
            catalogItems,
            colors,
            garments,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              console.log('[Dev] Workspace state successfully synchronized to src/data/db.json');
            }
          })
          .catch((err) => console.error('[Dev] Error saving workspace state:', err));
      }, 1000); // Debounce by 1 second to bundle rapid modifications

      return () => clearTimeout(timer);
    }
  }, [settings, catalogItems, colors, garments]);

  // Handler to choose catalog design and switch to customizer studio
  const handleSelectCatalogItemForCustomizer = (item: CatalogItem) => {
    setStudioCatalogItem(item);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add new item in admin
  const handleAddCatalogItem = (newItem: CatalogItem) => {
    setCatalogItems((prev) => [newItem, ...prev]);
  };

  // Update item in admin
  const handleUpdateCatalogItem = (updatedItem: CatalogItem) => {
    setCatalogItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  // Delete item in admin
  const handleDeleteCatalogItem = (id: string) => {
    setCatalogItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset default catalog and settings
  const handleResetCatalog = () => {
    setCatalogItems(INITIAL_CATALOG);
    setSettings(DEFAULT_STORE_SETTINGS);
    setColors(GARMENT_COLORS);
    setGarments(GARMENTS);
  };

  // Swipe gesture navigation for mobile screens (RTL safe)
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  const isWithinHorizontalScroll = (el: HTMLElement | null): boolean => {
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el);
      if (
        (style.overflowX === 'auto' || style.overflowX === 'scroll' || el.classList.contains('overflow-x-auto') || el.classList.contains('overflow-x-scroll')) &&
        el.scrollWidth > el.clientWidth
      ) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    
    // Ignore interactive elements to prevent conflict with design tools/inputs
    if (
      target.closest('input') || 
      target.closest('textarea') || 
      target.closest('button') || 
      target.closest('select') ||
      target.closest('canvas') ||
      target.closest('[role="slider"]') ||
      target.closest('.no-swipe') ||
      isWithinHorizontalScroll(target)
    ) {
      return;
    }

    setTouchEndX(null);
    setTouchEndY(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null || touchStartY === null || touchEndY === null) return;

    const xDistance = touchStartX - touchEndX;
    const yDistance = touchStartY - touchEndY;
    const isHorizontalSwipe = Math.abs(xDistance) > Math.abs(yDistance);
    const minSwipeDistance = 70; // Sensible threshold in pixels

    if (isHorizontalSwipe && Math.abs(xDistance) > minSwipeDistance) {
      const isLeftSwipe = xDistance > 0;
      const TABS_SEQUENCE: ('catalog' | 'studio' | 'about' | 'admin')[] = ['catalog', 'studio', 'about'];
      
      // Limit swipe navigation to customer-facing tabs for pristine UX
      const currentIndex = TABS_SEQUENCE.indexOf(activeTab as any);
      
      if (currentIndex !== -1) {
        if (isLeftSwipe) {
          // Swipe left (finger moves left) -> Next tab (forward)
          if (currentIndex < TABS_SEQUENCE.length - 1) {
            setActiveTab(TABS_SEQUENCE[currentIndex + 1]);
          }
        } else {
          // Swipe right (finger moves right) -> Previous tab (back)
          if (currentIndex > 0) {
            setActiveTab(TABS_SEQUENCE[currentIndex - 1]);
          }
        }
      } else if (activeTab === 'admin') {
        // If in admin panel, swiping right goes back to FAQ/About page
        if (!isLeftSwipe) {
          setActiveTab('about');
        }
      }
    }

    // Clear coordinates
    setTouchStartX(null);
    setTouchEndX(null);
    setTouchStartY(null);
    setTouchEndY(null);
  };

  return (
    <div 
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="min-h-screen bg-stone-100 text-stone-900 font-['Cairo',sans-serif] flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900"
    >
      
      {/* Header Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setShowCart(true)}
      />

      {/* Main Content Pages */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.985 }}
            transition={{
              type: 'spring',
              stiffness: 140,
              damping: 22,
              mass: 0.9
            }}
            className="w-full h-full"
          >
            {activeTab === 'catalog' && (
              <CatalogSection
                catalogItems={catalogItems}
                onSelectForCustomizer={handleSelectCatalogItemForCustomizer}
                settings={settings}
              />
            )}

            {activeTab === 'studio' && (
              <StudioCustomizer
                initialCatalogItem={studioCatalogItem}
                catalogItems={catalogItems}
                settings={settings}
                garments={garments}
                colors={colors}
                onOpenOrderModal={(data) => setOrderModalData(data)}
                onAddToCart={handleAddToCart}
                onOpenSizeGuide={() => setShowSizeGuide(true)}
              />
            )}

            {activeTab === 'about' && (
              <FaqAbout
                settings={settings}
                onGoToStudio={() => setActiveTab('studio')}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPanel
                settings={settings}
                onUpdateSettings={(newSet) => setSettings(newSet)}
                catalogItems={catalogItems}
                onAddCatalogItem={handleAddCatalogItem}
                onUpdateCatalogItem={handleUpdateCatalogItem}
                onDeleteCatalogItem={handleDeleteCatalogItem}
                onResetDefaultCatalog={handleResetCatalog}
                colors={colors}
                onUpdateColors={setColors}
                garments={garments}
                onUpdateGarments={setGarments}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        setActiveTab={setActiveTab}
      />

      {/* WhatsApp Checkout Modal */}
      {(orderModalData || (showCart === false && cart.length > 0 && showCartModal)) && (
        <OrderWhatsAppModal
          orderData={orderModalData}
          cart={orderModalData ? [] : cart}
          settings={settings}
          onClose={() => {
            setOrderModalData(null);
            setShowCartModal(false);
          }}
          onOrderSuccess={() => {
            if (!orderModalData) clearCart();
            setOrderModalData(null);
            setShowCartModal(false);
          }}
        />
      )}

      {/* Cart Drawer Overlay */}
      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateCartQuantity}
        settings={settings}
        onCheckout={() => {
          setShowCart(false);
          setShowCartModal(true);
        }}
      />

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <SizeGuideModal onClose={() => setShowSizeGuide(false)} />
      )}

    </div>
  );
}
