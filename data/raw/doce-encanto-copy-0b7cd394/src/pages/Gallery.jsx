import React, { useState, useEffect } from "react";
import { CustomerPhoto, User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Heart, Upload, Send, Loader2 } from "lucide-react";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [photosData, user] = await Promise.all([
        CustomerPhoto.filter({ is_approved: true }, '-created_date'),
        User.me().catch(() => null)
      ]);
      setPhotos(photosData);
      setUserData(user);
    } catch (error) {
      console.error("Erro ao carregar galeria:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !userData) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      await CustomerPhoto.create({
        customer_name: userData.full_name,
        photo_url: file_url,
        caption: caption,
        is_approved: false
      });
      // Reset form and show success message
      setShowUploadForm(false);
      setFile(null);
      setCaption("");
      alert("Sua foto foi enviada para aprovação. Obrigado por compartilhar!");
    } catch (error) {
      console.error("Erro ao enviar foto:", error);
      alert("Ocorreu um erro ao enviar sua foto. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">Galeria de Clientes</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Veja os momentos doces que nossos clientes compartilharam conosco. Inspire-se!
          </p>
        </motion.div>

        <div className="text-center mb-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-lg"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <Camera className="w-5 h-5 mr-2" />
            {showUploadForm ? 'Fechar Formulário' : 'Envie sua Foto'}
          </Button>
        </div>

        <AnimatePresence>
          {showUploadForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-pink-100">
                <CardHeader>
                  <CardTitle className="text-pink-700">Compartilhe seu Momento</CardTitle>
                </CardHeader>
                <CardContent>
                  {userData ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-pink-200 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500">
                                <span>Carregue um arquivo</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" required/>
                              </label>
                              <p className="pl-1">ou arraste e solte</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
                            {file && <p className="text-sm text-green-600 mt-2">{file.name}</p>}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="caption" className="block text-sm font-medium text-gray-700">Legenda (opcional)</label>
                        <Textarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-1" />
                      </div>
                      <Button type="submit" disabled={isUploading || !file} className="w-full">
                        {isUploading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        {isUploading ? 'Enviando...' : 'Enviar Foto'}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center">
                      <p className="mb-4">Você precisa estar logado para enviar uma foto.</p>
                      <Button onClick={() => User.login()}>Fazer Login</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative aspect-square overflow-hidden rounded-xl shadow-lg"
              >
                <img src={photo.photo_url} alt={photo.caption || 'Foto de cliente'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="font-bold">{photo.customer_name}</p>
                  <p className="text-sm opacity-90 line-clamp-2">{photo.caption}</p>
                </div>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white bg-black/20 hover:bg-black/40"><Heart className="w-5 h-5" /></Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}