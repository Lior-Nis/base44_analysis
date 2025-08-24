import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Star, User as UserIcon } from "lucide-react";
import { ExpertReview } from "@/api/entities";

const StarRating = ({ rating }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))}
  </div>
);

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch the 3 most recent, high-rated reviews
        const fetchedReviews = await ExpertReview.filter({ rating: { '$gte': 4 } }, '-created_date', 3);
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        // In case of error, we can fall back to static data or show nothing
        setReviews([]);
      }
      setIsLoading(false);
    };
    fetchReviews();
  }, []);
  
  const getDisplayName = (email) => {
    if (!email) return "A HomeScope User";
    const namePart = email.split('@')[0].replace(/[\._]/g, ' ');
    const capitalized = namePart.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    // Return first name and last initial
    const parts = capitalized.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    }
    return parts[0];
  }

  const testimonials = reviews.map(review => ({
    quote: review.comment,
    name: getDisplayName(review.customer_email),
    role: "Verified Customer",
    rating: review.rating,
  }));

  if (isLoading) {
    // Optional: return a loading skeleton
    return null;
  }

  if (testimonials.length === 0) {
    // Don't render the section if there are no reviews to show
    return null;
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real stories from homeowners and tenants who trust HomeScope for expert advice
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col"
            >
              <StarRating rating={testimonial.rating} />
              <p className="text-gray-700 my-6 flex-grow">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <UserIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}