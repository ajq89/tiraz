import React from 'react';
import { GarmentColor, GarmentType, CustomDesignState, PlacementPosition, GarmentOption } from '../types';

interface GarmentSvgMockupProps {
  garmentType: GarmentType;
  garment?: GarmentOption; // Added full garment object
  color: GarmentColor;
  view: 'front' | 'back';
  customization: CustomDesignState;
  onPositionChange?: (x: number, y: number) => void;
  interactive?: boolean;
}

export const GarmentSvgMockup: React.FC<GarmentSvgMockupProps> = ({
  garmentType,
  garment,
  color,
  view,
  customization,
  onPositionChange,
  interactive = true,
}) => {
  // Check if we should use a real photo
  const realImageUrlFront = garment?.realImageUrlFront;
  const realImageUrlBack = garment?.realImageUrlBack;
  const useRealPhoto = garment?.useRealPhoto && (view === 'front' ? !!realImageUrlFront : !!realImageUrlBack);
  const activeRealImageUrl = view === 'front' ? realImageUrlFront : realImageUrlBack;

  // Placement coordinates guide on 400x500 canvas
  const getPlacementBox = (placement: PlacementPosition, viewMode: 'front' | 'back') => {
    if (garmentType === 'cap') {
      if (viewMode === 'back') {
        return { x: 170, y: 195, width: 60, height: 35, label: 'خلفية القبعة (قفل التعديل)' };
      }
      return { x: 155, y: 150, width: 90, height: 60, label: 'مقدمة القبعة (Front)' };
    }
    if (viewMode === 'back') {
      return { x: 130, y: 150, width: 140, height: 160, label: 'منطقة الظهر الكبرى' };
    }
    switch (placement) {
      case 'left-chest':
        return { x: 235, y: 160, width: 65, height: 65, label: 'الصدر الأيسر (الجيب)' };
      case 'center-chest':
        return { x: 135, y: 175, width: 130, height: 130, label: 'منتصف الصدر' };
      case 'back-full':
        return { x: 130, y: 150, width: 140, height: 160, label: 'الظهر كاملاً' };
      case 'sleeve':
        return { x: 85, y: 180, width: 55, height: 55, label: 'على الكم الأيمن' };
      default:
        return { x: 150, y: 160, width: 100, height: 100, label: 'منطقة الصدر' };
    }
  };

  const placementBox = getPlacementBox(customization.placement, view);

  // Drag interaction handler for canvas
  const handleMouseDown = (e: React.MouseEvent<SVGGElement>) => {
    if (!interactive || !onPositionChange) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPosX = customization.positionX;
    const initialPosY = customization.positionY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      onPositionChange(initialPosX + dx * 0.8, initialPosY + dy * 0.8);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const fillColor = color.hex;
  const isDark = color.id === 'black' || color.id === 'navy' || color.id === 'burgundy' || color.id === 'charcoal' || color.id === 'olive';
  const seamStroke = isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.24)';
  const seamStitch = isDark ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.32)';

  // Renders the realistic 3D Wood Hanger (Sandwiched properly inside the collar)
  const renderHanger = () => {
    if (view === 'back') {
      // Back view only displays the shiny metal hook coming out of the neck opening
      return (
        <g id="hanger-hook-only" filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.45))">
          <path
            d="M 200,52 C 200,24 218,12 205,4 C 190,-4 182,10 182,20"
            fill="none"
            stroke="url(#metalHookGradient)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <rect x="197" y="47" width="6" height="6" rx="1" fill="#71717a" />
        </g>
      );
    }

    // Front view renders the full premium wood hanger bar inside the shirt shoulders
    return (
      <g id="full-wooden-hanger" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.4))">
        {/* Shiny metal hook */}
        <path
          d="M 200,52 C 200,24 218,12 205,4 C 190,-4 182,10 182,20"
          fill="none"
          stroke="url(#metalHookGradient)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Metal hanger loop holder */}
        <rect x="197" y="45" width="6" height="8" rx="1" fill="#52525b" />
        {/* Curved polished wood shoulder bar */}
        <path
          d="M 132,54 C 152,50 176,44 200,44 C 224,44 248,50 268,54 C 248,56.5 224,58 200,58 C 176,58 152,56.5 132,54 Z"
          fill="url(#woodHangerGradient)"
          stroke="#42220f"
          strokeWidth="1"
        />
        {/* Wood grain highlight lines */}
        <path
          d="M 138,53.5 Q 200,48 262,53.5"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />
        <path
          d="M 142,54.8 Q 200,51 258,54.8"
          fill="none"
          stroke="rgba(0, 0, 0, 0.15)"
          strokeWidth="1"
        />
      </g>
    );
  };

  // Realistic 3D Garment Renderers
  const renderGarmentBody = () => {
    if (garmentType === 'cap') {
      return (
        <g>
          {view === 'front' ? (
            <g id="cap-front">
              {/* Top squatchur button */}
              <ellipse cx="200" cy="115" rx="12" ry="6" fill={fillColor} stroke={seamStroke} strokeWidth="1.5" />
              <ellipse cx="200" cy="113" rx="12" ry="5" fill="rgba(255,255,255,0.12)" style={{ mixBlendMode: 'screen' }} />

              {/* Crown back outline to give depth */}
              <path
                d="M 110,240 Q 105,220 110,190 Q 120,130 200,115 Q 280,130 290,190 Q 295,220 290,240 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="2.5"
              />
              {/* 3D shading of the crown */}
              <path
                d="M 110,240 Q 105,220 110,190 Q 120,130 200,115 Q 280,130 290,190 Q 295,220 290,240 Z"
                fill="url(#torso3dShading)"
                style={{ mixBlendMode: 'multiply' }}
              />
              <path
                d="M 110,240 Q 105,220 110,190 Q 120,130 200,115 Q 280,130 290,190 Q 295,220 290,240 Z"
                fill="url(#specularHighlightGradient)"
                style={{ mixBlendMode: 'screen' }}
                opacity={isDark ? 0.35 : 0.22}
              />
              <path
                d="M 110,240 Q 105,220 110,190 Q 120,130 200,115 Q 280,130 290,190 Q 295,220 290,240 Z"
                fill="url(#fabricTexturePattern)"
                style={{ mixBlendMode: 'overlay' }}
              />

              {/* Panel Stitch lines */}
              <path d="M 200,115 Q 160,160 145,240" fill="none" stroke={seamStitch} strokeWidth="1.2" strokeDasharray="3 2" />
              <path d="M 200,115 L 200,240" fill="none" stroke={seamStitch} strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M 200,115 Q 240,160 255,240" fill="none" stroke={seamStitch} strokeWidth="1.2" strokeDasharray="3 2" />

              {/* Eyelets (ventilating holes) */}
              <circle cx="155" cy="160" r="3" fill="#000000" opacity="0.4" />
              <circle cx="155" cy="160" r="3.5" fill="none" stroke={seamStitch} strokeWidth="1" />
              <circle cx="245" cy="160" r="3" fill="#000000" opacity="0.4" />
              <circle cx="245" cy="160" r="3.5" fill="none" stroke={seamStitch} strokeWidth="1" />

              {/* Curved Brim (Visor) */}
              {/* Visor under shadow */}
              <path
                d="M 104,236 C 104,236 120,290 200,290 C 280,290 296,236 296,236 C 304,260 280,310 200,310 C 120,310 96,260 104,236 Z"
                fill="none"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="4"
                filter="blur(3px)"
              />
              {/* Visor Top */}
              <path
                d="M 106,238 Q 115,285 200,285 Q 285,285 294,238 C 302,255 280,302 200,302 C 120,302 98,255 106,238 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="2"
              />
              <path
                d="M 106,238 Q 115,285 200,285 Q 285,285 294,238 C 302,255 280,302 200,302 C 120,302 98,255 106,238 Z"
                fill="url(#torso3dShading)"
                style={{ mixBlendMode: 'multiply' }}
              />
              <path
                d="M 106,238 Q 115,285 200,285 Q 285,285 294,238 C 302,255 280,302 200,302 C 120,302 98,255 106,238 Z"
                fill="url(#fabricTexturePattern)"
                style={{ mixBlendMode: 'overlay' }}
              />

              {/* Visor concentric stitching rows */}
              <path d="M 118,245 Q 128,280 200,280 Q 272,280 282,245" fill="none" stroke={seamStitch} strokeWidth="1" strokeDasharray="3 2" />
              <path d="M 126,252 Q 135,288 200,288 Q 265,288 274,252" fill="none" stroke={seamStitch} strokeWidth="1" strokeDasharray="3 2" />
              <path d="M 134,259 Q 142,294 200,294 Q 258,294 266,259" fill="none" stroke={seamStitch} strokeWidth="1" strokeDasharray="3 2" />
            </g>
          ) : (
            <g id="cap-back">
              {/* Back dome */}
              <path
                d="M 110,240 Q 105,220 110,190 Q 120,130 200,115 Q 280,130 290,190 Q 295,220 290,240 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="2.5"
              />
              <path
                d="M 110,240 Q 105,220 110,190 Q 120,130 200,115 Q 280,130 290,190 Q 295,220 290,240 Z"
                fill="url(#torso3dShading)"
                style={{ mixBlendMode: 'multiply' }}
              />
              <path
                d="M 110,240 Q 105,220 110,190 Q 120,130 200,115 Q 280,130 290,190 Q 295,220 290,240 Z"
                fill="url(#fabricTexturePattern)"
                style={{ mixBlendMode: 'overlay' }}
              />

              {/* Eyelets */}
              <circle cx="155" cy="160" r="3" fill="#000000" opacity="0.4" />
              <circle cx="155" cy="160" r="3.5" fill="none" stroke={seamStitch} strokeWidth="1" />
              <circle cx="245" cy="160" r="3" fill="#000000" opacity="0.4" />
              <circle cx="245" cy="160" r="3.5" fill="none" stroke={seamStitch} strokeWidth="1" />

              {/* Semicircular cutout */}
              <path
                d="M 160,240 C 160,200 240,200 240,240 Z"
                fill="#ffffff"
                stroke={seamStroke}
                strokeWidth="1.5"
              />
              <g id="snapback-strap">
                <rect x="155" y="232" width="90" height="10" rx="2" fill="#18181b" stroke="#09090b" strokeWidth="1" />
                <circle cx="165" cy="237" r="1.5" fill="#52525b" />
                <circle cx="173" cy="237" r="1.5" fill="#52525b" />
                <circle cx="181" cy="237" r="1.5" fill="#52525b" />
                <circle cx="189" cy="237" r="1.5" fill="#52525b" />
                <circle cx="205" cy="237" r="1.5" fill="#ffffff" />
                <circle cx="213" cy="237" r="1.5" fill="#ffffff" />
                <circle cx="221" cy="237" r="1.5" fill="#ffffff" />
                <circle cx="229" cy="237" r="1.5" fill="#ffffff" />
              </g>
            </g>
          )}
        </g>
      );
    }

    if (garmentType === 'hoodie') {
      return (
        <g>
          {/* Main Hoodie Silhouette */}
          <path
            d="M 115,85 Q 120,70 145,55 L 255,55 Q 280,70 285,85 L 375,155 Q 382,165 372,175 L 332,235 Q 324,242 318,230 L 290,195 L 290,430 C 290,442 280,448 268,448 L 132,448 C 120,448 110,442 110,430 L 110,195 L 82,230 Q 76,242 68,235 L 28,175 Q 18,165 25,155 Z"
            fill={fillColor}
            stroke={seamStroke}
            strokeWidth="2.5"
          />

          {/* 3D Cylindrical Torso Shading */}
          <path
            d="M 115,85 Q 120,70 145,55 L 255,55 Q 280,70 285,85 L 375,155 Q 382,165 372,175 L 332,235 Q 324,242 318,230 L 290,195 L 290,430 C 290,442 280,448 268,448 L 132,448 C 120,448 110,442 110,430 L 110,195 L 82,230 Q 76,242 68,235 L 28,175 Q 18,165 25,155 Z"
            fill="url(#torso3dShading)"
            style={{ mixBlendMode: 'multiply' }}
          />
          <path
            d="M 110,100 Q 200,80 290,100 L 290,448 L 110,448 Z"
            fill="url(#specularHighlightGradient)"
            style={{ mixBlendMode: 'screen' }}
            opacity={isDark ? 0.35 : 0.25}
          />

          {/* Tactile Combed Cotton Grain Overlay */}
          <path
            d="M 115,85 Q 120,70 145,55 L 255,55 Q 280,70 285,85 L 375,155 Q 382,165 372,175 L 332,235 Q 324,242 318,230 L 290,195 L 290,430 C 290,442 280,448 268,448 L 132,448 C 120,448 110,442 110,430 L 110,195 L 82,230 Q 76,242 68,235 L 28,175 Q 18,165 25,155 Z"
            fill="url(#fabricTexturePattern)"
            style={{ mixBlendMode: 'overlay' }}
          />

          {/* Ribbed Bottom Band & Cuffs */}
          <path
            d="M 110,410 L 290,410 L 290,445 C 290,448 280,450 268,450 L 132,450 C 120,450 110,448 110,445 Z"
            fill="url(#fabricRibbingPattern)"
            stroke={seamStroke}
            strokeWidth="1.5"
          />
          {/* Sleeve Cuffs */}
          <path d="M 28,175 L 68,235 M 332,235 L 372,175" stroke={seamStroke} strokeWidth="2.5" />
          <path d="M 38,168 L 74,223 M 326,223 L 362,168" stroke="url(#fabricRibbingPattern)" strokeWidth="8" opacity="0.6" />

          {/* 3D Hood Construction */}
          {view === 'front' ? (
            <g>
              {/* Hood Interior cavity shadow */}
              <path
                d="M 140,55 C 130,110 270,110 260,55 C 240,115 160,115 140,55 Z"
                fill="#000000"
                opacity="0.4"
              />
              {/* Outer Draped Hood */}
              <path
                d="M 135,55 C 125,115 170,130 200,130 C 230,130 275,115 265,55 C 285,100 240,140 200,140 C 160,140 115,100 135,55 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="2"
              />
              {/* Drawstrings */}
              <path
                d="M 175,105 C 175,135 170,165 172,190"
                fill="none"
                stroke={isDark ? '#e4e4e7' : '#3f3f46'}
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="drop-shadow(1px 2px 2px rgba(0,0,0,0.3))"
              />
              <path
                d="M 225,105 C 225,135 230,165 228,190"
                fill="none"
                stroke={isDark ? '#e4e4e7' : '#3f3f46'}
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="drop-shadow(1px 2px 2px rgba(0,0,0,0.3))"
              />
              {/* Aglets (Tips) */}
              <rect x="170" y="188" width="4" height="8" rx="1" fill="#a1a1aa" />
              <rect x="226" y="188" width="4" height="8" rx="1" fill="#a1a1aa" />

              {/* Kangaroo Pocket */}
              <path
                d="M 135,320 L 265,320 L 282,400 C 282,410 272,415 260,415 L 140,415 C 128,415 118,410 118,400 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="2"
                filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.2))"
              />
              {/* Pocket Openings */}
              <path d="M 135,320 L 118,400" stroke={seamStroke} strokeWidth="2.5" />
              <path d="M 265,320 L 282,400" stroke={seamStroke} strokeWidth="2.5" />
              <path d="M 138,325 L 262,325" stroke={seamStitch} strokeWidth="1.5" strokeDasharray="4 2" />
            </g>
          ) : (
            /* Hood Back Fold */
            <g>
              <path
                d="M 135,50 C 130,135 270,135 265,50 C 290,110 240,150 200,150 C 160,150 110,110 135,50 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="2.5"
                filter="drop-shadow(0px 6px 10px rgba(0,0,0,0.3))"
              />
              <path
                d="M 135,50 C 130,135 270,135 265,50"
                fill="url(#torso3dShading)"
                opacity="0.3"
              />
            </g>
          )}

          {/* 3D Fabric Fold Shadow Overlays */}
          <path
            d="M 110,195 C 150,220 160,300 110,400 M 290,195 C 250,220 240,300 290,400"
            fill="none"
            stroke="#000000"
            strokeWidth="3"
            opacity="0.12"
            filter="blur(2px)"
          />
        </g>
      );
    }

    if (garmentType === 'sweatshirt') {
      return (
        <g>
          {/* Inner Back neck cavity underneath hanger */}
          {view === 'front' && (
            <path d="M 155,58 C 155,90 245,90 245,58 Z" fill="#000000" opacity="0.55" />
          )}

          {/* Render hanger inside the collar */}
          {renderHanger()}

          {/* Main Sweatshirt Silhouette */}
          <path
            d="M 125,75 Q 135,65 155,58 L 245,58 Q 265,65 275,75 L 368,150 Q 375,160 365,170 L 325,230 Q 318,238 310,225 L 285,190 L 285,425 C 285,438 275,445 262,445 L 138,445 C 125,445 115,438 115,425 L 115,190 L 90,225 Q 82,238 75,230 L 35,170 Q 25,160 32,150 Z"
            fill={fillColor}
            stroke={seamStroke}
            strokeWidth="2.5"
          />

          {/* 3D Cylindrical Shading */}
          <path
            d="M 125,75 Q 135,65 155,58 L 245,58 Q 265,65 275,75 L 368,150 Q 375,160 365,170 L 325,230 Q 318,238 310,225 L 285,190 L 285,425 C 285,438 275,445 262,445 L 138,445 C 125,445 115,438 115,425 L 115,190 L 90,225 Q 82,238 75,230 L 35,170 Q 25,160 32,150 Z"
            fill="url(#torso3dShading)"
            style={{ mixBlendMode: 'multiply' }}
          />
          <path
            d="M 115,90 Q 200,75 285,90 L 285,445 L 115,445 Z"
            fill="url(#specularHighlightGradient)"
            style={{ mixBlendMode: 'screen' }}
            opacity={isDark ? 0.35 : 0.22}
          />

          {/* Tactile Combed Cotton Grain Overlay */}
          <path
            d="M 125,75 Q 135,65 155,58 L 245,58 Q 265,65 275,75 L 368,150 Q 375,160 365,170 L 325,230 Q 318,238 310,225 L 285,190 L 285,425 C 285,438 275,445 262,445 L 138,445 C 125,445 115,438 115,425 L 115,190 L 90,225 Q 82,238 75,230 L 35,170 Q 25,160 32,150 Z"
            fill="url(#fabricTexturePattern)"
            style={{ mixBlendMode: 'overlay' }}
          />

          {/* Ribbed Bottom Band & Cuffs */}
          <path
            d="M 115,405 L 285,405 L 285,442 C 285,445 275,448 262,448 L 138,448 C 125,448 115,445 115,442 Z"
            fill="url(#fabricRibbingPattern)"
            stroke={seamStroke}
            strokeWidth="1.5"
          />

          {/* Ribbed Collar Front Overlays */}
          {view === 'front' ? (
            <g>
              {/* Inner Collar Brand Tag */}
              <rect x="180" y="65" width="40" height="15" rx="2" fill={isDark ? '#27272a' : '#e4e4e7'} stroke="#a1a1aa" strokeWidth="0.5" />
              <text x="200" y="74" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={isDark ? '#e4e4e7' : '#27272a'}>TIRAZ M</text>
              {/* Front Collar Rim */}
              <path
                d="M 155,58 C 155,95 245,95 245,58 C 245,102 155,102 155,58 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="2.2"
                filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.2)"
              />
              {/* Collar Ribbing Pattern Texture */}
              <path
                d="M 155,58 C 155,95 245,95 245,58 C 245,102 155,102 155,58 Z"
                fill="url(#fabricRibbingPattern)"
                opacity="0.35"
              />
              {/* Classic V-Stitch Sweatshirt Collar Detail */}
              <path d="M 190,95 L 200,108 L 210,95" fill="none" stroke={seamStroke} strokeWidth="2.2" />
            </g>
          ) : (
            <g>
              <path
                d="M 155,58 C 155,72 245,72 245,58 C 245,78 155,78 155,58 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="2.2"
              />
              <path
                d="M 155,58 C 155,72 245,72 245,58 C 245,78 155,78 155,58 Z"
                fill="url(#fabricRibbingPattern)"
                opacity="0.35"
              />
            </g>
          )}

          {/* Raglan Shoulder Seams */}
          <path d="M 155,58 L 115,130 M 245,58 L 285,130" stroke={seamStroke} strokeWidth="2" strokeDasharray="5 2" />
        </g>
      );
    }

    if (garmentType === 'shirt') {
      return (
        <g>
          {/* Inner back neck band shadow */}
          {view === 'front' && (
            <path d="M 158,58 C 158,85 242,85 242,58 Z" fill="#000000" opacity="0.4" />
          )}

          {/* Render hanger */}
          {renderHanger()}

          {/* Main Button-Down Shirt Silhouette */}
          <path
            d="M 125,75 Q 135,65 158,58 L 242,58 Q 265,65 275,75 L 358,145 Q 365,155 355,165 L 318,220 Q 310,228 302,215 L 280,185 L 280,430 Q 280,448 200,448 Q 120,448 120,430 L 120,185 L 98,215 Q 90,228 82,220 L 45,165 Q 35,155 42,145 Z"
            fill={fillColor}
            stroke={seamStroke}
            strokeWidth="2.5"
          />

          {/* 3D Cylindrical Shading */}
          <path
            d="M 125,75 Q 135,65 158,58 L 242,58 Q 265,65 275,75 L 358,145 Q 365,155 355,165 L 318,220 Q 310,228 302,215 L 280,185 L 280,430 Q 280,448 200,448 Q 120,448 120,430 L 120,185 L 98,215 Q 90,228 82,220 L 45,165 Q 35,155 42,145 Z"
            fill="url(#torso3dShading)"
            style={{ mixBlendMode: 'multiply' }}
          />

          {/* Tactile Combed Cotton Grain Overlay */}
          <path
            d="M 125,75 Q 135,65 158,58 L 242,58 Q 265,65 275,75 L 358,145 Q 365,155 355,165 L 318,220 Q 310,228 302,215 L 280,185 L 280,430 Q 280,448 200,448 Q 120,448 120,430 L 120,185 L 98,215 Q 90,228 82,220 L 45,165 Q 35,155 42,145 Z"
            fill="url(#fabricTexturePattern)"
            style={{ mixBlendMode: 'overlay' }}
          />

          {/* Crisp Dress Shirt Collar & Placket */}
          {view === 'front' ? (
            <g>
              {/* Left & Right Collar Flaps */}
              <path
                d="M 158,58 L 180,95 L 200,80 L 175,58 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="2"
                filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.25))"
              />
              <path
                d="M 242,58 L 220,95 L 200,80 L 225,58 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="2"
                filter="drop-shadow(-2px 2px 3px rgba(0,0,0,0.25))"
              />

              {/* Center Placket Strip */}
              <rect
                x="192"
                y="80"
                width="16"
                height="365"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="1.5"
                filter="drop-shadow(1px 0px 2px rgba(0,0,0,0.2))"
              />

              {/* Pearl Buttons */}
              {[110, 160, 210, 260, 310, 360, 410].map((cy) => (
                <g key={cy}>
                  <circle cx="200" cy={cy} r="4.2" fill={isDark ? '#e4e4e7' : '#ffffff'} stroke="#71717a" strokeWidth="0.8" />
                  <circle cx="200" cy={cy} r="2" fill="#d4d4d8" />
                </g>
              ))}

              {/* Chest Pocket */}
              <path
                d="M 230,160 L 270,160 L 270,210 L 250,222 L 230,210 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="1.5"
                filter="drop-shadow(1px 2px 3px rgba(0,0,0,0.15))"
              />
              <path d="M 230,165 L 270,165" stroke={seamStitch} strokeWidth="1" strokeDasharray="3 1" />
            </g>
          ) : (
            /* Shirt Back Yoke Seam */
            <g>
              <path d="M 125,120 L 275,120" stroke={seamStroke} strokeWidth="2" strokeDasharray="4 2" />
              <path
                d="M 158,58 C 158,72 242,72 242,58 C 242,78 158,78 158,58 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="2"
              />
            </g>
          )}
        </g>
      );
    }

    if (garmentType === 'long-sleeve') {
      const longSleevePath = "M 125,75 Q 138,64 158,58 L 242,58 Q 262,64 275,75 L 340,180 L 355,360 Q 357,370 345,372 L 320,365 Q 312,360 310,345 L 295,220 L 282,190 L 282,430 C 282,442 272,448 260,448 L 140,448 C 128,448 118,442 118,430 L 118,190 L 105,220 L 90,345 Q 88,360 80,365 L 55,372 Q 43,370 45,360 L 60,180 Z";

      return (
        <g>
          {/* Inner neck back cavity underneath hanger */}
          {view === 'front' && (
            <path
              d="M 158,58 C 158,95 242,95 242,58 C 242,66 158,66 158,58 Z"
              fill="#000000"
              opacity="0.55"
            />
          )}

          {/* Render hanger */}
          {renderHanger()}

          {/* Main Long Sleeve Body */}
          <path
            d={longSleevePath}
            fill={fillColor}
            stroke={seamStroke}
            strokeWidth="2.5"
          />

          {/* 3D Cylindrical Volume Shading */}
          <path
            d={longSleevePath}
            fill="url(#torso3dShading)"
            style={{ mixBlendMode: 'multiply' }}
          />

          {/* Specular Highlight */}
          <path
            d="M 118,90 Q 200,75 282,90 L 282,448 L 118,448 Z"
            fill="url(#specularHighlightGradient)"
            style={{ mixBlendMode: 'screen' }}
            opacity={isDark ? 0.38 : 0.25}
          />

          {/* Tactile Combed Cotton Grain Overlay */}
          <path
            d={longSleevePath}
            fill="url(#fabricTexturePattern)"
            style={{ mixBlendMode: 'overlay' }}
          />

          {/* 3D Fabric Wrinkles & Folds */}
          <g stroke="#000000" strokeWidth="2.5" opacity="0.1" filter="blur(1.5px)" fill="none">
            {/* Armpit drape folds */}
            <path d="M 118,190 C 135,215 140,280 120,380" />
            <path d="M 282,190 C 265,215 260,280 280,380" />
            {/* Elbow folds */}
            <path d="M 75,230 Q 95,240 100,260" />
            <path d="M 325,230 Q 305,240 300,260" />
            {/* Chest folds */}
            <path d="M 158,110 Q 200,125 242,110" />
          </g>

          {/* Ribbed Collar Front Overlays */}
          {view === 'front' ? (
            <g>
              {/* Inner Collar Brand Tag */}
              <rect x="180" y="65" width="40" height="15" rx="2" fill={isDark ? '#27272a' : '#e4e4e7'} stroke="#a1a1aa" strokeWidth="0.5" />
              <text x="200" y="74" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={isDark ? '#e4e4e7' : '#27272a'}>TIRAZ M</text>
              {/* Front Collar Rim */}
              <path
                d="M 158,58 C 158,95 242,95 242,58 C 242,102 158,102 158,58 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="2.2"
                filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.2)"
              />
              {/* Collar Ribbing Pattern Texture */}
              <path
                d="M 158,58 C 158,95 242,95 242,58 C 242,102 158,102 158,58 Z"
                fill="url(#fabricRibbingPattern)"
                opacity="0.35"
              />
            </g>
          ) : (
            <g>
              <path
                d="M 158,58 C 158,72 242,72 242,58 C 242,78 158,78 158,58 Z"
                fill={fillColor}
                stroke={seamStroke}
                strokeWidth="2.2"
              />
              <path
                d="M 158,58 C 158,72 242,72 242,58 C 242,78 158,78 158,58 Z"
                fill="url(#fabricRibbingPattern)"
                opacity="0.35"
              />
            </g>
          )}

          {/* Sleeves Cuff Stitch Lines */}
          <path d="M 45,360 L 80,365 M 355,360 L 320,365" stroke={seamStroke} strokeWidth="2.2" />
          <path d="M 47,355 L 78,360 M 353,355 L 322,360" stroke={seamStitch} strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Raglan Shoulder Seams */}
          <path d="M 158,58 L 118,130 M 242,58 L 282,130" stroke={seamStroke} strokeWidth="2" strokeDasharray="5 2" />
        </g>
      );
    }

    // Default T-Shirt (Classic or Oversized)
    const isOversized = garmentType === 'oversized-tee';
    
    // Smooth, Organic Photorealistic 3D T-Shirt Silhouette Paths with Natural Hem & Shoulder Curves
    const tshirtPath = isOversized
      ? "M 115,75 Q 130,62 155,56 L 245,56 Q 270,62 285,75 L 382,145 Q 390,155 380,168 L 334,238 Q 326,248 314,232 L 290,192 L 290,432 Q 200,452 110,432 L 110,192 L 86,232 Q 74,248 66,238 L 20,168 Q 10,155 18,145 Z"
      : "M 125,75 Q 138,64 158,58 L 242,58 Q 262,64 275,75 L 360,138 Q 368,148 358,160 L 322,218 Q 314,226 304,212 L 284,182 L 284,428 Q 200,446 116,428 L 116,182 L 96,212 Q 86,226 78,218 L 42,160 Q 32,148 40,138 Z";

    const leftSleeveOpening = isOversized ? "M 20,145 Q 43,190 66,238" : "M 40,138 Q 59,178 78,218";
    const rightSleeveOpening = isOversized ? "M 380,145 Q 357,190 334,238" : "M 358,138 Q 339,178 320,218";

    return (
      <g>
        {/* Inner neck back cavity underneath hanger */}
        {view === 'front' && (
          <path
            d="M 158,58 C 158,95 242,95 242,58 C 242,68 158,68 158,58 Z"
            fill="#0a0a0c"
            opacity="0.75"
          />
        )}

        {/* Render premium wood hanger embedded correctly in the neck opening */}
        {renderHanger()}

        {/* Inner Sleeve Cavity Depth Shadows */}
        <path d={isOversized ? "M 20,145 L 66,238 L 86,232 Z" : "M 40,138 L 78,218 L 96,212 Z"} fill="#000000" opacity="0.3" />
        <path d={isOversized ? "M 380,145 L 334,238 L 314,232 Z" : "M 358,138 L 320,218 L 304,212 Z"} fill="#000000" opacity="0.3" />

        {/* Main T-Shirt Body Base */}
        <path
          d={tshirtPath}
          fill={fillColor}
          stroke={seamStroke}
          strokeWidth="2.5"
          filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.18))"
        />

        {/* 3D Cylindrical Volume Shading */}
        <path
          d={tshirtPath}
          fill="url(#torso3dShading)"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* Specular Highlight along Left Center */}
        <path
          d={isOversized ? "M 110,90 Q 200,75 290,90 L 290,432 Q 200,452 110,432 Z" : "M 116,90 Q 200,75 284,90 L 284,428 Q 200,446 116,428 Z"}
          fill="url(#specularHighlightGradient)"
          style={{ mixBlendMode: 'screen' }}
          opacity={isDark ? 0.38 : 0.25}
        />

        {/* Tactile Combed Cotton Grain Overlay */}
        <path
          d={tshirtPath}
          fill="url(#fabricTexturePattern)"
          style={{ mixBlendMode: 'overlay' }}
        />

        {/* Photorealistic Set-in Sleeve Armhole Seams */}
        <path
          d={isOversized ? "M 155,56 C 145,100 130,145 110,192 M 245,56 C 255,100 270,145 290,192" : "M 158,58 C 148,98 135,140 116,182 M 242,58 C 252,98 265,140 284,182"}
          fill="none"
          stroke={seamStroke}
          strokeWidth="2"
        />
        <path
          d={isOversized ? "M 156,58 C 147,100 132,145 112,192 M 244,58 C 253,100 268,145 288,192" : "M 159,60 C 150,98 137,140 118,182 M 241,60 C 250,98 263,140 282,182"}
          fill="none"
          stroke={seamStitch}
          strokeWidth="1.2"
          strokeDasharray="3 1.5"
        />

        {/* Organic 3D Fabric Wrinkles, Tension Creases & Drapes */}
        <g stroke="#000000" strokeWidth="2.5" opacity="0.12" filter="blur(1.5px)" fill="none">
          {/* Armpit drape folds */}
          <path d="M 112,190 C 135,220 142,285 120,385" />
          <path d="M 288,190 C 265,220 258,285 280,385" />
          {/* Chest soft drape lines */}
          <path d="M 158,110 Q 200,128 242,110" />
          <path d="M 150,150 Q 200,172 250,150" />
          {/* Waist ripple creases */}
          <path d="M 125,320 Q 200,342 275,320" />
          <path d="M 130,370 Q 200,390 270,370" />
        </g>

        {/* Soft Highlight Crease Reflections */}
        <g stroke="#ffffff" strokeWidth="1.8" opacity={isDark ? 0.25 : 0.18} filter="blur(0.8px)" fill="none">
          <path d="M 114,192 C 137,222 144,287 122,387" />
          <path d="M 286,192 C 263,222 256,287 278,387" />
          <path d="M 158,112 Q 200,130 242,112" />
        </g>

        {/* Sleeve Hem Double-Needle Coverstitch */}
        <path d={leftSleeveOpening} stroke={seamStroke} strokeWidth="2" />
        <path d={rightSleeveOpening} stroke={seamStroke} strokeWidth="2" />
        <path
          d={isOversized ? "M 28,172 Q 51,217 74,233 M 372,172 Q 349,217 326,233" : "M 48,162 Q 67,202 86,218 M 352,162 Q 333,202 314,218"}
          stroke={seamStitch}
          strokeWidth="1.2"
          strokeDasharray="3.5 1.5"
        />

        {/* Bottom Hem Double-Needle Coverstitch (Curved organically) */}
        <path
          d={isOversized ? "M 110,422 Q 200,442 290,422" : "M 116,418 Q 200,436 284,418"}
          stroke={seamStroke}
          strokeWidth="1.8"
        />
        <path
          d={isOversized ? "M 110,426 Q 200,446 290,426" : "M 116,422 Q 200,440 284,422"}
          stroke={seamStitch}
          strokeWidth="1.2"
          strokeDasharray="4 2"
        />

        {/* 3D Ribbed Crew Collar Construction */}
        {view === 'front' ? (
          <g>
            {/* Back Neck Reinforcement Tape Strip */}
            <path
              d="M 158,58 C 158,74 242,74 242,58 L 242,63 C 242,79 158,79 158,63 Z"
              fill={isDark ? '#27272a' : '#e4e4e7'}
              stroke="#a1a1aa"
              strokeWidth="0.5"
            />
            {/* Woven Brand Tag */}
            <rect
              x="182"
              y="61"
              width="36"
              height="13"
              rx="2"
              fill={isDark ? '#18181b' : '#ffffff'}
              stroke="#71717a"
              strokeWidth="0.6"
            />
            <text
              x="200"
              y="70"
              textAnchor="middle"
              fontSize="5.5"
              fontWeight="extrabold"
              fill={isDark ? '#f4f4f5' : '#18181b'}
              letterSpacing="0.5"
            >
              TIRAZ • M
            </text>

            {/* Front Ribbed Collar Band Rim */}
            <path
              d="M 158,58 C 158,98 242,98 242,58 C 242,108 158,108 158,58 Z"
              fill={fillColor}
              stroke={seamStroke}
              strokeWidth="2.2"
              filter="drop-shadow(0px 3px 4px rgba(0,0,0,0.3))"
            />
            {/* Collar Ribbing Pattern Texture */}
            <path
              d="M 158,58 C 158,98 242,98 242,58 C 242,108 158,108 158,58 Z"
              fill="url(#fabricRibbingPattern)"
              opacity="0.45"
            />
            {/* Collar Topstitching Line */}
            <path
              d="M 156,60 C 156,110 244,110 244,60"
              fill="none"
              stroke={seamStitch}
              strokeWidth="1.2"
              strokeDasharray="4 2"
            />
          </g>
        ) : (
          <g>
            {/* Back View Collar Band */}
            <path
              d="M 158,58 C 158,72 242,72 242,58 C 242,80 158,80 158,58 Z"
              fill={fillColor}
              stroke={seamStroke}
              strokeWidth="2.2"
              filter="drop-shadow(0px 3px 4px rgba(0,0,0,0.25))"
            />
            <path
              d="M 158,58 C 158,72 242,72 242,58 C 242,80 158,80 158,58 Z"
              fill="url(#fabricRibbingPattern)"
              opacity="0.45"
            />
          </g>
        )}
      </g>
    );
  };

  // Render Placed Artwork on Fabric
  const renderArtwork = () => {
    const {
      designType,
      catalogItem,
      uploadedImageUrl,
      customText,
      textColor,
      scale,
      positionX,
      positionY,
      rotation,
      technique,
    } = customization;

    const centerX = placementBox.x + placementBox.width / 2 + positionX;
    const centerY = placementBox.y + placementBox.height / 2 + positionY;

    return (
      <g
        transform={`translate(${centerX} ${centerY}) rotate(${rotation}) scale(${scale} ${scale})`}
        onMouseDown={handleMouseDown}
        className={interactive ? 'cursor-grab active:cursor-grabbing hover:opacity-95' : ''}
      >
        {/* Placement outline guide when active */}
        {interactive && (
          <rect
            x="-48"
            y="-48"
            width="96"
            height="96"
            fill="none"
            stroke={technique === 'embroidery' ? '#f59e0b' : '#38bdf8'}
            strokeWidth="1.8"
            strokeDasharray="5 3"
            rx="6"
            className="opacity-50 hover:opacity-100 transition-opacity"
          />
        )}

        {/* 1. Catalog Image */}
        {designType === 'catalog' && catalogItem && (
          <g>
            <image
              href={catalogItem.imageUrl}
              x="-42"
              y="-42"
              width="84"
              height="84"
              preserveAspectRatio="xMidYMid slice"
              className="rounded-sm"
              style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.4))' }}
            />
            {/* Real cotton texture overlay on top of cross-origin images (completely CORS-safe & looks stunning) */}
            <rect
              x="-42"
              y="-42"
              width="84"
              height="84"
              fill="url(#fabricTexturePattern)"
              opacity="0.32"
              style={{ mixBlendMode: 'overlay' }}
              pointerEvents="none"
              rx="2"
            />
            {technique === 'embroidery' ? (
              <>
                {/* Gold/amber embroidery border represent real lock stitching */}
                <rect
                  x="-42"
                  y="-42"
                  width="84"
                  height="84"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="1.8"
                  strokeDasharray="2.5 1.5"
                  opacity="0.85"
                  rx="2"
                />
                <text x="0" y="52" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="bold">
                  🧵 مظهر تطريز
                </text>
              </>
            ) : (
              <rect
                x="-42"
                y="-42"
                width="84"
                height="84"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                rx="2"
              />
            )}
          </g>
        )}

        {/* 2. Customer Uploaded Image */}
        {designType === 'upload' && uploadedImageUrl && (
          <g>
            <image
              href={uploadedImageUrl}
              x="-42"
              y="-42"
              width="84"
              height="84"
              preserveAspectRatio="xMidYMid meet"
              style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.4))' }}
            />
            {/* Real cotton texture overlay */}
            <rect
              x="-42"
              y="-42"
              width="84"
              height="84"
              fill="url(#fabricTexturePattern)"
              opacity="0.32"
              style={{ mixBlendMode: 'overlay' }}
              pointerEvents="none"
            />
            {technique === 'embroidery' && (
              <rect
                x="-42"
                y="-42"
                width="84"
                height="84"
                fill="none"
                stroke="#d97706"
                strokeWidth="1.8"
                strokeDasharray="2.5 1.5"
                opacity="0.85"
              />
            )}
          </g>
        )}

        {/* 3. Custom Calligraphy / Text */}
        {designType === 'text' && customText && (
          <g>
            {/* Realistic drop-shadow backline */}
            {technique === 'embroidery' && (
              <text
                x="0"
                y="6"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="none"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="3"
                fontSize="24"
                fontWeight="extrabold"
                fontFamily="Cairo, sans-serif"
                style={{ letterSpacing: '1px' }}
              >
                {customText}
              </text>
            )}
            <text
              x="0"
              y="6"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={textColor || '#ffffff'}
              fontSize="24"
              fontWeight="extrabold"
              fontFamily="Cairo, sans-serif"
              style={{
                letterSpacing: '1px',
                filter: 'drop-shadow(1px 2px 1.5px rgba(0,0,0,0.45))',
              }}
            >
              {customText}
            </text>
            {/* 3D realistic thread stitch effect overlay */}
            {technique === 'embroidery' && (
              <text
                x="0"
                y="6"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.8"
                strokeDasharray="1.5 1"
                fontSize="24"
                fontWeight="extrabold"
                fontFamily="Cairo, sans-serif"
                style={{ letterSpacing: '1px' }}
              >
                {customText}
              </text>
            )}
          </g>
        )}
      </g>
    );
  };

  return (
    <div id="garment-mockup-svg" className="relative w-full max-w-[440px] mx-auto aspect-[4/5] flex items-center justify-center select-none">
      <svg
        viewBox="0 0 400 500"
        className="w-full h-full drop-shadow-2xl overflow-visible"
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* 1. Floor Ground Soft Shadow */}
          <radialGradient id="floorGroundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* 2. 3D Cylindrical Torso Shading Gradient */}
          <linearGradient id="torso3dShading" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="15%" stopColor="#000000" stopOpacity="0.1" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="85%" stopColor="#000000" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
          </linearGradient>

          {/* 3. Specular Lighting Overlay Gradient */}
          <linearGradient id="specularHighlightGradient" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
          </linearGradient>

          {/* 4. Fabric Ribbing Pattern Texture */}
          <pattern id="fabricRibbingPattern" width="4" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="4" stroke="#000000" strokeWidth="1" opacity="0.18" />
            <line x1="2" y1="0" x2="2" y2="4" stroke="#ffffff" strokeWidth="1" opacity="0.12" />
          </pattern>

          {/* 5. Elegant Wood Hanger Gradients */}
          <linearGradient id="woodHangerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="25%" stopColor="#b45309" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="75%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id="metalHookGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f4f4f5" />
            <stop offset="50%" stopColor="#a1a1aa" />
            <stop offset="100%" stopColor="#52525b" />
          </linearGradient>

          {/* 6. Realistic Woven Cotton Fabric Grain Pattern */}
          <pattern id="fabricTexturePattern" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M 0,3 L 6,3 M 3,0 L 3,6" stroke="#000000" strokeWidth="0.5" opacity="0.08" />
            <path d="M 0,0 L 6,6 M 6,0 L 0,6" stroke="#ffffff" strokeWidth="0.5" opacity="0.05" />
          </pattern>

          {/* 7. Realistic 3D Embroidery Thread Texture Filter */}
          <filter id="embroideryThread3DFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feDropShadow dx="1.5" dy="2" stdDeviation="1" floodColor="#000000" floodOpacity="0.55" />
          </filter>

          {/* 8. DTG Thermal Print Filter */}
          <filter id="printDTG3DFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" result="grain" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0" />
            <feComposite in2="SourceGraphic" in="grain" operator="in" result="textured" />
            <feDropShadow dx="0.5" dy="1" stdDeviation="0.5" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Realistic Floor Shadow Underneath Garment */}
        {!useRealPhoto && <ellipse cx="200" cy="465" rx="150" ry="18" fill="url(#floorGroundShadow)" />}

        {/* 3D Garment Silhouette */}
        {useRealPhoto ? (
          <image
            href={activeRealImageUrl}
            x="0"
            y="0"
            width="400"
            height="500"
            preserveAspectRatio="xMidYMid slice"
          />
        ) : renderGarmentBody()}

        {/* Placement Guide Box Area */}
        <rect
          x={placementBox.x}
          y={placementBox.y}
          width={placementBox.width}
          height={placementBox.height}
          fill={customization.technique === 'embroidery' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(56, 189, 248, 0.05)'}
          stroke={customization.technique === 'embroidery' ? '#f59e0b' : '#38bdf8'}
          strokeWidth="1.2"
          strokeDasharray="5 3"
          rx="8"
          className="opacity-70"
        />

        {/* Placement Label */}
        <text
          x={placementBox.x + placementBox.width / 2}
          y={placementBox.y - 8}
          textAnchor="middle"
          fill={isDark ? '#e4e4e7' : '#3f3f46'}
          fontSize="9.5"
          fontWeight="extrabold"
          className="opacity-80"
        >
          {placementBox.label} ({customization.technique === 'embroidery' ? 'تطريز 🧵' : 'طباعة 🎨'})
        </text>

        {/* Placed Custom Artwork */}
        {renderArtwork()}
      </svg>

      {/* View Badge */}
      <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur text-slate-200 text-[11px] px-3 py-1 rounded-md border border-slate-700/80 font-bold shadow-md">
        الجهة: {view === 'front' ? 'الأمامية (Front)' : 'الخلفية (Back)'}
      </div>
    </div>
  );
};
