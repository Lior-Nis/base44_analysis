import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useCart } from '../contexts/CartContext';

export default function FloatingCart() {
  const { cartItems, totalItems } = useCart();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    // Show the button after a short delay
    const timer = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Button asChild size="icon" className="relative rounded-full w-14 h-14 bg-orange-500 hover:bg-orange-600 shadow-lg">
        <Link to={createPageUrl('Cart')}>
          <ShoppingCart className="w-7 h-7 text-white" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
              {totalItems}
            </Badge>
          )}
        </Link>
      </Button>
    </motion.div>
  );
}