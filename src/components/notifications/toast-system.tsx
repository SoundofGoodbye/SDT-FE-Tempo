//toast-system.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (toast: Omit<Toast, 'id'>) => void;
    dismissToast: (id: string) => void;
    dismissAllToasts: () => void;
}

// Toast Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
export const ToastProvider: React.FC<{
    children: React.ReactNode;
    position?: ToastPosition;
    maxToasts?: number;
}> = ({
          children,
          position = 'top-right',
          maxToasts = 5
      }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Date.now().toString();
        const newToast = { ...toast, id };

        setToasts((prev) => {
            const updated = [...prev, newToast];
            // Limit number of toasts
            if (updated.length > maxToasts) {
                return updated.slice(-maxToasts);
            }
            return updated;
        });

        // Auto dismiss
        if (toast.duration !== 0) {
            setTimeout(() => {
                dismissToast(id);
            }, toast.duration || 5000);
        }
    }, [maxToasts]);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const dismissAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast, dismissAllToasts }}>
            {children}
            <ToastContainer position={position} />
        </ToastContext.Provider>
    );
};

// Toast Hook
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast Container Component
const ToastContainer: React.FC<{ position: ToastPosition }> = ({ position }) => {
    const { toasts } = useToast();

    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    };

    return (
        <div className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2 pointer-events-none`}>
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
};

// Individual Toast Component
const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
    const { dismissToast } = useToast();
    const [isExiting, setIsExiting] = useState(false);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => dismissToast(toast.id), 300);
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    };

    const bgColors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200',
    };

    const iconColors = {
        success: 'text-green-600',
        error: 'text-red-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600',
    };

    return (
        <div
            className={`
        pointer-events-auto min-w-[300px] max-w-md rounded-lg border shadow-lg p-4
        ${bgColors[toast.type]}
        transform transition-all duration-300 ease-in-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
        >
            <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${iconColors[toast.type]}`}>
                    {icons[toast.type]}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{toast.title}</h3>
                    {toast.description && (
                        <p className="mt-1 text-sm text-gray-600">{toast.description}</p>
                    )}
                    {toast.action && (
                        <button
                            onClick={toast.action.onClick}
                            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            {toast.action.label}
                        </button>
                    )}
                </div>
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};