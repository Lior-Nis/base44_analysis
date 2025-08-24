import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  Package,
  CreditCard,
  Clock,
  User
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function OrderDetails({ order, onClose, getStatusIcon, getStatusColor }) {
  if (!order) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="max-w-2xl w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="glass-effect shadow-2xl border-pink-100">
            <CardHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-amber-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl gradient-text mb-2">
                    Pedido #{order.id?.slice(-8)}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Badge variant="outline">
                      {order.delivery_type === "entrega" ? (
                        <><MapPin className="w-3 h-3 mr-1" />Entrega</>
                      ) : (
                        <><Package className="w-3 h-3 mr-1" />Retirada</>
                      )}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Informações do Cliente */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informações do Cliente
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Nome:</span> {order.customer_name}</p>
                    <p className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {order.customer_phone}
                    </p>
                    {order.customer_email && (
                      <p className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {order.customer_email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Datas Importantes
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Pedido feito:</span>{" "}
                      {format(new Date(order.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {order.scheduled_date && (
                      <p className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Agendado para:</span>{" "}
                        {format(new Date(order.scheduled_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Endereço de Entrega */}
              {order.delivery_type === "entrega" && order.delivery_address && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Endereço de Entrega
                  </h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {order.delivery_address}
                  </p>
                </div>
              )}

              {/* Itens do Pedido */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Itens do Pedido
                </h3>
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.product_name}</p>
                        <p className="text-sm text-gray-600">
                          Quantidade: {item.quantity} | Preço unitário: R$ {item.unit_price?.toFixed(2)}
                        </p>
                        {item.variations && item.variations.length > 0 && (
                          <p className="text-sm text-gray-500">
                            Variações: {item.variations.join(", ")}
                          </p>
                        )}
                        {item.customizations && (
                          <p className="text-sm text-gray-500">
                            Personalização: {item.customizations}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          R$ {item.total_price?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagamento */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Pagamento
                </h3>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Método: {order.payment_method || "Não informado"}</p>
                    <Badge 
                      className={order.payment_status === "pago" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {order.payment_status === "pago" ? "Pago" : "Pendente"}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-pink-600">
                    R$ {order.total_amount?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Observações */}
              {order.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800">Observações</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {order.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}