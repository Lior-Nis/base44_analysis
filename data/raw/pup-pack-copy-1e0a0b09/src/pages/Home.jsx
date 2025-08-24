
import React from "react";
import { Link } from "react-router-dom"; // useNavigate is removed as it's no longer needed
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { useHapticFeedback } from "../components/useHapticFeedback.js";
import { Camera, Sparkles, Heart, Star, ArrowRight, Check, Eye } from "lucide-react";

export default function Home() {
  const [user, setUser] = React.useState(null);
  const triggerHaptic = useHapticFeedback();
  // const navigate = useNavigate(); // Removed as login is handled by User.loginWithRedirect

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  const packages = [
    {
      name: "Starter Pack",
      images: 5,
      price: 5, // Changed from 0 to 5
      description: "Perfect for trying our service",
      features: ["5 premium transformations", "AI + human touch", "24-hour delivery", "Personal gallery"]
    },
    {
      name: "Popular Pack",
      images: 10,
      price: 10,
      description: "Most popular choice",
      features: ["10 premium transformations", "AI + human touch", "24-hour delivery", "Personal gallery", "Priority support"],
      popular: true
    },
    {
      name: "Ultimate Pack",
      images: 15,
      price: 15,
      description: "Maximum value for dog lovers",
      features: ["15 premium transformations", "AI + human touch", "24-hour delivery", "Personal gallery", "Priority support", "Bonus surprises"]
    }
  ];

  const exampleImages = [
    {
      url: "https://i.imgur.com/wzAd0kB.png",
      caption: "Different Styles"
    },
    {
      url: "https://i.imgur.com/aPvAGd5.jpeg", 
      caption: "New Background"
    },
    {
      url: "https://i.imgur.com/hXsKzZo.jpeg",
      caption: "Add Objects"
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="backdrop-blur-md bg-white/10 bg-opacity-10 rounded-3xl p-8 border border-white/20 shadow-xl" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              Transform Your Dog Into
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent" style={{color: '#fbbf24'}}> Art</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto" style={{color: 'rgba(255,255,255,0.9)'}}>
              Premium AI-powered transformations crafted by skilled artists. Every image is touched by both AI and human creativity for truly unique results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to={createPageUrl("Dashboard")}
                  onClick={triggerHaptic}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-xl border border-white/30 transition-all text-lg font-semibold"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  onClick={() => {
                    triggerHaptic();
                    User.loginWithRedirect(window.location.origin + createPageUrl('Dashboard'));
                  }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-xl border border-white/30 transition-all text-lg font-semibold"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
              )}
              <Link
                to={createPageUrl("Gallery")}
                onClick={triggerHaptic}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-xl border border-white/20 transition-all text-lg font-semibold"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: 'white'
                }}
              >
                <Camera className="w-5 h-5" />
                View Gallery
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Example Showcase Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">See What's Possible</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto" style={{color: 'rgba(255,255,255,0.8)'}}>
              Real transformations from our talented artists. Your pup could be next!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {exampleImages.map((image, index) => (
              <div
                key={index}
                className="backdrop-blur-md bg-white/10 rounded-2xl overflow-hidden border border-white/20 shadow-xl hover:scale-105 transition-all duration-300 group"
                style={{backgroundColor: 'rgba(255,255,255,0.1)'}}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full aspect-square object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)'}}>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-sm font-medium">{image.caption}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to={createPageUrl("Gallery")}
              onClick={triggerHaptic}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-xl border border-white/30 transition-all text-lg font-semibold"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white'
              }}
            >
              <Eye className="w-5 h-5" />
              See More Examples
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose PupPack?</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto" style={{color: 'rgba(255,255,255,0.8)'}}>
              We combine cutting-edge AI with human artistry to create transformations that go beyond simple filters
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl hover:bg-white/15 transition-all" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{background: 'linear-gradient(135deg, #8b5cf6, #ec4899)'}}>
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI + Human Touch</h3>
              <p className="text-white/80" style={{color: 'rgba(255,255,255,0.8)'}}>
                Every transformation is enhanced by both advanced AI and skilled human artists for unique, high-quality results
              </p>
            </div>

            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl hover:bg-white/15 transition-all" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'}}>
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Unlimited Creativity</h3>
              <p className="text-white/80" style={{color: 'rgba(255,255,255,0.8)'}}>
                Serious, funny, fantastical, or completely custom. We can enhance photos or create entirely new scenes
              </p>
            </div>

            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl hover:bg-white/15 transition-all" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{background: 'linear-gradient(135deg, #f97316, #ef4444)'}}>
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Premium Quality</h3>
              <p className="text-white/80" style={{color: 'rgba(255,255,255,0.8)'}}>
                Fast delivery, personal galleries, and results that exceed expectations. Your pup deserves the best
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Pack</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto" style={{color: 'rgba(255,255,255,0.8)'}}>
              One-time purchase, lifetime access to your personal gallery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`backdrop-blur-md rounded-2xl p-8 border shadow-xl hover:scale-105 transition-all flex flex-col ${
                  pkg.popular 
                    ? "bg-white/20 border-white/40 ring-2 ring-white/50" 
                    : "bg-white/10 border-white/20 hover:bg-white/15"
                }`}
                style={{
                  backgroundColor: pkg.popular ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  borderColor: pkg.popular ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'
                }}
              >
                {pkg.popular && (
                  <div className="text-center mb-4">
                    <span className="inline-block text-white px-4 py-1 rounded-full text-sm font-bold" style={{background: 'linear-gradient(135deg, #fbbf24, #f97316)'}}>
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-white/80 mb-4" style={{color: 'rgba(255,255,255,0.8)'}}>{pkg.description}</p>
                  <div className="text-4xl font-bold text-white mb-2">
                    {pkg.price === 0 ? "FREE" : `$${pkg.price}`}
                  </div>
                  <p className="text-white/80" style={{color: 'rgba(255,255,255,0.8)'}}>{pkg.images} transformations</p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {pkg.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3 text-white/90" style={{color: 'rgba(255,255,255,0.9)'}}>
                      <Check className="w-5 h-5 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to={createPageUrl("CreateOrder") + `?package=${pkg.images}_images`}
                  onClick={triggerHaptic}
                  className="block w-full py-4 rounded-xl text-center font-semibold transition-all"
                  style={{
                    backgroundColor: pkg.popular ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                    color: 'white',
                    borderColor: pkg.popular ? 'transparent' : 'rgba(255,255,255,0.3)',
                    border: pkg.popular ? 'none' : '1px solid rgba(255,255,255,0.3)'
                  }}
                >
                  Select {pkg.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="backdrop-blur-md bg-white/10 rounded-3xl p-12 border border-white/20 shadow-xl" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Pup?
            </h2>
            <p className="text-xl text-white/80 mb-8" style={{color: 'rgba(255,255,255,0.8)'}}>
              Join thousands of happy dog owners who've discovered the magic of PupPack
            </p>
            {user ? (
              <Link
                to={createPageUrl("Dashboard")}
                onClick={triggerHaptic}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-xl transition-all text-lg font-semibold"
                style={{background: 'linear-gradient(135deg, #8b5cf6, #ec4899)'}}
              >
                Start Creating <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <button
                onClick={() => {
                  triggerHaptic();
                  User.loginWithRedirect(window.location.origin + createPageUrl('Dashboard'));
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-xl transition-all text-lg font-semibold"
                style={{background: 'linear-gradient(135deg, #8b5cf6, #ec4899)'}}
              >
                Get Started Today <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
