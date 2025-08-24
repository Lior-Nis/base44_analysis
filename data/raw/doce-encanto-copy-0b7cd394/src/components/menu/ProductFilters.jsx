import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

export default function ProductFilters({ priceRange, onPriceRangeChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <Card className="border-pink-100 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-pink-700">
            <DollarSign className="w-5 h-5" />
            Filtros Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Faixa de Preço
              </label>
              <Select value={priceRange} onValueChange={onPriceRangeChange}>
                <SelectTrigger className="border-pink-200">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os preços</SelectItem>
                  <SelectItem value="0-30">Até R$ 30</SelectItem>
                  <SelectItem value="30-60">R$ 30 - R$ 60</SelectItem>
                  <SelectItem value="60-100">R$ 60 - R$ 100</SelectItem>
                  <SelectItem value="100">Acima de R$ 100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}