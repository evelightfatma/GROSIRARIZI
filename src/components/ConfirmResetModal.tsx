import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmResetModal: React.FC<ConfirmResetModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal-confirm-reset"
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
    >
      <div className="bg-[#16161C] border border-white/15 rounded-2xl p-5 w-full max-w-xs shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Konfirmasi Reset</h4>
          <p className="text-xs text-gray-400 mt-1">
            Yakin ingin mengembalikan seluruh konfigurasi harga ke harga default Batik ARIZI?
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="py-2.5 text-xs font-semibold rounded-xl bg-[#20202A] text-gray-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md transition-colors cursor-pointer"
          >
            Ya, Reset
          </button>
        </div>
      </div>
    </div>
  );
};
