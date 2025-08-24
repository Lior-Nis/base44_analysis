
import React, { useState, useEffect } from "react";
import { SentEmail, Newsletter, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, Users, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function History() {
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      // Only load sent emails for the current user
      const emails = await SentEmail.filter({ created_by: user.email }, '-sent_date');
      setSentEmails(emails);
    } catch (error) {
      console.error("Error loading history:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Send History
          </h1>
          <p className="text-gray-600 mt-2">
            Track your newsletter delivery history
          </p>
        </motion.div>

        {/* History List */}
        <div className="space-y-4">
          {sentEmails.length === 0 ? (
            <Card className="bg-white/20 backdrop-blur-xl border-white/20 shadow-lg">
              <CardContent className="text-center py-16">
                <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No emails sent yet</h3>
                <p className="text-gray-500">Your sent newsletters will appear here</p>
              </CardContent>
            </Card>
          ) : (
            sentEmails.map((email, index) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/20 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          email.status === 'sent' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {email.status === 'sent' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-800">
                            {email.subject}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(email.sent_date), 'MMM d, yyyy HH:mm')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {email.recipients.length} recipients
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={email.status === 'sent' ? 'default' : 'destructive'}
                        className={email.status === 'sent' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      >
                        {email.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Recipients */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Recipients:</p>
                        <div className="flex flex-wrap gap-2">
                          {email.recipients.map((recipient, i) => (
                            <Badge key={i} variant="outline" className="bg-white/40 text-gray-700 text-xs">
                              {recipient}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Body Preview */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Content Preview:</p>
                        <div className="bg-white/30 rounded-lg p-3 text-sm text-gray-600">
                          {email.body.substring(0, 200)}
                          {email.body.length > 200 && "..."}
                        </div>
                      </div>

                      {/* Resend ID */}
                      {email.resend_id && (
                        <div className="text-xs text-gray-500">
                          Resend ID: {email.resend_id}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
