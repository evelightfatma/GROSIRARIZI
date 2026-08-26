import React from 'react';
import { ListChecks, Copy, Tag, Check, ShoppingBag } from 'lucide-react';
import { PriceCalculationResult } from '../types';
import { formatRupiah } from '../utils/pricing';

interface CartSectionProps {
  calculation: PriceCalculationResult | null;
  onCopySummary: () => void;
  isCopied: boolean;
}

export const CartSection: React.FC<CartSectionProps> = ({
  calculation,
  onCopySummary,
  isCopied,
}) => {
  const totalQty = calculation?.quantity || 0;

  return (
    <section
      id="cart-section"
      className="bg-[#16161C] rounded-2xl p-5 border border-white/10 shadow-xl space-y-4"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-[#D4AF37]" />
          <span>Rincian Keranjang Pembelian</span>
        </h3>
        <span
          id="cart-total-qty-badge"
          className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full"
        >
          {totalQty} PCS
        </span>
      </div>

      {/* Cart Items List */}
      <div id="cart-items-list" className="space-y-2 text-xs">
        {(!calculation || calculation.items.length === 0) ? (
          <div className="text-gray-500 italic text-center py-6 bg-[#0D0D10]/40 rounded-xl border border-white/5 flex flex-col items-center gap-1.5">
            <ShoppingBag className="w-5 h-5 text-gray-600 mb-1" />
            <span>Keranjang masih kosong. Pilih varian ukuran batik di katalog atas.</span>
          </div>
        ) : (
          calculation.items.map((item, idx) => (
            <div
              key={`${item.prodId}_${item.sleeve}_${idx}`}
              className="bg-[#0D0D10]/70 p-3 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-1.5"
            >
              <div>
                <span className="font-bold text-white block">{item.prodName}</span>
                <span className="text-[11px] text-[#D4AF37] font-medium">
                  Lengan {item.sleeve} • Ukuran [ {item.sizesStr} ]
                </span>
              </div>
              <span className="text-xs font-bold text-white bg-[#20202A] px-2.5 py-1 rounded-lg border border-white/10 self-start sm:self-auto shrink-0">
                {item.qty} Pcs
              </span>
            </div>
          ))
        )}
      </div>

      {/* Wholesale Calculation Results Card */}
      <div
        id="results-card"
        className="bg-gradient-to-br from-[#16161C] via-[#16161C] to-[#20202A] rounded-xl p-4 border border-[#D4AF37]/30 shadow-2xl space-y-3 relative overflow-hidden gold-border-glow"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              TOTAL PEMBELIAN GROSIR
            </span>
            <div
              id="res-total-price"
              className="text-3xl font-extrabold gold-gradient-text mt-0.5"
            >
              {calculation ? formatRupiah(calculation.total) : 'Rp 0'}
            </div>
          </div>
          <button
            id="copy-summary-btn"
            onClick={onCopySummary}
            title="Salin Ringkasan Belanja"
            disabled={!calculation || calculation.quantity <= 0}
            className="p-2.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] active:scale-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Savings Badge */}
        {calculation && calculation.saving > 0 && (
          <div id="saving-badge-container">
            <div className="flex items-center justify-between bg-emerald-950/50 border border-emerald-500/40 px-3 py-2 rounded-xl text-emerald-400 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Hemat <strong className="font-bold text-white">{formatRupiah(calculation.saving)}</strong>
                </span>
              </span>
              <span
                id="res-saving-percent"
                className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full"
              >
                {calculation.savingPercentage}% OFF
              </span>
            </div>
          </div>
        )}

        {/* Price Averages & Normal Price Comparison */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="bg-[#0D0D10]/60 p-2.5 rounded-xl border border-white/5">
            <span className="text-gray-400 block text-[10px]">Harga Rata-Rata</span>
            <span id="res-avg-price" className="text-white font-bold text-xs sm:text-sm">
              {calculation ? `${formatRupiah(calculation.averagePrice)} / pcs` : 'Rp 0 / pcs'}
            </span>
          </div>
          <div className="bg-[#0D0D10]/60 p-2.5 rounded-xl border border-white/5">
            <span className="text-gray-400 block text-[10px]">Harga Normal Ecer</span>
            <span
              id="res-normal-price"
              className="text-gray-400 line-through text-xs font-semibold block"
            >
              {calculation ? formatRupiah(calculation.normalPrice) : 'Rp 0'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
