import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, ChevronDown, ArrowDownRight } from "lucide-react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const collectionsRef = useRef(null);
  const isCollectionsInView = useInView(collectionsRef, { once: false, margin: "-100px 0px" });

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };
  
  const letterAnimation = {
    hidden: { y: 100, opacity: 0 },
    visible: i => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.04,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };
  
  const textReveal = {
    hidden: { width: "0%" },
    visible: {
      width: "100%",
      transition: {
        delay: 0.5,
        duration: 1.2, 
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  const fadeSlideUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <div className="bg-[#f8f7f4]">
      {/* Hero Section */}
      <header className="h-screen flex flex-col justify-between relative overflow-hidden" ref={heroRef}>
        <nav className={`w-full px-6 md:px-12 py-6 flex justify-between items-center fixed top-0 z-50 transition-all duration-300 ${
          scrollY > 50 ? "bg-[#f8f7f4]/90 backdrop-blur-md shadow-sm" : "bg-transparent backdrop-blur-sm"
        }`}>
          <h1 className="font-['Space_Grotesk'] text-2xl tracking-tight">moda.studio</h1>
          <div className="hidden md:flex gap-8 font-light text-sm uppercase tracking-wider">
            <a href="#collections" className="hover:opacity-70 transition-opacity">Collections</a>
            <a href="#essentials" className="hover:opacity-70 transition-opacity">Essentials</a>
            <a href="#sustainability" className="hover:opacity-70 transition-opacity">Sustainability</a>
            <a href="#about" className="hover:opacity-70 transition-opacity">About</a>
          </div>
          <button className="md:hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 6H21" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 18H21" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </nav>
        
        <div 
          className="flex flex-col justify-center items-center h-full px-6 text-center relative bg-cover bg-center"
          style={{ 
            backgroundImage: "url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b05d02_2292140e-202a-45f6-b4ba-0933d55ca3fe.png)",
            backgroundSize: "110%", 
            backgroundPosition: "center 40%" 
          }}
        >
          <div className="absolute inset-0 bg-[#c4b3a3]/20 backdrop-blur-[2px]"></div>
          
          <div className="relative z-10 backdrop-blur-sm bg-white/10 px-8 py-10 rounded-lg max-w-4xl">
            <div className="overflow-hidden mb-4">
              <motion.p 
                className="uppercase tracking-[0.25em] text-sm font-light text-[#2c2c2c]"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Designed with intention
              </motion.p>
            </div>
            
            <div className="mx-8 px-12 overflow-hidden">
              <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="font-['Space_Grotesk'] text-5xl md:text-8xl mb-6 leading-snug max-w-3xl text-[#2c2c2c]">
                  {"Contemporary fashion with purpose".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={letterAnimation}
                      style={{ display: 'inline-block', width: char === " " ? "0.25em" : "auto" }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </h2>
              </motion.div>
            </div>
            
            <motion.div 
              className="h-[1px] w-full bg-[#2c2c2c]/40 my-6"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            ></motion.div>
            
            <motion.p 
              className="font-light text-lg md:text-xl max-w-2xl mx-auto text-[#2c2c2c]/80 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              Curated seasonal collections and sustainable essentials that define modern minimalism
            </motion.p>
          </div>
        </div>

        <motion.div 
          className="absolute bottom-0 left-0 right-0 flex justify-center mb-12 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          style={{ opacity }}
        >
          <a 
            href="#collections" 
            className="rounded-full border border-[#2c2c2c] text-[#2c2c2c] w-10 h-10 flex items-center justify-center animate-bounce duration-slow hover:bg-[#2c2c2c]/10 transition-colors"
          >
            <ChevronDown size={20} />
          </a>
        </motion.div>
      </header>

      <section id="collections" className="py-24 md:py-32 px-6 md:px-12 relative overflow-hidden" ref={collectionsRef}>
        <div className="absolute top-0 left-0 w-full h-40 md:h-64 overflow-hidden z-0">
          <motion.svg
            className="absolute left-0 top-0 w-[300%] h-full" 
            viewBox="0 0 3000 100" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ x: 0 }}
            animate={{ x: "-66.666%" }} 
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          >
            <path
              d="M0,40 C500,80 500,0 1000,40 C1500,80 1500,0 2000,40 C2500,80 2500,0 3000,40 L3000,0 L0,0 Z"
              fill="rgba(210, 195, 180, 0.15)" 
            />
            <path
              d="M0,30 C400,60 600,0 1000,30 C1400,60 1600,0 2000,30 C2400,60 2600,0 3000,30 L3000,0 L0,0 Z"
              fill="rgba(210, 195, 180, 0.08)"
            />
          </motion.svg>
        </div>

        <div className="max-w-screen-xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 mb-16 gap-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isCollectionsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <p className="text-sm uppercase tracking-wider text-[#777] mb-4">Seasonal Collections</p>
              <h2 className="font-['Space_Grotesk'] text-4xl md:text-6xl mb-6 leading-tight">
                <span className="block">Autumn / Winter</span>
                <span className="block relative">
                  <span className="relative z-10">2025</span>
                  <motion.span 
                    className="absolute -bottom-2 left-0 h-4 bg-[#d2c3b4]/30 w-full -z-0"
                    initial={{ width: 0 }}
                    animate={isCollectionsInView ? { width: "100%" } : { width: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  ></motion.span>
                </span>
              </h2>
              <p className="font-light text-lg leading-relaxed">
                A thoughtful exploration of texture and form, our latest collection balances bold silhouettes with a restrained palette of olive, sand, and charcoal.
              </p>
            </motion.div>
            
            <motion.div
              className="flex items-center justify-center md:justify-end"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isCollectionsInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div 
                className="rounded-full border border-black py-5 px-8 flex items-center gap-4 cursor-pointer hover:bg-black hover:text-white transition-all duration-300 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm uppercase tracking-wider">Explore the collection</span>
                <ArrowDownRight size={20} className="group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300" />
              </motion.div>
            </motion.div>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              {
                img: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?q=80&w=1887&auto=format&fit=crop",
                title: "Oversized Wool Coat",
                desc: "Tailored silhouette in heavyweight merino wool"
              },
              {
                img: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=1887&auto=format&fit=crop",
                title: "Structured Blazer",
                desc: "Architectural lines with subtle texture"
              },
              {
                img: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=1887&auto=format&fit=crop",
                title: "Pleated Trousers",
                desc: "Fluid movement in organic cotton"
              }
            ].map((item, index) => (
              <motion.div 
                key={index} 
                className="group relative overflow-hidden"
                variants={fadeIn}
              >
                <div className="aspect-[5/6] overflow-hidden">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="pt-4">
                  <h3 className="font-medium text-lg">{item.title}</h3>
                  <p className="text-[#555] font-light">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="flex justify-center"
          >
            <a 
              href="#" 
              className="inline-flex items-center gap-2 text-sm uppercase tracking-wider border-b border-black pb-1 hover:opacity-70 transition-opacity"
            >
              View Full Collection
              <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      <section id="sustainability" className="py-24 md:py-32 px-6 md:px-12 bg-[#e9e5de] relative">
        <div className="max-w-screen-xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <motion.div 
              className="md:w-1/2 aspect-[4/5] overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <img 
                src="https://images.unsplash.com/photo-1581784368651-8916092072cf?q=80&w=1887&auto=format&fit=crop" 
                alt="Sustainable fashion" 
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </motion.div>
            
            <motion.div 
              className="md:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <p className="text-sm uppercase tracking-wider text-[#777] mb-4">Sustainability</p>
              <h2 className="font-['Space_Grotesk'] text-3xl md:text-5xl mb-6">A commitment to better practices</h2>
              <p className="font-light text-lg leading-relaxed mb-6">
                We believe fashion can be both beautiful and responsible. Our production methods minimize waste and prioritize natural, renewable materials sourced from ethical partners.
              </p>
              <ul className="space-y-4 font-light">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 mt-1 rounded-full border border-black flex items-center justify-center">
                    <span className="w-2 h-2 bg-black rounded-full"></span>
                  </span>
                  <span>95% natural or recycled materials in every product</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 mt-1 rounded-full border border-black flex items-center justify-center">
                    <span className="w-2 h-2 bg-black rounded-full"></span>
                  </span>
                  <span>Carbon-neutral manufacturing practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 mt-1 rounded-full border border-black flex items-center justify-center">
                    <span className="w-2 h-2 bg-black rounded-full"></span>
                  </span>
                  <span>Plastic-free packaging and shipping</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="essentials" className="py-24 md:py-32 px-6 md:px-12 relative">
        <div className="max-w-screen-xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="mb-16"
          >
            <p className="text-sm uppercase tracking-wider text-[#777] mb-4">Timeless Design</p>
            <h2 className="font-['Space_Grotesk'] text-3xl md:text-5xl mb-6">The Essentials</h2>
            <p className="font-light text-lg max-w-xl leading-relaxed">
              Cornerstone pieces that transcend seasons, designed to last in both style and construction.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              {
                img: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3bca2e_image.png",
                title: "The Classic Tee",
                desc: "Organic cotton in three versatile shades"
              },
              {
                img: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=1887&auto=format&fit=crop",
                title: "Relaxed Shirt",
                desc: "Breathable linen blend with minimal detail"
              },
              {
                img: "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?q=80&w=1887&auto=format&fit=crop",
                title: "Straight Leg Denim",
                desc: "Medium weight with subtle texture"
              }
            ].map((item, index) => (
              <motion.div 
                key={index} 
                className="group relative"
                variants={fadeIn}
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent text-white">
                  <h3 className="font-medium text-lg">{item.title}</h3>
                  <p className="font-light opacity-90">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="about" className="py-24 md:py-32 px-6 md:px-12 bg-[#2c2c2c] text-white">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            <motion.div 
              className="md:w-2/5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <p className="text-sm uppercase tracking-wider text-[#aaa] mb-4">About</p>
              <h2 className="font-['Space_Grotesk'] text-3xl md:text-5xl mb-6">Our approach to fashion</h2>
            </motion.div>
            <motion.div 
              className="md:w-3/5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <p className="font-light text-lg leading-relaxed mb-8">
                Founded in 2018, moda.studio began with a simple premise: fashion should inspire without excess. Our design philosophy embraces deliberate minimalism—each piece considered in its purpose, material, and longevity.
              </p>
              <p className="font-light text-lg leading-relaxed mb-8">
                Working with a select group of ethical manufacturers across Europe, we create collections that balance contemporary aesthetics with lasting quality. These relationships, built on shared values and transparency, allow us to maintain exceptional standards while reducing environmental impact.
              </p>
              <a 
                href="#" 
                className="inline-flex items-center gap-2 text-sm uppercase tracking-wider border-b border-white pb-1 hover:opacity-70 transition-opacity"
              >
                Learn More About Our Story
                <ArrowRight size={16} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-screen-xl mx-auto">
          <motion.div 
            className="flex flex-col items-center text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <p className="text-sm uppercase tracking-wider text-[#777] mb-4">Stay Connected</p>
            <h2 className="font-['Space_Grotesk'] text-3xl md:text-5xl mb-6 max-w-2xl">
              Subscribe for early collection access and studio insights
            </h2>
            <div className="w-full max-w-md mt-6 flex">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-4 py-3 border-t border-l border-b border-black bg-transparent text-sm focus:outline-none"
              />
              <button className="px-6 py-3 bg-black text-white text-sm uppercase tracking-wider hover:bg-black/90 transition-colors">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-16 px-6 md:px-12 border-t border-gray-200">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <h3 className="font-['Space_Grotesk'] text-xl mb-6">moda.studio</h3>
              <p className="font-light text-sm text-[#555] mb-6 max-w-xs">
                Contemporary fashion with purpose, designed in Berlin and crafted ethically.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-black hover:opacity-70 transition-opacity">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 2 17 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61992 14.1902 8.22773 13.4229 8.09407 12.5922C7.9604 11.7615 8.09207 10.9099 8.47033 10.1584C8.84859 9.40685 9.45419 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87658 12.63 8C13.4789 8.12588 14.2649 8.52146 14.8717 9.12831C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17.5 6.5H17.51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="text-black hover:opacity-70 transition-opacity">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="text-black hover:opacity-70 transition-opacity">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 3.00005C22.0424 3.67552 20.9821 4.19216 19.86 4.53005C19.2577 3.83756 18.4573 3.34674 17.567 3.12397C16.6767 2.90121 15.7395 2.95724 14.8821 3.2845C14.0247 3.61176 13.2884 4.19445 12.773 4.95376C12.2575 5.71308 11.9877 6.61238 12 7.53005V8.53005C10.2426 8.57561 8.50127 8.18586 6.93101 7.39549C5.36074 6.60513 4.01032 5.43868 3 4.00005C3 4.00005 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.50005C20.9991 7.2215 20.9723 6.94364 20.92 6.67005C21.9406 5.66354 22.6608 4.39276 23 3.00005Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-wider mb-4">Collections</h4>
              <ul className="space-y-3 font-light">
                <li><a href="#" className="hover:opacity-70 transition-opacity">Winter 2025</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Spring / Summer 2025</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Archive</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-wider mb-4">Information</h4>
              <ul className="space-y-3 font-light">
                <li><a href="#" className="hover:opacity-70 transition-opacity">About Us</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Sustainability</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Production</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Stockists</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3 font-light">
                <li><a href="#" className="hover:opacity-70 transition-opacity">Terms of Service</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Privacy Policy</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Shipping & Returns</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-gray-200 text-sm text-[#777] font-light">
            <p>© 2023 moda.studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}