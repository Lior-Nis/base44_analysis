
import React, { useState, useEffect } from 'react';
import { User, AdminTransaction } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Wallet,
  Search,
  Plus,
  Minus,
  History,
  User as UserIcon,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Eye,
  Calculator
} from 'lucide-react';

export default function BalanceManager() {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [transactions, setTransactions] = useState([]);
  
  // Balance adjustment states
  const [isAddingMoney, setIsAddingMoney] = useState(false); // Kept as it is set to false in validateAndExecute
  const [isCuttingMoney, setIsCuttingMoney] = useState(false); // Kept as it is set to false in validateAndExecute
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Security & audit
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    loadCurrentAdmin();
    loadRecentTransactions();
  }, []);

  const loadCurrentAdmin = async () => {
    try {
      const adminData = await User.me();
      if (adminData.role !== 'admin') {
        throw new Error('Unauthorized access');
      }
      setCurrentAdmin(adminData);
    } catch (error) {
      console.error('Admin authentication failed:', error);
      // Potentially redirect to login or show an error state
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const recentTransactions = await AdminTransaction.list('-created_date', 100);
      setTransactions(recentTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      alert('Please enter search term');
      return;
    }

    setIsSearching(true);
    try {
      // Search by email, phone, or name
      const users = await User.list();
      const filtered = users.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.includes(searchTerm) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.includes(searchTerm)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
      alert('Error searching users');
    }
    setIsSearching(false);
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchTerm('');
  };

  const validateAndExecute = async (type) => {
    if (isLocked) {
      alert("Panel is locked due to too many failed attempts.");
      return;
    }
    if (!selectedUser) {
      alert("Please select a user first.");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    if (Number(amount) > 100000) {
      alert('Amount cannot exceed ₹1,00,000 per transaction');
      return false;
    }
    if (!reason.trim()) {
      alert("Please provide a reason for this transaction.");
      return;
    }
    if (reason.length < 10) {
      alert('Reason must be at least 10 characters long');
      return false;
    }

    const numericAmount = Number(amount);

    if (type === 'debit' && numericAmount > selectedUser.wallet_balance) {
      alert("Cannot deduct more than the user's current balance.");
      setFailedAttempts(failedAttempts + 1);
      if (failedAttempts + 1 >= 3) {
        setIsLocked(true);
        alert("Too many failed attempts. Panel locked.");
      }
      return;
    }

    if (!confirm(`Are you sure you want to ${type === 'credit' ? 'ADD' : 'CUT'} ₹${numericAmount} ${type === 'credit' ? 'to' : 'from'} ${selectedUser.full_name || selectedUser.email}'s wallet? This action is irreversible.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const previousBalance = selectedUser.wallet_balance || 0;
      const newBalance = type === 'credit'
        ? previousBalance + numericAmount
        : previousBalance - numericAmount;

      // Update user balance
      await User.update(selectedUser.id, { wallet_balance: newBalance });

      // Create audit trail
      await AdminTransaction.create({
        user_id: selectedUser.id,
        admin_id: currentAdmin.id,
        transaction_type: type,
        amount: numericAmount,
        reason: reason,
        previous_balance: previousBalance,
        new_balance: newBalance,
        ip_address: 'N/A', // In a real app, get this from the request or use a server-side IP detection
        user_agent: navigator.userAgent
      });

      // Reset form and state
      alert(`Successfully ${type === 'credit' ? 'credited' : 'debited'} ₹${numericAmount}.`);
      setAmount('');
      setReason('');
      setSelectedUser({ ...selectedUser, wallet_balance: newBalance });
      setIsAddingMoney(false);
      setIsCuttingMoney(false);
      setFailedAttempts(0); // Reset on success
      loadRecentTransactions(); // Refresh logs

    } catch (error) {
      console.error(`Error processing ${type}:`, error);
      alert(`An error occurred. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickReasons = {
    credit: [
      'Manual bonus by admin',
      'Referral reward',
      'Compensation for technical issue',
      'Loyalty bonus',
      'Tournament prize adjustment',
      'Customer service goodwill',
      'Promotional bonus'
    ],
    debit: [
      'Duplicate bonus correction',
      'Fraud prevention action',
      'System error correction',
      'Chargeback adjustment',
      'Terms violation penalty',
      'Account review adjustment'
    ]
  };

  if (!currentAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center p-8 bg-slate-800 rounded-lg shadow-lg">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
          <p className="text-gray-400">Admin authentication required.</p>
          <p className="text-gray-500 text-sm mt-2">Please ensure you are logged in as an administrator.</p>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center p-8 bg-slate-800 rounded-lg shadow-lg">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold text-white mb-2">Panel Locked</h3>
          <p className="text-gray-400">Too many failed attempts. For security reasons, this panel is temporarily locked.</p>
          <p className="text-gray-500 text-sm mt-2">Please contact system administrator to unlock access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-400" />
            Player Balance Management System
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Admin: {currentAdmin.full_name || currentAdmin.email}</span>
            <Badge className="bg-green-500/20 text-green-300">Authorized</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="search">🔍 Search User</TabsTrigger>
              <TabsTrigger value="balance">💰 Manage Balance</TabsTrigger>
              <TabsTrigger value="history">📊 Transaction History</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-6">
              <Card className="bg-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Search Players</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter email, phone, name, or user ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <Button 
                      onClick={searchUsers}
                      disabled={isSearching}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Search Results:</h4>
                      {searchResults.map(user => (
                        <Card key={user.id} className="bg-slate-800/50 hover:bg-slate-800/70 cursor-pointer" 
                              onClick={() => selectUser(user)}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="text-white font-medium">{user.full_name || 'Unnamed User'}</h5>
                                <p className="text-gray-400 text-sm">{user.email}</p>
                                <p className="text-gray-400 text-sm">Phone: {user.phone_number || 'Not provided'}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-400">₹{user.wallet_balance || 0}</div>
                                <div className="text-sm text-gray-400">Current Balance</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="balance" className="space-y-6">
              {selectedUser ? (
                <div className="space-y-6">
                  {/* Selected User Info */}
                  <Card className="bg-slate-700/50">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedUser.full_name || 'Unnamed User'}</h3>
                          <p className="text-gray-400">{selectedUser.email}</p>
                          <p className="text-gray-400 text-sm">ID: {selectedUser.id.slice(-8)}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-400">₹{selectedUser.wallet_balance || 0}</div>
                          <div className="text-sm text-gray-400">Current Balance</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-slate-800/50 p-3 rounded">
                          <div className="text-gray-400">Total Deposited</div>
                          <div className="text-white font-bold">₹{selectedUser.total_deposited || 0}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded">
                          <div className="text-gray-400">Total Withdrawn</div>
                          <div className="text-white font-bold">₹{selectedUser.total_withdrawn || 0}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded">
                          <div className="text-gray-400">Total Winnings</div>
                          <div className="text-green-400 font-bold">₹{selectedUser.total_winnings || 0}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Balance Actions */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Add Money */}
                    <Card className="bg-green-500/10 border-green-500/30">
                      <CardHeader>
                        <CardTitle className="text-green-400 flex items-center gap-2">
                          <Plus className="w-5 h-5" />
                          Add Money
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-white">Amount (₹)</Label>
                          <Input
                            type="number"
                            placeholder="Enter amount to add"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-slate-800 border-slate-600 text-white"
                            max="100000"
                            min="1"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Reason</Label>
                          <Textarea
                            placeholder="Enter reason for adding money..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                          <div className="mt-2">
                            <Label className="text-gray-400 text-sm">Quick Reasons:</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {quickReasons.credit.map((quickReason, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setReason(quickReason)}
                                  className="text-xs border-green-500/30 text-green-300 hover:bg-green-500/10"
                                >
                                  {quickReason}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => validateAndExecute('credit')}
                          disabled={isProcessing || !amount || !reason}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? 'Processing...' : `Add ₹${amount || '0'} to Wallet`}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Cut Money */}
                    <Card className="bg-red-500/10 border-red-500/30">
                      <CardHeader>
                        <CardTitle className="text-red-400 flex items-center gap-2">
                          <Minus className="w-5 h-5" />
                          Deduct Money
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Alert className="border-red-500/30 bg-red-500/10">
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                          <AlertDescription className="text-red-300">
                            <strong>Warning:</strong> This action will permanently reduce the user's balance.
                          </AlertDescription>
                        </Alert>
                        <div>
                          <Label className="text-white">Amount (₹)</Label>
                          <Input
                            type="number"
                            placeholder="Enter amount to deduct"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-slate-800 border-slate-600 text-white"
                            max={selectedUser.wallet_balance || 0}
                            min="1"
                          />
                          <div className="text-sm text-gray-400 mt-1">
                            Max: ₹{selectedUser.wallet_balance || 0}
                          </div>
                        </div>
                        <div>
                          <Label className="text-white">Reason (Required)</Label>
                          <Textarea
                            placeholder="Enter detailed reason for deducting money..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                          <div className="mt-2">
                            <Label className="text-gray-400 text-sm">Quick Reasons:</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {quickReasons.debit.map((quickReason, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setReason(quickReason)}
                                  className="text-xs border-red-500/30 text-red-300 hover:bg-red-500/10"
                                >
                                  {quickReason}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => validateAndExecute('debit')}
                          disabled={isProcessing || !amount || !reason}
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          {isProcessing ? 'Processing...' : `Deduct ₹${amount || '0'} from Wallet`}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="bg-slate-700/50">
                  <CardContent className="p-12 text-center">
                    <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">No User Selected</h3>
                    <p className="text-gray-400">Search and select a user to manage their balance</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="bg-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Admin Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-600">
                        <TableHead className="text-white">Date & Time</TableHead>
                        <TableHead className="text-white">User</TableHead>
                        <TableHead className="text-white">Type</TableHead>
                        <TableHead className="text-white">Amount</TableHead>
                        <TableHead className="text-white">Balance Change</TableHead>
                        <TableHead className="text-white">Reason</TableHead>
                        <TableHead className="text-white">Admin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id} className="border-slate-600">
                          <TableCell className="text-gray-300">
                            {new Date(transaction.created_date).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-white">
                            {transaction.user_id.slice(-8)}...
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              transaction.transaction_type === 'credit' 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-red-500/20 text-red-300'
                            }>
                              {transaction.transaction_type === 'credit' ? (
                                <Plus className="w-3 h-3 mr-1" />
                              ) : (
                                <Minus className="w-3 h-3 mr-1" />
                              )}
                              {transaction.transaction_type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className={
                            transaction.transaction_type === 'credit' 
                              ? 'text-green-400 font-bold' 
                              : 'text-red-400 font-bold'
                          }>
                            {transaction.transaction_type === 'credit' ? '+' : '-'}₹{transaction.amount}
                          </TableCell>
                          <TableCell className="text-gray-300 text-sm">
                            ₹{transaction.previous_balance} → ₹{transaction.new_balance}
                          </TableCell>
                          <TableCell className="text-gray-300 text-sm max-w-xs truncate">
                            {transaction.reason}
                          </TableCell>
                          <TableCell className="text-gray-300 text-sm">
                            {transaction.admin_id.slice(-6)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
