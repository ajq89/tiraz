export type TechniqueType = 'embroidery' | 'printing';

export type GarmentType = string;

export type PlacementPosition = 'left-chest' | 'center-chest' | 'back-full' | 'sleeve';

export type GarmentColor = {
  id: string;
  nameAr: string;
  nameEn: string;
  hex: string;
  bgClass?: string;
  textColor?: string;
};

export type GarmentSize = string;

export type CatalogCategory = string;

export type AllowedTechniqueOption = 'embroidery' | 'printing' | 'both';

export type SideOption = 'one-side' | 'two-sides';

export interface CatalogItem {
  id: string;
  title: string;
  category: CatalogCategory;
  technique: TechniqueType;
  allowedTechniqueOption?: AllowedTechniqueOption;
  imageUrl: string;
  svgData?: string; // Optional inline vector graphics
  price: number; // Base design cost in BHD (One side)
  priceTwoSides?: number; // Cost for two sides
  sideOption: SideOption; // Forced side option
  description: string;
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  allowedGarments?: GarmentType[];
  isFixed?: boolean;
  fixedPlacement?: PlacementPosition;
  frontScale?: number;
  backScale?: number;
}

export interface CustomDesignState {
  designType: 'catalog' | 'upload' | 'text' | 'full-upload';
  catalogItem?: CatalogItem | null;
  uploadedImageUrl?: string | null;
  customText?: string;
  textColor?: string;
  fontFamily?: string;
  technique: TechniqueType;
  placement: PlacementPosition;
  scale: number; // 0.5 to 1.8
  positionX: number; // offset X in px
  positionY: number; // offset Y in px
  rotation: number; // in degrees
  threadColor?: string; // for embroidery
}

export interface GarmentOption {
  id: string;
  nameAr: string;
  nameEn: string;
  basePrice: number; // in BHD
  description: string;
  availableColors: GarmentColor[];
  availableSizes: GarmentSize[];
  mockupFrontSvg?: string;
  mockupBackSvg?: string;
  realImageUrlFront?: string;
  realImageUrlBack?: string;
  useRealPhoto?: boolean;
}

export interface OrderDetails {
  garment: GarmentOption;
  selectedColor: GarmentColor;
  selectedSize: GarmentSize;
  view: 'front' | 'back';
  customization: CustomDesignState;
  secondaryCustomization?: CustomDesignState | null;
  hasSecondarySide: boolean;
  quantity: number;
  customerName: string;
  customerPhone: string;
  customerArea: string;
  customerAddress: string;
  notes: string;
}

export interface CartItem {
  id: string;
  garment: GarmentOption;
  color: GarmentColor;
  size: GarmentSize;
  customization: CustomDesignState;
  secondaryCustomization?: CustomDesignState | null;
  hasSecondarySide: boolean;
  quantity: number;
  subtotal: number;
  previewUrl?: string;
}

export interface StoreSettings {
  whatsappNumber: string; // e.g., '97333000000'
  deliveryFee: number; // e.g. 1.500 BHD
  currency: string; // 'د.ب'
  storeNameAr: string;
  storeNameEn: string;
  subTitle: string;
  instagramHandle: string;
  freeDeliveryThreshold: number; // 0 to disable, or e.g., 20 BHD
  enablePromoFreeDelivery?: boolean;
  promoFreeDeliveryText?: string;
  enableCustomUpload: boolean;
  basePrices: Record<string, number>;
  techniquePrices: {
    embroidery: number;
    printing: number;
  };
  categories: { id: string; nameAr: string; nameEn: string; }[];
}
