import React from "react";

export function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-t-transparent ${sizeClass} ${className}`} role="status" aria-label="loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
}