import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Package, 
  Clock, 
  MapPin, 
  Calendar,
  MessageSquare,
  Mail,
  Phone,
  ArrowLeft,
  Share2,
  Copy,
  Download
} from 'lucide-react';
import { Order, SiteConfig } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import { motion } from 'framer-motion';

export default function OrderConfirmation() {
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  useEffect(() => {
    loadOrderAndConfig();
  }, [location]);

  const loadOrderAndConfig = async () => {
    try {
      const orderId = new URLSearchParams(location.search).get('orderId');
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      const [orderData, configData] = await Promise.all([
        Order.get(orderId),
        SiteConfig.list()
      ]);

      setOrder(orderData);
      setSiteConfig(configData.length > 0 ? configData[0] : null);

      // Enviar notificação por email para a loja
      await sendStoreNotification(orderData, configData[0]);

    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendStoreNotification = async (orderData, config) => {
    try {
      const orderCode = generateOrderCode(orderData);
      const storeEmail = config?.email || 'avelinananakamti09@gmail.com';
      
      const subject = `🆕 Novo Pedido Recebido - ${orderCode}`;
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f97316; margin-bottom: 10px;">🎉 ${config?.site_name || 'Lina Kamati'}</h1>
              <h2 style="color: #333; margin-bottom: 20px;">Novo Pedido Recebido!</h2>
            </div>

            <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #f97316; margin: 0 0 10px 0;">Código do Pedido: ${orderCode}</h3>
              <p style="color: #666; margin: 5px 0;"><strong>Cliente:</strong> ${orderData.customer_name}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Telefone:</strong> ${orderData.customer_phone}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Email:</strong> ${orderData.customer_email}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Tipo:</strong> ${orderData.order_type === 'vitrine_diaria' ? 'Vitrine Diária' : 'Encomenda'}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Entrega:</strong> ${orderData.delivery_type === 'entrega' ? 'Entrega' : 'Retirada'}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Total:</strong> Kz ${orderData.total_amount.toFixed(2)}</p>
            </div>

            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h4 style="color: #0369a1; margin: 0 0 15px 0;">Itens do Pedido:</h4>
              ${orderData.items.map(item => `
                <p style="color: #374151; margin: 5px 0;">
                  • ${item.product_name} - Qtd: ${item.quantity} - Kz ${item.unit_price.toFixed(2)}
                </p>
              `).join('')}
            </div>

            ${orderData.notes ? `
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #92400e; margin: 0;"><strong>Observações:</strong> ${orderData.notes}</p>
              </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px;">
              <a href="${window.location.origin}/AdminDashboard" style="display: inline-block; background-color: #f97316; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; margin: 5px;">
                🏪 Ver no Painel Admin
              </a>
            </div>
          </div>
        </div>
      `;

      await SendEmail({
        to: storeEmail,
        subject: subject,
        body: body,
        from_name: config?.site_name || 'Lina Kamati'
      });

    } catch (error) {
      console.error('Erro ao enviar notificação para loja:', error);
    }
  };

  const generateOrderCode = (orderData) => {
    if (!orderData) return '';
    
    const isVitrine = orderData.order_type === 'vitrine_diaria';
    const prefix = isVitrine ? 'VT-' : 'PD-';
    
    // Usar os últimos 6 dígitos do ID como número sequencial
    const sequentialNumber = orderData.id.slice(-6).replace(/\D/g, '').padStart(2, '0');
    
    return `${prefix}${sequentialNumber}`;
  };

  const sendToWhatsApp = async () => {
    if (!order || !siteConfig) return;

    setIsSendingWhatsApp(true);

    try {
      const orderCode = generateOrderCode(order);
      const whatsappNumber = siteConfig.whatsapp || '244943480916';
      
      const message = `🎉 *Novo Pedido - ${orderCode}*

👤 *Cliente:* ${order.customer_name}
📞 *Telefone:* ${order.customer_phone}
📧 *Email:* ${order.customer_email}

📦 *Tipo:* ${order.order_type === 'vitrine_diaria' ? 'Vitrine Diária' : 'Encomenda'}
🚚 *Entrega:* ${order.delivery_type === 'entrega' ? 'Entrega' : 'Retirada'}
${order.delivery_address ? `📍 *Endereço:* ${order.delivery_address}` : ''}
${order.event_date ? `📅 *Data do Evento:* ${new Date(order.event_date).toLocaleDateString('pt-BR')}` : ''}

🛍️ *Itens do Pedido:*
${order.items.map(item => `• ${item.product_name} - Qtd: ${item.quantity} - Kz ${item.unit_price.toFixed(2)}`).join('\n')}

💰 *Total: Kz ${order.total_amount.toFixed(2)}*

${order.notes ? `📝 *Observações:* ${order.notes}` : ''}
${order.ingredient_notes ? `⚠️ *Restrições:* ${order.ingredient_notes}` : ''}

_Pedido enviado automaticamente via ${siteConfig.site_name}_`;

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

    } catch (error) {
      console.error('Erro ao enviar para WhatsApp:', error);
      alert('Erro ao enviar para WhatsApp. Tente novamente.');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const copyOrderCode = () => {
    if (order) {
      const orderCode = generateOrderCode(order);
      navigator.clipboard.writeText(orderCode);
      alert(`Código ${orderCode} copiado!`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando confirmação do pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Pedido não encontrado</h2>
            <p className="text-gray-600 mb-4">Não foi possível encontrar os detalhes do pedido.</p>
            <Link to={createPageUrl('Menu')}>
              <Button>Voltar ao Menu</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderCode = generateOrderCode(order);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header de Sucesso */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h1>
          <p className="text-gray-600">Seu pedido foi recebido com sucesso</p>
        </motion.div>

        {/* Código do Pedido */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-4">
                <div>
                  <p className="text-orange-100 text-sm">Código do Pedido</p>
                  <p className="text-2xl font-bold">{orderCode}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={copyOrderCode}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detalhes do Pedido */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Detalhes do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tipo de Pedido</span>
                  <Badge variant={order.order_type === 'vitrine_diaria' ? 'default' : 'secondary'}>
                    {order.order_type === 'vitrine_diaria' ? 'Vitrine Diária' : 'Encomenda'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Entrega</span>
                  <div className="flex items-center gap-1">
                    {order.delivery_type === 'entrega' ? <MapPin className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                    <span className="capitalize">{order.delivery_type}</span>
                  </div>
                </div>

                {order.event_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Data do Evento</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(order.event_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Pendente
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={sendToWhatsApp}
                  disabled={isSendingWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {isSendingWhatsApp ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Enviar para WhatsApp da Loja
                    </div>
                  )}
                </Button>

                <Button variant="outline" className="w-full" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Ligar para a Loja
                </Button>

                <Button variant="outline" className="w-full" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar por Email
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Itens do Pedido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div>
                      <h4 className="font-medium">{item.product_name}</h4>
                      <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Kz {(item.quantity * item.unit_price).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Kz {item.unit_price.toFixed(2)} cada</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-orange-600">Kz {order.total_amount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Próximos Passos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Próximos Passos:</h3>
              <div className="space-y-2 text-blue-800">
                <p>1. Você receberá uma confirmação por email em breve</p>
                <p>2. Nossa equipe entrará em contato para confirmar os detalhes</p>
                <p>3. Você será notificado quando seu pedido estiver pronto</p>
                {order.order_type === 'encomenda' && <p>4. Prepare-se para saborear algo especial!</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Botões de Navegação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to={createPageUrl('Menu')}>
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Menu
            </Button>
          </Link>
          <Link to={createPageUrl('Orders')}>
            <Button size="lg">
              <Package className="w-4 h-4 mr-2" />
              Meus Pedidos
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}