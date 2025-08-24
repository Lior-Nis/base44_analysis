import React, { useState } from "react";
import { send_slack_notification } from "@/api/functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Loader2, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

export default function SlackTester() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const sendTestMessage = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    setResult(null);
    setError(null);

    try {
      const response = await send_slack_notification({ message: message.trim() });
      
      if (response.data?.success) {
        setResult('✅ Message sent to Slack successfully!');
        setMessage(""); // Clear the input
      } else {
        throw new Error(response.data?.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(`❌ Failed to send message: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const sendQuickTest = () => {
    setMessage("🧪 Test message from Aurora app - Slack integration is working!");
    setTimeout(() => sendTestMessage(), 100);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Slack Message Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter your test message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px]"
        />
        
        <div className="flex gap-2">
          <Button 
            onClick={sendTestMessage} 
            disabled={!message.trim() || sending}
            className="bg-green-600 hover:bg-green-700 flex-1"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Send Message
          </Button>
          
          <Button 
            variant="outline"
            onClick={sendQuickTest}
            disabled={sending}
          >
            Quick Test
          </Button>
        </div>

        {result && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{result}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">💡 Quick Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use emoji and markdown for rich messages</li>
            <li>Try: *bold*, _italic_, `code`</li>
            <li>Test different message lengths</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}