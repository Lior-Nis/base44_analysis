import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FloatingAssistantButton() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    // Show the button after a delay to not be too intrusive
    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-24 right-20 z-[45]"
    >
      <Button asChild size="icon" className="rounded-full w-12 h-12 bg-purple-600 hover:bg-purple-700 shadow-lg">
        <Link to={createPageUrl('Assistant')}>
          <MessageCircle className="w-6 h-6 text-white" />
        </Link>
      </Button>
    </motion.div>
  );
}