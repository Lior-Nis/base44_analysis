import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SellerCard from './SellerCard';

export default function FeaturedSellers({ sellers }) {
  if (!sellers || sellers.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-poppins text-2xl font-bold text-[var(--headings-labels)]">
          Featured Sellers & Artisans
        </h2>
        <Button variant="outline" asChild>
          <Link to={createPageUrl('AllSellers')}>
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller) => (
          <SellerCard key={seller.id} seller={seller} />
        ))}
      </div>
    </section>
  );
}