import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      id="toast-container"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isInfo = toast.type === 'info';

          const bgColor = isError
            ? 'bg-red-950/95 border-red-500/50 text-red-200 shadow-red-950/50'
            : isInfo
            ? 'bg-[#16161C]/95 border-sky-500/40 text-sky-200'
            : 'bg-[#16161C]/95 border-[#D4AF37]/40 text-[#F3E5AB] shadow-[#D4AF37]/10';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`p-3 rounded-xl border shadow-2xl text-xs font-semibold pointer-events-auto flex items-center gap-2.5 backdrop-blur-md ${bgColor}`}
            >
              {isError ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : isInfo ? (
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              )}
              <span className="flex-1 leading-snug">{toast.message}</span>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-gray-400 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                aria-label="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
