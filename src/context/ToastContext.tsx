import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

// Union type representing the possible kinds of toast notifications
export type ToastKind = "success" | "error" | "info";

// Interface representing an individual toast notification object
interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

// Interface representing the value provided by ToastContext
interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void;
}

// Context object for toast notification management
const ToastContext = createContext<ToastContextValue | null>(null);

// Provider component that manages toast notifications and renders the toast stack container
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Displays a new toast notification with an automatic dismissal timeout
  const showToast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={`toast ${t.kind}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Custom hook to easily consume the ToastContext
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}