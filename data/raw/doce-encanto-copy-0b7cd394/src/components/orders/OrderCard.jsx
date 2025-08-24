import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  Eye,
  Package,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function OrderCard({ order, index, onViewDetails, getStatusIcon, getStatusColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-xl transition-all duration-300 border-pink-100 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-gray-800">
                  Pedido #{order.id?.slice(-8)}
                </h3>
                <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(order.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
                {order.scheduled_date && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Agendado: {format(new Date(order.scheduled_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col md:items-end mt-2 md:mt-0">
              <span className="text-2xl font-bold text-pink-600">
                R$ {order.total_amount?.toFixed(2)}
              </span>
              <Badge variant="outline" className="mt-1">
                {order.delivery_type === "entrega" ? (
                  <><MapPin className="w-3 h-3 mr-1" />Entrega</>
                ) : (
                  <><Package className="w-3 h-3 mr-1" />Retirada</>
                )}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <p className="font-medium text-gray-700">Cliente: {order.customer_name}</p>
            {order.delivery_type === "entrega" && order.delivery_address && (
              <p className="text-sm text-gray-600 flex items-start gap-1">
                <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                {order.delivery_address}
              </p>
            )}
          </div>

          <div className="space-y-2 mb-4">
            <p className="font-medium text-gray-700">Itens do pedido:</p>
            <div className="space-y-1">
              {order.items?.slice(0, 2).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.product_name}
                  </span>
                  <span className="text-gray-800 font-medium">
                    R$ {item.total_price?.toFixed(2)}
                  </span>
                </div>
              ))}
              {order.items?.length > 2 && (
                <p className="text-sm text-gray-500">
                  +{order.items.length - 2} item(s) adicional(is)
                </p>
              )}
            </div>
          </div>

          {order.notes && (
            <div className="mb-4">
              <p className="font-medium text-gray-700 text-sm mb-1">Observações:</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                {order.notes}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onViewDetails(order)}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}