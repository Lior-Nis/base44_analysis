
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const colorSchemes = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/20",
    button: "bg-blue-600 hover:bg-blue-700",
  },
  green: {
    gradient: "from-green-500 to-green-600",
    shadow: "shadow-green-500/20",
    button: "bg-green-600 hover:bg-green-700",
  },
  purple: {
    gradient: "from-purple-500 to-purple-600",
    shadow: "shadow-purple-500/20",
    button: "bg-purple-600 hover:bg-purple-700",
  },
  orange: {
    gradient: "from-orange-500 to-orange-600",
    shadow: "shadow-orange-500/20",
    button: "bg-orange-600 hover:bg-orange-700",
  }
};

const MembershipCard = ({ membership, index, isMiddle = false }) => {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const scheme = colorSchemes[membership.color_scheme] || colorSchemes.blue;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        y: -12,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className={`flex flex-col bg-slate-800/70 backdrop-blur-xl border rounded-3xl p-8 relative transition-all duration-300 group overflow-hidden ${
        membership.popular
          ? 'border-blue-500/50 shadow-xl'
          : 'border-slate-700/50'
      }`}
      style={{
        boxShadow: isHovering
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.03) 0%, transparent 50%)`
        }}
      />

      {/* Clean border highlight */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'subtract',
          padding: '1px',
        }}
      />

      {membership.popular && (
        <Badge className="absolute top-6 right-6 bg-blue-500/90 backdrop-blur-sm text-white border-0 font-medium px-3 py-1.5 rounded-full shadow-lg">
          <Star className="w-3.5 h-3.5 mr-1" />
          Most Popular
        </Badge>
      )}

      <div className="flex-grow relative z-10">
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors duration-300">
          {membership.name}
        </h3>

        <div className="mb-6">
          <span className="text-5xl font-bold text-white group-hover:scale-105 inline-block transition-transform duration-300">
            ${membership.price}
          </span>
          <span className="text-lg font-medium text-gray-400 ml-2">/mo</span>
        </div>

        <p className="text-gray-400 mb-8 text-sm leading-relaxed min-h-[40px] group-hover:text-gray-300 transition-colors duration-300">
          {membership.description || "Premium membership with exclusive benefits"}
        </p>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-8"></div>

        <ul className="space-y-3 mb-8">
          {(membership.features || []).map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-start space-x-3 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${featureIndex * 50}ms` }}>
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300 text-sm group-hover:text-white transition-colors duration-300">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default function MembershipPreview({ memberships, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 space-y-6">
            <Skeleton className="h-8 w-3/4 bg-slate-700" />
            <Skeleton className="h-12 w-1/2 bg-slate-700" />
            <Skeleton className="h-4 w-full bg-slate-700" />
            <div className="pt-6 border-t border-slate-700">
                <Skeleton className="h-5 w-full mb-3 bg-slate-700" />
                <Skeleton className="h-5 w-full mb-3 bg-slate-700" />
                <Skeleton className="h-5 w-5/6 bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!memberships || memberships.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No membership plans available.</p>
        <Link to={createPageUrl("Memberships")}>
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700">View All Plans</Button>
        </Link>
      </div>
    );
  }

  // Create a custom arrangement with Pro Athlete in the middle
  const proAthlete = {
    name: "Pro Athlete",
    price: 59,
    description: "Comprehensive training for serious fitness enthusiasts",
    features: [
      "24/7 gym access",
      "Personal trainer sessions (4/month)",
      "Group fitness classes",
      "Premium equipment access",
      "Nutrition consultation"
    ],
    popular: true,
    color_scheme: "blue"
  };

  const displayMemberships = memberships.length >= 2
    ? [memberships[0], proAthlete, memberships[1]]
    : [proAthlete, ...memberships];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
      {displayMemberships.map((membership, index) => (
        <MembershipCard
          key={membership.id || `pro-athlete-${index}`}
          membership={membership}
          index={index}
          isMiddle={index === 1}
        />
      ))}
    </div>
  );
}
