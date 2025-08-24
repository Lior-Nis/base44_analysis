import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Calendar, 
  GraduationCap, 
  MessageCircle,
  User,
  Star,
  PartyPopper,
  Heart
} from "lucide-react";

export default function QuickActions({ onActionClick }) {
  const quickActions = [
    {
      icon: PartyPopper,
      title: "Organizar Festa",
      description: "Ajuda completa para planejar seu evento",
      action: "Quero organizar uma festa e preciso de ajuda com o planejamento completo"
    },
    {
      icon: Heart,
      title: "Surpresa Especial",
      description: "Ideias criativas para momentos únicos",
      action: "Preciso de ideias para fazer uma surpresa especial e romântica"
    },
    {
      icon: ShoppingCart,
      title: "Fazer Pedido",
      description: "Tutorial completo do app",
      action: "Como fazer um pedido pelo aplicativo? Me ensine passo a passo"
    },
    {
      icon: GraduationCap,
      title: "Aprender Confeitaria",
      description: "Aulas e técnicas disponíveis",
      action: "Onde encontro as aulas de confeitaria e como acessar?"
    },
    {
      icon: User,
      title: "Minha Conta",
      description: "Gerenciar perfil e histórico",
      action: "Como gerenciar minha conta e ver meus pedidos anteriores?"
    },
    {
      icon: Star,
      title: "Produtos Populares",
      description: "Descobrir os favoritos",
      action: "Quais são os produtos mais pedidos e populares?"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mb-8"
    >
      <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
        🚀 Ações Rápidas
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-pink-100 hover:border-pink-200 bg-white/80 backdrop-blur-sm">
              <CardContent 
                className="p-4 text-center"
                onClick={() => onActionClick(action.action)}
              >
                <action.icon className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                <h4 className="font-medium text-sm mb-1">{action.title}</h4>
                <p className="text-xs text-gray-600">{action.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}