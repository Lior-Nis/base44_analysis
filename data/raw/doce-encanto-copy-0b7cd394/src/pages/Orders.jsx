import React, { useState, useEffect } from "react";
import { Order, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle,
  MapPin,
  Phone,
  Calendar,
  Package,
  Truck,
  Eye,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import OrderCard from "../components/orders/OrderCard";
import OrderDetails from "../components/orders/OrderDetails";
import EmptyState from "../components/orders/EmptyState";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserAndOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, activeTab]);

  const loadUserAndOrders = async () => {
    try {
      const user = await User.me();
      setUserData(user);
      
      const userOrders = await Order.filter({ created_by: user.email }, '-created_date');
      setOrders(userOrders);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (activeTab !== "all") {
      filtered = filtered.filter(order => order.status === activeTab);
    }

    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pendente":
        return <Clock className="w-4 h-4" />;
      case "confirmado":
        return <CheckCircle className="w-4 h-4" />;
      case "preparando":
        return <Package className="w-4 h-4" />;
      case "pronto":
        return <CheckCircle className="w-4 h-4" />;
      case "entregue":
        return <Truck className="w-4 h-4" />;
      case "cancelado":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "confirmado":
        return "bg-blue-100 text-blue-800";
      case "preparando":
        return "bg-purple-100 text-purple-800";
      case "pronto":
        return "bg-green-100 text-green-800";
      case "entregue":
        return "bg-emerald-100 text-emerald-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusCounts = {
    all: orders.length,
    pendente: orders.filter(o => o.status === "pendente").length,
    confirmado: orders.filter(o => o.status === "confirmado").length,
    preparando: orders.filter(o => o.status === "preparando").length,
    pronto: orders.filter(o => o.status === "pronto").length,
    entregue: orders.filter(o => o.status === "entregue").length,
    cancelado: orders.filter(o => o.status === "cancelado").length
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-amber-50 p-4 md:p-8 flex items-center justify-center">
        <Card className="glass-effect shadow-2xl p-8 text-center max-w-md">
          <CardContent>
            <ShoppingBag className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Faça Login para Ver seus Pedidos
            </h3>
            <p className="text-gray-500 mb-6">
              Entre na sua conta para acompanhar seus pedidos e histórico de compras
            </p>
            <Button className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
              Meus Pedidos
            </h1>
            <p className="text-gray-600">
              Acompanhe o status dos seus pedidos em tempo real
            </p>
          </div>
          <Link to={createPageUrl("Menu")}>
            <Button className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Novo Pedido
            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-16 w-full" />
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 bg-white/80 backdrop-blur-sm border border-pink-100">
                <TabsTrigger value="all" className="text-xs md:text-sm">
                  Todos ({statusCounts.all})
                </TabsTrigger>
                <TabsTrigger value="pendente" className="text-xs md:text-sm">
                  Pendente ({statusCounts.pendente})
                </TabsTrigger>
                <TabsTrigger value="confirmado" className="text-xs md:text-sm">
                  Confirmado ({statusCounts.confirmado})
                </TabsTrigger>
                <TabsTrigger value="preparando" className="text-xs md:text-sm">
                  Preparando ({statusCounts.preparando})
                </TabsTrigger>
                <TabsTrigger value="pronto" className="text-xs md:text-sm">
                  Pronto ({statusCounts.pronto})
                </TabsTrigger>
                <TabsTrigger value="entregue" className="text-xs md:text-sm">
                  Entregue ({statusCounts.entregue})
                </TabsTrigger>
                <TabsTrigger value="cancelado" className="text-xs md:text-sm">
                  Cancelado ({statusCounts.cancelado})
                </TabsTrigger>
              </TabsList>

              {/* Orders List */}
              <div className="grid gap-6">
                {filteredOrders.map((order, index) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    index={index}
                    onViewDetails={setSelectedOrder}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                  />
                ))}

                {filteredOrders.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Nenhum pedido encontrado
                    </h3>
                    <p className="text-gray-500">
                      Não há pedidos com o status "{activeTab === 'all' ? 'todos' : activeTab}"
                    </p>
                  </motion.div>
                )}
              </div>
            </Tabs>
          </motion.div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
          />
        )}
      </div>
    </div>
  );
}