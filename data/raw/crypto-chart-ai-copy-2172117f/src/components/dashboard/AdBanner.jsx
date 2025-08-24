import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Zap } from "lucide-react";

export default function AdBanner() {
  return (
    <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 relative overflow-hidden">
      <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-white mb-1">Upgrade je Trading Setup</h3>
          <p className="text-slate-300">
            Ontdek onze partners voor de beste hardware wallets en trading platformen.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-800"
          asChild
        >
          <a href="#" target="_blank" rel="noopener noreferrer">
            Bekijk Partners
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardContent>
      <Badge variant="secondary" className="absolute top-2 right-2 text-xs bg-slate-700/50 text-slate-400">Advertentie</Badge>
    </Card>
  );
}