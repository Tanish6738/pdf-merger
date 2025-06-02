import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 200); // Allow time for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/90 text-white border-green-400';
      case 'error':
        return 'bg-red-500/90 text-white border-red-400';
      case 'info':
        return 'bg-[#00A99D]/90 text-white border-[#00A99D]';
      default:
        return 'bg-gray-500/90 text-white border-gray-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg border backdrop-blur-sm ${getToastStyles()} shadow-lg`}
          style={{ maxWidth: 'calc(100vw - 2rem)' }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getIcon()}</span>
            <span className="text-sm font-medium break-words">{message}</span>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 200);
              }}
              className="ml-2 text-white/80 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast manager hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration + 200);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col items-center space-y-2 p-4">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return { showToast, ToastContainer };
};

export default Toast;
