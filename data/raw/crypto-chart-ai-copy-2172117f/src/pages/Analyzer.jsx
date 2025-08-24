
import React, { useState, useRef } from "react";
import { User } from "@/api/entities";
import { ChartAnalysis } from "@/api/entities";
import { UploadFile, InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Camera, Image as ImageIcon, AlertCircle, TrendingUp, TrendingDown, Target, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import UploadZone from "../components/analyzer/UploadZone";
import AnalysisResults from "../components/analyzer/AnalysisResults";

const sanitizeAnalysisData = (data) => {
  if (!data) return {};
  const sanitized = { ...data };

  // Sanitize top-level numeric fields
  const numericFields = ['confidence_score', 'entry_price', 'stop_loss', 'take_profit', 'risk_reward_ratio'];
  numericFields.forEach(field => {
    if (sanitized[field] !== undefined && sanitized[field] !== null) {
      // Convert to string to handle potential number-like strings, then remove non-numeric chars except . and -
      const parsed = parseFloat(String(sanitized[field]).replace(/[^0-9.-]+/g, ""));
      sanitized[field] = isNaN(parsed) ? null : parsed;
    } else {
      sanitized[field] = null; // Ensure null if undefined/null
    }
  });

  // Sanitize recommendation enum
  if (sanitized.recommendation) {
    sanitized.recommendation = String(sanitized.recommendation).toLowerCase();
    const validRecs = ["long", "short", "hold", "wait"];
    if (!validRecs.includes(sanitized.recommendation)) {
      sanitized.recommendation = 'wait'; // Default to 'wait' if invalid
    }
  } else {
    sanitized.recommendation = 'wait'; // Default to 'wait' if undefined/null
  }

  // Sanitize nested technical_indicators object and its numeric fields
  if (sanitized.technical_indicators) {
    if (typeof sanitized.technical_indicators !== 'object' || sanitized.technical_indicators === null) {
      sanitized.technical_indicators = {}; // Ensure it's an object
    }

    if (sanitized.technical_indicators.rsi !== undefined && sanitized.technical_indicators.rsi !== null) {
      const parsedRsi = parseFloat(String(sanitized.technical_indicators.rsi).replace(/[^0-9.-]+/g, ""));
      sanitized.technical_indicators.rsi = isNaN(parsedRsi) ? null : parsedRsi;
    } else {
      sanitized.technical_indicators.rsi = null; // Ensure null if undefined/null
    }
  } else {
    sanitized.technical_indicators = {}; // Ensure technical_indicators exists as an object
  }

  // Ensure other string fields are strings, or null if empty/invalid
  const stringFields = ['crypto_symbol', 'timeframe', 'market_conditions', 'analysis_details', 'timing_recommendation', 'macd', 'moving_averages', 'support_resistance'];
  stringFields.forEach(field => {
    if (sanitized[field] !== undefined && sanitized[field] !== null) {
      sanitized[field] = String(sanitized[field]);
    } else {
      sanitized[field] = null; // Set to null if undefined/null
    }
  });

  // For nested strings in technical_indicators
  if (sanitized.technical_indicators) {
    const nestedStringFields = ['macd', 'moving_averages', 'support_resistance'];
    nestedStringFields.forEach(field => {
      if (sanitized.technical_indicators[field] !== undefined && sanitized.technical_indicators[field] !== null) {
        sanitized.technical_indicators[field] = String(sanitized.technical_indicators[field]);
      } else {
        sanitized.technical_indicators[field] = null;
      }
    });
  }

  return sanitized;
};


export default function AnalyzerPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (file) => {
    if (!user) return;

    setError(null);
    setIsAnalyzing(true);
    setUploadedFile(file);

    try {
      // Upload the file
      const { file_url } = await UploadFile({ file });

      // Analyze the chart with AI
      const analysisPrompt = `
        Analyseer deze cryptocurrency chart screenshot als een professionele crypto trader. 
        Geef een gedetailleerde technische analyse met de volgende informatie:

        1. Identificeer het cryptocurrency symbool en timeframe indien mogelijk
        2. Geef een duidelijke trading aanbeveling: LONG, SHORT, HOLD, of WAIT
        3. Bepaal entry price, stop loss en take profit levels
        4. Bereken risico/beloning ratio
        5. Analyseer technische indicatoren (RSI, MACD, moving averages)
        6. Identificeer support en resistance levels
        7. Beoordeel algemene marktomstandigheden
        8. Geef timing aanbeveling voor entry
        9. Geef een vertrouwensscore (0-100%)

        Wees specifiek met prijsniveaus indien zichtbaar in de chart.
        Leg uit waarom je deze aanbeveling geeft.
      `;

      const analysisResponse = await InvokeLLM({
        prompt: analysisPrompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            crypto_symbol: { type: "string" },
            timeframe: { type: "string" },
            recommendation: { 
              type: "string",
              enum: ["long", "short", "hold", "wait"]
            },
            confidence_score: { 
              type: "number",
              minimum: 0,
              maximum: 100
            },
            entry_price: { type: "number" },
            stop_loss: { type: "number" },
            take_profit: { type: "number" },
            risk_reward_ratio: { type: "number" },
            market_conditions: { type: "string" },
            technical_indicators: {
              type: "object",
              properties: {
                rsi: { type: "number" },
                macd: { type: "string" },
                moving_averages: { type: "string" },
                support_resistance: { type: "string" }
              }
            },
            analysis_details: { type: "string" },
            timing_recommendation: { type: "string" }
          }
        }
      });

      // Sanitize the response from the LLM
      const sanitizedResponse = sanitizeAnalysisData(analysisResponse);

      // Save the analysis
      const analysisData = {
        ...sanitizedResponse,
        chart_image_url: file_url
      };

      const savedAnalysis = await ChartAnalysis.create(analysisData);
      setAnalysisResult(savedAnalysis);

      // Update user stats
      await User.updateMyUserData({
        total_analyses: (user.total_analyses || 0) + 1
      });

      // Refresh user data
      const updatedUser = await User.me();
      setUser(updatedUser);

    } catch (error) {
      console.error("Analysis error:", error);
      setError("Er is een fout opgetreden bij het analyseren van de chart. Probeer het opnieuw.");
    }

    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setUploadedFile(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Chart Analyzer</h1>
            <p className="text-slate-300">Upload een crypto chart screenshot voor professionele analyse</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            {!analysisResult && (
              <UploadZone 
                onFileUpload={handleFileUpload}
                isAnalyzing={isAnalyzing}
                uploadedFile={uploadedFile}
              />
            )}

            {analysisResult && (
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Geanalyseerde Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={analysisResult.chart_image_url} 
                    alt="Analyzed chart"
                    className="w-full rounded-lg border border-slate-600"
                  />
                  <Button 
                    onClick={resetAnalysis}
                    variant="outline"
                    className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Nieuwe Analyse Starten
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            {analysisResult && (
              <AnalysisResults analysis={analysisResult} />
            )}

            {!analysisResult && !isAnalyzing && (
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Wat analyseren we?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-slate-300">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Long/Short Signalen</p>
                          <p className="text-sm text-slate-400">Exacte entry points met stop loss en take profit</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TrendingDown className="w-5 h-5 text-red-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Technische Indicatoren</p>
                          <p className="text-sm text-slate-400">RSI, MACD, moving averages analyse</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Risk Management</p>
                          <p className="text-sm text-slate-400">Automatische risico/beloning berekening</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Pro Tip</h3>
                    <p className="text-slate-300">
                      Voor de beste resultaten, upload charts met duidelijk zichtbare prijsniveaus en timeframes. 
                      Screenshots van TradingView werken het beste!
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
