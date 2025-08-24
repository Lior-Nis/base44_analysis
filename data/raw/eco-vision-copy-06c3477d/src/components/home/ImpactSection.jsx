
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Zap, Leaf, Users, MessageSquare, Sun, Battery, Globe, DollarSign, Heart, Smile } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const extendedStats = [
  { 
    number: "250+", 
    label: "Projects Completed", 
    icon: <Zap className="h-8 w-8 md:h-10 md:w-10 text-white" />,
    bgImage: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
  },
  { 
    number: "5,000", 
    label: "Tons of Carbon Offset", 
    icon: <Leaf className="h-8 w-8 md:h-10 md:w-10 text-white" />,
    bgImage: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
  },
  { 
    number: "3,000+", 
    label: "Active Volunteers", 
    icon: <Users className="h-8 w-8 md:h-10 md:w-10 text-white" />,
    bgImage: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
  },
  { 
    number: "120+", 
    label: "Communities Impacted", 
    icon: <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-white" />,
    bgImage: "https://images.unsplash.com/photo-1531824475211-72594993ce2a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
  },
  { 
    number: "750+", 
    label: "Solar Installations", 
    icon: <Sun className="h-8 w-8 md:h-10 md:w-10 text-white" />,
    bgImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
  },
  { 
    number: "45MW", 
    label: "Clean Energy Generated", 
    icon: <Battery className="h-8 w-8 md:h-10 md:w-10 text-white" />,
    bgImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
  },
  { 
    number: "12K+", 
    label: "Trees Planted", 
    icon: <Leaf className="h-8 w-8 md:h-10 md:w-10 text-white" />,
    bgImage: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
  },
  { 
    number: "80+", 
    label: "Partner Organizations", 
    icon: <Globe className="h-8 w-8 md:h-10 md:w-10 text-white" />,
    bgImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
  },
  { 
    number: "$25M", 
    label: "Investment in Green Tech", 
    icon: <DollarSign className="h-8 w-8 md:h-10 md:w-10 text-white" />,
    bgImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
  },
  { 
    number: "1M+", 
    label: "Lives Impacted Positively", 
    icon: <Heart className="h-8 w-8 md:h-10 md:w-10 text-white" />,
    bgImage: "https://images.unsplash.com/photo-1520034475321-cbe63696469a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
  },
  { 
    number: "95%", 
    label: "Community Satisfaction", 
    icon: <Smile className="h-8 w-8 md:h-10 md:w-10 text-white" />,
    bgImage: "https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
  }
];
const allStats = [...extendedStats, ...extendedStats];

export default function ImpactSection() {
  const statsRef = useRef(null);

  useEffect(() => {
    const scrollContainer = statsRef.current;
    if (!scrollContainer) return;

    const animationDuration = 60; // seconds

    const keyframes = `
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = keyframes;
    document.head.appendChild(styleSheet);

    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  return (
    <section id="impact" className="py-20 md:py-28 bg-gradient-to-b from-white via-green-50 to-green-100 text-gray-800 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-5 text-green-700">Our Impact in Numbers</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Quantifiable achievements that showcase our commitment to a greener America.
          </p>
        </motion.div>
      </div>

      <div className="relative" style={{ height: "300px" }}>
        <motion.div
          ref={statsRef}
          className="absolute top-0 left-0 flex"
          style={{ animation: `scroll ${allStats.length * 5}s linear infinite`, width: `${allStats.length * 288}px` }} // 288px is approx width of a card
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {allStats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="w-64 md:w-72 h-[280px] md:h-[300px] mr-6 md:mr-8 flex-shrink-0 relative overflow-hidden shadow-2xl group rounded-lg"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110"
                style={{ backgroundImage: `url(${stat.bgImage})` }}
              ></div>
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-colors duration-300"></div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-5 md:p-6">
                <div className="mb-3 md:mb-4 transition-transform duration-300 group-hover:scale-110">
                  {stat.icon}
                </div>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2">{stat.number}</p>
                <p className="text-sm md:text-base text-green-200 group-hover:text-white transition-colors duration-300">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
