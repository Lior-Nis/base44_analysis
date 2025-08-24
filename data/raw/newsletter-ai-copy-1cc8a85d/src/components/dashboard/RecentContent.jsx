
import React from "react";
import { Edit, Calendar, Send, PenTool, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function RecentContent({ newsletters, onEdit, onSend }) {
  const recentNewsletters = newsletters.slice(0, 5);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-3xl p-8 border border-gray-200"
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <PenTool className="w-8 h-8" />
        Recent Content
      </h2>
      {recentNewsletters.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
            <PenTool className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">No content yet</p>
          <p className="text-gray-600">Create your first newsletter to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentNewsletters.map((newsletter, index) => (
            <motion.div
              key={newsletter.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="group flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300"
            >
              <div className="flex items-center gap-6">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  {newsletter.emoji || "📧"}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{newsletter.title}</h3>
                  <p className="text-gray-600 line-clamp-1 mb-2">{newsletter.description}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-semibold border border-gray-300 capitalize">
                      {newsletter.status}
                    </span>
                    {newsletter.scheduled_date && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(newsletter.scheduled_date), 'MMM d')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onEdit(newsletter)}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 group"
                >
                  <Edit className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                </button>
                {newsletter.status === 'draft' && (
                  <button
                    onClick={() => onSend(newsletter)}
                    className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 font-bold flex items-center gap-2 group"
                  >
                    <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Send
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
