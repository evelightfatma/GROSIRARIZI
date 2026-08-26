import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, KeyRound } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onErrorToast: (msg: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onErrorToast,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '138080') {
      sessionStorage.setItem('batikAriziAdminLoggedIn', 'true');
      onSuccess();
    } else {
      setErrorMsg('PIN salah. Silakan masukkan PIN Admin yang valid.');
      onErrorToast('PIN Admin salah');
    }
  };

  return (
    <div
      id="modal-login"
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-[#16161C] border border-white/15 rounded-2xl p-6 w-full max-w-xs shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg p-1 rounded cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl flex items-center justify-center mx-auto text-[#D4AF37] mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white tracking-wide">
            ADMIN BATIK ARIZI
          </h3>
          <p className="text-xs text-gray-400">
            Masukkan PIN Admin untuk mengelola katalog, harga grosir & Google Apps Script.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="relative">
              <input
                ref={inputRef}
                type="password"
                id="admin-pin-input"
                placeholder="••••••"
                maxLength={6}
                inputMode="numeric"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full bg-[#0D0D10] border border-white/20 rounded-xl p-3 text-center text-white text-xl tracking-widest font-mono outline-none focus:border-[#D4AF37] transition-colors"
              />
              <KeyRound className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {errorMsg && (
              <p
                id="login-error-msg"
                className="text-red-400 text-[11px] text-center mt-2 font-medium"
              >
                {errorMsg}
              </p>
            )}
          </div>

          <button
            type="submit"
            id="submit-admin-pin-btn"
            className="w-full bg-gradient-to-r from-[#AA820A] via-[#D4AF37] to-[#F3E5AB] hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all active:scale-95 shadow-md cursor-pointer text-xs uppercase tracking-wider"
          >
            MASUK ADMIN
          </button>
        </form>
      </div>
    </div>
  );
};
