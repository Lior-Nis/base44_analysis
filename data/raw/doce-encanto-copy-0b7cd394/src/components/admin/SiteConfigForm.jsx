
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Palette,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Upload,
  Eye,
  Save,
  RotateCcw,
  Smartphone,
  Globe,
  Image as ImageIcon,
  Type,
  Loader2
} from 'lucide-react';
import { SiteConfig } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { motion } from 'framer-motion';

export default function SiteConfigForm() {
  const [config, setConfig] = useState({
    site_name: 'Lina Kamati',
    site_logo: '',
    site_tagline: 'Confeitaria Artesanal Premium',
    hero_title: 'Saboreie a Tradição em Cada Mordida',
    hero_subtitle: 'Descubra o sabor autêntico dos nossos doces artesanais, preparados com ingredientes frescos e receitas tradicionais que encantam paladares.',
    hero_background: '',
    about_text: 'Tradição e qualidade em cada doce que preparamos com muito carinho.',
    phone: '(11) 99999-9999',
    whatsapp: '5511999999999',
    email: 'contato@linakamati.com.br',
    address: 'Av. Paulista, 1234 - São Paulo, SP',
    working_hours: {
      monday_friday: 'Segunda a Sexta: 8h às 18h',
      saturday: 'Sábado: 8h às 16h',
      sunday: 'Domingo: 9h às 15h'
    },
    social_links: {
      facebook: '',
      instagram: '',
      youtube: '',
      twitter: ''
    },
    primary_color: '#f97316',
    secondary_color: '#ea580c',
    footer_text: '',
    delivery_fee: 5
  });

  const [originalConfig, setOriginalConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (originalConfig) {
      const hasChanged = JSON.stringify(config) !== JSON.stringify(originalConfig);
      setHasChanges(hasChanged);
    }
  }, [config, originalConfig]);

  const loadConfig = async () => {
    try {
      const configs = await SiteConfig.list();
      if (configs.length > 0) {
        const loadedConfig = configs[0];
        setConfig(loadedConfig);
        setOriginalConfig(loadedConfig);
      } else {
        // Criar configuração padrão se não existir
        const defaultConfig = {
          site_name: 'Lina Kamati',
          site_logo: '',
          site_tagline: 'Confeitaria Artesanal Premium',
          hero_title: 'Saboreie a Tradição em Cada Mordida',
          hero_subtitle: 'Descubra o sabor autêntico dos nossos doces artesanais, preparados com ingredientes frescos e receitas tradicionais que encantam paladares.',
          hero_background: '',
          about_text: 'Tradição e qualidade em cada doce que preparamos com muito carinho.',
          phone: '(11) 99999-9999',
          whatsapp: '5511999999999',
          email: 'contato@linakamati.com.br',
          address: 'Av. Paulista, 1234 - São Paulo, SP',
          working_hours: {
            monday_friday: 'Segunda a Sexta: 8h às 18h',
            saturday: 'Sábado: 8h às 16h',
            sunday: 'Domingo: 9h às 15h'
          },
          social_links: {
            facebook: '',
            instagram: '',
            youtube: '',
            twitter: ''
          },
          primary_color: '#f97316',
          secondary_color: '#ea580c',
          footer_text: '',
          delivery_fee: 5
        };
        
        const newConfig = await SiteConfig.create(defaultConfig);
        setConfig(newConfig);
        setOriginalConfig(newConfig);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setConfig(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setConfig(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter menos de 5MB.');
      return;
    }

    setLogoFile(file);
    setUploadingLogo(true);

    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('site_logo', file_url);
      alert('Logo carregado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      alert('Erro ao fazer upload do logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleHeroUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('A imagem deve ter menos de 10MB.');
      return;
    }

    setHeroFile(file);
    setUploadingHero(true);

    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('hero_background', file_url);
      alert('Imagem de fundo carregada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setUploadingHero(false);
    }
  };

  const formatWhatsApp = (value) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Adiciona o código do país se não estiver presente
    if (numbers.length === 11 && !numbers.startsWith('55')) {
      return '55' + numbers;
    }
    
    return numbers;
  };

  const formatPhone = (value) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Formata como (XX) XXXXX-XXXX
    if (numbers.length === 11) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
    } else if (numbers.length === 10) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
    }
    
    return value;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (originalConfig && originalConfig.id) {
        await SiteConfig.update(originalConfig.id, config);
      } else {
        const newConfig = await SiteConfig.create(config);
        setOriginalConfig(newConfig);
      }
      
      setOriginalConfig({ ...config });
      setHasChanges(false);
      alert('Configurações salvas com sucesso! As alterações serão aplicadas em toda a aplicação.');
      
      // Recarregar a página para aplicar as mudanças imediatamente
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja descartar todas as alterações?')) {
      setConfig({ ...originalConfig });
      setHasChanges(false);
    }
  };

  const testWhatsApp = () => {
    const whatsappUrl = `https://wa.me/${config.whatsapp}?text=Olá! Vim através do site da ${config.site_name}`;
    window.open(whatsappUrl, '_blank');
  };

  const testPhone = () => {
    window.open(`tel:${config.phone}`, '_self');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-orange-500" />
            Configurações do Site
          </h2>
          <p className="text-gray-600 mt-1">
            Personalize a aparência e informações do seu site
          </p>
        </div>
        
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Descartar
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-yellow-800">
            <Eye className="w-4 h-4" />
            <span className="font-medium">Você tem alterações não salvas</span>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="branding">Visual</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="social">Redes Sociais</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        {/* Aba Geral */}
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="site_name">Nome da Empresa/Site</Label>
                    <Input
                      id="site_name"
                      value={config.site_name}
                      onChange={(e) => handleInputChange('site_name', e.target.value)}
                      placeholder="Ex: Lina Kamati"
                    />
                  </div>
                  <div>
                    <Label htmlFor="site_tagline">Slogan/Tagline</Label>
                    <Input
                      id="site_tagline"
                      value={config.site_tagline}
                      onChange={(e) => handleInputChange('site_tagline', e.target.value)}
                      placeholder="Ex: Confeitaria Artesanal Premium"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="hero_title">Título Principal (Página Inicial)</Label>
                  <Input
                    id="hero_title"
                    value={config.hero_title}
                    onChange={(e) => handleInputChange('hero_title', e.target.value)}
                    placeholder="Título que aparece na página inicial"
                  />
                </div>

                <div>
                  <Label htmlFor="hero_subtitle">Subtítulo (Página Inicial)</Label>
                  <Textarea
                    id="hero_subtitle"
                    value={config.hero_subtitle}
                    onChange={(e) => handleInputChange('hero_subtitle', e.target.value)}
                    placeholder="Descrição que aparece abaixo do título principal"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="about_text">Texto Sobre a Empresa</Label>
                  <Textarea
                    id="about_text"
                    value={config.about_text}
                    onChange={(e) => handleInputChange('about_text', e.target.value)}
                    placeholder="Descrição da sua empresa no rodapé"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Visual */}
        <TabsContent value="branding">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Logo e Imagens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Logo da Empresa</Label>
                  <div className="mt-2 space-y-4">
                    {config.site_logo && (
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <img 
                          src={config.site_logo} 
                          alt="Logo atual" 
                          className="h-12 w-auto object-contain"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Logo atual</p>
                          <p className="text-xs text-gray-500">Clique em "Escolher arquivo" para alterar</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="flex-1"
                      />
                      {uploadingLogo && <Loader2 className="w-4 h-4 animate-spin" />}
                    </div>
                    <p className="text-xs text-gray-500">
                      Recomendado: PNG ou SVG, fundo transparente, máximo 5MB
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Imagem de Fundo (Página Inicial)</Label>
                  <div className="mt-2 space-y-4">
                    {config.hero_background && (
                      <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={config.hero_background} 
                          alt="Fundo atual" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <p className="text-white text-sm font-medium">Imagem de fundo atual</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroUpload}
                        disabled={uploadingHero}
                        className="flex-1"
                      />
                      {uploadingHero && <Loader2 className="w-4 h-4 animate-spin" />}
                    </div>
                    <p className="text-xs text-gray-500">
                      Recomendado: JPG ou PNG, resolução alta, máximo 10MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Cores do Site
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary_color">Cor Primária</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="primary_color"
                        type="color"
                        value={config.primary_color}
                        onChange={(e) => handleInputChange('primary_color', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={config.primary_color}
                        onChange={(e) => handleInputChange('primary_color', e.target.value)}
                        placeholder="#f97316"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondary_color">Cor Secundária</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={config.secondary_color}
                        onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={config.secondary_color}
                        onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                        placeholder="#ea580c"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  As cores serão aplicadas aos botões, links e elementos de destaque do site.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Contato */}
        <TabsContent value="contact">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="phone"
                        value={config.phone}
                        onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                        placeholder="(11) 99999-9999"
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={testPhone}
                        title="Testar ligação"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="whatsapp"
                        value={config.whatsapp}
                        onChange={(e) => handleInputChange('whatsapp', formatWhatsApp(e.target.value))}
                        placeholder="5511999999999"
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={testWhatsApp}
                        title="Testar WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: código do país + DDD + número (sem espaços)
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={config.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contato@linakamati.com.br"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    value={config.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Rua, número, bairro, cidade, CEP"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horários de Funcionamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="monday_friday">Segunda a Sexta</Label>
                  <Input
                    id="monday_friday"
                    value={config.working_hours.monday_friday}
                    onChange={(e) => handleInputChange('working_hours.monday_friday', e.target.value)}
                    placeholder="Segunda a Sexta: 8h às 18h"
                  />
                </div>
                <div>
                  <Label htmlFor="saturday">Sábado</Label>
                  <Input
                    id="saturday"
                    value={config.working_hours.saturday}
                    onChange={(e) => handleInputChange('working_hours.saturday', e.target.value)}
                    placeholder="Sábado: 8h às 16h"
                  />
                </div>
                <div>
                  <Label htmlFor="sunday">Domingo</Label>
                  <Input
                    id="sunday"
                    value={config.working_hours.sunday}
                    onChange={(e) => handleInputChange('working_hours.sunday', e.target.value)}
                    placeholder="Domingo: 9h às 15h"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Redes Sociais */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Redes Sociais
              </CardTitle>
              <p className="text-sm text-gray-600">
                Links para suas redes sociais (deixe em branco para ocultar)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={config.social_links.facebook}
                    onChange={(e) => handleInputChange('social_links.facebook', e.target.value)}
                    placeholder="https://facebook.com/linakamati"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={config.social_links.instagram}
                    onChange={(e) => handleInputChange('social_links.instagram', e.target.value)}
                    placeholder="https://instagram.com/linakamati"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-600" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    value={config.social_links.youtube}
                    onChange={(e) => handleInputChange('social_links.youtube', e.target.value)}
                    placeholder="https://youtube.com/@linakamati"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-blue-400" />
                    Twitter/X
                  </Label>
                  <Input
                    id="twitter"
                    value={config.social_links.twitter}
                    onChange={(e) => handleInputChange('social_links.twitter', e.target.value)}
                    placeholder="https://twitter.com/linakamati"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Avançado */}
        <TabsContent value="advanced">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="delivery_fee">Taxa de Entrega (Kz)</Label>
                  <Input
                    id="delivery_fee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={config.delivery_fee}
                    onChange={(e) => handleInputChange('delivery_fee', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Taxa padrão cobrada para entregas
                  </p>
                </div>

                <div>
                  <Label htmlFor="footer_text">Texto Adicional do Rodapé</Label>
                  <Textarea
                    id="footer_text"
                    value={config.footer_text}
                    onChange={(e) => handleInputChange('footer_text', e.target.value)}
                    placeholder="Texto adicional que aparecerá no rodapé do site"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
