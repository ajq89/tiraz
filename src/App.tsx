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

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'studio' | 'about' | 'admin'>('catalog');

  // Store Settings with LocalStorage persistence
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('tiraz_settings');
      return saved ? JSON.parse(saved) : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  // Catalog Items with LocalStorage persistence
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem('tiraz_catalog');
      return saved ? JSON.parse(saved) : INITIAL_CATALOG;
    } catch {
      return INITIAL_CATALOG;
    }
  });

  // Available global colors with LocalStorage persistence
  const [colors, setColors] = useState<GarmentColor[]>(() => {
    try {
      const saved = localStorage.getItem('tiraz_colors');
      return saved ? JSON.parse(saved) : GARMENT_COLORS;
    } catch {
      return GARMENT_COLORS;
    }
  });

  // Available global garments with LocalStorage persistence
  const [garments, setGarments] = useState<GarmentOption[]>(() => {
    try {
      const saved = localStorage.getItem('tiraz_garments');
      return saved ? JSON.parse(saved) : GARMENTS;
    } catch {
      return GARMENTS;
    }
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

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-['Cairo',sans-serif] flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      
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
