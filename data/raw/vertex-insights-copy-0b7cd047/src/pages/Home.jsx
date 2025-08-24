import React, { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Add intersection observer for additional animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe all cards for scroll animations
    document.querySelectorAll('.card-animate').forEach(card => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      <header className="header-animate w-full flex justify-between items-center p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold text-sm tracking-tight font-geist">VX</span>
          </div>
          <span className="font-semibold text-zinc-900 tracking-tight font-geist">Vertex</span>
        </div>
      </header>

      <main className="flex-1 w-full px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="title-animate text-center mb-12">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl text-zinc-900 tracking-tight mb-6 font-geist font-semibold">Trading Intelligence Cards</h1>
            <p className="text-zinc-600 text-xl max-w-2xl mx-auto font-geist">Professional trading insights and market analytics at your fingertips</p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {/* Enhanced Stock Performance Card */}
            <div className="card-animate flex flex-col sm:p-10 w-full aspect-[3/5] hover:scale-105 transition-all duration-300 hover:shadow-3xl group animate-in text-white bg-zinc-900 bg-[url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/1186f423-e9dd-4944-903e-b47acd318366_1600w.jpg)] bg-cover rounded-3xl pt-8 pr-8 pb-8 pl-8 shadow-2xl justify-between" style={{boxShadow: 'rgba(0, 0, 0, 0.25) 0px 25px 50px -12px, rgba(255, 255, 255, 0.05) 0px 0px 0px 1px'}}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" style={{strokeWidth: '1.5'}}><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg>
                  <span className="text-xs px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full font-geist">Live</span>
                </div>
                <div className="">
                  <p className="text-4xl sm:text-5xl tracking-tight font-geist font-semibold">NVDA +8.24%</p>
                  <p className="text-zinc-400 text-base mt-2 font-geist">NVIDIA Corporation</p>
                </div>
                <div className="relative">
                  <div className="absolute top-0 right-0 text-right">
                    <p className="text-emerald-400 font-semibold text-lg font-geist">$892.13</p>
                    <p className="text-zinc-500 text-sm font-geist">+$67.82</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 border-t border-zinc-800 pt-6">
                <p className="text-zinc-400 text-sm leading-relaxed font-geist">
                  AI chip demand drives exceptional growth. Strong quarterly earnings exceeded analyst expectations by 15%.
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm tracking-tight font-geist">VERTEX</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-400" style={{strokeWidth: '1.5'}}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path></svg>
                  </div>
                  <a href="#" className="text-emerald-400 text-sm hover:underline transition-colors font-geist">vertex.trade</a>
                </div>
              </div>
            </div>

            {/* Enhanced Security Card */}
            <div className="card-animate flex flex-col justify-between rounded-3xl bg-white text-zinc-900 p-8 sm:p-10 w-full aspect-[3/5] hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl group animate-in" style={{boxShadow: 'rgba(0, 0, 0, 0.15) 0px 25px 50px -12px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px'}}>
              <div className="flex flex-1 bg-[url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/686aa8d3-7d4f-455f-afba-ed9399e3708b_800w.jpg)] bg-cover rounded-2xl items-center justify-center">
                <div className="relative">
                </div>
              </div>
              <div className="space-y-6 mt-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wide text-zinc-700 font-medium font-geist">Enterprise Security</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold leading-tight tracking-tight font-geist">Military-grade encryption & 2FA authentication</h2>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-zinc-600">
                    <p className="font-geist">SOC 2 Type II Certified</p>
                    <p className="font-geist">Bank-level security protocols</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" style={{strokeWidth: '1.5'}}><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
                </div>
              </div>
            </div>

            {/* Enhanced Tesla Stock Card */}
            <div className="card-animate flex flex-col sm:p-10 w-full aspect-[3/5] hover:scale-105 transition-all duration-300 hover:shadow-3xl group text-white bg-zinc-900 bg-[url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/eab297ee-54cd-4050-b3a4-8849a59a4d35_1600w.jpg)] bg-cover rounded-3xl pt-8 pr-8 pb-8 pl-8 shadow-2xl justify-between animate-in" style={{boxShadow: 'rgba(0, 0, 0, 0.25) 0px 25px 50px -12px, rgba(255, 255, 255, 0.05) 0px 0px 0px 1px'}}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-400 group-hover:scale-110 transition-transform" style={{strokeWidth: '1.5'}}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                  <span className="text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full font-geist">EV Leader</span>
                </div>
                <div className="">
                  <p className="text-4xl sm:text-5xl tracking-tight font-geist font-semibold">TSLA +4.71%</p>
                  <p className="text-zinc-400 text-base mt-2 font-geist">Tesla Inc.</p>
                </div>
                <div className="relative">
                  <div className="absolute top-0 right-0 text-right">
                    <p className="text-blue-400 font-semibold text-lg font-geist">$248.73</p>
                    <p className="text-zinc-500 text-sm font-geist">+$11.19</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 border-t border-zinc-800 pt-6">
                <p className="text-zinc-400 text-sm leading-relaxed font-geist">
                  Cybertruck production ramping up. Autonomous driving technology showing promising results in latest trials.
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm tracking-tight font-geist">VERTEX</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-400" style={{strokeWidth: '1.5'}}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path></svg>
                  </div>
                  <a href="#" className="text-blue-400 text-sm hover:underline transition-colors font-geist">vertex.trade</a>
                </div>
              </div>
            </div>

            {/* Enhanced Payments Card */}
            <div className="card-animate flex flex-col sm:p-10 w-full aspect-[3/5] hover:scale-105 transition-all duration-300 hover:shadow-3xl group text-zinc-900 bg-white rounded-3xl pt-8 pr-8 pb-8 pl-8 shadow-2xl justify-between animate-in" style={{boxShadow: 'rgba(0, 0, 0, 0.15) 0px 25px 50px -12px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px'}}>
              <div className="flex flex-1 bg-[url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/e4f6cd7d-ef57-4f1a-b6a2-ea028bcf34be_800w.jpg)] bg-cover rounded-2xl items-center justify-center">
                <div className="relative">
                </div>
              </div>
              <div className="space-y-6 mt-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wide text-zinc-700 font-medium font-geist">Instant Payments</span>
                  <div className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-full font-geist">0% Fees</div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold leading-tight tracking-tight font-geist">Lightning-fast deposits & withdrawals</h2>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-zinc-600">
                    <p className="font-geist">• ACH transfers in under 1 hour</p>
                    <p className="font-geist">• Wire transfers same-day processing</p>
                    <p className="font-geist">• Crypto deposits instant confirmation</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" style={{strokeWidth: '1.5'}}><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
                </div>
              </div>
            </div>

            {/* Enhanced Portfolio Overview Card */}
            <div className="card-animate flex flex-col sm:p-10 w-full aspect-[3/5] hover:scale-105 transition-all duration-300 hover:shadow-3xl group animate-in text-white bg-zinc-900 bg-[url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/81a82278-7c4d-4f1a-b091-8363387c969c_1600w.jpg)] bg-cover rounded-3xl pt-8 pr-8 pb-8 pl-8 shadow-2xl justify-between" style={{boxShadow: 'rgba(0, 0, 0, 0.25) 0px 25px 50px -12px, rgba(255, 255, 255, 0.05) 0px 0px 0px 1px'}}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-purple-400 group-hover:scale-110 transition-transform" style={{strokeWidth: '1.5'}}><path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"></path><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path></svg>
                  <span className="text-xs px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full font-geist">Portfolio</span>
                </div>
                <h2 className="text-5xl sm:text-6xl tracking-tight font-geist font-semibold">Markets</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center hover:bg-zinc-800 p-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="font-geist">NVDA</span>
                    </div>
                    <span className="text-emerald-400 font-medium font-geist">+8.24% <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline w-3 h-3 ml-1" style={{strokeWidth: '1.5'}}><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg></span>
                  </div>
                  <div className="flex justify-between items-center hover:bg-zinc-800 p-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="font-geist">TSLA</span>
                    </div>
                    <span className="text-blue-400 font-medium font-geist">+4.71% <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline w-3 h-3 ml-1" style={{strokeWidth: '1.5'}}><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg></span>
                  </div>
                  <div className="flex justify-between items-center hover:bg-zinc-800 p-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="font-geist">AMZN</span>
                    </div>
                    <span className="text-yellow-400 font-medium font-geist">+2.18% <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline w-3 h-3 ml-1" style={{strokeWidth: '1.5'}}><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg></span>
                  </div>
                  <div className="flex justify-between items-center hover:bg-zinc-800 p-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                      <span className="font-geist">META</span>
                    </div>
                    <span className="text-rose-400 font-medium font-geist">-1.24% <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline w-3 h-3 ml-1" style={{strokeWidth: '1.5'}}><path d="M16 17h6v-6"></path><path d="m22 17-8.5-8.5-5 5L2 7"></path></svg></span>
                  </div>
                  <div className="flex justify-between items-center hover:bg-zinc-800 p-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="font-geist">GOOGL</span>
                    </div>
                    <span className="text-cyan-400 font-medium font-geist">+1.87% <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline w-3 h-3 ml-1" style={{strokeWidth: '1.5'}}><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg></span>
                  </div>
                </div>
              </div>
              <div className="space-y-4 border-t border-zinc-800 pt-6">
                <p className="text-zinc-400 text-sm leading-relaxed font-geist">
                  Real-time market overview with performance indicators. Diversified portfolio showing strong upward momentum.
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm tracking-tight font-geist">VERTEX</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-purple-400" style={{strokeWidth: '1.5'}}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path></svg>
                  </div>
                  <a href="#" className="text-purple-400 text-sm hover:underline transition-colors font-geist">vertex.trade</a>
                </div>
              </div>
            </div>

            {/* Enhanced Platform Features Card */}
            <div className="card-animate flex flex-col justify-between rounded-3xl bg-white text-zinc-900 p-8 sm:p-10 w-full aspect-[3/5] hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl group animate-in" style={{boxShadow: 'rgba(0, 0, 0, 0.15) 0px 25px 50px -12px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px'}}>
              <div className="flex flex-1 bg-[url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a5863e51-75a9-462d-96f9-bf5d99e2cdc4_800w.jpg)] bg-cover rounded-2xl items-center justify-center">
                <div className="relative">
                </div>
              </div>
              <div className="space-y-6 mt-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wide text-zinc-700 font-medium font-geist">AI-Powered Trading</span>
                  <div className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-full font-geist">Beta</div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold leading-tight tracking-tight font-geist">Smart algorithms & predictive analytics</h2>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-zinc-600">
                    <p className="font-geist">• Machine learning risk assessment</p>
                    <p className="font-geist">• Pattern recognition alerts</p>
                    <p className="font-geist">• Automated portfolio rebalancing</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" style={{strokeWidth: '1.5'}}><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 py-8 px-4 sm:px-6 border-t border-zinc-200">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-zinc-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-xs tracking-tight font-geist">VX</span>
            </div>
            <span className="font-medium text-zinc-900 tracking-tight font-geist">Vertex Trading Platform</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-600 font-geist">
            <a href="#" className="hover:text-zinc-900 transition-colors">About</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Security</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">API</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        html, body { 
          height: 100%; 
          font-family: 'Inter', sans-serif; 
          background: #f3f0eb 
        }
        .card-animate { 
          opacity: 0; 
          transform: translateY(40px); 
          filter: blur(8px); 
          animation: fadeInSlideBlur 0.8s ease-out forwards; 
        }
        .header-animate { 
          opacity: 0; 
          transform: translateY(-20px); 
          filter: blur(4px); 
          animation: fadeInSlideBlur 0.6s ease-out forwards; 
          animation-delay: 0.1s; 
        }
        .title-animate { 
          opacity: 0; 
          transform: translateY(30px); 
          filter: blur(6px); 
          animation: fadeInSlideBlur 0.8s ease-out forwards; 
          animation-delay: 0.3s; 
        }
        .card-animate:nth-child(1) { animation-delay: 0.5s; }
        .card-animate:nth-child(2) { animation-delay: 0.6s; }
        .card-animate:nth-child(3) { animation-delay: 0.7s; }
        .card-animate:nth-child(4) { animation-delay: 0.8s; }
        .card-animate:nth-child(5) { animation-delay: 0.9s; }
        .card-animate:nth-child(6) { animation-delay: 1.0s; }
        @keyframes fadeInSlideBlur {
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }
        .font-geist { font-family: 'Geist', sans-serif !important; }
        .font-roboto { font-family: 'Roboto', sans-serif !important; }
        .font-montserrat { font-family: 'Montserrat', sans-serif !important; }
        .font-poppins { font-family: 'Poppins', sans-serif !important; }
        .font-playfair { font-family: 'Playfair Display', serif !important; }
        .font-instrument-serif { font-family: 'Instrument Serif', serif !important; }
        .font-merriweather { font-family: 'Merriweather', serif !important; }
        .font-bricolage { font-family: 'Bricolage Grotesque', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .font-manrope { font-family: 'Manrope', sans-serif !important; }
        .font-space-grotesk { font-family: 'Space Grotesk', sans-serif !important; }
        .font-work-sans { font-family: 'Work Sans', sans-serif !important; }
        .font-pt-serif { font-family: 'PT Serif', serif !important; }
        .font-geist-mono { font-family: 'Geist Mono', monospace !important; }
        .font-space-mono { font-family: 'Space Mono', monospace !important; }
        .font-quicksand { font-family: 'Quicksand', sans-serif !important; }
        .font-nunito { font-family: 'Nunito', sans-serif !important; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}