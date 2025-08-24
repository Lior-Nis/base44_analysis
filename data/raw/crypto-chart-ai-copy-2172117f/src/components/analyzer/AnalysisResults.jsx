import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Clock, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

export default function AnalysisResults({ analysis }) {
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

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Main Recommendation Card */}
      <Card className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Trading Aanbeveling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Badge className={`text-lg px-4 py-2 ${getRecommendationColor(analysis.recommendation)}`}>
                {getRecommendationIcon(analysis.recommendation)}
                <span className="ml-2 font-bold">{analysis.recommendation?.toUpperCase()}</span>
              </Badge>
              {analysis.crypto_symbol && (
                <div className="text-white">
                  <span className="text-2xl font-bold">{analysis.crypto_symbol}</span>
                  {analysis.timeframe && (
                    <span className="text-slate-400 ml-2">({analysis.timeframe})</span>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Vertrouwensscore</p>
              <p className={`text-2xl font-bold ${getConfidenceColor(analysis.confidence_score)}`}>
                {analysis.confidence_score}%
              </p>
            </div>
          </div>

          {analysis.timing_recommendation && (
            <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">Timing Aanbeveling</span>
              </div>
              <p className="text-slate-300">{analysis.timing_recommendation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Levels */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Prijs Niveaus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.entry_price && (
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">Entry Price</p>
                <p className="text-2xl font-bold text-blue-400">${analysis.entry_price}</p>
              </div>
            )}
            {analysis.stop_loss && (
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">Stop Loss</p>
                <p className="text-2xl font-bold text-red-400">${analysis.stop_loss}</p>
              </div>
            )}
            {analysis.take_profit && (
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">Take Profit</p>
                <p className="text-2xl font-bold text-green-400">${analysis.take_profit}</p>
              </div>
            )}
          </div>

          {analysis.risk_reward_ratio && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">Risk/Reward Ratio</span>
                </div>
                <span className="text-2xl font-bold text-purple-400">
                  1:{analysis.risk_reward_ratio?.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Analysis */}
      {analysis.technical_indicators && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Technische Indicatoren
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.technical_indicators.rsi && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">RSI</span>
                  <span className="text-white font-medium">{analysis.technical_indicators.rsi}</span>
                </div>
              )}
              {analysis.technical_indicators.macd && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">MACD</span>
                  <span className="text-white font-medium">{analysis.technical_indicators.macd}</span>
                </div>
              )}
              {analysis.technical_indicators.moving_averages && (
                <div>
                  <span className="text-slate-300">Moving Averages</span>
                  <p className="text-white font-medium mt-1">{analysis.technical_indicators.moving_averages}</p>
                </div>
              )}
              {analysis.technical_indicators.support_resistance && (
                <div>
                  <span className="text-slate-300">Support & Resistance</span>
                  <p className="text-white font-medium mt-1">{analysis.technical_indicators.support_resistance}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Conditions */}
      {analysis.market_conditions && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Markt Condities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">{analysis.market_conditions}</p>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis */}
      {analysis.analysis_details && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Gedetailleerde Analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 whitespace-pre-line">{analysis.analysis_details}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}