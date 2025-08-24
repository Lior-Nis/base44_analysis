
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Product } from "@/api/entities";
import { Membership } from "@/api/entities";
import { ArrowRight, Star, Users, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import FeaturedProducts from "../components/home/FeaturedProducts";
import MembershipPreview from "../components/home/MembershipPreview";
import HeroSection from "../components/home/HeroSection";
import StatsSection from "../components/home/StatsSection";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularMemberships, setPopularMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [products, memberships] = await Promise.all([
      Product.filter({ featured: true }, "-created_date", 4),
      Membership.list("-created_date", 3)]
      );

      setFeaturedProducts(products);
      setPopularMemberships(memberships);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <HeroSection />
      
      {/* Stats Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              Why Choose FitnessPro?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands of satisfied members in our premium fitness community
            </p>
          </div>
          <StatsSection />
        </div>
      </section>

      {/* Featured Memberships */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Unlock your potential with our premium membership options
            </p>
            <div className="text-center">
              <span className="inline-block bg-gradient-to-r from-blue-600 to-green-500 px-6 py-2 rounded-full text-white font-medium text-sm">
                🚀 Limited Time: Save 20% on Annual Plans
              </span>
            </div>
          </div>

          <MembershipPreview memberships={popularMemberships} loading={loading} />

          <div className="text-center mt-12">
            <Link to={createPageUrl("Memberships")}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6">
                View All Plans
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="relative py-20 bg-gradient-to-b from-slate-900 to-black overflow-hidden">
        <div className="absolute -top-40 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-slate-800 px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                ⚡ PREMIUM COLLECTION
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Professional Fitness Gear
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Discover our handpicked selection of premium equipment and supplements, 
              trusted by professional athletes and fitness enthusiasts worldwide.
            </p>
          </div>

          <FeaturedProducts products={featuredProducts} loading={loading} />

          <div className="text-center mt-16">
            <Link to={createPageUrl("Shop")}>
              <Button size="lg" className="bg-gradient-to-r from-slate-200 to-slate-100 hover:from-slate-100 hover:to-slate-50 text-gray-900 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Explore Full Collection
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-green-600 opacity-80"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-full h-full rounded-full bg-blue-500/20 blur-3xl opacity-50"></div>
        <div className="absolute -top-1/2 -right-1/4 w-full h-full rounded-full bg-green-500/20 blur-3xl opacity-50"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Fitness Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of members who have achieved their fitness goals with FitnessPro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Memberships")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                Start Your Membership
              </Button>
            </Link>
            <Link to={createPageUrl("Shop")}>
              <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/40 font-semibold transition-all">
                Shop Equipment
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>);

}
