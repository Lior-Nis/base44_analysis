import React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className, src, alt, onLoad, onError, ...props }, ref) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const handleLoad = (e) => {
    setImageLoaded(true);
    setImageError(false);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setImageError(true);
    setImageLoaded(false);
    onError?.(e);
  };

  if (!src || imageError) {
    return null;
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      className={cn(
        "aspect-square h-full w-full object-cover",
        !imageLoaded && "opacity-0",
        className
      )}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium select-none",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };