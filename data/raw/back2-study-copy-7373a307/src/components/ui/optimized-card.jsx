import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

// Optimized Card Component with memoization
const OptimizedCard = memo(({ 
  children, 
  className = "", 
  animate = true, 
  delay = 0,
  ...props 
}) => {
  const cardContent = (
    <Card className={className} {...props}>
      {children}
    </Card>
  );

  if (!animate) {
    return cardContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      {cardContent}
    </motion.div>
  );
});

OptimizedCard.displayName = "OptimizedCard";

export default OptimizedCard;