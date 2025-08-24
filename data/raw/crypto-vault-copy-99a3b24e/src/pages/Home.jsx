import React from "react";
import { TrendingUp, TrendingDown, ArrowUpDown, Settings, RotateCcw, Shield, ShieldCheck, Key, Lock, Mic, ChevronDown, ChevronRight, BarChart3, Menu, Twitter, MessageCircle, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-black font-sans antialiased text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)]"></div>
      </div>

      <div className="fixed w-full h-screen">
        <iframe src='https://my.spline.design/aidatamodelinteraction-mdTL3FktFVHgDvFr5TKtnYDV/' frameBorder='0' width='100%' height='100%'></iframe>
      </div>

      {/* Navigation */}
      <header className="relative z-50 border-b border-white/10 glass sticky top-0" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 text-lg font-semibold group animate-slide-in-left delay-100">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="m2 17 10 5 10-5"></path>
                  <path d="m2 12 10 5 10-5"></path>
                </svg>
              </div>
              <span className="text-white font-semibold">CryptoVault</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8 animate-fade-in-up delay-200">
              <div className="flex items-center gap-6 text-sm font-medium">
                <a href="#" className="px-4 py-2 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">Trading</a>
                <a href="#" className="text-white/70 hover:text-white transition-colors duration-300">Markets</a>
                <div className="relative group">
                  <button className="flex items-center gap-1 text-white/70 hover:text-white transition-colors duration-300">
                    Products <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <a href="#" className="text-white/70 hover:text-white transition-colors duration-300">Analytics</a>
                <a href="#" className="text-white/70 hover:text-white transition-colors duration-300">Learn</a>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-px h-6 bg-white/20"></div>
                <a href="#" className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-300">Sign In</a>
                <a href="#" className="text-sm font-medium text-black bg-white hover:bg-white/90 transition-all duration-300 rounded-2xl px-6 py-2.5 shadow-lg shadow-white/20">Get Started</a>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 hover:bg-white/10 rounded-2xl transition-colors duration-300">
              <Menu className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </header>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            
            {/* Hero Content - Spans 5 columns */}
            <div className="lg:col-span-5 animate-slide-in-left delay-300">
              <div className="gradient-border rounded-3xl mb-8 inline-block" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3))', padding: '1px' }}>
                <div className="bg-black rounded-3xl px-4 py-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/80">Advanced Trading Platform</span>
                  </div>
                </div>
              </div>

              <h1 className="sm:text-7xl xl:text-8xl leading-none text-6xl font-medium tracking-tighter mb-8">
                <span className="block text-white">Trade crypto</span>
                <span className="block" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>like a pro</span>
              </h1>

              <p className="text-xl text-white/70 mb-10 max-w-lg leading-relaxed">
                Access professional trading tools, real-time market data, and institutional-grade security for Bitcoin, Ethereum, and 200+ cryptocurrencies.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <button className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-3xl transition-all duration-300 shadow-xl shadow-indigo-500/25 transform hover:scale-105">
                  Start Trading
                </button>
                <button className="px-8 py-4 border border-white/20 hover:border-white/40 text-white font-medium rounded-3xl transition-all duration-300 backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  View Demo
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-1">$24B+</div>
                  <div className="text-sm text-white/60">24h Volume</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-1">150K+</div>
                  <div className="text-sm text-white/60">Active Traders</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white mb-1">200+</div>
                  <div className="text-sm text-white/60">Cryptocurrencies</div>
                </div>
              </div>
            </div>

            {/* Trading Card - Spans 4 columns */}
            <div className="lg:col-span-4 animate-fade-in-up delay-500">
              <div className="rounded-3xl p-8 backdrop-blur-xl border border-white/20 shadow-2xl animate-float" style={{ background: 'rgba(255, 255, 255, 0.05)', animation: 'float 6s ease-in-out infinite' }}>
                
                {/* Card Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">Quick Trade</h3>
                    <p className="text-sm text-white/60">Instant crypto exchange</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 hover:bg-white/10 rounded-2xl transition-colors duration-300">
                      <RotateCcw className="w-4 h-4 text-white/60" />
                    </button>
                    <button className="p-3 hover:bg-white/10 rounded-2xl transition-colors duration-300">
                      <Settings className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>

                {/* From Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">From</span>
                    <span className="text-sm text-white/60">Balance: 12.5847 BTC</span>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <button className="flex items-center gap-3 px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 rounded-2xl transition-colors duration-300 border border-orange-500/30">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">₿</span>
                      </div>
                      <span className="text-sm font-medium text-white">BTC</span>
                      <ChevronDown className="w-4 h-4 text-white/60" />
                    </button>
                    
                    <div className="flex-1 text-right">
                      <input type="text" defaultValue="0.5" className="w-full bg-transparent text-2xl font-semibold text-white text-right outline-none" />
                      <p className="text-sm text-white/60 mt-1">≈ $21,450.00</p>
                    </div>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center mb-6">
                  <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 border border-white/20 backdrop-blur-sm transform hover:scale-110">
                    <ArrowUpDown className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* To Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">To</span>
                    <span className="text-sm text-white/60">Balance: 245.92 ETH</span>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <button className="flex items-center gap-3 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-2xl transition-colors duration-300 border border-blue-500/30">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">Ξ</span>
                      </div>
                      <span className="text-sm font-medium text-white">ETH</span>
                      <ChevronDown className="w-4 h-4 text-white/60" />
                    </button>
                    
                    <div className="flex-1 text-right">
                      <input type="text" defaultValue="12.847" className="w-full bg-transparent text-2xl font-semibold text-white text-right outline-none" />
                      <p className="text-sm text-white/60 mt-1">≈ $21,380.50</p>
                    </div>
                  </div>
                </div>

                {/* Trade Info */}
                <div className="space-y-3 mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Exchange Rate</span>
                    <span className="text-white font-medium">1 BTC = 25.694 ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Network Fee</span>
                    <span className="text-white font-medium">~$12.50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Estimated Time</span>
                    <span className="text-green-400 font-medium">~2 minutes</span>
                  </div>
                </div>

                {/* Trade Button */}
                <button className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-500/25 transform hover:scale-[1.02]">
                  Execute Trade
                </button>
              </div>
            </div>

            {/* Market Data - Spans 3 columns */}
            <div className="lg:col-span-3 space-y-6 animate-slide-in-right delay-700">
              
              {/* Live Market Data */}
              <div className="rounded-3xl p-6 backdrop-blur-xl border border-white/20" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Live Markets</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-white/60">Real-time</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-sm font-bold text-white">₿</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">BTC/USD</p>
                        <p className="text-xs text-white/60">Bitcoin</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">$44,084.92</p>
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +2.45%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-sm font-bold text-white">Ξ</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">ETH/USD</p>
                        <p className="text-xs text-white/60">Ethereum</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">$1,616.18</p>
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        -1.23%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-sm font-bold text-white">◎</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">SOL/USD</p>
                        <p className="text-xs text-white/60">Solana</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">$99.24</p>
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +5.67%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="rounded-3xl p-6 backdrop-blur-xl border border-white/20" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <h3 className="text-lg font-semibold text-white mb-6">Security Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-colors duration-300">
                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-white/80" />
                    </div>
                    <span className="text-sm text-white/80">Multi-signature wallets</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-colors duration-300">
                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Key className="w-4 h-4 text-white/80" />
                    </div>
                    <span className="text-sm text-white/80">Hardware security modules</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-colors duration-300">
                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white/80" />
                    </div>
                    <span className="text-sm text-white/80">End-to-end encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up delay-800">
            
            <div className="rounded-3xl p-8 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-500 transform hover:scale-[1.02] group" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">Advanced Analytics</h3>
              <p className="text-white/70 leading-relaxed mb-8">Professional-grade charts, technical indicators, and market insights to make informed trading decisions.</p>
              <div className="flex items-center gap-2 text-white font-medium hover:text-indigo-300 transition-colors duration-300 cursor-pointer">
                Learn more
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="rounded-3xl p-8 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-500 transform hover:scale-[1.02] group" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">Voice Trading</h3>
              <p className="text-white/70 leading-relaxed mb-8">Execute trades using voice commands with our AI-powered trading assistant for hands-free portfolio management.</p>
              <div className="flex items-center gap-2 text-white font-medium hover:text-green-300 transition-colors duration-300 cursor-pointer">
                Learn more
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="rounded-3xl p-8 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-500 transform hover:scale-[1.02] group" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">Bank-Grade Security</h3>
              <p className="text-white/70 leading-relaxed mb-8">Your assets are protected by institutional-grade security measures including cold storage and insurance coverage.</p>
              <div className="flex items-center gap-2 text-white font-medium hover:text-orange-300 transition-colors duration-300 cursor-pointer">
                Learn more
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="border-t border-white/10 mt-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              
              {/* Company Info */}
              <div className="lg:col-span-1">
                <a href="#" className="flex items-center gap-3 text-lg font-semibold mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                      <path d="m2 17 10 5 10-5"></path>
                      <path d="m2 12 10 5 10-5"></path>
                    </svg>
                  </div>
                  <span className="text-white font-semibold">CryptoVault</span>
                </a>
                <p className="text-white/60 text-sm leading-relaxed mb-8">
                  The most advanced cryptocurrency trading platform built for professionals and institutions worldwide.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors duration-300">
                    <Twitter className="w-4 h-4 text-white/70" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors duration-300">
                    <MessageCircle className="w-4 h-4 text-white/70" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors duration-300">
                    <Users className="w-4 h-4 text-white/70" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-white font-semibold mb-6">Platform</h4>
                <ul className="space-y-4 text-sm">
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Spot Trading</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Futures Trading</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Options Trading</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Margin Trading</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">NFT Marketplace</a></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-white font-semibold mb-6">Support</h4>
                <ul className="space-y-4 text-sm">
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Help Center</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">API Documentation</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Trading Guides</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Contact Support</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">System Status</a></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-white font-semibold mb-6">Company</h4>
                <ul className="space-y-4 text-sm">
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">About Us</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Careers</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Press Kit</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Privacy Policy</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-white/60 text-sm">© 2024 CryptoVault. All rights reserved.</p>
              <div className="flex items-center gap-6 text-sm text-white/60">
                <span>🌍 English</span>
                <span>💱 USD</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
        }
        @keyframes slideInLeft {
          0% { opacity: 0; transform: translateX(-30px); filter: blur(5px); }
          100% { opacity: 1; transform: translateX(0); filter: blur(0px); }
        }
        @keyframes slideInRight {
          0% { opacity: 0; transform: translateX(30px); filter: blur(5px); }
          100% { opacity: 1; transform: translateX(0); filter: blur(0px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-slide-in-left { animation: slideInLeft 0.8s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.8s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }
      `}</style>
    </div>
  );
}