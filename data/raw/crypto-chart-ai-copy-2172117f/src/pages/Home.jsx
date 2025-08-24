
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Upload, Target, Shield, TrendingUp, Users, CheckCircle, ArrowRight } from "lucide-react";
import { User } from "@/api/entities";

export default function HomePage() {
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      // User not logged in
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    await User.loginWithRedirect(window.location.origin + createPageUrl("Dashboard"));
  };

  const features = [
    {
      icon: BarChart3,
      title: "AI Chart Analyse",
      description: "Upload screenshots van crypto charts en krijg instant professionele analyse"
    },
    {
      icon: Target,
      title: "Precisie Trading",
      description: "Long/Short aanbevelingen met exacte entry points, stop loss en take profit levels"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Automatische berekening van risico/beloning ratio voor elke trade"
    },
    {
      icon: TrendingUp,
      title: "Technische Indicatoren",
      description: "Analyse van RSI, MACD, moving averages en support/resistance levels"
    }
  ];

  const pricingFeatures = [
    "5 gratis analyses per maand",
    "Onbeperkte premium analyses",
    "Geavanceerde technische indicatoren",
    "Prioriteit ondersteuning",
    "Trading geschiedenis",
    "Export naar Excel/CSV"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welkom terug, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{user.full_name?.split(' ')[0] || user.email.split('@')[0]}</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Klaar om je volgende succesvolle trade te analyseren?
            </p>
            <Link to={createPageUrl("Analyzer")}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg">
                <Upload className="w-5 h-5 mr-2" />
                Analyseer Chart
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Je Statistieken</h3>
                    <p className="text-slate-400">Deze maand</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Totaal analyses:</span>
                    <span className="text-white font-semibold">{user.total_analyses || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Quick Start</h3>
                    <p className="text-slate-400">Begin direct</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Link to={createPageUrl("Analyzer")}>
                    <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Chart Screenshot
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Dashboard")}>
                    <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Bekijk Analyse Geschiedenis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-3xl"></div>
        <div className="relative px-6 py-24">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Crypto Chart
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Analyzer</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Upload screenshots van crypto charts en krijg instant AI-gestuurde trading aanbevelingen met exacte entry points, stop loss en take profit levels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleLogin}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg"
              >
                Start Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Demo Bekijken
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Professionele Trading Tools
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Onze AI analyseert je charts met dezelfde precisie als een ervaren trader
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 px-6 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Eenvoudige Prijzen
            </h2>
            <p className="text-xl text-slate-300">
              Start gratis, upgrade wanneer je meer nodig hebt
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Gratis Plan</h3>
                <div className="text-4xl font-bold text-blue-400 mb-6">€0<span className="text-lg text-slate-400">/maand</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-slate-300">5 analyses per maand</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-slate-300">Basis technische analyse</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-slate-300">Long/Short aanbevelingen</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                  onClick={handleLogin}
                >
                  Start Gratis
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/50 backdrop-blur-sm relative">
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                POPULAIR
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Premium Plan</h3>
                <div className="text-4xl font-bold text-cyan-400 mb-6">€29<span className="text-lg text-slate-400">/maand</span></div>
                <ul className="space-y-3 mb-8">
                  {pricingFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  onClick={handleLogin}
                >
                  Upgrade naar Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Word lid van duizenden traders die onze AI-gestuurde analyses gebruiken. 100% gratis.
          </p>
          <Button
            size="lg"
            onClick={handleLogin}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-12 py-4 text-lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Start met Analyseren
          </Button>
        </div>
      </div>
    </div>
  );
}
