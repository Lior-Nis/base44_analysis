import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ text = "טוען...", size = "default" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-8 h-8",
    large: "w-12 h-12"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="mb-4"
      >
        <Loader2 className={`${sizeClasses[size]} text-blue-500`} />
      </motion.div>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
};

// Enhanced Lazy Wrapper with better error handling
const LazyWrapper = ({ 
  children, 
  fallback = <LoadingSpinner />, 
  errorFallback 
}) => {
  const [hasError, setHasError] = React.useState(false);

  const defaultErrorFallback = (
    <div className="p-4 text-center">
      <p className="text-red-600">שגיאה בטעינת הרכיב</p>
      <button 
        onClick={() => setHasError(false)}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        נסה שוב
      </button>
    </div>
  );

  if (hasError) {
    return errorFallback || defaultErrorFallback;
  }

  return (
    <Suspense fallback={fallback}>
      <ErrorBoundaryWrapper onError={() => setHasError(true)}>
        {children}
      </ErrorBoundaryWrapper>
    </Suspense>
  );
};

// Simple error boundary for lazy components
class ErrorBoundaryWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LazyWrapper Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle the error display
    }
    return this.props.children;
  }
}

export default LoadingSpinner;
export { LazyWrapper };