import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ShieldCheck, School, Users2, Lightbulb, Target, Plus, Minus } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const goalsData = [
  { 
    icon: <TrendingUp className="h-7 w-7" />, 
    title: "Boost Renewables", 
    shortText: "Increase renewable energy usage to 50% nationally by 2030.",
    longText: "Through strategic initiatives, policy advocacy, and community partnerships, we aim to make renewable energy sources account for half of the nation's energy consumption within the next decade, fostering energy independence and a cleaner grid.",
    image: "https://images.unsplash.com/photo-1553261200-825800584ef8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    color: "bg-green-600",
    textColor: "text-green-100",
    hoverColor: "hover:bg-green-700"
  },
  { 
    icon: <ShieldCheck className="h-7 w-7" />, 
    title: "Cut Emissions", 
    shortText: "Reduce greenhouse gas emissions by 30% in the next decade.",
    longText: "By promoting energy efficiency, supporting carbon capture technologies, and transitioning away from fossil fuels, we are committed to a significant reduction in harmful emissions, contributing to global climate goals.",
    image: "https://images.unsplash.com/photo-1611273684886-550171508c14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    color: "bg-blue-600",
    textColor: "text-blue-100",
    hoverColor: "hover:bg-blue-700"
  },
  { 
    icon: <School className="h-7 w-7" />, 
    title: "Educate Youth", 
    shortText: "Empower 100,000 students with green energy knowledge.",
    longText: "Our comprehensive educational programs, workshops, and online resources will inspire and equip the next generation with the understanding of sustainable practices and the importance of renewable energy for their future.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    color: "bg-purple-600",
    textColor: "text-purple-100",
    hoverColor: "hover:bg-purple-700"
  },
  { 
    icon: <Users2 className="h-7 w-7" />, 
    title: "Community Projects", 
    shortText: "Establish 500 impactful green projects in underserved areas.",
    longText: "We focus on bringing the benefits of green energy to all, particularly to communities that have been historically underserved, ensuring equitable access to clean power and environmental justice.",
    image: "https://images.unsplash.com/photo-1532601224476-15c79f2dd787?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    color: "bg-amber-600",
    textColor: "text-amber-100",
    hoverColor: "hover:bg-amber-700"
  },
  { 
    icon: <Lightbulb className="h-7 w-7" />, 
    title: "Innovate Tech", 
    shortText: "Drive development of cutting-edge clean energy technologies.",
    longText: "We invest in research and development, fostering innovation in solar, wind, energy storage, and other clean technologies to accelerate the transition to a sustainable energy system and create new green jobs.",
    image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b412?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    color: "bg-cyan-600",
    textColor: "text-cyan-100",
    hoverColor: "hover:bg-cyan-700"
  },
  { 
    icon: <Target className="h-7 w-7" />, 
    title: "Policy Advocacy", 
    shortText: "Champion and advocate for robust policies supporting renewables.",
    longText: "Working with policymakers at local, state, and federal levels, we strive to create a supportive regulatory environment that encourages investment in renewable energy and accelerates the shift from fossil fuels.",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    color: "bg-pink-600",
    textColor: "text-pink-100",
    hoverColor: "hover:bg-pink-700"
  },
];

export default function GoalsSection() {
  const [expandedGoal, setExpandedGoal] = useState(null);

  return (
    <section id="goals" className="py-24 md:py-32 bg-gray-900 text-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-5">Our Strategic Goals</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Driving change through focused objectives. We are committed to tangible outcomes that pave the way for a sustainable tomorrow.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {goalsData.map((goal, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className={`relative rounded-xl shadow-2xl transition-all duration-500 ease-in-out cursor-pointer overflow-hidden
                ${expandedGoal === index ? 'h-[520px] md:h-[560px]' : 'h-[280px] md:h-[300px]'}
                ${goal.color} ${goal.hoverColor}`}
              onMouseEnter={() => setExpandedGoal(index)}
              onMouseLeave={() => setExpandedGoal(null)}
            >
              <AnimatePresence>
                {expandedGoal === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1)), url('${goal.image}')` }}
                  >
                     <div className={`absolute inset-0 ${goal.color.replace('bg-', 'bg-')}/50 backdrop-blur-xs`}></div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className={`relative z-10 p-6 flex flex-col h-full transition-all duration-500 ease-in-out ${expandedGoal === index ? 'justify-end' : 'justify-between'}`}>
                <div>
                  <div className={`p-3 inline-block rounded-full mb-4 ${expandedGoal === index ? 'bg-white/20' : 'bg-black/20'}`}>
                    {React.cloneElement(goal.icon, { className: `h-7 w-7 ${goal.textColor}`})}
                  </div>
                  <h3 className={`text-2xl font-semibold mb-2 ${expandedGoal === index ? 'text-white' : goal.textColor}`}>{goal.title}</h3>
                  <p className={`text-sm ${expandedGoal === index ? 'text-gray-200' : goal.textColor.replace('100', '200')}`}>
                    {goal.shortText}
                  </p>
                </div>
                <AnimatePresence>
                {expandedGoal === index && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="text-sm text-gray-200 mt-3 leading-relaxed">{goal.longText}</p>
                    </motion.div>
                )}
                </AnimatePresence>
                <div className={`absolute top-4 right-4 p-2 rounded-full transition-opacity duration-300 ${expandedGoal === index ? 'bg-white/20' : 'bg-black/20'}`}>
                  {expandedGoal === index ? <Minus className={`h-5 w-5 ${goal.textColor}`} /> : <Plus className={`h-5 w-5 ${goal.textColor}`} />}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}