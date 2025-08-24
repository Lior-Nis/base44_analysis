
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Gift,
  Send,
  User as UserIcon,
  Package,
  Loader2,
  ArrowLeft,
  MessageSquare // Added for WhatsApp icon
} from 'lucide-react';
import { User, Product } from '@/api/entities';
import { SendEmail, GenerateImage } from "@/api/integrations"; // Added GenerateImage
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function RewardPage() {
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [emailMessage, setEmailMessage] = useState(
    `Parabéns por ser nosso Cliente do Mês na Lina Kamati! ✨\n\nComo agradecimento pela sua fidelidade, preparamos um presente especial para você. Esperamos que goste!\n\nCom carinho,\nEquipe Lina Kamati` // Updated company name
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // New state for PDF generation

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const customerId = urlParams.get('customerId');

    if (customerId) {
      loadData(customerId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadData = async (customerId) => {
    try {
      const [customerData, productsData] = await Promise.all([
        User.get(customerId),
        Product.list()
      ]);
      setCustomer(customerData);
      setProducts(productsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const generateRewardPDF = async () => {
    if (!customer || selectedProducts.length === 0) {
      alert('Por favor, selecione pelo menos um produto como prêmio.');
      return null;
    }

    setIsGeneratingPDF(true);

    try {
      const prizeProducts = products.filter(p => selectedProducts.includes(p.id));

      // Criar HTML estruturado para o PDF
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .content { padding: 30px; }
            .customer-info { background: #f8f9ff; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #667eea; }
            .products { margin: 25px 0; }
            .product-item { display: flex; align-items: center; padding: 15px; border: 2px solid #f0f0f0; border-radius: 10px; margin-bottom: 15px; }
            .product-item img { width: 60px; height: 60px; border-radius: 8px; margin-right: 15px; object-fit: cover; }
            .product-info h3 { margin: 0; color: #333; font-size: 16px; }
            .product-info p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
            .message-box { background: #fff7ed; padding: 20px; border-radius: 10px; border-left: 4px solid #f97316; margin: 25px 0; }
            .footer { text-align: center; padding: 20px; background: #f8f9ff; color: #666; }
            .gift-icon { font-size: 48px; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="gift-icon">🎁</div>
              <h1>Prêmio Especial</h1>
              <p>Cliente do Mês - Lina Kamati</p>
            </div>

            <div class="content">
              <div class="customer-info">
                <h2 style="margin: 0 0 10px 0; color: #667eea;">🏆 Parabéns, ${customer.full_name}!</h2>
                <p style="margin: 0; color: #666;">Você foi escolhido como nosso Cliente do Mês!</p>
              </div>

              <div class="message-box">
                <p style="margin: 0; line-height: 1.6;">${emailMessage.replace(/\n/g, '<br>')}</p>
              </div>

              <div class="products">
                <h3 style="color: #333; margin-bottom: 20px;">🎁 Seus Prêmios:</h3>
                ${prizeProducts.map(product => `
                  <div class="product-item">
                    <img src="${product.image_url}" alt="${product.name}">
                    <div class="product-info">
                      <h3>${product.name}</h3>
                      <p>Presente especial para você!</p>
                    </div>
                  </div>
                `).join('')}
              </div>

              <div style="background: #e0f2fe; padding: 20px; border-radius: 10px; text-align: center; margin-top: 25px;">
                <h3 style="margin: 0 0 10px 0; color: #0277bd;">📍 Como Resgatar:</h3>
                <p style="margin: 0; color: #555;">Apresente este comprovante em nossa loja ou mencione em seu próximo pedido para resgatar seu prêmio.</p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0; font-weight: bold;">Lina Kamati - Confeitaria Artesanal</p>
              <p style="margin: 5px 0 0 0;">Obrigado por ser um cliente especial! ❤️</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Gerar imagem do PDF usando IA
      const pdfImageResponse = await GenerateImage({
        prompt: `Create a beautiful reward certificate PDF design for "${customer.full_name}" featuring products: ${prizeProducts.map(p => p.name).join(', ')}. Include elegant typography, gift icons, and a premium confectionery theme with soft colors and professional layout.`
      });

      return pdfImageResponse.url;
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert('Erro ao gerar PDF. Tente novamente.');
      return null;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSendRewardWhatsApp = async () => {
    if (!customer || selectedProducts.length === 0) {
      alert('Por favor, selecione pelo menos um produto como prêmio.');
      return;
    }

    setIsSending(true);

    try {
      const prizeProducts = products.filter(p => selectedProducts.includes(p.id));
      // Use customer.phone if available, otherwise fallback to a default number.
      // Clean phone number to contain only digits.
      const phoneNumber = customer.phone?.replace(/\D/g, '') || '943480916';

      const message = encodeURIComponent(
        `🎉 PARABÉNS ${customer.full_name.toUpperCase()}! 🎉\n\n` +
        `Você foi escolhido como nosso CLIENTE DO MÊS na Lina Kamati! ✨\n\n` +
        `🎁 SEUS PRÊMIOS:\n` +
        `${prizeProducts.map(p => `• ${p.name}`).join('\n')}\n\n` +
        `📍 COMO RESGATAR:\n` +
        `Apresente esta mensagem em nossa loja ou mencione em seu próximo pedido.\n\n` +
        `Obrigado por ser um cliente tão especial! ❤️\n\n` +
        `- Equipe Lina Kamati 🍰`
      );

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');

      alert('Mensagem do prêmio aberta no WhatsApp!');
    } catch (error) {
      console.error("Erro ao enviar via WhatsApp:", error);
      alert('Ocorreu um erro ao preparar a mensagem do WhatsApp. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendReward = async () => {
    if (!customer || selectedProducts.length === 0) {
      alert('Por favor, selecione pelo menos um produto como prêmio.');
      return;
    }

    setIsSending(true);

    try {
      const prizeProducts = products.filter(p => selectedProducts.includes(p.id));

      const productsHtml = prizeProducts.map(p => `
        <div style="border: 1px solid #eee; border-radius: 8px; padding: 10px; margin-bottom: 10px; display: flex; align-items: center;">
          <img src="${p.image_url}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
          <div>
            <h4 style="margin: 0; font-size: 16px;">${p.name}</h4>
            <p style="margin: 0; color: #555;">Presente especial para você!</p>
          </div>
        </div>
      `).join('');

      const emailBody = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <p>${emailMessage.replace(/\n/g, '<br>')}</p>
          <h3 style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">Seu Presente:</h3>
          ${productsHtml}
          <p>Para resgatar seu prêmio, basta mencioná-lo em seu próximo pedido ou visita à nossa loja.</p>
          <p>Mais uma vez, obrigado por ser um cliente tão especial!</p>
        </div>
      `;

      await SendEmail({
        to: customer.email,
        subject: "🎁 Um Presente Especial para Você da Lina Kamati!", // Updated company name in subject
        body: emailBody,
      });

      alert('Email com a recompensa enviado com sucesso!');
      // Opcional: redirecionar de volta para o painel
      // window.location.href = createPageUrl('AdminDashboard');
    } catch (error) {
      console.error("Erro ao enviar recompensa:", error);
      alert('Ocorreu um erro ao enviar o e-mail. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <h2 className="text-xl font-bold mb-2">Cliente não encontrado</h2>
        <p className="text-gray-600 mb-4">Não foi possível carregar os dados do cliente.</p>
        <Link to={createPageUrl('AdminDashboard')}>
            <Button>Voltar ao Painel</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <Link to={createPageUrl('AdminDashboard') + '?tab=customers'} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-orange-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Clientes
            </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Gift className="w-6 h-6 text-orange-500" />
                Recompensa para Cliente do Mês
              </CardTitle>
              <CardDescription>
                Envie um presente personalizado para agradecer seu cliente mais fiel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                <UserIcon className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-semibold">{customer.full_name}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. Personalize a Mensagem</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={6}
                placeholder="Escreva uma mensagem de agradecimento..."
                className="text-base"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Selecione os Produtos de Presente</CardTitle>
              <CardDescription>Escolha um ou mais itens para enviar como prêmio.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                {products.map(product => (
                  <label
                    key={product.id}
                    htmlFor={`product-${product.id}`}
                    className={`border-2 rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-all ${
                      selectedProducts.includes(product.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <Checkbox
                      id={`product-${product.id}`}
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleProductSelection(product.id)}
                    />
                    <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">Kz {product.price.toFixed(2)}</p> {/* Updated currency */}
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-4 justify-end">
            <Button
              size="lg"
              onClick={handleSendRewardWhatsApp}
              disabled={isSending || selectedProducts.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Enviar via WhatsApp
                </>
              )}
            </Button>

            <Button
              size="lg"
              onClick={handleSendReward}
              disabled={isSending || selectedProducts.length === 0}
              variant="outline" // Changed variant
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar por E-mail
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
