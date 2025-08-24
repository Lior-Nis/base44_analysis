
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Bot,
  Loader2,
  Mic,
  Send,
  User,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  StopCircle,
  RotateCcw
} from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { SofiaFeedback } from '@/api/entities';
import { motion, AnimatePresence } from 'framer-motion';

// ===== FEEDBACK MODAL COMPONENT =====
const FeedbackModal = ({ open, setOpen, message, onSubmit }) => {
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating) {
      onSubmit(message, rating, comment);
      setOpen(false);
      setRating(null);
      setComment('');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800">Dar Feedback sobre a Resposta</h3>
          <p className="text-sm text-gray-500 mt-1">Ajude a Sofia a aprender e melhorar.</p>
        </div>
        <div className="bg-gray-50 p-4 border-y">
          <p className="text-sm text-gray-600 italic">"{message?.content}"</p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <Label className="font-medium">Como foi esta resposta?</Label>
            <div className="flex gap-3 mt-2">
              <Button
                onClick={() => setRating('boa')}
                variant={rating === 'boa' ? 'default' : 'outline'}
                className="w-full"
              >
                <ThumbsUp className="w-4 h-4 mr-2" /> Boa
              </Button>
              <Button
                onClick={() => setRating('ruim')}
                variant={rating === 'ruim' ? 'destructive' : 'outline'}
                className="w-full"
              >
                <ThumbsDown className="w-4 h-4 mr-2" /> Ruim
              </Button>
            </div>
          </div>
          {rating === 'ruim' && (
            <div>
              <Label htmlFor="feedback-comment" className="font-medium">O que podemos melhorar?</Label>
              <Textarea
                id="feedback-comment"
                placeholder="Ex: A resposta foi muito genérica, não usou os dados corretamente, etc."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
        </div>
        <div className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-lg">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!rating}>Enviar Feedback</Button>
        </div>
      </div>
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL SOFIA (VERSÃO ESTÁVEL + FUNCIONALIDADES AVANÇADAS) =====
export default function MarketingAI({ orders = [], products = [], customers = [], messages = [] }) {
  // Estados básicos
  const [status, setStatus] = useState('idle');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [customQuery, setCustomQuery] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  // Estados de voz
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Referências
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false);
  const availableVoices = useRef([]);

  // Função para carregar e atualizar vozes disponíveis
  const loadAvailableVoices = useCallback(() => {
    const voices = speechSynthesis.getVoices();
    availableVoices.current = voices;
    
    console.log('🎙️ Vozes disponíveis no sistema:', voices.map(v => ({
      name: v.name,
      lang: v.lang,
      default: v.default,
      localService: v.localService
    })));
  }, []);

  // Inicialização ÚNICA (Mantém a estabilidade)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    console.log('🚀 Inicializando Sofia (uma única vez)...');

    // Detectar mobile
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);

    // Carregar vozes disponíveis
    loadAvailableVoices();
    
    // Escutar mudanças nas vozes (importante para alguns browsers)
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadAvailableVoices;
    }

    // Configurar APIs de voz
    const hasSupport = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setSpeechSupported(hasSupport);

    if (hasSupport) {
      const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'pt-BR';
      
      rec.onstart = () => setStatus('listening');
      rec.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);
      };
      rec.onend = () => {
        if (status === 'listening') {
          setStatus('idle');
          if (currentTranscript.trim()) {
            processUserInput(currentTranscript.trim());
          }
        }
      };
      
      setRecognition(rec);
    }

    // Mensagem de boas-vindas ÚNICA
    const welcomeMessage = {
      role: 'assistant',
      content: 'Olá! Sou a Sofia, sua consultora de marketing da Lina Kamati! 🤖✨\n\nPosso ajudar com análises de negócio, estratégias de marketing, criação de campanhas e muito mais.\n\nO que você gostaria de discutir hoje?',
      id: Date.now()
    };
    
    setConversationHistory([welcomeMessage]);

    // Configurar áudio para mobile
    if (mobile) {
      const unlockAudio = () => {
        if (!audioUnlocked) {
          const utterance = new SpeechSynthesisUtterance('');
          speechSynthesis.speak(utterance);
          setAudioUnlocked(true);
        }
      };
      document.addEventListener('click', unlockAudio, { once: true });
      document.addEventListener('touchstart', unlockAudio, { once: true });
    } else {
      setAudioUnlocked(true);
    }

    return () => {
      if (recognition) recognition.stop();
      speechSynthesis.cancel();
      // Clean up onvoiceschanged to avoid memory leaks if component unmounts
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [audioUnlocked, recognition, status, loadAvailableVoices]); // Added loadAvailableVoices to dependencies

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Função melhorada para selecionar a melhor voz do sistema
  const selectBestVoice = useCallback(() => {
    const voices = availableVoices.current.length > 0 ? availableVoices.current : speechSynthesis.getVoices();
    
    if (voices.length === 0) {
      console.log('⚠️ Nenhuma voz disponível no momento');
      return null;
    }

    // Prioridade 1: Voz padrão do sistema em português
    let selectedVoice = voices.find(voice => 
      voice.default && voice.lang.includes('pt')
    );

    // Prioridade 2: Voz feminina em português brasileiro
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang === 'pt-BR' && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('feminina') ||
         voice.name.toLowerCase().includes('maria') ||
         voice.name.toLowerCase().includes('ana') ||
         voice.name.toLowerCase().includes('lucia') ||
         voice.name.toLowerCase().includes('monica'))
      );
    }

    // Prioridade 3: Qualquer voz em português brasileiro
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang === 'pt-BR');
    }

    // Prioridade 4: Qualquer voz em português
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.includes('pt'));
    }

    // Prioridade 5: Voz padrão do sistema (qualquer idioma)
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.default);
    }

    // Último recurso: primeira voz disponível
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    if (selectedVoice) {
      console.log('✅ Voz selecionada:', {
        name: selectedVoice.name,
        lang: selectedVoice.lang,
        default: selectedVoice.default,
        localService: selectedVoice.localService
      });
    }

    return selectedVoice;
  }, []);

  const speakText = useCallback((text) => {
    if (!text || !speechSynthesis || (isMobile && !audioUnlocked)) {
      setStatus('idle');
      return;
    }

    try {
      // Garante que qualquer fala anterior seja parada
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }

      // FUNCIONALIDADE MELHORADA: Limpeza COMPLETA do texto para fala natural
      const cleanText = text
        // Remove formatação Markdown
        .replace(/\*\*(.*?)\*\*/g, '$1')     // Remove ** (negrito)
        .replace(/\*(.*?)\*/g, '$1')         // Remove * (itálico)
        .replace(/__(.*?)__/g, '$1')         // Remove __ (sublinhado)
        .replace(/_(.*?)_/g, '$1')           // Remove _ (itálico)
        .replace(/~~(.*?)~~/g, '$1')         // Remove ~~ (riscado)
        
        // Remove cabeçalhos e marcadores
        .replace(/#{1,6}\s*/g, '')           // Remove # ## ### etc
        .replace(/^\s*[-*+]\s+/gm, '')       // Remove marcadores de lista (-, *, +)
        .replace(/^\s*\d+\.\s+/gm, '')       // Remove numeração de lista (1. 2. etc)
        
        // Remove links e códigos
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')  // Remove links [texto](url), mantém texto
        .replace(/`(.*?)`/g, '$1')           // Remove código `texto`
        .replace(/```[\s\S]*?```/g, '')      // Remove blocos de código
        
        // Remove emojis e símbolos especiais
        .replace(/[🤖✨💬📊🎯💡🚀📱🔥⭐🎉🌟💪🎊🏆🎈🎁🎪🎭🎨🎯🎮🎲🎳🎸🎵🎶🎺🎻🎼🎽🎾🎿🏀🏁🏂🏃🏄🏅🏆🏇🏈🏉🏊🏋🏌🏍🏎🏏🏐🏑🏒🏓🏔🏕🏖🏗🏘🏙🏚🏛🏜🏝🏞🏟🏠🏡🏢🏣🏤🏥🏦🏧🏨🏩🏪🏫🏬🏭🏮🏯🏰]/g, '')
        
        // Remove outros caracteres especiais problemáticos
        .replace(/[*_~`]/g, '')              // Remove asteriscos, underscores, til, backticks restantes
        .replace(/[\[\]()]/g, '')            // Remove parênteses e colchetes
        .replace(/[|]/g, '')                 // Remove pipes
        
        // Melhora a pontuação para fala
        .replace(/\n\n+/g, '. ')             // Parágrafos viram pausas longas
        .replace(/\n/g, ', ')                // Quebras de linha viram pausas curtas
        .replace(/\s+/g, ' ')                // Remove espaços múltiplos
        .replace(/\.\s*\./g, '.')            // Remove pontos duplos
        .replace(/,\s*,/g, ',')              // Remove vírgulas duplas
        .replace(/:\s*:/g, ':')              // Remove dois pontos duplos
        
        // Limpeza final
        .trim()
        .replace(/^[,.\s]+/, '')             // Remove pontuação no início
        .replace(/[,.\s]+$/, '');            // Remove pontuação no final

      if (!cleanText) {
        setStatus('idle');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Configurações de fala otimizadas
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1.0; // Adjusted from 1.1 to 1.0 as per common natural voice settings
      utterance.volume = 1.0; // Adjusted from 0.95 to 1.0 for full volume

      // FUNCIONALIDADE MELHORADA: Usar voz do sistema
      const selectedVoice = selectBestVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setStatus('speaking');
        console.log('🗣️ Sofia começou a falar');
      };
      
      utterance.onend = () => {
        setStatus('idle');
        console.log('✅ Sofia terminou de falar');
      };
      
      utterance.onerror = (e) => {
        // Ignora erros de cancelamento que são intencionais
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.error('❌ Erro na síntese de voz:', e.error);
        }
        setStatus('idle');
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('❌ Erro na síntese de voz:', error);
      setStatus('idle');
    }
  }, [isMobile, audioUnlocked, selectBestVoice]);

  const processUserInput = async (input) => {
    if (!input.trim() || status === 'processing') return;

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setStatus('processing');

    const newUserMessage = { role: 'user', content: input.trim(), id: Date.now() };
    setConversationHistory(prev => [...prev, newUserMessage]);
    
    setCustomQuery('');
    setCurrentTranscript('');

    try {
      const responseText = await generateIntelligentResponse(input);
      const assistantMessage = { role: 'assistant', content: responseText, id: Date.now() + 1 };
      setConversationHistory(prev => [...prev, assistantMessage]);
      
      speakText(responseText);
    } catch (error) {
      console.error("Erro ao gerar resposta:", error);
      const errorMessage = { 
        role: 'assistant', 
        content: "Desculpe, tive um problema técnico. Vamos tentar novamente?", 
        id: Date.now() + 2 
      };
      setConversationHistory(prev => [...prev, errorMessage]);
      setStatus('idle');
    }
  };

  const generateBusinessAnalysis = useCallback(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const productSales = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          productSales[item.product_name] = (productSales[item.product_name] || 0) + item.quantity;
        });
      }
    });
    
    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, sales]) => `${name}: ${sales} vendidos`);
    
    const categoryAnalysis = {};
    products.forEach(product => {
      categoryAnalysis[product.category] = (categoryAnalysis[product.category] || 0) + 1;
    });
    
    const last30Days = orders.filter(order => 
      new Date(order.created_date) > new Date(new Date().setDate(new Date().getDate() - 30))
    );
    const recentRevenue = last30Days.reduce((sum, order) => sum + order.total_amount, 0);
    
    const customerAnalysis = customers.map(customer => {
      const customerOrders = orders.filter(order => order.customer_email === customer.email);
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
      return {
        ...customer,
        totalSpent,
        orderCount: customerOrders.length
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
    
    const topCustomers = customerAnalysis.slice(0, 3);
    
    return `RESUMO FINANCEIRO:
- Receita Total: Kz ${totalRevenue.toFixed(2)}
- Total de Pedidos: ${totalOrders}
- Ticket Médio: Kz ${avgOrderValue.toFixed(2)}
- Receita Últimos 30 Dias: Kz ${recentRevenue.toFixed(2)}
- Total de Clientes: ${totalCustomers}

PRODUTOS MAIS VENDIDOS:
${topProducts.join('\n')}

CATEGORIAS DISPONÍVEIS:
${Object.entries(categoryAnalysis).map(([cat, count]) => `${cat}: ${count} produtos`).join('\n')}

TOP 3 CLIENTES:
${topCustomers.map(c => `${c.full_name}: Kz ${c.totalSpent.toFixed(2)} em ${c.orderCount} pedidos`).join('\n')}

PRODUTOS CADASTRADOS: ${products.length}
MENSAGENS DE CLIENTES: ${messages.length}`;
  }, [orders, products, customers, messages]);

  const generateIntelligentResponse = useCallback(async (userInput) => {
    const recentFeedbacks = feedbackHistory.slice(-5).map(fb =>
      `- O usuário disse que a resposta '${fb.message_content.substring(0, 50)}...' foi ${fb.rating}. Comentário: ${fb.comment || 'N/A'}`
    ).join('\n');
    
    const businessData = generateBusinessAnalysis();
    
    const prompt = `Você é Sofia, a consultora de marketing inteligente da confeitaria Lina Kamati.

SUAS ESPECIALIDADES:
- Análise estratégica de negócios com dados reais
- Geração de campanhas de marketing completas
- Criação de posts para Instagram com copy e hashtags
- Análise de performance de produtos e vendas
- Sugestões de melhorias operacionais
- Criação de tutoriais passo-a-passo detalhados
- Análise de tendências e concorrência
- Otimização de preços e promoções

DADOS ATUAIS DO NEGÓCIO LINA KAMATI:
${businessData}

FEEDBACK RECENTE DOS USUÁRIOS:
${recentFeedbacks || "Nenhum feedback recente."}

HISTÓRICO DA CONVERSA:
${conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

PERGUNTA ATUAL:
"${userInput}"

INSTRUÇÕES PARA RESPOSTA:
1. Use os dados reais do negócio para fundamentar suas respostas
2. Use o histórico da conversa para entender o contexto e não se repetir.
3. Seja específica e prática - cite números, produtos, tendências reais
4. Se pedir campanhas, crie campanhas COMPLETAS com objetivo, público-alvo, copy, hashtags, cronograma e KPIs
5. Se pedir análises, use dados reais de vendas, produtos e clientes
6. Se pedir tutoriais, crie passo-a-passo detalhados e acionáveis
7. Se pedir posts para Instagram, crie copy completo com hashtags relevantes
8. Mantenha tom conversacional e profissional
9. Termine com uma pergunta ou sugestão para continuar
10. **Formate suas respostas usando Markdown, incluindo negrito, listas e parágrafos para melhor legibilidade.**

Responda como Sofia, consultora especializada:`;

    return await InvokeLLM({ prompt });
  }, [feedbackHistory, generateBusinessAnalysis, conversationHistory]);

  const handleSubmitFeedback = async (message, rating, comment) => {
    const feedbackData = {
      message_content: message.content,
      conversation_history: JSON.stringify(conversationHistory),
      rating: rating,
      comment: comment
    };
    
    try {
      await SofiaFeedback.create(feedbackData);
      setFeedbackHistory(prev => [...prev, feedbackData]);
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
    }
  };

  const handleOpenFeedbackModal = (message) => {
    setFeedbackMessage(message);
    setIsFeedbackModalOpen(true);
  };

  const handleVoiceButtonClick = () => {
    if (!speechSupported || !recognition) return;
    
    if (status === 'idle') {
      setCurrentTranscript('');
      recognition.start();
    } else if (status === 'listening') {
      recognition.stop();
    } else if (status === 'speaking') {
      // FUNCIONALIDADE RESTAURADA: Botão para parar a fala
      speechSynthesis.cancel();
      setStatus('idle');
    }
  };

  const handleNewConversation = () => {
    console.log('🔄 Iniciando nova conversa...');
    
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    setConversationHistory([]);
    setCustomQuery('');
    setCurrentTranscript('');
    setStatus('idle');
    
    const welcomeMessage = { 
      role: 'assistant', 
      content: 'Olá! Sou a Sofia, sua consultora de marketing da Lina Kamati! 🤖✨\n\nPosso ajudar com análises de negócio, estratégias de marketing, criação de campanhas e muito mais.\n\nO que você gostaria de discutir hoje?', 
      id: Date.now() 
    };
    
    setConversationHistory([welcomeMessage]);
    speakText(welcomeMessage.content);
  };

  return (
    <div className="w-full space-y-6 pb-24">
      {isMobile && !audioUnlocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mx-4">
          <div className="flex items-center gap-2 text-amber-800">
            <Volume2 className="w-4 h-4" />
            <span className="font-medium">🔊 Ative o áudio natural da Sofia</span>
          </div>
          <p className="text-amber-700 text-sm mt-1">
            Toque em qualquer lugar da tela para ativar o áudio. A Sofia falará com voz natural e clara.
          </p>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chat principal */}
          <div className="xl:col-span-2 flex flex-col bg-white rounded-lg shadow-lg border h-[80vh]">
            <CardHeader className="flex-shrink-0">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-purple-600" />
                  Sofia - Consultora de Marketing Lina Kamati
                  {status === 'speaking' && (
                    <Badge variant="secondary" className="animate-pulse">🗣️ Falando</Badge>
                  )}
                  {status === 'listening' && (
                    <Badge variant="destructive" className="animate-pulse">🎤 Ouvindo</Badge>
                  )}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewConversation}
                  className="flex items-center gap-2"
                  title="Iniciar nova conversa"
                >
                  <RotateCcw className="w-4 h-4" />
                  Nova Conversa
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
              {conversationHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Bot className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Carregando Sofia...</h3>
                </div>
              ) : (
                conversationHistory.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 group ${
                      message.role === 'user' ? 'justify-end' : ''
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <div className="max-w-xl">
                      <div className={`p-4 rounded-2xl shadow-sm relative ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white border rounded-bl-none'
                      }`}>
                        <div className="prose prose-sm max-w-none text-gray-800">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                      
                      {message.role === 'assistant' && (
                        <div className="pt-2 flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenFeedbackModal(message)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <ThumbsDown className="w-3 h-3" />
                            <span className="ml-1">Avaliar</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))
              )}
              
              {status === 'processing' && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="p-3 bg-white border rounded-2xl rounded-bl-none shadow-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>

            <CardFooter className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  processUserInput(customQuery);
                }}
                className="flex items-center gap-3 w-full"
              >
                <Textarea
                  placeholder="Digite sua mensagem ou use o microfone..."
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  className="flex-1 resize-none min-h-[40px] max-h-[120px]"
                  rows={1}
                  disabled={status === 'processing'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      processUserInput(customQuery);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={status === 'processing' || !customQuery.trim()}
                  className="px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardFooter>
          </div>

          {/* Painel lateral */}
          <div className="flex flex-col gap-6">
            {/* Controle por voz */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-center gap-2">
                  🎤 Controle por Voz
                  {isMobile && <Badge variant="outline" className="text-xs">Mobile</Badge>}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {isMobile 
                    ? "Toque para falar, toque novamente para parar" 
                    : "Clique para falar, clique novamente para parar"
                  }
                </p>
              </CardHeader>
              <CardContent>
                <button
                  onClick={handleVoiceButtonClick}
                  disabled={!speechSupported || status === 'processing'}
                  className={`w-28 h-28 rounded-full text-white flex items-center justify-center mx-auto shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    status === 'listening'
                      ? 'bg-red-500 animate-pulse'
                      : status === 'speaking'
                      ? 'bg-orange-500'
                      : status === 'processing'
                      ? 'bg-gray-400'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                >
                  {status === 'listening' ? (
                    <Mic className="w-12 h-12" />
                  ) : status === 'speaking' ? (
                    <StopCircle className="w-12 h-12" />
                  ) : status === 'processing' ? (
                    <Loader2 className="w-12 h-12 animate-spin" />
                  ) : (
                    <Mic className="w-12 h-12" />
                  )}
                </button>
                
                <p className="mt-4 text-sm font-medium text-gray-700 h-10 flex items-center justify-center">
                  {status === 'idle' && "Clique para falar com a Sofia"}
                  {status === 'listening' && "Ouvindo... Clique para parar"}
                  {status === 'processing' && "Sofia está pensando..."}
                  {status === 'speaking' && "Sofia está falando... Clique para parar"}
                </p>
                
                {status === 'listening' && currentTranscript && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Você está dizendo:</p>
                    <p className="text-sm font-medium text-gray-800">"{currentTranscript}"</p>
                  </div>
                )}
                
                {isMobile && (
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <div>Áudio: {audioUnlocked ? '✅ Ativo' : '🔒 Bloqueado'}</div>
                    <div>Voz: {speechSupported ? '✅ Suportada' : '❌ Não Suportada'}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Capacidades */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Capacidades da Sofia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-purple-600">🎯 Marketing Especializado</p>
                  <p className="text-gray-600">Campanhas, posts, análises</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-green-600">📊 Análise de Dados</p>
                  <p className="text-gray-600">Vendas, clientes, produtos</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-600">🚀 Estratégias</p>
                  <p className="text-gray-600">Crescimento e otimização</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-orange-600">📝 Tutoriais</p>
                  <p className="text-gray-600">Passo-a-passos detalhados</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <FeedbackModal
        open={isFeedbackModalOpen}
        setOpen={setIsFeedbackModalOpen}
        message={feedbackMessage}
        onSubmit={handleSubmitFeedback}
      />
    </div>
  );
}
