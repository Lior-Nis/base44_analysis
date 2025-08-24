import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Server,
  Globe,
  Zap,
  Shield,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Cpu,
  HardDrive,
  Wifi,
  Users,
  Video,
  Settings
} from 'lucide-react';

// Sistema de Monitoramento da Infraestrutura
export default function StreamingInfrastructure() {
  const [infraStatus, setInfraStatus] = useState({
    mediaServers: {
      status: 'online',
      load: 15,
      activeStreams: 0,
      maxCapacity: 1000
    },
    cdn: {
      status: 'online',
      globalNodes: 12,
      latency: 45,
      bandwidth: 850
    },
    transcoding: {
      status: 'online',
      queue: 0,
      processing: 0,
      completed: 0
    },
    storage: {
      used: 2.3,
      total: 500,
      recordings: 45
    }
  });

  const [serverLocations] = useState([
    { region: 'São Paulo', status: 'online', load: 12, viewers: 0 },
    { region: 'Rio de Janeiro', status: 'online', load: 8, viewers: 0 },
    { region: 'Lisboa', status: 'online', load: 5, viewers: 0 },
    { region: 'Miami', status: 'online', load: 18, viewers: 0 },
    { region: 'Frankfurt', status: 'online', load: 22, viewers: 0 }
  ]);

  useEffect(() => {
    // Simulação de monitoramento em tempo real
    const interval = setInterval(() => {
      setInfraStatus(prev => ({
        ...prev,
        mediaServers: {
          ...prev.mediaServers,
          load: Math.max(5, Math.min(95, prev.mediaServers.load + (Math.random() - 0.5) * 10))
        },
        cdn: {
          ...prev.cdn,
          latency: Math.max(20, Math.min(100, prev.cdn.latency + (Math.random() - 0.5) * 10)),
          bandwidth: Math.max(500, Math.min(1000, prev.cdn.bandwidth + (Math.random() - 0.5) * 50))
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'online': return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Offline</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Infraestrutura de Streaming Nativo</h2>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Sistema Operacional
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Status Geral dos Sistemas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Servidores de Mídia</CardTitle>
            <Server className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{infraStatus.mediaServers.load}%</div>
              {getStatusBadge(infraStatus.mediaServers.status)}
            </div>
            <Progress value={infraStatus.mediaServers.load} className="mb-2" />
            <p className="text-xs text-gray-600">
              {infraStatus.mediaServers.activeStreams}/{infraStatus.mediaServers.maxCapacity} streams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CDN Global</CardTitle>
            <Globe className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{infraStatus.cdn.latency}ms</div>
              {getStatusBadge(infraStatus.cdn.status)}
            </div>
            <Progress value={(100 - infraStatus.cdn.latency)} className="mb-2" />
            <p className="text-xs text-gray-600">
              {infraStatus.cdn.globalNodes} nós ativos • {infraStatus.cdn.bandwidth} Mbps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transcodificação</CardTitle>
            <Cpu className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{infraStatus.transcoding.processing}</div>
              {getStatusBadge(infraStatus.transcoding.status)}
            </div>
            <Progress value={infraStatus.transcoding.queue > 0 ? 50 : 0} className="mb-2" />
            <p className="text-xs text-gray-600">
              {infraStatus.transcoding.queue} na fila • {infraStatus.transcoding.completed} concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
            <HardDrive className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{infraStatus.storage.used}GB</div>
              <Badge className="bg-blue-100 text-blue-800">
                {((infraStatus.storage.used / infraStatus.storage.total) * 100).toFixed(1)}%
              </Badge>
            </div>
            <Progress value={(infraStatus.storage.used / infraStatus.storage.total) * 100} className="mb-2" />
            <p className="text-xs text-gray-600">
              {infraStatus.storage.recordings} gravações • {infraStatus.storage.total}GB total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Servidores Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Rede Global de Distribuição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {serverLocations.map((location, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    location.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium text-sm">{location.region}</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  Carga: {location.load}%
                </div>
                <Progress value={location.load} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">
                  {location.viewers} viewers ativos
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Qualidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-500" />
              Configurações de Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">4K Ultra HD (2160p)</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Full HD (1080p)</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">HD (720p)</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">SD (480p)</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mobile (360p)</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Segurança e Proteção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">DRM (Proteção de Conteúdo)</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Anti-Captura de Tela</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Criptografia de Stream</span>
                <Badge className="bg-green-100 text-green-800">SSL/TLS</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Autenticação de Acesso</span>
                <Badge className="bg-green-100 text-green-800">JWT</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Geo-blocking</span>
                <Badge className="bg-blue-100 text-blue-800">Configurável</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Monitoramento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Sistema de Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Sistema Saudável</span>
              </div>
              <p className="text-sm text-green-600">
                Todos os sistemas operando normalmente
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Alto Desempenho</span>
              </div>
              <p className="text-sm text-blue-600">
                Latência média de {infraStatus.cdn.latency}ms globalmente
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800">Capacidade</span>
              </div>
              <p className="text-sm text-purple-600">
                Suporta até {infraStatus.mediaServers.maxCapacity} streams simultâneos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}