import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  MessageCircle, 
  ShoppingBag, 
  Calendar, 
  Info,
  Star,
  Gift,
  PartyPopper,
  Heart,
  BookOpen,
  Users,
  Smartphone,
  HelpCircle
} from "lucide-react";

export default function SuggestedQuestions({ onQuestionClick }) {
  const suggestions = [
    {
      icon: PartyPopper,
      text: "Preciso organizar uma festa de aniversário para 30 pessoas",
      category: "Eventos"
    },
    {
      icon: Heart,
      text: "Quero fazer uma surpresa especial para minha namorada",
      category: "Surpresas"
    },
    {
      icon: ShoppingBag,
      text: "Como fazer um pedido personalizado no app?",
      category: "Tutorial"
    },
    {
      icon: Gift,
      text: "Que doces recomendam para casamento?",
      category: "Produtos"
    },
    {
      icon: Users,
      text: "Como funciona o programa de fidelidade?",
      category: "Benefícios"
    },
    {
      icon: BookOpen,
      text: "Onde encontro as aulas de confeitaria?",
      category: "Aprendizado"
    },
    {
      icon: Calendar,
      text: "Qual o prazo para encomendas personalizadas?",
      category: "Prazos"
    },
    {
      icon: Smartphone,
      text: "Como acompanhar meus pedidos pelo app?",
      category: "Tutorial"
    },
    {
      icon: Star,
      text: "Quais são os produtos mais pedidos?",
      category: "Populares"
    },
    {
      icon: HelpCircle,
      text: "Preciso de ajuda para navegar no aplicativo",
      category: "Suporte"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-4"
    >
      <h3 className="font-semibold text-gray-700 text-center">
        💡 Perguntas frequentes e sugestões:
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              className="w-full text-left justify-start h-auto py-3 px-4 border-pink-200 hover:border-pink-300 hover:bg-pink-50 transition-all duration-300"
              onClick={() => onQuestionClick(suggestion.text)}
            >
              <suggestion.icon className="w-4 h-4 mr-3 text-pink-500 flex-shrink-0" />
              <div className="text-left">
                <span className="text-sm font-medium">{suggestion.text}</span>
                <div className="text-xs text-gray-500 mt-1">{suggestion.category}</div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center mt-6 p-4 bg-gradient-to-r from-pink-50 to-amber-50 rounded-lg">
        <p className="text-sm text-gray-600">
          💬 <strong>Dica:</strong> Seja específico! Quanto mais detalhes você fornecer sobre seu evento ou necessidade, melhor eu posso te ajudar com sugestões personalizadas.
        </p>
      </div>
    </motion.div>
  );
}