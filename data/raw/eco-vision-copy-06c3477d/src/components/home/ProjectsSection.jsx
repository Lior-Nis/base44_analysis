import React from "react";
import { motion } from "framer-motion";
import { Sun, Wind, Leaf, ChevronRight } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2
    }
  }
};

const projectsData = [
  {
    title: "Community Solar Programs",
    description: "Empowering residents with clean energy and lower utility bills.",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    icon: <Sun className="h-8 w-8 text-yellow-400" />
  },
  {
    title: "Wind Farm Development",
    description: "Harnessing the power of wind for a sustainable future.",
    image: "https://images.unsplash.com/photo-1548337138-e87d889cc369?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    icon: <Wind className="h-8 w-8 text-sky-400" />
  },
  {
    title: "Sustainability Education",
    description: "Teaching environmental stewardship and green energy solutions.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    icon: <Leaf className="h-8 w-8 text-green-400" />
  }
];

export default function ProjectsSection() {
  return (
    <section 
      id="projects" 
      className="py-24 md:py-32 overflow-hidden relative bg-cover bg-center"
      style={{ backgroundImage: "url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/17a8d2_pexels-photo-388415.jpeg')" }}
    >
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-0"></div>
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-5 text-gray-900">Our Projects</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            We work on diverse initiatives to accelerate America's transition to renewable energy. Each project is a step towards a cleaner, more sustainable future.
          </p>
        </motion.div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
        >
          {projectsData.map((project, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -10, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)" }}
              className="group relative h-[480px] overflow-hidden shadow-xl rounded-xl transition-all duration-300"
            >
              <img 
                src={project.image} 
                alt={project.title} 
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              />
              <div className="absolute top-5 left-5 backdrop-blur-md bg-black/30 p-3 shadow-lg z-20 rounded-full">
                {project.icon}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 bg-gradient-to-t from-black/80 via-black/60 to-transparent text-white z-10">
                <h3 className="text-2xl font-semibold mb-2">{project.title}</h3>
                <p className="text-sm text-gray-200 mb-3 line-clamp-2">{project.description}</p>
                <a href="#" className="inline-flex items-center gap-1 text-green-300 font-medium group-hover:text-green-200 transition-colors text-sm">
                  Learn more
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}