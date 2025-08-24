import React from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ChatMessage({ message }) {
  const isBot = message.type === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 ${!isBot ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isBot 
          ? 'bg-gradient-to-br from-pink-500 to-amber-500' 
          : 'bg-gradient-to-br from-gray-500 to-gray-600'
      }`}>
        {isBot ? (
          <Bot className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-white" />
        )}
      </div>
      
      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${!isBot ? 'text-right' : ''}`}>
        <div className={`rounded-2xl p-4 shadow-sm ${
          isBot 
            ? 'bg-white border border-pink-100 rounded-tl-md' 
            : 'bg-gradient-to-r from-pink-500 to-amber-500 text-white rounded-tr-md'
        }`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${!isBot ? 'text-right' : ''}`}>
          {format(message.timestamp, "HH:mm", { locale: ptBR })}
        </div>
      </div>
    </motion.div>
  );
}