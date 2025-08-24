import React from 'react';
import { Star } from 'lucide-react';

const reviews = [
  { quote: "I'm absolutely blown away by the quality! My dog looks like a superhero and I can't stop showing everyone.", author: "Jessica L.", rating: 5 },
  { quote: "The process was so simple and the results exceeded my expectations. Will definitely order again!", author: "Mike R.", rating: 5 },
  { quote: "The quality is amazing and the turnaround time was perfect. Love my transformed pup photos!", author: "Sarah P.", rating: 5 },
  { quote: "So much fun to see my dog in different scenarios! The AI combined with human touch is incredible.", author: "David C.", rating: 5 },
  { quote: "Genuinely impressed with the creativity and attention to detail. Worth every penny!", author: "Emily T.", rating: 5 },
  { quote: "Customer service was fantastic and the final images are gallery-worthy. Highly recommend!", author: "Chris B.", rating: 5 },
  { quote: "My friends are asking where I got these amazing photos done. PupPack is the best!", author: "Anna M.", rating: 5 },
  { quote: "From upload to delivery, everything was seamless. The transformations are pure magic!", author: "Tom W.", rating: 5 },
];

const ReviewsBanner = () => {
  const reviewCards = reviews.map((review, index) => (
    <div key={index} className="flex-shrink-0 w-80 mx-4">
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg h-full">
        <div className="flex items-center mb-4">
          {[...Array(review.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          ))}
        </div>
        <p className="text-white/90 text-sm leading-relaxed mb-4 italic whitespace-normal">
          "{review.quote}"
        </p>
        <p className="text-white font-semibold text-sm">
          - {review.author}
        </p>
      </div>
    </div>
  ));

  // Create enough duplicates to ensure seamless scrolling
  const allCards = [...reviewCards, ...reviewCards, ...reviewCards];

  return (
    <div className="relative z-10 bg-black/20 backdrop-blur-sm border-y border-white/20 w-full overflow-hidden py-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">What Our Customers Say</h3>
        <p className="text-white/80">Join thousands of happy dog owners!</p>
      </div>
      
      <div className="flex animate-infinite-scroll">
        {allCards.map((card, index) => 
          React.cloneElement(card, { key: `card-${index}` })
        )}
      </div>
      
      <style>{`
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-320px * ${reviews.length})); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 40s linear infinite;
          width: calc(320px * ${allCards.length});
        }
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

export default ReviewsBanner;