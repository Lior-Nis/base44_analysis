import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const CarouselContext = React.createContext(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }
  return context
}

const Carousel = React.forwardRef(({ 
  orientation = "horizontal", 
  opts = {}, 
  className, 
  children, 
  ...props 
}, ref) => {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [totalItems, setTotalItems] = React.useState(0)
  const intervalRef = React.useRef(null)

  // Auto-advance slides every 5 seconds
  React.useEffect(() => {
    if (totalItems > 1 && opts.loop) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % totalItems)
      }, 5000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [totalItems, opts.loop])

  const scrollPrev = React.useCallback(() => {
    setCurrentIndex(prev => {
      if (prev === 0) return opts.loop ? totalItems - 1 : 0
      return prev - 1
    })
  }, [totalItems, opts.loop])

  const scrollNext = React.useCallback(() => {
    setCurrentIndex(prev => {
      if (prev === totalItems - 1) return opts.loop ? 0 : totalItems - 1
      return prev + 1
    })
  }, [totalItems, opts.loop])

  const canScrollPrev = currentIndex > 0 || opts.loop
  const canScrollNext = currentIndex < totalItems - 1 || opts.loop

  const contextValue = {
    currentIndex,
    totalItems,
    setTotalItems,
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext,
    orientation
  }

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn("relative", className)}
        onMouseEnter={() => intervalRef.current && clearInterval(intervalRef.current)}
        onMouseLeave={() => {
          if (totalItems > 1 && opts.loop) {
            intervalRef.current = setInterval(() => {
              setCurrentIndex(prev => (prev + 1) % totalItems)
            }, 5000)
          }
        }}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
})
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { currentIndex, setTotalItems, orientation } = useCarousel()
  const contentRef = React.useRef(null)

  React.useEffect(() => {
    if (contentRef.current) {
      const items = contentRef.current.children.length
      setTotalItems(items)
    }
  }, [setTotalItems, props.children])

  return (
    <div className="overflow-hidden">
      <div
        ref={contentRef}
        className={cn(
          "flex transition-transform duration-300 ease-in-out",
          orientation === "horizontal" ? "" : "flex-col",
          className
        )}
        style={{
          transform: orientation === "horizontal" 
            ? `translateX(-${currentIndex * 100}%)` 
            : `translateY(-${currentIndex * 100}%)`
        }}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef(({ 
  className, 
  variant = "outline", 
  size = "icon", 
  ...props 
}, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef(({ 
  className, 
  variant = "outline", 
  size = "icon", 
  ...props 
}, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      onClick={scrollNext}
      disabled={!canScrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext, 
  useCarousel 
}