"use client";

import { AlertTriangle, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-3 rounded-xl font-bold text-white bg-[#F33939] hover:bg-red-600 transition-all text-sm"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
