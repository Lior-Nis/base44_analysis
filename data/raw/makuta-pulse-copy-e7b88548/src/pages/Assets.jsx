
import React, { useState, useEffect } from "react";
import { AssetPrice } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Coins, 
  ImageIcon, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  RefreshCw,
  DollarSign,
  BarChart3
} from "lucide-react";

import PriceChart from "../components/dashboard/PriceChart";

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const data = await AssetPrice.list('-created_date');
      setAssets(data);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
    setIsLoading(false);
  };

  const generateMockAssets = () => [
    {
      id: 1,
      asset_name: "MKTZ Token",
      asset_type: "token",
      price_usd: 0.000234,
      price_change_24h: 15.7,
      volume_24h: 1250,
      market_cap: 23400,
      description: "Main MAKUTA ecosystem token on Sui blockchain"
    },
    {
      id: 2,
      asset_name: "Makuta Gorilla #1",
      asset_type: "nft",
      price_usd: 0.05,
      price_change_24h: -2.3,
      volume_24h: 0,
      market_cap: null,
      description: "Unique Congolese Gorilla NFT inspired by The Lion King"
    },
    {
      id: 3,
      asset_name: "Makuta Okapi #2",
      asset_type: "nft",
      price_usd: 0.04,
      price_change_24h: 8.1,
      volume_24h: 0,
      market_cap: null,
      description: "Rare Okapi NFT representing Congo's endemic wildlife"
    },
    {
      id: 4,
      asset_name: "MAKUTA Elephant #3",
      asset_type: "nft",
      price_usd: 0.06,
      price_change_24h: 12.4,
      volume_24h: 0,
      market_cap: null,
      description: "Majestic Elephant NFT from the MAKUTA collection"
    }
  ];

  const mockAssets = generateMockAssets();
  const displayAssets = assets.length > 0 ? assets : mockAssets;

  const generatePriceHistory = (basePrice) => {
    const days = 30;
    const data = [];
    let currentPrice = basePrice;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.2;
      currentPrice = currentPrice * (1 + variation);
      
      data.push({
        date: date.toISOString(),
        price: Math.max(currentPrice, basePrice * 0.5)
      });
    }
    
    return data;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">
            Digital Assets Portfolio
          </h1>
          <p className="text-emerald-600 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Track MKTZ token and NFT collection performance
          </p>
        </div>
        <Button 
          onClick={loadAssets}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Prices
        </Button>
      </div>

      {/* Assets Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid gap-4">
            {displayAssets.map((asset) => (
              <Card 
                key={asset.id} 
                className={`bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  selectedAsset?.id === asset.id ? 'ring-2 ring-emerald-500' : ''
                }`}
                onClick={() => setSelectedAsset(asset)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${
                        asset.asset_type === 'token' 
                          ? 'bg-gradient-to-r from-emerald-100 to-emerald-200' 
                          : 'bg-gradient-to-r from-yellow-100 to-yellow-200'
                      }`}>
                        {asset.asset_type === 'token' ? (
                          <Coins className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-slate-900">{asset.asset_name}</CardTitle>
                        <p className="text-sm text-slate-600 capitalize">
                          {asset.asset_type} • {asset.description}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      asset.asset_type === 'token' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }>
                      {asset.asset_type.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Current Price</p>
                      <p className="font-bold text-slate-900">
                        ${asset.price_usd?.toFixed(6) || '0.000000'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">24h Change</p>
                      <div className={`flex items-center gap-1 ${
                        (asset.price_change_24h || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {(asset.price_change_24h || 0) >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="font-medium">
                          {Math.abs(asset.price_change_24h || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">24h Volume</p>
                      <p className="font-medium text-slate-900">
                        ${(asset.volume_24h || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        {asset.asset_type === 'token' ? 'Market Cap' : 'Listings'}
                      </p>
                      <p className="font-medium text-slate-900">
                        {asset.asset_type === 'token' 
                          ? `$${(asset.market_cap || 0).toLocaleString()}`
                          : 'OpenSea'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {asset.asset_type === 'nft' && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <a
                        href="https://opensea.io/collection/makuta-collectibles"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on OpenSea <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Price Chart Sidebar */}
        <div className="space-y-6">
          {selectedAsset ? (
            <>
              <PriceChart
                title={`${selectedAsset.asset_name} Price History`}
                data={generatePriceHistory(selectedAsset.price_usd)}
                color={selectedAsset.asset_type === 'token' ? '#059669' : '#D97706'}
              />
              
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Asset Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Name</p>
                    <p className="font-medium text-slate-900">{selectedAsset.asset_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Type</p>
                    <Badge className={
                      selectedAsset.asset_type === 'token' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }>
                      {selectedAsset.asset_type.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Description</p>
                    <p className="text-sm text-slate-800">{selectedAsset.description}</p>
                  </div>
                  {selectedAsset.asset_type === 'token' && (
                    <>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Blockchain</p>
                        <p className="font-medium text-slate-900">Sui Network</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Status</p>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Verification Pending
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 mb-2">Select an Asset</p>
                <p className="text-sm text-slate-500">
                  Click on any asset to view detailed price charts and information
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
