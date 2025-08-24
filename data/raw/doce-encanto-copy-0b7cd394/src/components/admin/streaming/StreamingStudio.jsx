import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Users,
  MessageSquare,
  Settings,
  Radio,
  Square,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Wifi,
  WifiOff,
  Eye,
  Heart,
  ThumbsUp,
  Send,
  BarChart3,
  Signal,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Native Streaming Studio Component
export default function StreamingStudio({ liveId, onClose }) {
  const [streamState, setStreamState] = useState({
    isLive: false,
    isConnected: false,
    viewerCount: 0,
    duration: 0,
    quality: 'HD',
    bitrate: 0,
    fps: 30
  });

  const [controls, setControls] = useState({
    videoEnabled: true,
    audioEnabled: true,
    screenShare: false,
    recording: false
  });

  const [chat, setChat] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [analytics, setAnalytics] = useState({
    totalViewers: 0,
    peakViewers: 0,
    averageWatchTime: 0,
    engagement: 0,
    reactions: { hearts: 0, likes: 0, comments: 0 }
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // Simulação de dados em tempo real
  useEffect(() => {
    if (streamState.isLive) {
      intervalRef.current = setInterval(() => {
        setStreamState(prev => ({
          ...prev,
          duration: prev.duration + 1,
          viewerCount: Math.max(0, prev.viewerCount + Math.floor(Math.random() * 3 - 1)),
          bitrate: 2500 + Math.floor(Math.random() * 500)
        }));

        setAnalytics(prev => ({
          ...prev,
          totalViewers: prev.totalViewers + Math.floor(Math.random() * 2),
          engagement: Math.min(100, prev.engagement + Math.random() * 2)
        }));
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [streamState.isLive]);

  // Inicializar câmera
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 1920, 
          height: 1080,
          frameRate: 30 
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      streamRef.current = stream;
      setStreamState(prev => ({ ...prev, isConnected: true }));
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Erro ao acessar câmera. Verifique as permissões.');
    }
  };

  useEffect(() => {
    initializeCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startStream = async () => {
    if (!streamRef.current) {
      await initializeCamera();
    }

    // Simular início do streaming
    setStreamState(prev => ({
      ...prev,
      isLive: true,
      viewerCount: 1
    }));

    // Notificar usuários inscritos (simulado)
    setTimeout(() => {
      addChatMessage('Sistema', 'Live iniciada! Bem-vindos!', 'system');
    }, 1000);
  };

  const stopStream = () => {
    setStreamState(prev => ({
      ...prev,
      isLive: false,
      duration: 0
    }));

    setAnalytics(prev => ({
      ...prev,
      peakViewers: Math.max(prev.peakViewers, streamState.viewerCount)
    }));
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !controls.videoEnabled;
        setControls(prev => ({ ...prev, videoEnabled: !prev.videoEnabled }));
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !controls.audioEnabled;
        setControls(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!controls.screenShare) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        
        setControls(prev => ({ ...prev, screenShare: true }));
      } else {
        await initializeCamera();
        setControls(prev => ({ ...prev, screenShare: false }));
      }
    } catch (error) {
      console.error('Erro ao compartilhar tela:', error);
    }
  };

  const addChatMessage = (user, message, type = 'user') => {
    const newMsg = {
      id: Date.now(),
      user,
      message,
      timestamp: new Date(),
      type
    };
    setChat(prev => [...prev.slice(-49), newMsg]);
  };

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      addChatMessage('Você (Admin)', newMessage, 'admin');
      setNewMessage('');
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header do Estúdio */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">🎥 Estúdio de Streaming Nativo</h1>
          <Badge className={streamState.isLive ? 'bg-red-500' : 'bg-gray-500'}>
            {streamState.isLive ? '🔴 AO VIVO' : '⚫ OFFLINE'}
          </Badge>
          {streamState.isLive && (
            <div className="text-sm">
              ⏱️ {formatDuration(streamState.duration)} | 👥 {streamState.viewerCount} assistindo
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
            Configurações
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar Estúdio
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Área Principal de Streaming */}
        <div className="flex-1 flex flex-col">
          {/* Preview da Câmera */}
          <div className="flex-1 bg-gray-800 relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Overlays de Status */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className="bg-black/70 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                <Signal className="w-4 h-4" />
                {streamState.quality} • {streamState.bitrate} kbps • {streamState.fps} fps
              </div>
              
              {streamState.isConnected && (
                <div className="bg-green-500/80 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Conectado
                </div>
              )}
            </div>

            {/* Analytics em Tempo Real */}
            <div className="absolute top-4 right-4 space-y-2">
              <div className="bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                👥 {streamState.viewerCount} assistindo
              </div>
              <div className="bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                💖 {analytics.reactions.hearts} reações
              </div>
              <div className="bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                🎯 {analytics.engagement.toFixed(1)}% engajamento
              </div>
            </div>

            {/* Controles de Transmissão */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/80 rounded-lg p-4 flex items-center gap-4">
                {!streamState.isLive ? (
                  <Button 
                    onClick={startStream}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3"
                    disabled={!streamState.isConnected}
                  >
                    <Radio className="w-5 h-5 mr-2" />
                    Iniciar Live
                  </Button>
                ) : (
                  <Button 
                    onClick={stopStream}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Finalizar Live
                  </Button>
                )}

                <div className="h-8 w-px bg-gray-500" />

                <Button
                  onClick={toggleVideo}
                  variant={controls.videoEnabled ? "default" : "destructive"}
                  size="sm"
                >
                  {controls.videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>

                <Button
                  onClick={toggleAudio}
                  variant={controls.audioEnabled ? "default" : "destructive"}
                  size="sm"
                >
                  {controls.audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>

                <Button
                  onClick={toggleScreenShare}
                  variant={controls.screenShare ? "secondary" : "outline"}
                  size="sm"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Lateral */}
        <div className="w-80 bg-white border-l flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="viewers">Viewers</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col p-4">
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                <AnimatePresence>
                  {chat.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-2 rounded-lg text-sm ${
                        msg.type === 'admin' ? 'bg-blue-100 ml-4' : 
                        msg.type === 'system' ? 'bg-yellow-100' : 
                        'bg-gray-100'
                      }`}
                    >
                      <div className="font-semibold text-xs text-gray-600">
                        {msg.user} • {msg.timestamp.toLocaleTimeString()}
                      </div>
                      <div>{msg.message}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Responder no chat..."
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                <Button onClick={sendChatMessage} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="flex-1 p-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Visualizações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalViewers}</div>
                    <div className="text-xs text-gray-600">Pico: {analytics.peakViewers}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Engajamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.engagement.toFixed(1)}%</div>
                    <Progress value={analytics.engagement} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Reações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        Curtidas
                      </span>
                      <span>{analytics.reactions.hearts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        Comentários
                      </span>
                      <span>{analytics.reactions.comments}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="viewers" className="flex-1 p-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold mb-2">
                  Assistindo Agora ({streamState.viewerCount})
                </div>
                {/* Lista de viewers seria implementada aqui */}
                <div className="text-xs text-gray-500">
                  Lista de espectadores aparecerá aqui quando a live estiver ativa
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}