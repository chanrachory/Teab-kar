import React from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export default function Toast({ toasts }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[92vw] max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const bgClass =
          toast.type === "error"
            ? "bg-red-600"
            : toast.type === "success"
            ? "bg-emerald-600"
            : "bg-amber-600";

        return (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-white ${bgClass} transform transition-all duration-300 pointer-events-auto flex items-center gap-2`}
          >
            {toast.type === "error" && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            {toast.type === "success" && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            {toast.type === "info" && <Info className="w-5 h-5 flex-shrink-0" />}
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
