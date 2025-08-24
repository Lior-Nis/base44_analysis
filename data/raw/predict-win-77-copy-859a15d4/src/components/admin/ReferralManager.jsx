import React, { useState, useEffect } from 'react';
import { User, Referral } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';

export default function ReferralManager() {
    const [referrals, setReferrals] = useState([]);
    const [topReferrers, setTopReferrers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const allReferrals = await Referral.list('-created_date', 100);
            setReferrals(allReferrals);
            
            const users = await User.list();
            const referrerCounts = users.reduce((acc, user) => {
                if (user.referred_by) {
                    acc[user.referred_by] = (acc[user.referred_by] || 0) + 1;
                }
                return acc;
            }, {});

            const sortedReferrers = Object.entries(referrerCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([id, count]) => {
                    const u = users.find(user => user.id === id);
                    return { ...u, referral_count: count };
                });
            
            setTopReferrers(sortedReferrers);
        };
        fetchData();
    }, []);

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Gift className="text-yellow-400" />
                        Top 5 Referrers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-600">
                                <TableHead className="text-white">User</TableHead>
                                <TableHead className="text-white">Referral Count</TableHead>
                                <TableHead className="text-white">Total Earnings</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topReferrers.map(user => (
                                <TableRow key={user.id} className="border-slate-600">
                                    <TableCell>{user.full_name || user.email}</TableCell>
                                    <TableCell>{user.referral_count}</TableCell>
                                    <TableCell>₹{user.referral_earnings || 0}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="text-white">Recent Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow className="border-slate-600">
                                <TableHead className="text-white">Referrer ID</TableHead>
                                <TableHead className="text-white">Referred ID</TableHead>
                                <TableHead className="text-white">Bonus</TableHead>
                                <TableHead className="text-white">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {referrals.map(ref => (
                                <TableRow key={ref.id} className="border-slate-600">
                                    <TableCell>{ref.referrer_id.slice(-6)}</TableCell>
                                    <TableCell>{ref.referred_id.slice(-6)}</TableCell>
                                    <TableCell>₹{ref.bonus_amount}</TableCell>
                                    <TableCell>{new Date(ref.created_date).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}