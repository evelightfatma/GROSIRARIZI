import React from 'react';
import { Building2, Copy, Check } from 'lucide-react';
import { AdminSettings } from '../types';

interface PaymentInfoProps {
  adminSettings: AdminSettings;
  onCopyBank: () => void;
  isBankCopied: boolean;
}

export const PaymentInfo: React.FC<PaymentInfoProps> = ({
  adminSettings,
  onCopyBank,
  isBankCopied,
}) => {
  return (
    <section
      id="payment-info-section"
      className="bg-[#16161C] rounded-2xl p-5 border border-[#D4AF37]/30 shadow-xl space-y-3 relative overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span>Rekening Pembayaran Resmi</span>
        </h3>
        <span className="text-[10px] text-gray-400">Batik ARIZI</span>
      </div>

      <div className="bg-[#0D0D10]/80 p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
        <div>
          <span
            id="disp-bank-name"
            className="text-[10px] text-gray-400 uppercase tracking-wide block font-semibold"
          >
            {adminSettings.bankName}
          </span>
          <span
            id="disp-bank-acc"
            className="text-base font-extrabold text-white tracking-wider font-mono"
          >
            {adminSettings.bankAcc}
          </span>
          <span
            id="disp-bank-holder"
            className="text-xs text-[#D4AF37] block font-medium mt-0.5"
          >
            {adminSettings.bankHolder}
          </span>
        </div>
        <button
          id="copy-bank-btn"
          onClick={onCopyBank}
          className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-2 rounded-xl text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {isBankCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};
