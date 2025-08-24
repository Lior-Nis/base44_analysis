
import React, { useState } from "react";
import { User } from "@/api/entities";
import { sendSupportEmail } from "@/api/functions";
import { Mail, Send, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useHapticFeedback } from "../components/useHapticFeedback.js";

export default function ContactSupport() {
  const triggerHaptic = useHapticFeedback();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: ""
  });

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    triggerHaptic();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setSending(true);

    try {
      const response = await sendSupportEmail({
        subject: formData.subject,
        message: formData.message
      });

      if (response.data.success) {
        setSent(true);
        setFormData({ subject: "", message: "" });
      } else {
        throw new Error(response.data.error || 'Failed to send support request');
      }
    } catch (error) {
      console.error('Error sending support email:', error);
      alert("Error sending message. Please try again or email us directly at contact.mypuppack@gmail.com");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-12 border border-white/20 shadow-xl">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Message Sent!</h1>
            <p className="text-white/80 mb-8">
              Thank you for contacting us. We'll get back to you as soon as possible.
            </p>
            <Link
              to={createPageUrl("Home")}
              onClick={triggerHaptic}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            to={createPageUrl("Home")}
            onClick={triggerHaptic}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
          <div className="text-center mb-8">
            <Mail className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Contact Support</h1>
            <p className="text-white/80">
              Need help with your transformations? Have questions? We're here to help!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-3">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="What can we help you with?"
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-3">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please describe your question or issue in detail..."
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="6"
                required
              />
            </div>

            {user && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <p className="text-white/80 text-sm">
                  <strong>Contact Info:</strong> {user.full_name} ({user.email})
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending Message...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Message
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-white/70">
            <p>You can also email us directly at: contact.mypuppack@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
