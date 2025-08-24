
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Copy, Clipboard, Eye, X, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/api/entities";

export default function DesignSystem() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [copied, setCopied] = React.useState(null);

  React.useEffect(() => {
    const checkUserRole = async () => {
      try {
        const currentUser = await User.me();
        setIsAdmin(currentUser.role === 'admin');
      } catch (error) {
        console.log("User not logged in or not an admin");
      }
    };
    
    checkUserRole();
  }, []);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="font-['Space_Grotesk'] text-2xl mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">This page is only accessible to administrators.</p>
          <Button onClick={() => window.history.back()}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] p-6 md:p-12">
      <div className="max-w-screen-xl mx-auto">
        <header className="mb-16">
          <h1 className="font-['Space_Grotesk'] text-4xl md:text-6xl mb-4">Moda.Studio Design System</h1>
          <p className="text-[#555] text-lg md:text-xl max-w-2xl">
            A comprehensive guide to the brand identity, UI components, and design principles of the Moda.Studio website.
          </p>
        </header>

        <Tabs defaultValue="brand" className="w-full mb-16">
          <TabsList className="mb-8 bg-transparent border-b border-[#e0e0e0] w-full flex gap-8 pb-2 overflow-x-auto">
            <TabsTrigger value="brand" className="data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none px-0 py-2 border-b-2 border-transparent">Brand Identity</TabsTrigger>
            <TabsTrigger value="typography" className="data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none px-0 py-2 border-b-2 border-transparent">Typography</TabsTrigger>
            <TabsTrigger value="colors" className="data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none px-0 py-2 border-b-2 border-transparent">Color Palette</TabsTrigger>
            <TabsTrigger value="components" className="data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none px-0 py-2 border-b-2 border-transparent">Components</TabsTrigger>
            <TabsTrigger value="animations" className="data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none px-0 py-2 border-b-2 border-transparent">Animations</TabsTrigger>
            <TabsTrigger value="guidelines" className="data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none px-0 py-2 border-b-2 border-transparent">Guidelines</TabsTrigger>
          </TabsList>
          
          <TabsContent value="brand" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div>
                <h2 className="font-['Space_Grotesk'] text-3xl mb-6">Brand Essence</h2>
                <p className="text-[#555] mb-8 leading-relaxed">
                  Moda.Studio embodies contemporary luxury with a focus on minimalist, sustainable fashion. 
                  The brand exudes sophistication through clean aesthetics, thoughtful design, and a sense of 
                  intentional simplicity that feels both modern and timeless.
                </p>
                
                <h3 className="font-medium text-xl mb-3">Brand Values</h3>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 mt-1 rounded-full border border-black flex items-center justify-center">
                      <span className="w-2 h-2 bg-black rounded-full"></span>
                    </span>
                    <div>
                      <span className="font-medium">Intentional Design</span>
                      <p className="text-[#555]">Every element serves a purpose, every design choice is deliberate.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 mt-1 rounded-full border border-black flex items-center justify-center">
                      <span className="w-2 h-2 bg-black rounded-full"></span>
                    </span>
                    <div>
                      <span className="font-medium">Sustainable Luxury</span>
                      <p className="text-[#555]">Premium quality that honors ethical practices and environmental responsibility.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 mt-1 rounded-full border border-black flex items-center justify-center">
                      <span className="w-2 h-2 bg-black rounded-full"></span>
                    </span>
                    <div>
                      <span className="font-medium">Refined Minimalism</span>
                      <p className="text-[#555]">Beauty in simplicity, with attention to subtle details and textures.</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h2 className="font-['Space_Grotesk'] text-3xl mb-6">Brand Voice</h2>
                <div className="space-y-6">
                  <div className="p-6 bg-white rounded-lg">
                    <h3 className="font-medium text-xl mb-3">Headline Examples</h3>
                    <ul className="space-y-4">
                      <li className="font-['Space_Grotesk'] text-2xl">Contemporary fashion with purpose</li>
                      <li className="font-['Space_Grotesk'] text-2xl">A commitment to better practices</li>
                      <li className="font-['Space_Grotesk'] text-2xl">Designed with intention</li>
                    </ul>
                  </div>
                  
                  <div className="p-6 bg-white rounded-lg">
                    <h3 className="font-medium text-xl mb-3">Body Copy Examples</h3>
                    <ul className="space-y-4">
                      <li className="font-light text-[#2c2c2c]">Curated seasonal collections and sustainable essentials that define modern minimalism</li>
                      <li className="font-light text-[#2c2c2c]">We believe fashion can be both beautiful and responsible. Our production methods minimize waste and prioritize natural, renewable materials sourced from ethical partners.</li>
                      <li className="font-light text-[#2c2c2c]">A thoughtful exploration of texture and form, our latest collection balances bold silhouettes with a restrained palette of olive, sand, and charcoal.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="typography" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-2">
                <h2 className="font-['Space_Grotesk'] text-3xl mb-6">Typography System</h2>
                
                <div className="space-y-12">
                  <div>
                    <div className="flex items-end justify-between mb-4">
                      <h3 className="font-medium text-xl">Space Grotesk</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#777]">Primary Display Font</span>
                        <button 
                          onClick={() => copyToClipboard("font-['Space_Grotesk']", "space-grotesk")}
                          className="text-[#777] hover:text-black transition-colors"
                        >
                          {copied === "space-grotesk" ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg">
                      <p className="font-['Space_Grotesk'] text-6xl mb-4">Aa Bb Cc</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-['Space_Grotesk'] text-5xl font-light">Light</p>
                          <p className="font-['Space_Grotesk'] text-5xl font-normal">Regular</p>
                          <p className="font-['Space_Grotesk'] text-5xl font-medium">Medium</p>
                        </div>
                        <div>
                          <p className="font-['Space_Grotesk'] text-5xl font-semibold">Semi Bold</p>
                          <p className="font-['Space_Grotesk'] text-5xl font-bold">Bold</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-end justify-between mb-4">
                      <h3 className="font-medium text-xl">System UI</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#777]">Body Font</span>
                        <button 
                          onClick={() => copyToClipboard('font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;', "system-ui")}
                          className="text-[#777] hover:text-black transition-colors"
                        >
                          {copied === "system-ui" ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg">
                      <p className="text-6xl mb-4">Aa Bb Cc</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-5xl font-light">Light</p>
                          <p className="text-5xl font-normal">Regular</p>
                          <p className="text-5xl font-medium">Medium</p>
                        </div>
                        <div>
                          <p className="text-5xl font-semibold">Semi Bold</p>
                          <p className="text-5xl font-bold">Bold</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="font-['Space_Grotesk'] text-3xl mb-6">Font Hierarchy</h2>
                <div className="bg-white p-6 rounded-lg space-y-8">
                  <div>
                    <div className="flex justify-between items-center text-sm text-[#777] mb-2">
                      <span>H1 - Page Title</span>
                      <button 
                        onClick={() => copyToClipboard("font-['Space_Grotesk'] text-5xl md:text-8xl", "h1")}
                        className="text-[#777] hover:text-black transition-colors"
                      >
                        {copied === "h1" ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <h1 className="font-['Space_Grotesk'] text-5xl">Contemporary fashion</h1>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center text-sm text-[#777] mb-2">
                      <span>H2 - Section Title</span>
                      <button 
                        onClick={() => copyToClipboard("font-['Space_Grotesk'] text-3xl md:text-5xl", "h2")}
                        className="text-[#777] hover:text-black transition-colors"
                      >
                        {copied === "h2" ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <h2 className="font-['Space_Grotesk'] text-3xl">A commitment to better practices</h2>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center text-sm text-[#777] mb-2">
                      <span>H3 - Component Title</span>
                      <button 
                        onClick={() => copyToClipboard("font-medium text-xl", "h3")}
                        className="text-[#777] hover:text-black transition-colors"
                      >
                        {copied === "h3" ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <h3 className="font-medium text-xl">Oversized Wool Coat</h3>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center text-sm text-[#777] mb-2">
                      <span>Paragraph</span>
                      <button 
                        onClick={() => copyToClipboard("font-light text-lg leading-relaxed", "p")}
                        className="text-[#777] hover:text-black transition-colors"
                      >
                        {copied === "p" ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <p className="font-light text-lg">Cornerstone pieces that transcend seasons, designed to last in both style and construction.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="colors" className="mt-0">
            <h2 className="font-['Space_Grotesk'] text-3xl mb-6">Color Palette</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { name: "Background", hex: "#f8f7f4", usage: "Primary background color" },
                { name: "Text Primary", hex: "#2c2c2c", usage: "Primary text color" },
                { name: "Text Secondary", hex: "#555555", usage: "Secondary text, descriptions" },
                { name: "Text Tertiary", hex: "#777777", usage: "Labels, less important text" },
                { name: "Accent Beige", hex: "#d2c3b4", usage: "Subtle accents, highlights" },
                { name: "Accent Light", hex: "#e9e5de", usage: "Section backgrounds, cards" },
                { name: "White", hex: "#ffffff", usage: "UI elements, cards" },
                { name: "Black", hex: "#000000", usage: "Strong accents, buttons" }
              ].map((color, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <div 
                    className="h-32 w-full" 
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{color.name}</h3>
                      <button 
                        onClick={() => copyToClipboard(color.hex, color.hex)}
                        className="text-[#777] hover:text-black transition-colors"
                      >
                        {copied === color.hex ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <p className="text-[#555] text-sm mb-2">{color.usage}</p>
                    <p className="text-xs font-mono">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="components" className="mt-0">
            <h2 className="font-['Space_Grotesk'] text-3xl mb-6">UI Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="font-medium text-xl mb-4">Buttons</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-[#777] mb-2">Primary Button</p>
                    <motion.div 
                      className="rounded-full border border-black py-5 px-8 flex items-center gap-4 cursor-pointer hover:bg-black hover:text-white transition-all duration-300 w-fit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-sm uppercase tracking-wider">Explore the collection</span>
                      <ArrowRight size={20} />
                    </motion.div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-[#777] mb-2">Text Link</p>
                    <a 
                      href="#" 
                      className="inline-flex items-center gap-2 text-sm uppercase tracking-wider border-b border-black pb-1 hover:opacity-70 transition-opacity"
                    >
                      View Full Collection
                      <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="font-medium text-xl mb-4">Section Headers</h3>
                <div>
                  <p className="text-sm uppercase tracking-wider text-[#777] mb-4">Seasonal Collections</p>
                  <h2 className="font-['Space_Grotesk'] text-4xl mb-6 leading-tight">
                    <span className="block">Autumn / Winter</span>
                    <span className="block relative">
                      <span className="relative z-10">2025</span>
                      <span 
                        className="absolute -bottom-2 left-0 h-4 bg-[#d2c3b4]/30 w-full -z-0"
                      ></span>
                    </span>
                  </h2>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="font-medium text-xl mb-4">Cards</h3>
                <div className="group relative overflow-hidden">
                  <div className="aspect-[5/6] bg-[#e9e5de] overflow-hidden">
                    <div className="w-full h-full bg-[#d2c3b4] transition-transform duration-700 group-hover:scale-105"></div>
                  </div>
                  <div className="pt-4">
                    <h3 className="font-medium text-lg">Oversized Wool Coat</h3>
                    <p className="text-[#555] font-light">Tailored silhouette in heavyweight merino wool</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="font-medium text-xl mb-4">Feature List</h3>
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
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="animations" className="mt-0">
            <h2 className="font-['Space_Grotesk'] text-3xl mb-6">Animation Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-xl">Text Reveal</h3>
                  <button 
                    onClick={() => copyToClipboard(`letterAnimation = {
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
}`, "text-reveal")}
                    className="text-[#777] hover:text-black transition-colors"
                  >
                    {copied === "text-reveal" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                
                <p className="text-[#555] mb-6">Letter-by-letter animated reveal used for hero headings with custom easing.</p>
                
                <div className="mt-4 h-32 flex items-center justify-center">
                  <motion.div 
                    className="overflow-hidden relative h-16 flex items-center"
                    whileInView="visible"
                    initial="hidden"
                    viewport={{ once: true }}
                  >
                    <motion.div
                      variants={{
                        hidden: { y: 100 },
                        visible: {
                          y: 0,
                          transition: {
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1]
                          }
                        }
                      }}
                    >
                      <h2 className="font-['Space_Grotesk'] text-3xl">Contemporary fashion</h2>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-xl">Fade In & Slide Up</h3>
                  <button 
                    onClick={() => copyToClipboard(`fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}`, "fade-in")}
                    className="text-[#777] hover:text-black transition-colors"
                  >
                    {copied === "fade-in" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                
                <p className="text-[#555] mb-6">Subtle animation used for text and UI elements as they enter the viewport.</p>
                
                <div className="mt-4 h-32 flex items-center justify-center">
                  <motion.p 
                    className="font-light text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Curated seasonal collections and sustainable essentials
                  </motion.p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-xl">Staggered Children</h3>
                  <button 
                    onClick={() => copyToClipboard(`staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
}`, "staggered")}
                    className="text-[#777] hover:text-black transition-colors"
                  >
                    {copied === "staggered" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                
                <p className="text-[#555] mb-6">Sequential animation of multiple elements with a staggered delay.</p>
                
                <div className="mt-4 h-32 flex items-center justify-center">
                  <motion.div 
                    className="flex gap-4"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.12
                        }
                      }
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div 
                        key={i}
                        className="w-16 h-16 bg-[#d2c3b4]"
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { 
                            opacity: 1, 
                            y: 0,
                            transition: { duration: 0.6 }
                          }
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-xl">Interactive Button</h3>
                  <button 
                    onClick={() => copyToClipboard(`<motion.div 
  className="rounded-full border border-black py-5 px-8 flex items-center gap-4 cursor-pointer hover:bg-black hover:text-white transition-all duration-300 w-fit"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.98 }}
>
  <span className="text-sm uppercase tracking-wider">Explore the collection</span>
  <ArrowRight size={20} />
</motion.div>`, "interactive-button")}
                    className="text-[#777] hover:text-black transition-colors"
                  >
                    {copied === "interactive-button" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                
                <p className="text-[#555] mb-6">Subtle scale animations on hover and tap for buttons.</p>
                
                <div className="mt-4 h-32 flex items-center justify-center">
                  <motion.div 
                    className="rounded-full border border-black py-5 px-8 flex items-center gap-4 cursor-pointer hover:bg-black hover:text-white transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm uppercase tracking-wider">Explore the collection</span>
                    <ArrowDownRight size={20} />
                  </motion.div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="guidelines" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div>
                <h2 className="font-['Space_Grotesk'] text-3xl mb-6">Design Guidelines</h2>
                
                <div className="bg-white p-6 rounded-lg mb-8">
                  <h3 className="font-medium text-xl mb-4">Layout System</h3>
                  <p className="text-[#555] mb-4">Full-width sections with centered content and consistent padding:</p>
                  <ul className="space-y-2 text-[#555]">
                    <li>• Max content width: 1280px (max-w-screen-xl)</li>
                    <li>• Section padding: 96px vertical, 24-48px horizontal (py-24 md:py-32 px-6 md:px-12)</li>
                    <li>• Content margin: centered with mx-auto</li>
                    <li>• Grid system: 1 column mobile, 2-4 columns desktop</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="font-medium text-xl mb-4">Photography Style</h3>
                  <p className="text-[#555] mb-4">The visual language relies on:</p>
                  <ul className="space-y-4 text-[#555]">
                    <li className="flex items-start gap-2">
                      <Check size={16} className="mt-1 text-green-600" />
                      <span>Neutral, desaturated tones that complement the color palette</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="mt-1 text-green-600" />
                      <span>Clean compositions with ample negative space</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="mt-1 text-green-600" />
                      <span>Natural lighting that emphasizes texture and form</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="mt-1 text-green-600" />
                      <span>Minimal props, focusing on the garments themselves</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h2 className="font-['Space_Grotesk'] text-3xl mb-6">Implementation Notes</h2>
                
                <div className="bg-white p-6 rounded-lg mb-8">
                  <h3 className="font-medium text-xl mb-4">Key Features</h3>
                  <ul className="space-y-4 text-[#555]">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-1 rounded-full border border-black flex items-center justify-center">
                        <span className="w-2 h-2 bg-black rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-medium">Dynamic Video Backgrounds</span>
                        <p>Admin-controlled background videos for each section, with fallback images.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-1 rounded-full border border-black flex items-center justify-center">
                        <span className="w-2 h-2 bg-black rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-medium">Choreographed Animations</span>
                        <p>Framer Motion-powered animations that create visual rhythm and hierarchy.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-1 rounded-full border border-black flex items-center justify-center">
                        <span className="w-2 h-2 bg-black rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-medium">Responsive Design</span>
                        <p>Fully responsive layout with mobile-first approach and adaptive typography.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-1 rounded-full border border-black flex items-center justify-center">
                        <span className="w-2 h-2 bg-black rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-medium">Role-Based Permissions</span>
                        <p>Admin-only features for content management integrated seamlessly.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="font-medium text-xl mb-4">Avoid These</h3>
                  <ul className="space-y-4 text-[#555]">
                    <li className="flex items-start gap-2">
                      <X size={16} className="mt-1 text-red-600" />
                      <span>Heavy or "loud" UI elements that distract from the content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={16} className="mt-1 text-red-600" />
                      <span>Default-looking form elements and generic buttons</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={16} className="mt-1 text-red-600" />
                      <span>Bright, saturated colors that clash with the neutral palette</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={16} className="mt-1 text-red-600" />
                      <span>Cluttered layouts with insufficient spacing between elements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={16} className="mt-1 text-red-600" />
                      <span>Generic stock photography that feels inauthentic</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <footer className="mt-16 pt-8 border-t border-gray-200 text-sm text-[#777] font-light">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2023 moda.studio. All rights reserved.</p>
            <Button onClick={() => window.history.back()} variant="outline" className="flex items-center gap-2">
              <ArrowRight className="rotate-180" size={16} />
              Return to Site
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
