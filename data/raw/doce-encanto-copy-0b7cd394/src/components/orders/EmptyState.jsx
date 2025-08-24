import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ShoppingBag, Plus } from "lucide-react";

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <Card className="glass-effect shadow-2xl border-pink-100 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-pink-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Ainda não há pedidos
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Que tal experimentar nossos deliciosos doces? Explore nosso cardápio e faça seu primeiro pedido!
          </p>
          <div className="space-y-3">
            <Link to={createPageUrl("Menu")}>
              <Button className="w-full bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Fazer Primeiro Pedido
              </Button>
            </Link>
            <Link to={createPageUrl("Assistant")}>
              <Button variant="outline" className="w-full border-pink-200 text-pink-600 hover:bg-pink-50">
                Conversar com Assistente IA
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}