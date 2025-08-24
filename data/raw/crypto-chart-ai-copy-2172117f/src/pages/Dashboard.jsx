
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { ChartAnalysis } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Target, Clock, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AdBanner from "../components/dashboard/AdBanner"; // Added import

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const analysesData = await ChartAnalysis.list('-created_date', 20);
      setAnalyses(analysesData);
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case 'long': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'short': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'hold': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'wait': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case 'long': return <ArrowUp className="w-4 h-4" />;
      case 'short': return <ArrowDown className="w-4 h-4" />;
      case 'hold': return <Minus className="w-4 h-4" />;
      case 'wait': return <Clock className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getStats = () => {
    const longCount = analyses.filter(a => a.recommendation === 'long').length;
    const shortCount = analyses.filter(a => a.recommendation === 'short').length;
    const avgConfidence = analyses.length > 0 
      ? analyses.reduce((sum, a) => sum + (a.confidence_score || 0), 0) / analyses.length 
      : 0;

    return { longCount, shortCount, avgConfidence };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-300">Overzicht van je trading analyses</p>
          </div>
          <Link to={createPageUrl("Analyzer")}>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
              <Target className="w-4 h-4 mr-2" />
              Nieuwe Analyse
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Totaal Analyses</p>
                  <p className="text-2xl font-bold text-white">{user?.total_analyses || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Long Signalen</p>
                  <p className="text-2xl font-bold text-green-400">{stats.longCount}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Short Signalen</p>
                  <p className="text-2xl font-bold text-red-400">{stats.shortCount}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <ArrowDown className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Gem. Vertrouwen</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.avgConfidence.toFixed(0)}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Ad Banner */}
        <div className="mb-8">
            <AdBanner />
        </div>


        {/* Recent Analyses */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recente Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg mb-4">Nog geen analyses uitgevoerd</p>
                <Link to={createPageUrl("Analyzer")}>
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                    Start je eerste analyse
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <img 
                      src={analysis.chart_image_url} 
                      alt="Chart"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-600"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`${getRecommendationColor(analysis.recommendation)}`}>
                          {getRecommendationIcon(analysis.recommendation)}
                          <span className="ml-2 font-bold">{analysis.recommendation?.toUpperCase()}</span>
                        </Badge>
                        {analysis.crypto_symbol && (
                          <span className="text-white font-medium">{analysis.crypto_symbol}</span>
                        )}
                        {analysis.confidence_score && (
                          <span className="text-slate-400">{analysis.confidence_score}% vertrouwen</span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        {analysis.entry_price && (
                          <span className="text-slate-300">Entry: <span className="text-blue-400">${analysis.entry_price}</span></span>
                        )}
                        {analysis.stop_loss && (
                          <span className="text-slate-300">SL: <span className="text-red-400">${analysis.stop_loss}</span></span>
                        )}
                        {analysis.take_profit && (
                          <span className="text-slate-300">TP: <span className="text-green-400">${analysis.take_profit}</span></span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-slate-400 text-sm">
                        {format(new Date(analysis.created_date), 'dd MMM yyyy', { locale: nl })}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {format(new Date(analysis.created_date), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
