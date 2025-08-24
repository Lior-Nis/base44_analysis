import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { DepositRequest, WithdrawRequest } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet as WalletIcon, 
  Plus, 
  Minus, 
  QrCode,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Camera
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUpiId, setWithdrawUpiId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [uniqueCode, setUniqueCode] = useState('');

  const UPI_NUMBER = "9508621526";
  const UPI_ID = "9508621526@upi";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Generate or get unique code
      let code = userData.unique_code;
      if (!code) {
        code = `USER${userData.id.slice(-6).toUpperCase()}`;
        await User.updateMyUserData({ unique_code: code });
        setUniqueCode(code);
      } else {
        setUniqueCode(code);
      }

      // Load user's transactions
      const userDeposits = await DepositRequest.filter({ user_id: userData.id }, '-created_date');
      const userWithdrawals = await WithdrawRequest.filter({ user_id: userData.id }, '-created_date');
      
      setDeposits(userDeposits);
      setWithdrawals(userWithdrawals);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || depositAmount < 100) {
      alert("Minimum deposit amount is ₹100");
      return;
    }

    setIsLoading(true);
    try {
      let screenshotUrl = '';
      if (screenshot) {
        const uploadResult = await UploadFile({ file: screenshot });
        screenshotUrl = uploadResult.file_url;
      }

      await DepositRequest.create({
        user_id: user.id,
        amount: Number(depositAmount),
        transaction_id: transactionId,
        screenshot_url: screenshotUrl,
        unique_note: uniqueCode,
        status: 'pending'
      });

      alert("Deposit request submitted! We'll verify and add money to your wallet within 10 minutes.");
      setDepositAmount('');
      setTransactionId('');
      setScreenshot(null);
      loadData();
    } catch (error) {
      console.error("Error submitting deposit:", error);
      alert("Error submitting deposit request");
    }
    setIsLoading(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount < 100) {
      alert("Minimum withdrawal amount is ₹100");
      return;
    }
    if (!withdrawUpiId) {
      alert("Please enter your UPI ID");
      return;
    }
    if (Number(withdrawAmount) > user.wallet_balance) {
      alert("Insufficient wallet balance");
      return;
    }

    setIsLoading(true);
    try {
      await WithdrawRequest.create({
        user_id: user.id,
        amount: Number(withdrawAmount),
        upi_id: withdrawUpiId,
        status: 'pending'
      });

      alert("Withdrawal request submitted! We'll process it within 24 hours.");
      setWithdrawAmount('');
      setWithdrawUpiId('');
      loadData();
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      alert("Error submitting withdrawal request");
    }
    setIsLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Wallet</h1>
          <p className="text-gray-300">Manage your account balance and transactions</p>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 mb-8">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <WalletIcon className="w-12 h-12 text-purple-400" />
              <div>
                <div className="text-4xl lg:text-5xl font-bold text-white">
                  ₹{user?.wallet_balance || 0}
                </div>
                <div className="text-gray-300">Available Balance</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-gray-400">Total Deposited</div>
                <div className="text-white font-bold">₹{user?.total_deposited || 0}</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-gray-400">Total Withdrawn</div>
                <div className="text-white font-bold">₹{user?.total_withdrawn || 0}</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-gray-400">Total Winnings</div>
                <div className="text-green-400 font-bold">₹{user?.total_winnings || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="deposit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="deposit" className="text-white data-[state=active]:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="text-white data-[state=active]:bg-red-600">
              <Minus className="w-4 h-4 mr-2" />
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-blue-600">
              <Clock className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Deposit Tab */}
          <TabsContent value="deposit">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-400" />
                  Deposit Money
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Selection */}
                <div>
                  <Label className="text-white mb-3 block">Select Amount</Label>
                  <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                    {quickAmounts.map(amount => (
                      <Button
                        key={amount}
                        variant={depositAmount === amount.toString() ? "default" : "outline"}
                        onClick={() => setDepositAmount(amount.toString())}
                        className={depositAmount === amount.toString() ? "bg-green-600" : "border-slate-600 text-gray-300"}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    min="100"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {depositAmount && (
                  <>
                    {/* QR Code Section */}
                    <Card className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-green-500/30">
                      <CardContent className="p-6">
                        <div className="text-center mb-4">
                          <QrCode className="w-16 h-16 mx-auto mb-4 text-green-400" />
                          <h3 className="text-xl font-bold text-white mb-2">Payment Details</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                            <span className="text-gray-300">UPI Number:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">{UPI_NUMBER}</span>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => copyToClipboard(UPI_NUMBER)}
                                className="h-8 w-8 p-0"
                              >
                                <Copy className="w-4 h-4 text-blue-400" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                            <span className="text-gray-300">UPI ID:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">{UPI_ID}</span>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => copyToClipboard(UPI_ID)}
                                className="h-8 w-8 p-0"
                              >
                                <Copy className="w-4 h-4 text-blue-400" />
                              </Button>
                            </div>
                          </div>
                          
                          <Alert className="border-yellow-500/30 bg-yellow-500/10">
                            <Camera className="h-4 w-4 text-yellow-400" />
                            <AlertDescription className="text-yellow-300">
                              <strong>Important:</strong> Add "<strong>{uniqueCode}</strong>" in the UPI note/remark while paying for faster verification.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Transaction Details */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Transaction ID (Optional)</Label>
                        <Input
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Enter UPI transaction ID"
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Upload Screenshot (Optional)</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setScreenshot(e.target.files[0])}
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                      </div>

                      <Button
                        onClick={handleDeposit}
                        disabled={isLoading || !depositAmount}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isLoading ? "Submitting..." : "I Have Paid - Submit Request"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Minus className="w-5 h-5 text-red-400" />
                  Withdraw Money
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-blue-500/30 bg-blue-500/10">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    Minimum withdrawal: ₹100. Processing time: 24 hours.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label className="text-white">Withdrawal Amount</Label>
                  <Input
                    type="number"
                    min="100"
                    max={user?.wallet_balance || 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    className="bg-slate-700 border-slate-600 text-white mt-2"
                  />
                  <div className="text-sm text-gray-400 mt-1">
                    Available: ₹{user?.wallet_balance || 0}
                  </div>
                </div>

                <div>
                  <Label className="text-white">Your UPI ID</Label>
                  <Input
                    value={withdrawUpiId}
                    onChange={(e) => setWithdrawUpiId(e.target.value)}
                    placeholder="yourname@paytm or yourname@phonepe"
                    className="bg-slate-700 border-slate-600 text-white mt-2"
                  />
                </div>

                <Button
                  onClick={handleWithdraw}
                  disabled={isLoading || !withdrawAmount || !withdrawUpiId}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                >
                  {isLoading ? "Submitting..." : "Submit Withdrawal Request"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="space-y-6">
              {/* Deposits */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Deposit History</CardTitle>
                </CardHeader>
                <CardContent>
                  {deposits.length > 0 ? (
                    <div className="space-y-3">
                      {deposits.map((deposit) => (
                        <div key={deposit.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div>
                            <div className="text-white font-medium">₹{deposit.amount}</div>
                            <div className="text-sm text-gray-400">
                              {new Date(deposit.created_date).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge className={
                            deposit.status === 'approved' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                            deposit.status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          }>
                            {deposit.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {deposit.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                            {deposit.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {deposit.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No deposits yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Withdrawals */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Withdrawal History</CardTitle>
                </CardHeader>
                <CardContent>
                  {withdrawals.length > 0 ? (
                    <div className="space-y-3">
                      {withdrawals.map((withdrawal) => (
                        <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div>
                            <div className="text-white font-medium">₹{withdrawal.amount}</div>
                            <div className="text-sm text-gray-400">
                              To: {withdrawal.upi_id}
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(withdrawal.created_date).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge className={
                            withdrawal.status === 'paid' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                            withdrawal.status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          }>
                            {withdrawal.status === 'paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {withdrawal.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                            {withdrawal.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {withdrawal.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Minus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No withdrawals yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}