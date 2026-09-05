"use client";

/**
 * Toast notification system for user feedback.
 *
 * Provides animated toast messages for actions like:
 * - "Link copied!"
 * - "Wish created successfully!"
 * - "Image uploaded!"
 * - Error messages
 *
 * Uses CSS animations defined in globals.css for enter/exit transitions.
 */

import { createContext, useCallback, useContext, useState } from "react";
import { LuCheck, LuX, LuInfo } from "react-icons/lu";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: <LuCheck className="h-4 w-4" />,
    error: <LuX className="h-4 w-4" />,
    info: <LuInfo className="h-4 w-4" />,
  };

  const colors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    error: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed left-1/2 top-4 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-enter flex items-center gap-2 rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${colors[toast.type]}`}
            role="alert"
          >
            {icons[toast.type]}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="ml-2 rounded-full p-0.5 opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              <LuX className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}