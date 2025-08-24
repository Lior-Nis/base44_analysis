import React, { useState, useRef, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Product, Order, User, Live, Aula, Coupon, CustomerMessage, CustomerReminder } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Sparkles, 
  Bot, 
  User as UserIcon,
  Clock,
  ShoppingBag,
  Calendar,
  MapPin,
  Phone,
  Star,
  Heart,
  Loader2
} from "lucide-react";

import ChatMessage from "../components/assistant/ChatMessage";
import SuggestedQuestions from "../components/assistant/SuggestedQuestions";
import QuickActions from "../components/assistant/QuickActions";

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Olá! Sou a assistente IA da Doce Encanto 🧁\n\nSou especialista em confeitaria e conheço todo nosso aplicativo! Posso te ajudar com:\n\n🍰 **Produtos & Cardápio**\n• Escolher produtos perfeitos para seu evento\n• Personalizar pedidos especiais\n• Sugestões por ocasião e orçamento\n\n📱 **Navegação no App**\n• Como fazer pedidos (Vitrine Diária e Encomendas)\n• Usar cupons de desconto\n• Acompanhar seus pedidos\n• Gerenciar seu perfil\n\n🎉 **Planejamento de Eventos**\n• Organizar festas de aniversário\n• Planejamento de casamentos\n• Eventos corporativos\n• Surpresas especiais\n\n📚 **Sala Learn**\n• Aulas de confeitaria\n• Receitas e técnicas\n• Dicas profissionais\n\n💬 **Suporte Geral**\n• Informações sobre a empresa\n• Horários e localização\n• Políticas e procedimentos\n\nComo posso te ajudar hoje?",
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadUserData();
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setUserData(user);
    } catch (error) {
      console.log("Usuário não logado");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (message = currentMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    try {
      // Buscar dados completos do contexto
      const [products, userOrders, lives, aulas, coupons] = await Promise.all([
        Product.list('-created_date', 50),
        userData ? Order.filter({ created_by: userData.email }, '-created_date', 20) : [],
        Live.list('-scheduled_date', 10),
        Aula.list('-created_date', 20),
        Coupon.filter({ is_active: true }, '-created_date', 10)
      ]);

      const context = `
        VOCÊ É A ASSISTENTE IA ESPECIALIZADA DA "DOCE ENCANTO" - Confeitaria Artesanal Premium
        
        SOBRE A EMPRESA:
        - Nome: Doce Encanto Confeitaria Artesanal
        - Fundada em 2015 (9 anos de tradição e experiência)
        - Especialidades: Bolos personalizados, doces finos, salgados gourmet, doces para eventos
        - Horário: Terça a Domingo, 8h às 18h (fechado às segundas para planejamento)
        - Localização: Centro da Cidade
        - Telefone: (11) 99999-9999
        - Email: contato@doceencanto.com.br
        - Missão: Transformar momentos especiais em memórias ainda mais doces
        - Valores: Qualidade artesanal, ingredientes premium, atendimento personalizado

        PRODUTOS DISPONÍVEIS NO CARDÁPIO:
        ${products.map(p => `- ${p.name}: R$${p.price?.toFixed(2)} (${p.category})
          Descrição: ${p.description}
          Quantidade mínima: ${p.min_order_quantity || 1} unidade(s)
          Tags: ${p.tags?.join(', ') || 'Nenhuma'}
          ${p.published_today ? '✨ Disponível hoje na Vitrine Diária!' : ''}`).join('\n')}

        FUNCIONALIDADES DO APLICATIVO:
        
        🏠 **PÁGINA INICIAL (Home)**
        - Apresentação da empresa e produtos em destaque
        - Acesso rápido às principais funcionalidades
        - Galeria de clientes e trabalhos realizados
        
        🍰 **CARDÁPIO (Menu)**
        - Todos os produtos organizados por categoria
        - Filtros por preço, categoria e tags
        - Vitrine Diária: produtos frescos disponíveis para retirada no mesmo dia
        - Encomendas: pedidos personalizados com prazo de entrega
        
        🛒 **SISTEMA DE PEDIDOS**
        - Vitrine Diária: pedidos instantâneos para retirada
        - Encomendas: pedidos com personalização e prazo
        - Carrinho de compras integrado
        - Múltiplas formas de pagamento (PIX, cartão, dinheiro)
        
        👤 **PAINEL DO CLIENTE**
        - Histórico completo de pedidos
        - Programa de fidelidade e pontos
        - Gerenciamento de perfil e preferências
        - Lembretes de datas especiais
        
        📚 **SALA LEARN**
        - Videoaulas de confeitaria
        - Receitas exclusivas
        - Técnicas profissionais
        - E-books e materiais didáticos
        
        💬 **TESTEMUNHOS**
        - Avaliações de clientes
        - Galeria de trabalhos realizados
        - Feedback e sugestões

        AULAS DISPONÍVEIS NA SALA LEARN:
        ${aulas.map(a => `- ${a.title} (${a.duration_minutes} min)
          Por: ${a.author}
          Nível: ${a.level}
          Categoria: ${a.category}
          Visualizações: ${a.views || 0}`).join('\n')}

        LIVES PROGRAMADAS:
        ${lives.map(l => `- ${l.title}
          Data: ${new Date(l.scheduled_date).toLocaleDateString('pt-BR')}
          Plataforma: ${l.platform}
          Status: ${l.status}`).join('\n')}

        CUPONS ATIVOS:
        ${coupons.map(c => `- Código: ${c.code}
          Desconto: ${c.discount_type === 'percentage' ? c.discount_value + '%' : 'R$' + c.discount_value?.toFixed(2)}
          Válido até: ${c.expires_at ? new Date(c.expires_at).toLocaleDateString('pt-BR') : 'Sem prazo'}
          Aplicável: ${c.applicable_to === 'all' ? 'Todos os pedidos' : c.applicable_to}`).join('\n')}

        ${userData ? `
        DADOS DO CLIENTE LOGADO:
        - Nome: ${userData.full_name}
        - Email: ${userData.email}
        - Telefone: ${userData.phone || 'Não informado'}
        - Pontos de Fidelidade: ${userData.loyalty_points || 0}
        - Aniversário: ${userData.birthday ? new Date(userData.birthday).toLocaleDateString('pt-BR') : 'Não informado'}
        - Endereço: ${userData.address || 'Não informado'}
        - Preferências: ${userData.preferences?.join(', ') || 'Nenhuma cadastrada'}
        
        HISTÓRICO DE PEDIDOS:
        ${userOrders.map(o => `- Pedido #${o.id.slice(-6)}: R$${o.total_amount?.toFixed(2)} 
          Status: ${o.status} | Tipo: ${o.order_type} | Data: ${new Date(o.created_date).toLocaleDateString('pt-BR')}`).join('\n')}
        ` : `
        USUÁRIO NÃO LOGADO:
        - Orientar sobre as vantagens de criar uma conta
        - Explicar o programa de fidelidade
        - Mostrar como acessar funcionalidades exclusivas
        `}

        ===== INSTRUÇÕES ESPECIAIS =====
        
        🎯 **COMO AJUDAR COM PLANEJAMENTO DE EVENTOS:**
        1. Pergunte sobre o tipo de evento (aniversário, casamento, corporativo, etc.)
        2. Número de convidados
        3. Orçamento disponível
        4. Preferências alimentares/restrições
        5. Tema ou estilo desejado
        6. Data do evento
        7. Sugira produtos adequados e quantidades
        8. Ofereça opções de personalização
        
        🍰 **SUGESTÕES POR OCASIÃO:**
        - Aniversário infantil: Cupcakes coloridos, bolo temático, docinhos
        - Casamento: Bolo de noiva, bem-casados, mesa de doces finos
        - Corporativo: Salgados gourmet, café da manhã, coffee break
        - Aniversário adulto: Bolos sofisticados, tortas, doces gourmet
        - Chá de bebê: Doces em tons pastéis, cupcakes temáticos
        
        💡 **DICAS DE NAVEGAÇÃO:**
        - Para pedidos rápidos: usar a Vitrine Diária
        - Para eventos: fazer encomenda com antecedência
        - Para economizar: verificar cupons disponíveis
        - Para aprender: acessar a Sala Learn
        - Para acompanhar: usar o Painel do Cliente
        
        🎨 **PERSONALIZAÇÃO:**
        - Sempre pergunte sobre cores, temas, sabores preferidos
        - Sugira combinações criativas
        - Explique possibilidades de personalização
        - Oriente sobre prazos necessários
        
        ===== REGRAS DE ATENDIMENTO =====
        
        ✅ **SEMPRE FAÇA:**
        - Seja calorosa, acolhedora e profissional
        - Use emojis moderadamente para deixar a conversa agradável
        - Seja específica e detalhada nas respostas
        - Ofereça múltiplas opções quando possível
        - Personalize sugestões baseadas no perfil do cliente
        - Explique claramente como usar as funcionalidades
        - Incentive o cliente a explorar o aplicativo
        - Sugira produtos complementares quando apropriado
        
        ❌ **NUNCA FAÇA:**
        - Invente preços ou informações que não tem
        - Prometa prazos irreais
        - Dê informações conflitantes
        - Seja impessoal ou robótica
        - Ignore o contexto da conversa
        
        🔄 **SEMPRE OFEREÇA:**
        - Ajuda adicional
        - Orientação sobre próximos passos
        - Informações sobre promoções
        - Sugestões personalizadas
        - Contato direto quando necessário
        
        💬 **RESPOSTAS INTELIGENTES:**
        - Use o histórico do cliente quando relevante
        - Adapte o tom à situação (festa alegre, evento formal, etc.)
        - Sugira produtos baseados em pedidos anteriores
        - Lembre de datas especiais cadastradas
        - Conecte diferentes funcionalidades do app
      `;

      const response = await InvokeLLM({
        prompt: `${context}\n\nPergunta/Solicitação do cliente: ${message}`,
        add_context_from_internet: false
      });

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "Desculpe, houve um erro temporário. Tente novamente em alguns instantes ou entre em contato diretamente pelo telefone (11) 99999-9999. 😔",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              Assistente IA Especializada
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Sua consultora pessoal em confeitaria e eventos especiais! 🧁✨
          </p>
        </motion.div>

        {/* Quick Actions */}
        <QuickActions onActionClick={handleSuggestedQuestion} />

        {/* Chat Container */}
        <Card className="glass-effect shadow-2xl border-pink-100 mb-6">
          <CardHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-amber-50">
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Bot className="w-6 h-6" />
              Chat com Especialista IA
              <Badge className="bg-green-100 text-green-700 ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Online 24/7
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-amber-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border border-pink-100 max-w-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-pink-100 p-6 bg-gradient-to-r from-pink-50/50 to-amber-50/50">
              <div className="flex gap-3">
                <Textarea
                  ref={inputRef}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem... (Ex: 'Preciso organizar uma festa de 15 anos para 50 pessoas')"
                  className="resize-none border-pink-200 focus:border-pink-300 bg-white/80"
                  rows={1}
                  disabled={isTyping}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!currentMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Questions */}
        <SuggestedQuestions onQuestionClick={handleSuggestedQuestion} />
      </div>
    </div>
  );
}