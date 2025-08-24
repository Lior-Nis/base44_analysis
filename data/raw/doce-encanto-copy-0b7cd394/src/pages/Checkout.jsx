
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle }
  from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  CreditCard,
  Shield,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Package,
  Gift, // Add Gift icon
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCart } from '../components/contexts/CartContext';
import { Order, Product, Coupon } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart, cartType } = useCart();

  // Estados do formulário
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Dados pessoais
    customer_name: '',
    customer_email: '',
    customer_phone: '',

    // Data do evento e observações
    event_date: null,
    ingredient_notes: '',

    // Entrega
    delivery_type: 'retirada',
    delivery_address: '',
    delivery_date: null,
    delivery_time: '',
    delivery_notes: '',

    // Pagamento
    payment_method: 'pix',

    // Observações gerais
    general_notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');


  useEffect(() => {
    if (cartItems.length === 0) {
      // Redirecionar para menu se carrinho vazio
      window.location.href = createPageUrl('Menu');
    }
  }, [cartItems]);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.customer_name) newErrors.customer_name = 'Nome é obrigatório';
      if (!formData.customer_email) newErrors.customer_email = 'Email é obrigatório';
      if (!formData.customer_phone) newErrors.customer_phone = 'Telefone é obrigatório';
      if (cartType === 'encomenda' && !formData.event_date) {
        newErrors.event_date = 'Data do evento é obrigatória para encomendas';
      }
    }

    if (step === 2) {
      if (formData.delivery_type === 'entrega' && !formData.delivery_address) {
        newErrors.delivery_address = 'Endereço é obrigatório para entrega';
      }
      if (!formData.delivery_date) newErrors.delivery_date = 'Data de entrega/retirada é obrigatória';
      if (!formData.delivery_time) newErrors.delivery_time = 'Horário é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');

    if (!couponCode) {
      setCouponError('Por favor, insira um código de cupom.');
      return;
    }

    try {
      const results = await Coupon.filter({ code: couponCode.toUpperCase(), is_active: true });
      const coupon = results[0];

      if (!coupon) {
        setCouponError('Cupom inválido ou expirado.');
        return;
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        setCouponError('Este cupom expirou.');
        return;
      }

      const currentOrderTotal = cartTotal + (cartType === 'encomenda' && formData.delivery_type === 'entrega' ? 500 : 0);

      if (coupon.min_order_value && currentOrderTotal < coupon.min_order_value) {
        setCouponError(`O pedido mínimo para este cupom é de Kz ${coupon.min_order_value.toFixed(2)}.`);
        return;
      }

      if (coupon.applicable_to !== 'all' && coupon.applicable_to !== cartType) {
        setCouponError(`Este cupom não é válido para este tipo de pedido.`);
        return;
      }

      setAppliedCoupon(coupon);
      setCouponSuccess('Cupom aplicado com sucesso!');

    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      setCouponError('Não foi possível aplicar o cupom. Tente novamente.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
  };


  const handleSubmit = async () => {
    if (cartType === 'vitrine_diaria') {
      if (!validateStep(1)) return; // Only validate step 1 for daily showcase
    } else {
      if (!validateStep(currentStep)) return; // Validate current step for custom orders
    }

    setIsLoading(true);

    try {
      const deliveryFee = (cartType === 'encomenda' && formData.delivery_type === 'entrega') ? 500 : 0;
      let baseTotal = cartTotal + deliveryFee;

      let finalDiscountAmount = 0;
      if (appliedCoupon) {
        if (appliedCoupon.discount_type === 'percentage') {
          finalDiscountAmount = baseTotal * (appliedCoupon.discount_value / 100);
        } else { // fixed
          finalDiscountAmount = appliedCoupon.discount_value;
        }
      }

      let finalOrderTotal = baseTotal - finalDiscountAmount;
      // Ensure total doesn't go below zero
      if (finalOrderTotal < 0) {
        finalOrderTotal = 0;
      }

      const orderData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        items: cartItems.map(item => ({
          product_id: item.productId,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          variations: Object.entries(item.variations || {}).map(([key, value]) => `${key}: ${value}`),
          customizations: item.customText || '',
          total_price: item.price * item.quantity
        })),
        total_amount: finalOrderTotal,
        order_type: cartType, // Define o tipo de pedido (encomenda ou vitrine_diaria)
        status: cartType === 'vitrine_diaria' ? 'novo' : 'pendente', // Status inicial diferente
        delivery_type: cartType === 'vitrine_diaria' ? 'retirada' : formData.delivery_type, // Fixed for vitrine
        delivery_address: cartType === 'vitrine_diaria' ? '' : formData.delivery_address, // Empty for vitrine
        scheduled_date: cartType === 'vitrine_diaria' ? new Date() : formData.delivery_date, // Current date for vitrine
        event_date: formData.event_date,
        ingredient_notes: formData.ingredient_notes,
        payment_method: formData.payment_method,
        notes: formData.general_notes,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        discount_amount: finalDiscountAmount,
      };

      const order = await Order.create(orderData);

      // Decrementar estoque para pedidos da vitrine diária
      if (cartType === 'vitrine_diaria') {
        const stockUpdates = cartItems.map(async (item) => {
          const product = await Product.get(item.productId);
          if (product && typeof product.daily_stock === 'number') {
            const newStock = Math.max(0, product.daily_stock - item.quantity);
            await Product.update(item.productId, { daily_stock: newStock });
          }
        });
        await Promise.all(stockUpdates);
      }

      clearCart();

      // Redirecionar para página de confirmação
      window.location.href = createPageUrl('OrderConfirmation') + `?orderId=${order.id}`;

    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Dados Pessoais', description: 'Informações básicas e do evento' },
    { number: 2, title: 'Entrega', description: 'Data e local de entrega/retirada' },
    { number: 3, title: 'Pagamento', description: 'Forma de pagamento e confirmação' }
  ];

  if (cartItems.length === 0) {
    return <div>Carregando...</div>;
  }

  const deliveryFee = cartType === 'encomenda' && formData.delivery_type === 'entrega' ? 500 : 0;

  let discountAmount = 0;
  let subtotalWithDelivery = cartTotal + deliveryFee;

  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = subtotalWithDelivery * (appliedCoupon.discount_value / 100);
    } else { // fixed
      discountAmount = appliedCoupon.discount_value;
    }
  }

  let finalTotal = subtotalWithDelivery - discountAmount;
  // Ensure total doesn't go below zero for display
  if (finalTotal < 0) {
    finalTotal = 0;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Menu')}>
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Cardápio
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Pedido</h1>
        </div>

        {/* Progress Steps (apenas para encomendas) */}
        {cartType === 'encomenda' && (
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                    currentStep >= step.number
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.number ? <CheckCircle className="w-6 h-6" /> : step.number}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{step.title}</p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-4 ${
                      currentStep > step.number ? 'bg-orange-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                {/* Etapa Única para Vitrine Diária ou Step 1 para Encomenda */}
                {(cartType === 'vitrine_diaria' || currentStep === 1) && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="text-xl font-semibold mb-6">
                      {cartType === 'vitrine_diaria' ? 'Seus Dados para Retirada' : 'Dados Pessoais e do Evento'}
                    </h3>

                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customer_name">Nome Completo *</Label>
                          <Input
                            id="customer_name"
                            value={formData.customer_name}
                            onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                            className={errors.customer_name ? 'border-red-500' : ''}
                          />
                          {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>}
                        </div>

                        <div>
                          <Label htmlFor="customer_phone">Telefone *</Label>
                          <Input
                            id="customer_phone"
                            value={formData.customer_phone}
                            onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                            placeholder="(11) 99999-9999"
                            className={errors.customer_phone ? 'border-red-500' : ''}
                          />
                          {errors.customer_phone && <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="customer_email">Email *</Label>
                        <Input
                          id="customer_email"
                          type="email"
                          value={formData.customer_email}
                          onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                          className={errors.customer_email ? 'border-red-500' : ''}
                        />
                        {errors.customer_email && <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>}
                      </div>

                      {cartType === 'encomenda' && (
                        <>
                          <Separator className="my-6" />

                          {/* Data do Evento */}
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <CalendarIcon className="w-5 h-5 text-orange-600" />
                              <h4 className="font-semibold text-orange-800">Informações do Evento</h4>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <Label>Data do Evento *</Label>
                                <p className="text-sm text-gray-600 mb-2">
                                  Para qual data específica este pedido será utilizado?
                                </p>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className={`w-full justify-start ${errors.event_date ? 'border-red-500' : ''}`}>
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {formData.event_date ? format(formData.event_date, 'PPP', { locale: ptBR }) : 'Selecione a data do evento'}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={formData.event_date}
                                      onSelect={(date) => setFormData({...formData, event_date: date})}
                                      disabled={(date) => date < new Date()}
                                    />
                                  </PopoverContent>
                                </Popover>
                                {errors.event_date && <p className="text-red-500 text-sm mt-1">{errors.event_date}</p>}
                              </div>

                              <div>
                                <Label htmlFor="ingredient_notes">Observações sobre Ingredientes</Label>
                                <p className="text-sm text-gray-600 mb-2">
                                  Informe aqui ingredientes que devem ser evitados devido a alergias, restrições alimentares ou preferências pessoais.
                                </p>
                                <Textarea
                                  id="ingredient_notes"
                                  value={formData.ingredient_notes}
                                  onChange={(e) => setFormData({...formData, ingredient_notes: e.target.value})}
                                  placeholder="Ex: Sem nozes, sem lactose, sem glúten, etc."
                                  rows={3}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-end mt-6">
                      {cartType === 'vitrine_diaria' ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          {isLoading ? 'Processando...' : 'Finalizar Pedido Rápido'}
                        </Button>
                      ) : (
                        <Button onClick={handleNext} className="bg-orange-500 hover:bg-orange-600">
                          Continuar
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Entrega (apenas para encomendas) */}
                {cartType === 'encomenda' && currentStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="text-xl font-semibold mb-6">Informações de Entrega</h3>

                    <div className="space-y-6">
                      <div>
                        <Label>Tipo de Entrega</Label>
                        <RadioGroup
                          value={formData.delivery_type}
                          onValueChange={(value) => setFormData({...formData, delivery_type: value})}
                          className="mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="retirada" id="retirada" />
                            <Label htmlFor="retirada" className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Retirada na Loja
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="entrega" id="entrega" />
                            <Label htmlFor="entrega" className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Entrega no Endereço
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {formData.delivery_type === 'entrega' && (
                        <div>
                          <Label htmlFor="delivery_address">Endereço de Entrega *</Label>
                          <Textarea
                            id="delivery_address"
                            value={formData.delivery_address}
                            onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
                            placeholder="Rua, número, bairro, cidade, CEP"
                            className={errors.delivery_address ? 'border-red-500' : ''}
                          />
                          {errors.delivery_address && <p className="text-red-500 text-sm mt-1">{errors.delivery_address}</p>}
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Data de {formData.delivery_type === 'entrega' ? 'Entrega' : 'Retirada'} *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={`w-full justify-start ${errors.delivery_date ? 'border-red-500' : ''}`}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.delivery_date ? format(formData.delivery_date, 'PPP', { locale: ptBR }) : 'Selecione a data'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={formData.delivery_date}
                                onSelect={(date) => setFormData({...formData, delivery_date: date})}
                                disabled={(date) => date < new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                          {errors.delivery_date && <p className="text-red-500 text-sm mt-1">{errors.delivery_date}</p>}
                        </div>

                        <div>
                          <Label htmlFor="delivery_time">Horário *</Label>
                          <Input
                            id="delivery_time"
                            type="time"
                            value={formData.delivery_time}
                            onChange={(e) => setFormData({...formData, delivery_time: e.target.value})}
                            className={errors.delivery_time ? 'border-red-500' : ''}
                          />
                          {errors.delivery_time && <p className="text-red-500 text-sm mt-1">{errors.delivery_time}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="delivery_notes">Observações para {formData.delivery_type === 'entrega' ? 'Entrega' : 'Retirada'}</Label>
                        <Textarea
                          id="delivery_notes"
                          value={formData.delivery_notes}
                          onChange={(e) => setFormData({...formData, delivery_notes: e.target.value})}
                          placeholder={
                            formData.delivery_type === 'entrega'
                              ? "Ex: Deixar com porteiro, apartamento 101, etc."
                              : "Ex: Retirar em nome de outra pessoa, etc."
                          }
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={handleBack}>
                        Voltar
                      </Button>
                      <Button onClick={handleNext} className="bg-orange-500 hover:bg-orange-600">
                        Continuar
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Pagamento (apenas para encomendas) */}
                {cartType === 'encomenda' && currentStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="text-xl font-semibold mb-6">Pagamento e Confirmação</h3>

                    <div className="space-y-6">
                      <div>
                        <Label>Forma de Pagamento</Label>
                        <RadioGroup
                          value={formData.payment_method}
                          onValueChange={(value) => setFormData({...formData, payment_method: value})}
                          className="mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pix" id="pix" />
                            <Label htmlFor="pix">PIX (Desconto de 5%)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cartao" id="cartao" />
                            <Label htmlFor="cartao">Cartão de Crédito/Débito</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dinheiro" id="dinheiro" />
                            <Label htmlFor="dinheiro">Dinheiro (na {formData.delivery_type === 'entrega' ? 'entrega' : 'retirada'})</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label htmlFor="general_notes">Observações Gerais</Label>
                        <Textarea
                          id="general_notes"
                          value={formData.general_notes}
                          onChange={(e) => setFormData({...formData, general_notes: e.target.value})}
                          placeholder="Alguma observação adicional sobre seu pedido..."
                          rows={3}
                        />
                      </div>

                      {/* Resumo das Informações */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Resumo das Informações</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Cliente:</strong> {formData.customer_name}</p>
                          <p><strong>Telefone:</strong> {formData.customer_phone}</p>
                          <p><strong>Data do Evento:</strong> {formData.event_date ? format(formData.event_date, 'PPP', { locale: ptBR }) : 'Não informado'}</p>
                          <p><strong>Tipo:</strong> {formData.delivery_type === 'entrega' ? 'Entrega' : 'Retirada na loja'}</p>
                          <p><strong>Data:</strong> {formData.delivery_date ? format(formData.delivery_date, 'PPP', { locale: ptBR }) : 'Não informado'} às {formData.delivery_time}</p>
                          {formData.ingredient_notes && (
                            <p><strong>Restrições:</strong> {formData.ingredient_notes}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={handleBack}>
                        Voltar
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {isLoading ? 'Processando...' : 'Finalizar Pedido'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Pedido */}
          <div className="md:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                        {Object.keys(item.variations || {}).length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {Object.entries(item.variations).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="mr-1">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {item.customText && (
                          <p className="text-xs text-gray-500 mt-1">"{item.customText}"</p>
                        )}
                      </div>
                      <p className="font-medium">Kz {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}

                  <Separator />

                  {/* Coupon Section */}
                  <div className="space-y-2 pt-2">
                    {!appliedCoupon ? (
                      <>
                        <Label htmlFor="coupon" className="flex items-center gap-2 font-medium">
                          <Tag className="w-4 h-4 text-gray-600" />
                          Cupom de Desconto
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="coupon"
                            placeholder="Insira seu cupom"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-grow"
                          />
                          <Button onClick={handleApplyCoupon} variant="outline" className="shrink-0">Aplicar</Button>
                        </div>
                        {couponError && <p className="text-red-500 text-sm">{couponError}</p>}
                        {couponSuccess && <p className="text-green-600 text-sm">{couponSuccess}</p>}
                      </>
                    ) : (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-green-800 flex items-center gap-2">
                              <Gift className="w-4 h-4" />
                              Cupom Aplicado!
                            </p>
                            <p className="text-sm text-green-700 ml-6">{appliedCoupon.code}</p>
                          </div>
                          <Button onClick={handleRemoveCoupon} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50">Remover</Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Kz {cartTotal.toFixed(2)}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Taxa de Entrega</span>
                        <span>Kz {deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Desconto ({appliedCoupon.code})</span>
                        <span>- Kz {discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {formData.payment_method === 'pix' && (
                      <div className="flex justify-between text-green-600">
                        <span>Desconto PIX (5%)</span>
                        <span>- Kz {(() => {
                          // Calculate PIX discount on (subtotal + delivery fee - coupon discount)
                          const pixDiscountBase = cartTotal + deliveryFee - discountAmount;
                          return (pixDiscountBase * 0.05).toFixed(2);
                        })()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>Kz {(() => {
                        let currentCalculatedTotal = finalTotal;
                        // Apply PIX discount if selected
                        if (formData.payment_method === 'pix') {
                          currentCalculatedTotal *= 0.95;
                        }
                        return currentCalculatedTotal.toFixed(2);
                      })()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
