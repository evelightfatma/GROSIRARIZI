import React, { useState } from 'react';
import { Shirt, RefreshCw, Minus, Plus, ChevronDown, Check, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { BatikProduct, SleeveType, SizeType } from '../types';
import { SIZES } from '../constants';

interface CatalogSectionProps {
  products: BatikProduct[];
  cart: Record<string, Record<SizeType, number>>;
  isSyncing: boolean;
  onSync: () => void;
  onAdjustQty: (cartKey: string, size: SizeType, delta: number) => void;
  onSetQty: (cartKey: string, size: SizeType, value: number) => void;
}

interface ProductCardProps {
  product: BatikProduct;
  cart: Record<string, Record<SizeType, number>>;
  onAdjustQty: (cartKey: string, size: SizeType, delta: number) => void;
  onSetQty: (cartKey: string, size: SizeType, value: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cart,
  onAdjustQty,
  onSetQty,
}) => {
  // Active selected sleeve tab
  const [activeSleeve, setActiveSleeve] = useState<SleeveType>(
    product.sleeves.includes('Panjang') ? 'Panjang' : product.sleeves[0] || 'Panjang'
  );

  // Selected size from dropdown
  const [selectedSize, setSelectedSize] = useState<SizeType>('L');

  // Input quantity for the selected size in dropdown
  const cartKey = `${product.id}_${activeSleeve}`;
  const sizeData = cart[cartKey] || {
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
    XXXL: 0,
  };

  const currentSizeQty = sizeData[selectedSize] || 0;

  // Compute total pcs for this specific sleeve variant
  let currentSleeveTotal = 0;
  SIZES.forEach((sz) => {
    currentSleeveTotal += Number(sizeData[sz]) || 0;
  });

  // Compute total pcs for whole product (both sleeves)
  let productTotalPcs = 0;
  (product.sleeves || []).forEach((slv) => {
    const slvData = cart[`${product.id}_${slv}`] || {};
    SIZES.forEach((sz) => {
      productTotalPcs += Number(slvData[sz]) || 0;
    });
  });

  // Pick active image based on active sleeve
  const currentImg =
    (activeSleeve === 'Panjang' ? product.imagePanjang : product.imagePendek) ||
    product.image ||
    product.imagePanjang ||
    product.imagePendek ||
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';

  // Get list of active sizes that have qty > 0 for this sleeve
  const chosenSizesList = SIZES.filter((sz) => (sizeData[sz] || 0) > 0);

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-[#16161C] rounded-2xl p-5 border border-white/10 shadow-xl space-y-4 relative overflow-hidden transition-all hover:border-[#D4AF37]/40"
    >
      {/* Top Header: Title & Total Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-extrabold bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/25 inline-flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Batik ARIZI Solo
            </span>
            {productTotalPcs > 0 && (
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
                {productTotalPcs} Pcs Dipilih
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-white tracking-wide leading-snug">
            {product.name}
          </h3>
        </div>
      </div>

      {/* Main Aligned Content: Large Image & Selection Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
        {/* Large Product Image Container */}
        <div className="sm:col-span-5 relative group rounded-xl overflow-hidden bg-[#0D0D10] border border-white/10 aspect-square flex items-center justify-center">
          <img
            src={currentImg}
            alt={`${product.name} - Lengan ${activeSleeve}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute bottom-2 left-2 bg-[#0D0D10]/80 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[#F3E5AB] flex items-center gap-1 shadow-md">
            <ImageIcon className="w-3 h-3 text-[#D4AF37]" />
            <span>Lengan {activeSleeve}</span>
          </div>
        </div>

        {/* Controls: Sleeve Selector, Size Dropdown & Stepper */}
        <div className="sm:col-span-7 space-y-3.5">
          {/* 1. Sleeve Variant Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              1. Pilih Varian Lengan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {product.sleeves.map((sleeve) => {
                const isActive = activeSleeve === sleeve;
                const sleeveCartKey = `${product.id}_${sleeve}`;
                const sleeveData = cart[sleeveCartKey] || {};
                const slvQty = SIZES.reduce<number>(
                  (a, sz) => a + (Number(sleeveData[sz]) || 0),
                  0
                );

                return (
                  <button
                    key={sleeve}
                    type="button"
                    onClick={() => setActiveSleeve(sleeve)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      isActive
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md shadow-[#D4AF37]/15'
                        : 'bg-[#0D0D10] text-gray-300 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5" />
                      <span>{sleeve}</span>
                    </span>
                    {slvQty > 0 && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-black text-[#D4AF37]'
                            : 'bg-[#D4AF37]/20 text-[#F3E5AB]'
                        }`}
                      >
                        {slvQty} pcs
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Size Dropdown & Large Quantity Stepper */}
          <div className="bg-[#0D0D10] p-3.5 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor={`size-select-${product.id}`} className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                2. Pilih Ukuran (Dropdown)
              </label>
              <span className="text-[10px] text-gray-400">
                Lengan {activeSleeve}: <strong className="text-[#D4AF37]">{currentSleeveTotal} Pcs</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {/* Dropdown Selector */}
              <div className="sm:col-span-6 relative">
                <select
                  id={`size-select-${product.id}`}
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value as SizeType)}
                  className="w-full appearance-none bg-[#16161C] border border-white/20 hover:border-[#D4AF37] text-white text-xs font-bold rounded-xl py-2.5 px-3 pr-8 outline-none transition-colors cursor-pointer"
                >
                  {SIZES.map((sz) => {
                    const count = sizeData[sz] || 0;
                    return (
                      <option key={sz} value={sz} className="bg-[#16161C] text-white">
                        Ukuran {sz} {count > 0 ? `(${count} pcs dipilih)` : ''}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Large Quantity Stepper for Selected Size */}
              <div className="sm:col-span-6 flex items-center bg-[#16161C] border border-white/20 rounded-xl overflow-hidden p-0.5">
                <button
                  type="button"
                  onClick={() => onAdjustQty(cartKey, selectedSize, -1)}
                  disabled={currentSizeQty <= 0}
                  aria-label={`Kurangi jumlah ukuran ${selectedSize}`}
                  className="w-10 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#20202A] active:scale-90 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0 font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex-1 flex flex-col items-center justify-center">
                  <input
                    type="number"
                    min="0"
                    value={currentSizeQty}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      onSetQty(cartKey, selectedSize, isNaN(parsed) ? 0 : Math.max(0, parsed));
                    }}
                    className="w-full text-center bg-transparent text-white font-extrabold text-sm outline-none py-0.5"
                  />
                  <span className="text-[9px] text-gray-400 font-semibold leading-none">
                    Pcs ({selectedSize})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onAdjustQty(cartKey, selectedSize, 1)}
                  aria-label={`Tambah jumlah ukuran ${selectedSize}`}
                  className="w-10 h-9 flex items-center justify-center text-[#D4AF37] hover:text-[#F3E5AB] hover:bg-[#20202A] active:scale-90 transition-all cursor-pointer shrink-0 font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Direct Quick Add Helper Buttons for Selected Size */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
              <span className="text-gray-400">Tambah Cepat ({selectedSize}):</span>
              <div className="flex gap-1.5">
                {[1, 6, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onAdjustQty(cartKey, selectedSize, num)}
                    className="px-2 py-0.5 bg-[#20202A] hover:bg-[#D4AF37]/20 hover:text-[#F3E5AB] text-gray-300 rounded text-[10px] font-bold transition-all border border-white/10 active:scale-95 cursor-pointer"
                  >
                    +{num}
                  </button>
                ))}
                {currentSizeQty > 0 && (
                  <button
                    type="button"
                    onClick={() => onSetQty(cartKey, selectedSize, 0)}
                    className="px-2 py-0.5 bg-red-950/40 text-red-400 hover:bg-red-900/60 rounded text-[10px] font-bold transition-all border border-red-500/30 active:scale-95 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Selected Sizes Breakdown Badges for this Sleeve */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400 font-medium">
                Rincian Ukuran Terpilih (Lengan {activeSleeve}):
              </span>
              {currentSleeveTotal > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    SIZES.forEach((sz) => onSetQty(cartKey, sz, 0));
                  }}
                  className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer"
                >
                  Hapus Semua Lengan Ini
                </button>
              )}
            </div>

            {chosenSizesList.length === 0 ? (
              <div className="bg-[#0D0D10]/50 border border-dashed border-white/10 rounded-xl p-2.5 text-center text-[11px] text-gray-500">
                Belum ada ukuran yang dipilih untuk Lengan {activeSleeve}. Gunakan dropdown di atas untuk menambah.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {chosenSizesList.map((sz) => {
                  const qty = sizeData[sz] || 0;
                  return (
                    <div
                      key={sz}
                      className="bg-[#0D0D10] border border-[#D4AF37]/40 rounded-xl px-2.5 py-1 flex items-center gap-2 text-xs shadow-sm"
                    >
                      <span className="font-bold text-[#F3E5AB]">Ukuran {sz}:</span>
                      <span className="font-extrabold text-white bg-[#20202A] px-2 py-0.5 rounded-lg border border-white/10">
                        {qty} pcs
                      </span>
                      <div className="flex items-center gap-1 ml-0.5">
                        <button
                          type="button"
                          onClick={() => onAdjustQty(cartKey, sz, -1)}
                          title={`Kurangi 1 ${sz}`}
                          className="text-gray-400 hover:text-white p-0.5 hover:bg-white/10 rounded cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAdjustQty(cartKey, sz, 1)}
                          title={`Tambah 1 ${sz}`}
                          className="text-[#D4AF37] hover:text-[#F3E5AB] p-0.5 hover:bg-white/10 rounded cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSetQty(cartKey, sz, 0)}
                          title={`Hapus ukuran ${sz}`}
                          className="text-red-400 hover:text-red-300 p-0.5 hover:bg-red-500/20 rounded cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  cart,
  isSyncing,
  onSync,
  onAdjustQty,
  onSetQty,
}) => {
  return (
    <section id="catalog-section" className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shirt className="w-4 h-4 text-[#D4AF37]" />
            <span>Katalog Batik ARIZI (Tampilan Penuh)</span>
          </h2>
          <p className="text-[11px] text-gray-400">
            Pilih varian lengan & tentukan ukuran via dropdown dengan praktis
          </p>
        </div>
        <button
          id="sync-sheets-btn"
          onClick={onSync}
          disabled={isSyncing}
          title="Sinkronkan dengan Google Sheets & Drive"
          className="text-xs bg-[#16161C] hover:bg-[#20202A] border border-white/10 px-3 py-2 rounded-xl text-[#D4AF37] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shadow-md font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync Data Spreadsheet</span>
        </button>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="bg-[#16161C] p-8 rounded-2xl text-center text-gray-400 text-xs border border-white/5 space-y-3">
          <p>Belum ada produk yang dimuat dari Spreadsheet.</p>
          <button
            onClick={onSync}
            className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Muat Data dari Spreadsheet Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              cart={cart}
              onAdjustQty={onAdjustQty}
              onSetQty={onSetQty}
            />
          ))}
        </div>
      )}
    </section>
  );
};
