import React from 'react';
import { Crown, ShoppingCart, Settings } from 'lucide-react';

interface HeaderProps {
  totalCartQty: number;
  onCartClick: () => void;
  onAdminClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCartQty,
  onCartClick,
  onAdminClick,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-30 bg-[#0D0D10]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#AA820A] via-[#D4AF37] to-[#F3E5AB] p-[1px] flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-[#0D0D10] rounded-[11px] flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wider gold-gradient-text uppercase leading-none">
              Batik ARIZI
            </h1>
            <span className="text-[10px] text-gray-400 font-medium tracking-wide">
              Katalog & Kalkulator Grosir
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="header-cart-btn"
            onClick={onCartClick}
            aria-label="Keranjang Belanja"
            className="relative p-2 rounded-lg bg-[#16161C] hover:bg-[#20202A] border border-white/10 text-gray-300 transition-all active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-[#D4AF37]" />
            {totalCartQty > 0 && (
              <span
                id="cart-badge"
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0D0D10] animate-pulse"
              >
                {totalCartQty}
              </span>
            )}
          </button>
          <button
            id="header-admin-btn"
            onClick={onAdminClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#16161C] hover:bg-[#20202A] border border-white/10 text-xs font-medium text-gray-300 transition-all active:scale-95 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
