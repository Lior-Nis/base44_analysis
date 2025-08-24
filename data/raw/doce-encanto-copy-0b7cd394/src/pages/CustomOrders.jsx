
import React, { useState } from "react";
import { CustomOrder, User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Loader2, Send, Gift, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CustomOrders() {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    event_type: "",
    event_date: "",
    guest_count: "",
    description: "",
    budget_range: ""
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  React.useEffect(() => {
    User.me().then(user => {
      if (user) {
        setFormData(prev => ({
          ...prev,
          customer_name: user.full_name,
          customer_email: user.email,
          customer_phone: user.phone || ""
        }));
      }
    }).catch(() => console.log("Usuário não logado"));
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imageUrls = [];
      if (files.length > 0) {
        const uploadPromises = files.map(file => UploadFile({ file }));
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.map(res => res.file_url);
      }
      
      await CustomOrder.create({
        ...formData,
        guest_count: Number(formData.guest_count),
        inspiration_images: imageUrls
      });
      
      setSubmitSuccess(true);
    } catch (error)
    {
      console.error("Erro ao enviar pedido:", error);
      alert("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="text-center max-w-lg p-8">
          <CardHeader>
            <Gift className="w-16 h-16 mx-auto text-pink-500 mb-4"/>
            <CardTitle className="text-2xl gradient-text">Pedido Enviado com Sucesso!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">Recebemos sua solicitação. Entraremos em contato em breve com um orçamento e mais detalhes. Obrigado por escolher a Doce Encanto!</p>
            <Link to={createPageUrl("Home")}>
              <Button>Voltar para a Página Inicial</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-amber-50 p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">Pedidos Especiais</h1>
          <p className="text-gray-600 text-lg">
            Sonhe, e nós transformamos em bolo. Conte-nos sobre seu evento!
          </p>
        </div>
        
        <Card className="bg-white/80 backdrop-blur-sm border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Gift className="w-6 h-6" /> Formulário de Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div><Label htmlFor="customer_name">Nome Completo</Label><Input id="customer_name" value={formData.customer_name} onChange={handleInputChange} required /></div>
                <div><Label htmlFor="customer_phone">Telefone</Label><Input id="customer_phone" type="tel" value={formData.customer_phone} onChange={handleInputChange} required /></div>
              </div>
              <div><Label htmlFor="customer_email">E-mail</Label><Input id="customer_email" type="email" value={formData.customer_email} onChange={handleInputChange} required /></div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="event_type">Tipo de Evento</Label>
                  <Select onValueChange={(v) => handleSelectChange('event_type', v)} required>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aniversario">Aniversário</SelectItem>
                      <SelectItem value="casamento">Casamento</SelectItem>
                      <SelectItem value="formatura">Formatura</SelectItem>
                      <SelectItem value="empresarial">Empresarial</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="event_date">Data do Evento</Label><Input id="event_date" type="date" value={formData.event_date} onChange={handleInputChange} required /></div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div><Label htmlFor="guest_count">Número de Convidados</Label><Input id="guest_count" type="number" min="1" value={formData.guest_count} onChange={handleInputChange} required /></div>
                <div>
                  <Label htmlFor="budget_range">Faixa de Orçamento (opcional)</Label>
                  <Select onValueChange={(v) => handleSelectChange('budget_range', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100-300">R$ 100 - R$ 300</SelectItem>
                      <SelectItem value="300-500">R$ 300 - R$ 500</SelectItem>
                      <SelectItem value="500-1000">R$ 500 - R$ 1000</SelectItem>
                      <SelectItem value="1000+">Acima de R$ 1000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div><Label htmlFor="description">Descreva seu pedido</Label><Textarea id="description" placeholder="Detalhes do bolo, tema da festa, sabores, etc." value={formData.description} onChange={handleInputChange} required rows={5}/></div>

              <div>
                <Label htmlFor="inspiration_images">Imagens de Inspiração (opcional)</Label>
                <div className="mt-1 flex items-center gap-2 p-3 border border-pink-200 rounded-md">
                    <Upload className="w-5 h-5 text-gray-500" />
                    <Input id="inspiration_images" type="file" multiple onChange={handleFileChange} className="border-none shadow-none focus-visible:ring-0 p-0 h-auto" />
                </div>
                {files.length > 0 && <p className="text-sm text-gray-500 mt-1">{files.length} arquivo(s) selecionado(s)}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-pink-500 to-amber-500 text-white">
                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {isSubmitting ? 'Enviando Solicitação...' : 'Enviar Solicitação'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
