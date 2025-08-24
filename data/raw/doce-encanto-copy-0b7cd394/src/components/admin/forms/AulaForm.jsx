import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Video, 
  Eye, 
  Shield, 
  Lock, 
  DollarSign, 
  FileText, 
  Play,
  Pause,
  Volume2,
  SkipForward,
  AlertCircle,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react';
import { UploadFile } from '@/api/integrations';

export default function AulaForm({ open, setOpen, aula, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Técnicas Básicas',
    level: 'Iniciante',
    duration_minutes: 30,
    is_free: true,
    price: 0,
    ingredients_list: '',
    step_by_step: '',
    can_skip_parts: true,
    block_screenshots: false,
    prevent_download: true, // Sempre ativo
    tags: []
  });

  const [videoFile, setVideoFile] = useState(null);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (aula) {
      setFormData({
        title: aula.title || '',
        description: aula.description || '',
        category: aula.category || 'Técnicas Básicas',
        level: aula.level || 'Iniciante',
        duration_minutes: aula.duration_minutes || 30,
        is_free: aula.is_free !== undefined ? aula.is_free : true,
        price: aula.price || 0,
        ingredients_list: aula.ingredients_list || '',
        step_by_step: aula.step_by_step || '',
        can_skip_parts: aula.can_skip_parts !== undefined ? aula.can_skip_parts : true,
        block_screenshots: aula.block_screenshots || false,
        prevent_download: true, // Sempre ativo
        tags: aula.tags || []
      });
      setPreviewUrl(aula.video_url);
    } else {
      // Reset para nova aula
      setFormData({
        title: '',
        description: '',
        category: 'Técnicas Básicas',
        level: 'Iniciante',
        duration_minutes: 30,
        is_free: true,
        price: 0,
        ingredients_list: '',
        step_by_step: '',
        can_skip_parts: true,
        block_screenshots: false,
        prevent_download: true,
        tags: []
      });
      setVideoFile(null);
      setPdfFiles([]);
      setPreviewUrl(null);
    }
  }, [aula, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'video/mp4' && file.type !== 'video/webm' && file.type !== 'video/mov') {
      alert('Por favor, selecione um arquivo de vídeo válido (MP4, WebM ou MOV).');
      return;
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      alert('O arquivo de vídeo deve ter menos de 500MB.');
      return;
    }

    setVideoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handlePdfUpload = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type === 'application/pdf');
    
    if (validFiles.length !== files.length) {
      alert('Por favor, selecione apenas arquivos PDF.');
      return;
    }

    setPdfFiles(prev => [...prev, ...validFiles]);
  };

  const removePdf = (index) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Por favor, insira o título da aula.');
      return;
    }

    if (!aula && !videoFile) {
      alert('Por favor, selecione um arquivo de vídeo.');
      return;
    }

    if (!formData.is_free && formData.price <= 0) {
      alert('Por favor, defina um preço para a aula paga.');
      return;
    }

    setIsLoading(true);
    setIsUploading(true);

    try {
      let finalData = { ...formData };

      // Upload do vídeo se houver
      if (videoFile) {
        setUploadProgress(20);
        const { file_url: videoUrl } = await UploadFile({ file: videoFile });
        finalData.video_url = videoUrl;
        setUploadProgress(50);
      }

      // Upload dos PDFs
      if (pdfFiles.length > 0) {
        setUploadProgress(70);
        const pdfUrls = [];
        for (const pdfFile of pdfFiles) {
          const { file_url } = await UploadFile({ file: pdfFile });
          pdfUrls.push(file_url);
        }
        finalData.pdf_materials = pdfUrls;
        setUploadProgress(90);
      }

      // Upload da thumbnail se não existir
      if (!aula && videoFile) {
        // Aqui poderia gerar uma thumbnail do vídeo automaticamente
        // Por enquanto, vamos usar uma imagem padrão ou deixar para depois
      }

      setUploadProgress(100);
      await onSubmit(finalData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'Técnicas Básicas',
        level: 'Iniciante',
        duration_minutes: 30,
        is_free: true,
        price: 0,
        ingredients_list: '',
        step_by_step: '',
        can_skip_parts: true,
        block_screenshots: false,
        prevent_download: true,
        tags: []
      });
      setVideoFile(null);
      setPdfFiles([]);
      setPreviewUrl(null);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Erro ao salvar aula:', error);
      alert('Erro ao salvar a aula. Tente novamente.');
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-orange-500" />
            {aula ? 'Editar Aula' : 'Nova Aula em Vídeo'}
          </DialogTitle>
          <DialogDescription>
            Configure todos os detalhes da sua aula educativa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload de Vídeo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload do Vídeo da Aula
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Selecione o arquivo de vídeo</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Formatos aceitos: MP4, WebM, MOV • Tamanho máximo: 500MB
                  </p>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/mov"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload">
                    <Button type="button" className="bg-orange-500 hover:bg-orange-600">
                      <Upload className="w-4 h-4 mr-2" />
                      Escolher Vídeo
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <video 
                      src={previewUrl} 
                      controls 
                      className="w-full max-h-64 rounded-lg"
                      preload="metadata"
                    >
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {videoFile ? `${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(2)} MB)` : 'Vídeo atual'}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setVideoFile(null);
                        setPreviewUrl(aula?.video_url || null);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Enviando vídeo...</span>
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações da Aula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título da Aula *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Torta de Limão Perfeita"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duração (minutos) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration_minutes}
                    onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição Detalhada *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o que o aluno aprenderá, os objetivos da aula e o que ela aborda..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Técnicas Básicas">Técnicas Básicas</SelectItem>
                      <SelectItem value="Bolos">Bolos</SelectItem>
                      <SelectItem value="Doces Finos">Doces Finos</SelectItem>
                      <SelectItem value="Salgados">Salgados</SelectItem>
                      <SelectItem value="Decoração">Decoração</SelectItem>
                      <SelectItem value="Recursos Educacionais">Recursos Educacionais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level">Nível de Dificuldade</Label>
                  <Select value={formData.level} onValueChange={(value) => handleChange('level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Iniciante">Iniciante</SelectItem>
                      <SelectItem value="Intermediário">Intermediário</SelectItem>
                      <SelectItem value="Avançado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags da Aula</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Adicionar tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monetização */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Definição de Acesso e Preço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) => handleChange('is_free', checked)}
                />
                <Label htmlFor="is_free" className="flex items-center gap-2">
                  {formData.is_free ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Aula Gratuita
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 text-orange-500" />
                      Aula Paga
                    </>
                  )}
                </Label>
              </div>

              {!formData.is_free && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <Label htmlFor="price">Preço da Aula (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                    required={!formData.is_free}
                  />
                  <p className="text-sm text-orange-600 mt-2">
                    Este será o valor que o cliente verá no aplicativo.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configurações de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Configurações de Segurança e Experiência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Proteção Anti-Cópia */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Proteção Anti-Cópia
                </h4>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-800">Impedir Download do Vídeo</p>
                      <p className="text-sm text-red-600">
                        O cliente só poderá assistir via streaming (sempre ativo)
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 text-red-500" />
                      <span className="ml-2 text-red-600 font-medium">ATIVO</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Bloquear Captura de Tela/Gravação</p>
                    <p className="text-sm text-gray-600">
                      Impede screenshots e gravação de tela durante a aula
                    </p>
                  </div>
                  <Switch
                    checked={formData.block_screenshots}
                    onCheckedChange={(checked) => handleChange('block_screenshots', checked)}
                  />
                </div>
              </div>

              <Separator />

              {/* Controle de Navegação */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Controle de Navegação no Vídeo
                </h4>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-medium text-blue-800">Permitir Avanço Livre no Vídeo</p>
                    <p className="text-sm text-blue-600">
                      {formData.can_skip_parts 
                        ? "O aluno pode pular para qualquer parte da aula"
                        : "O aluno deve assistir sequencialmente, sem pular etapas"
                      }
                    </p>
                  </div>
                  <Switch
                    checked={formData.can_skip_parts}
                    onCheckedChange={(checked) => handleChange('can_skip_parts', checked)}
                  />
                </div>

                {!formData.can_skip_parts && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Modo Sequencial Ativado</p>
                        <p className="text-xs text-yellow-700">
                          Ideal para aulas que seguem um passo a passo rigoroso onde cada etapa é fundamental.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recursos Complementares */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                Recursos Complementares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ingredients">Lista de Ingredientes e Materiais</Label>
                <Textarea
                  id="ingredients"
                  placeholder="Liste todos os ingredientes e materiais necessários..."
                  value={formData.ingredients_list}
                  onChange={(e) => handleChange('ingredients_list', e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="steps">Passo a Passo Escrito</Label>
                <Textarea
                  id="steps"
                  placeholder="Descreva o passo a passo que complementa o vídeo..."
                  value={formData.step_by_step}
                  onChange={(e) => handleChange('step_by_step', e.target.value)}
                  rows={6}
                />
              </div>

              {/* Upload de PDFs */}
              <div>
                <Label>PDFs Complementares</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handlePdfUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload">
                    <Button type="button" variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Anexar PDFs (Receitas, Guias, etc.)
                    </Button>
                  </label>
                </div>

                {pdfFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {pdfFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePdf(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pré-visualização */}
          {previewUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-500" />
                  Pré-visualização da Aula
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4">
                  <video 
                    src={previewUrl} 
                    controls={formData.can_skip_parts}
                    className="w-full max-h-80 rounded"
                    controlsList={formData.block_screenshots ? "nodownload" : ""}
                  >
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-300">
                    <span>Como o aluno verá:</span>
                    <div className="flex items-center gap-4">
                      {formData.can_skip_parts ? (
                        <span className="flex items-center gap-1">
                          <SkipForward className="w-3 h-3" />
                          Avanço livre
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          Sequencial
                        </span>
                      )}
                      {formData.block_screenshots && (
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Protegida
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {aula ? 'Atualizar Aula' : 'Publicar Aula'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}