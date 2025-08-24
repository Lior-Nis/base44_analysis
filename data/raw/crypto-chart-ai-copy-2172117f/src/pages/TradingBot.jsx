import React, { useState, useEffect, useRef } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Cpu, Shield, Key, Power, PowerOff, Terminal, Check } from "lucide-react";

export default function TradingBotPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [botLogs, setBotLogs] = useState([]);
  const logIntervalRef = useRef(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    loadUser();
    return () => clearInterval(logIntervalRef.current);
  }, []);

  useEffect(() => {
    if (isBotRunning) {
      startBotSimulation();
    } else {
      clearInterval(logIntervalRef.current);
    }
  }, [isBotRunning]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [botLogs]);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setApiKey(userData.bybit_api_key || "");
      // We don't pre-fill the secret for security
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  };

  const addLog = (message, type = 'info') => {
    setBotLogs(prev => [...prev, { time: new Date(), message, type }]);
  };

  const startBotSimulation = () => {
    addLog("AI Trading Bot gestart...", 'success');
    logIntervalRef.current = setInterval(() => {
      const randomAction = Math.random();
      if (randomAction < 0.2) {
        addLog("Markten scannen op nieuwe kansen...");
      } else if (randomAction < 0.4) {
        addLog("Potentiële LONG setup gevonden voor ETH/USDT. Analyseren...");
      } else if (randomAction < 0.6) {
        addLog("Alle indicatoren zijn neutraal. Posities behouden.");
      } else if (randomAction < 0.8) {
        addLog("Potentiële SHORT setup gevonden voor BTC/USDT. Analyseren...");
      } else {
        const tradeType = Math.random() > 0.5 ? 'LONG' : 'SHORT';
        const pair = Math.random() > 0.5 ? 'BTC/USDT' : 'ETH/USDT';
        addLog(`[SIMULATIE] ${tradeType} trade geplaatst op ${pair}`, 'trade');
      }
    }, 5000);
  };

  const handleSaveKeys = async () => {
    setIsSaving(true);
    await User.updateMyUserData({ 
      bybit_api_key: apiKey,
      bybit_api_secret: apiSecret,
    });
    setIsSaving(false);
    alert("API Sleutels opgeslagen!");
  };

  const handleToggleBot = () => {
    if (!apiKey || !apiSecret) {
      alert("Voer eerst uw API sleutels in.");
      return;
    }
    setIsBotRunning(!isBotRunning);
    if (!isBotRunning) {
      setBotLogs([]);
    } else {
      addLog("AI Trading Bot gestopt.", 'error');
    }
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">AI Trading Bot</h1>
          <p className="text-slate-300">Automatiseer je trades via je Bybit account.</p>
        </div>

        <Alert variant="destructive" className="mb-8 border-yellow-500/50 bg-yellow-500/10 text-yellow-300">
          <Shield className="h-4 w-4 !text-yellow-400" />
          <AlertTitle className="!text-yellow-300">Belangrijke Mededeling</AlertTitle>
          <AlertDescription>
            Dit is een **simulatie**. De daadwerkelijke, veilige verbinding met Bybit vereist backend-functionaliteit. Voer uw echte API-sleutels hier **NIET** in tenzij de backend is geactiveerd door het base44-team.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Column 1: Configuration */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Bybit API Configuratie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api-key" className="text-slate-300">API Key</Label>
                  <Input 
                    id="api-key" 
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Uw Bybit API Key" 
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="api-secret" className="text-slate-300">API Secret</Label>
                  <Input 
                    id="api-secret" 
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="Uw Bybit API Secret" 
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={handleSaveKeys} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700">
                  {isSaving ? "Opslaan..." : "Sleutels Opslaan"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Bot Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-300">Bot Status:</span>
                  <span className={`font-bold ${isBotRunning ? 'text-green-400' : 'text-red-400'}`}>
                    {isBotRunning ? 'Actief' : 'Gestopt'}
                  </span>
                </div>
                <Button 
                  onClick={handleToggleBot}
                  className={`w-full ${isBotRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isBotRunning ? <PowerOff className="w-4 h-4 mr-2" /> : <Power className="w-4 h-4 mr-2" />}
                  {isBotRunning ? 'Stop Bot' : 'Start Bot'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Live Log */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Live Bot Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black/50 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                  {botLogs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-slate-500">{log.time.toLocaleTimeString()}</span>
                      <span className={
                        log.type === 'success' ? 'text-green-400' : 
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'trade' ? 'text-cyan-400' :
                        'text-slate-300'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}