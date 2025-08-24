// Minimal implementation for toast functionality
import { createContext, useState, useContext } from 'react';

const ToastContext = createContext({
  toast: () => {},
  toasts: []
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = (data) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, ...data }]);

    // Auto dismiss after 3s
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// We'll keep it simple for demo
export const toast = (props) => {
  console.log('Toast:', props.title, props.description);
  // In a real implementation, this would use some global state
  return { id: Date.now().toString() };
};