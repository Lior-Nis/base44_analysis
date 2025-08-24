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
  FileText, 
  Eye, 
  Shield, 
  Lock, 
  DollarSign, 
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  BookOpen,
  Users,
  Star,
  Tag
} from 'lucide-react';
import { UploadFile } from '@/api/integrations';

export default function PDFForm({ open, setOpen, pdf, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Receitas',
    is_free: true,
    price: 0,
    tags: [],
    pages_count: 0,
    file_size_mb: 0,
    thumbnail_url: '',
    pdf_url: '',
    enable_download: false,
    enable_print: false,
    watermark_enabled: true,
    access_duration_days: 365,
    preview_pages: 3
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [pdfInfo, setPdfInfo] = useState(null);

  useEffect(() => {
    if (pdf) {
      setFormData({
        title: pdf.title || '',
        description: pdf.description || '',
        category: pdf.category || 'Receitas',
        is_free: pdf.is_free !== undefined ? pdf.is_free : true,
        price: pdf.price || 0,
        tags: pdf.tags || [],
        pages_count: pdf.pages_count || 0,
        file_size_mb: pdf.file_size_mb || 0,
        thumbnail_url: pdf.thumbnail_url || '',
        pdf_url: pdf.pdf_url || '',
        enable_download: pdf.enable_download || false,
        enable_print: pdf.enable_print || false,
        watermark_enabled: pdf.watermark_enabled !== undefined ? pdf.watermark_enabled : true,
        access_duration_days: pdf.access_duration_days || 365,
        preview_pages: pdf.preview_pages || 3
      });
      setPdfPreview(pdf.pdf_url);
      setThumbnailPreview(pdf.thumbnail_url);
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Receitas',
        is_free: true,
        price: 0,
        tags: [],
        pages_count: 0,
        file_size_mb: 0,
        thumbnail_url: '',
        pdf_url: '',
        enable_download: false,
        enable_print: false,
        watermark_enabled: true,
        access_duration_days: 365,
        preview_pages: 3
      });
      setPdfFile(null);
      setThumbnailFile(null);
      setPdfPreview(null);
      setThumbnailPreview(null);
      setPdfInfo(null);
    }
  }, [pdf, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF válido.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('O arquivo PDF deve ter menos de 50MB.');
      return;
    }

    setPdfFile(file);
    setPdfPreview(URL.createObjectURL(file));

    // Simular extração de informações do PDF
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const estimatedPages = Math.ceil(file.size / (100 * 1024)); // Estimativa baseada no tamanho

    setPdfInfo({
      name: file.name,
      size: fileSizeMB,
      pages: estimatedPages
    });

    setFormData(prev => ({
      ...prev,
      file_size_mb: parseFloat(fileSizeMB),
      pages_count: estimatedPages,
      title: prev.title || file.name.replace('.pdf', '')
    }));
  };

  const handleThumbnailUpload = (e) => {
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

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
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
    
    if (!formData.title || !formData.description) {
      alert('Por favor, preencha os campos obrigatórios (Título, Descrição).');
      return;
    }

    if (!pdf && !pdfFile) {
      alert('Por favor, selecione um arquivo PDF.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let pdfUrl = formData.pdf_url;
      let thumbnailUrl = formData.thumbnail_url;

      // Upload do PDF se houver um novo arquivo
      if (pdfFile) {
        setUploadProgress(25);
        const pdfUploadResult = await UploadFile({ file: pdfFile });
        pdfUrl = pdfUploadResult.file_url;
        setUploadProgress(50);
      }

      // Upload da thumbnail se houver um novo arquivo
      if (thumbnailFile) {
        setUploadProgress(75);
        const thumbnailUploadResult = await UploadFile({ file: thumbnailFile });
        thumbnailUrl = thumbnailUploadResult.file_url;
      }

      setUploadProgress(90);

      const pdfData = {
        ...formData,
        pdf_url: pdfUrl,
        thumbnail_url: thumbnailUrl,
        download_count: pdf?.download_count || 0
      };

      await onSubmit(pdfData);
      
      setUploadProgress(100);
      
      // Reset form
      setPdfFile(null);
      setThumbnailFile(null);
      setPdfPreview(null);
      setThumbnailPreview(null);
      setPdfInfo(null);
      
    } catch (error) {
      console.error('Erro ao salvar PDF:', error);
      alert('Erro ao salvar PDF. Tente novamente.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            {pdf ? 'Editar PDF Educacional' : 'Adicionar Novo PDF Educacional'}
          </DialogTitle>
          <DialogDescription>
            Configure seu material educacional em PDF com controles avançados de acesso e segurança
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload do PDF */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload do PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="pdf-upload" className="cursor-pointer">
                    <div className="text-lg font-medium text-gray-700 mb-2">
                      Selecione seu arquivo PDF
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      Máximo 50MB • Formatos aceitos: PDF
                    </div>
                    <Button type="button" variant="outline">
                      Escolher Arquivo PDF
                    </Button>
                  </Label>
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {pdfInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">📄 Arquivo Selecionado</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Nome:</span>
                      <div className="text-blue-600">{pdfInfo.name}</div>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Tamanho:</span>
                      <div className="text-blue-600">{pdfInfo.size} MB</div>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Páginas:</span>
                      <div className="text-blue-600">~{pdfInfo.pages} páginas</div>
                    </div>
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fazendo upload...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do PDF</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do PDF <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Ex: Receitas Clássicas de Bolos"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receitas">Receitas</SelectItem>
                    <SelectItem value="Guias de Técnicas">Guias de Técnicas</SelectItem>
                    <SelectItem value="E-books">E-books</SelectItem>
                    <SelectItem value="Listas de Ingredientes">Listas de Ingredientes</SelectItem>
                    <SelectItem value="Tabelas de Conversão">Tabelas de Conversão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Descrição <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descreva o conteúdo do PDF e o que o aluno aprenderá..."
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags e Palavras-chave
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Digite uma tag e pressione Enter"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  Adicionar
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configurações de Monetização */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Monetização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={formData.is_free}
                    onChange={() => handleChange('is_free', true)}
                  />
                  <span>PDF Gratuito</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={!formData.is_free}
                    onChange={() => handleChange('is_free', false)}
                  />
                  <span>PDF Pago</span>
                </label>
              </div>

              {!formData.is_free && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="access_duration_days">Acesso por (dias)</Label>
                    <Input
                      id="access_duration_days"
                      type="number"
                      value={formData.access_duration_days}
                      onChange={(e) => handleChange('access_duration_days', parseInt(e.target.value) || 365)}
                      min="1"
                      max="3650"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configurações de Acesso e Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Controles de Acesso e Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Permitir Download</Label>
                      <p className="text-xs text-gray-500">Cliente pode baixar o PDF</p>
                    </div>
                    <Switch
                      checked={formData.enable_download}
                      onCheckedChange={(checked) => handleChange('enable_download', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Permitir Impressão</Label>
                      <p className="text-xs text-gray-500">Cliente pode imprimir o PDF</p>
                    </div>
                    <Switch
                      checked={formData.enable_print}
                      onCheckedChange={(checked) => handleChange('enable_print', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marca d'Água</Label>
                      <p className="text-xs text-gray-500">Adicionar marca d'água de proteção</p>
                    </div>
                    <Switch
                      checked={formData.watermark_enabled}
                      onCheckedChange={(checked) => handleChange('watermark_enabled', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preview_pages">Páginas de Preview</Label>
                    <Input
                      id="preview_pages"
                      type="number"
                      value={formData.preview_pages}
                      onChange={(e) => handleChange('preview_pages', parseInt(e.target.value) || 3)}
                      min="0"
                      max="10"
                    />
                    <p className="text-xs text-gray-500">
                      Número de páginas que o cliente pode ver antes de comprar
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-800">Recomendações de Segurança:</p>
                    <ul className="text-yellow-700 mt-1 space-y-1">
                      <li>• Para PDFs pagos, desabilite download e impressão</li>
                      <li>• Mantenha a marca d'água ativada para proteção</li>
                      <li>• Configure 2-3 páginas de preview para despertar interesse</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Imagem de Capa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                />
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
                    alt="Preview da capa"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                )}
                <p className="text-xs text-gray-500">
                  Recomendado: 400x300px, formato JPG ou PNG, máximo 5MB
                </p>
              </div>
            </CardContent>
          </Card>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading}>
            {isUploading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {pdf ? 'Atualizar PDF' : 'Adicionar PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}