import React from 'react';
import { FileText, Send } from 'lucide-react';

interface OrderActionProps {
  onProcessOrder: () => void;
  adminWa: string;
  isProcessing: boolean;
}

export const OrderAction: React.FC<OrderActionProps> = ({
  onProcessOrder,
  adminWa,
  isProcessing,
}) => {
  return (
    <section id="order-action-section" className="space-y-3">
      <button
        id="process-order-btn"
        onClick={onProcessOrder}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-[#AA820A] via-[#D4AF37] to-[#F3E5AB] hover:brightness-110 text-black font-black py-4 rounded-2xl text-sm tracking-wide uppercase shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span>Memproses Invoice & WA...</span>
          </>
        ) : (
          <>
            <FileText className="w-5 h-5 text-black" />
            <span>ORDER & BUAT INVOICE (TEXT)</span>
            <Send className="w-4 h-4 text-black" />
          </>
        )}
      </button>
      <p className="text-[11px] text-center text-gray-400">
        Otomatis mendownload Invoice (.txt), menyimpannya ke Google Drive & meneruskan ke Admin WA (
        <span id="disp-admin-wa-label" className="text-[#D4AF37] font-semibold">
          +{adminWa}
        </span>
        )
      </p>
    </section>
  );
};
