
import React, { useState, useEffect } from "react";
import { Affiliate } from "@/api/entities";
import { Purchase } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, DollarSign, TrendingUp, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function Affiliates() {
  const [affiliates, setAffiliates] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAffiliate, setNewAffiliate] = useState({
    affiliate_email: "",
    affiliate_code: "",
    commission_rate: 0.10
  });

  useEffect(() => {
    loadAffiliates();
    loadPurchases();
  }, []);

  const loadAffiliates = async () => {
    try {
      const data = await Affiliate.list("-created_date");
      setAffiliates(data);
    } catch (error) {
      console.error("Error loading affiliates:", error);
    }
    setLoading(false);
  };

  const loadPurchases = async () => {
    try {
      const data = await Purchase.list();
      setPurchases(data);
    } catch (error) {
      console.error("Error loading purchases:", error);
    }
  };

  const createAffiliate = async () => {
    if (!newAffiliate.affiliate_email || !newAffiliate.affiliate_code) return;
    
    try {
      await Affiliate.create(newAffiliate);
      setNewAffiliate({ affiliate_email: "", affiliate_code: "", commission_rate: 0.10 });
      setShowCreateForm(false);
      loadAffiliates();
    } catch (error) {
      console.error("Error creating affiliate:", error);
    }
  };

  const toggleAffiliateStatus = async (affiliateId, currentStatus) => {
    try {
      await Affiliate.update(affiliateId, { is_active: !currentStatus });
      loadAffiliates();
    } catch (error) {
      console.error("Error updating affiliate:", error);
    }
  };

  const copyReferralLink = (code) => {
    const link = `${window.location.origin}${createPageUrl("Catalog")}?ref=${code}`;
    navigator.clipboard.writeText(link);
    alert("Referral link copied to clipboard!");
  };

  const generateRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setNewAffiliate(prev => ({ ...prev, affiliate_code: code }));
  };

  const calculateStats = () => {
    const totalEarnings = affiliates.reduce((sum, aff) => sum + aff.total_earnings, 0);
    const activeAffiliates = affiliates.filter(aff => aff.is_active).length;
    const totalReferrals = affiliates.reduce((sum, aff) => sum + aff.total_referrals, 0);
    
    return { totalEarnings, activeAffiliates, totalReferrals };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Affiliate Program</h1>
            <p className="text-slate-600">Manage your referral partners and track commissions</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Affiliate
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold text-slate-900">${stats.totalEarnings.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500 bg-opacity-10">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Active Affiliates</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.activeAffiliates}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500 bg-opacity-10">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Referrals</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalReferrals}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500 bg-opacity-10">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Create Affiliate Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Affiliate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Affiliate Email</label>
                  <Input
                    value={newAffiliate.affiliate_email}
                    onChange={(e) => setNewAffiliate(prev => ({ ...prev, affiliate_email: e.target.value }))}
                    placeholder="affiliate@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Referral Code</label>
                  <div className="flex gap-2">
                    <Input
                      value={newAffiliate.affiliate_code}
                      onChange={(e) => setNewAffiliate(prev => ({ ...prev, affiliate_code: e.target.value.toUpperCase() }))}
                      placeholder="AFFILIATE123"
                    />
                    <Button variant="outline" onClick={generateRandomCode}>
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    step="0.01"
                    value={newAffiliate.commission_rate * 100}
                    onChange={(e) => setNewAffiliate(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) / 100 }))}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={createAffiliate}>Create Affiliate</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Affiliates List */}
        <Card>
          <CardHeader>
            <CardTitle>All Affiliates</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="h-6 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {affiliates.map((affiliate) => (
                  <div key={affiliate.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">{affiliate.affiliate_email}</h3>
                          <Badge 
                            className={affiliate.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {affiliate.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {affiliate.affiliate_code}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                          <span>Commission: {(affiliate.commission_rate * 100)}%</span>
                          <span>Referrals: {affiliate.total_referrals}</span>
                          <span>Earnings: ${affiliate.total_earnings.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyReferralLink(affiliate.affiliate_code)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAffiliateStatus(affiliate.id, affiliate.is_active)}
                          className={affiliate.is_active ? 'text-red-600' : 'text-green-600'}
                        >
                          {affiliate.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
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
