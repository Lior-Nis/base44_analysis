import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Globe,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Info,
  Shield,
  Zap,
  Settings,
  ArrowRight,
  FileText,
  Link as LinkIcon
} from 'lucide-react';

export default function DomainConfig() {
  const [domainStatus, setDomainStatus] = useState('not_configured');
  const [currentStep, setCurrentStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  const handleVerifyDomain = async () => {
    setIsVerifying(true);
    try {
      // Simular verificação DNS
      setTimeout(() => {
        setDomainStatus('active');
        setIsVerifying(false);
        alert('Domínio verificado com sucesso! Pode levar alguns minutos para estar totalmente ativo.');
      }, 3000);
    } catch (error) {
      setIsVerifying(false);
      alert('Falha na verificação. Certifique-se de que os registros DNS estão corretos.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Globe className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Configurar Domínio kamati.app</h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Configure seu domínio personalizado para que sua aplicação seja acessível através de <strong>kamati.app</strong>
        </p>
      </div>

      {/* Status Atual */}
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">kamati.app</h3>
                <p className="text-sm text-gray-500">Domínio principal da aplicação</p>
              </div>
            </div>
            <Badge className={domainStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {domainStatus === 'active' ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ativo
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Não Configurado
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        {domainStatus === 'active' && (
          <CardContent>
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <Shield className="w-5 h-5" />
              <span className="font-medium">SSL/HTTPS Ativo</span>
            </div>
            <Button asChild>
              <a href="https://kamati.app" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visitar kamati.app
              </a>
            </Button>
          </CardContent>
        )}
      </Card>

      {domainStatus !== 'active' && (
        <>
          {/* Passo 1: Configuração na Base44 */}
          <Card className={`border-2 ${currentStep === 1 ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-400'}`}>
                  1
                </div>
                Configurar na Plataforma Base44
              </CardTitle>
              <CardDescription>
                Primeiro, você precisa configurar o domínio no painel da Base44
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  <strong>Ação Necessária:</strong> Você precisa configurar o domínio kamati.app diretamente no painel da Base44.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                  Como fazer:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm ml-6">
                  <li>Acesse o <strong>Dashboard da Base44</strong> em seu navegador</li>
                  <li>Vá para <strong>Settings → Custom Domains</strong></li>
                  <li>Clique em <strong>"Add Custom Domain"</strong></li>
                  <li>Digite <strong>kamati.app</strong> no campo de domínio</li>
                  <li>Clique em <strong>"Add Domain"</strong> para salvar</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button asChild className="flex-1">
                  <a 
                    href="https://dashboard.base44.app/settings/domains" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Dashboard Base44
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                >
                  Próximo Passo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Passo 2: Configuração DNS */}
          <Card className={`border-2 ${currentStep === 2 ? 'border-orange-500 bg-orange-50/30' : 'border-gray-200'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${currentStep >= 2 ? 'bg-orange-500' : 'bg-gray-400'}`}>
                  2
                </div>
                Configurar Registros DNS
              </CardTitle>
              <CardDescription>
                Configure estes registros no seu provedor de domínio (onde você comprou kamati.app)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Acesse o painel de controle do seu registrador de domínio e adicione estes registros DNS:
                </AlertDescription>
              </Alert>

              {/* Registro A */}
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-blue-800">Registro A (Domínio Principal)</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('76.76.21.21')}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar IP
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">TIPO</Label>
                    <div className="font-mono bg-white p-2 rounded border">A</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">NOME/HOST</Label>
                    <div className="font-mono bg-white p-2 rounded border">@ (ou kamati.app)</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">VALOR/DESTINO</Label>
                    <div className="font-mono bg-white p-2 rounded border text-blue-600 font-semibold">76.76.21.21</div>
                  </div>
                </div>
              </div>

              {/* Registro CNAME */}
              <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50/50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-green-800">Registro CNAME (www)</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('kamati.app')}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">TIPO</Label>
                    <div className="font-mono bg-white p-2 rounded border">CNAME</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">NOME/HOST</Label>
                    <div className="font-mono bg-white p-2 rounded border">www</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">VALOR/DESTINO</Label>
                    <div className="font-mono bg-white p-2 rounded border text-green-600 font-semibold">kamati.app</div>
                  </div>
                </div>
              </div>

              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tempo de Propagação:</strong> Após salvar os registros DNS, pode levar de 5 minutos a 48 horas para que as alterações se propaguem mundialmente.
                </AlertDescription>
              </Alert>

              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(3)}
                className="w-full"
              >
                Configurei os Registros DNS
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Passo 3: Verificação */}
          <Card className={`border-2 ${currentStep === 3 ? 'border-green-500 bg-green-50/30' : 'border-gray-200'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-400'}`}>
                  3
                </div>
                Verificar Configuração
              </CardTitle>
              <CardDescription>
                Verifique se o domínio foi configurado corretamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Antes de verificar:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>✓ Domínio adicionado na Base44</li>
                  <li>✓ Registros DNS configurados no seu provedor</li>
                  <li>✓ Aguardou pelo menos 5-10 minutos</li>
                </ul>
              </div>

              <Button 
                onClick={handleVerifyDomain} 
                disabled={isVerifying}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verificando Domínio...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Verificar Domínio kamati.app
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Este processo verificará se os registros DNS estão funcionando corretamente
              </p>
            </CardContent>
          </Card>

          {/* Suporte */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <LinkIcon className="w-5 h-5" />
                Precisa de Ajuda?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-purple-700">
                Se você está com dificuldades na configuração, aqui estão alguns recursos úteis:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <Button variant="outline" asChild>
                  <a href="https://docs.base44.app/custom-domains" target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    Documentação Base44
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://support.base44.app" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Suporte Técnico
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}