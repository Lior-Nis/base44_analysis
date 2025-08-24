import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

export default function ProductForm({ open, setOpen, product, onSubmit }) {
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        category: product.category || 'Salgados',
        tags: product.tags?.join(', ') || '',
        image_url: product.image_url || '',
        min_order_quantity: product.min_order_quantity || 1,
      });
      setPreviewImage(product.image_url);
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'Salgados',
        tags: '',
        image_url: '',
        min_order_quantity: 1,
      });
      setPreviewImage(null);
    }
    setImageFile(null);
  }, [product, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const productData = {
        ...formData,
        price: parseFloat(formData.price),
        min_order_quantity: parseInt(formData.min_order_quantity, 10) || 1,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };
    await onSubmit(productData, imageFile);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
          <DialogDescription>
            {product ? 'Altere as informações do produto abaixo.' : 'Preencha as informações para criar um novo produto.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Descrição</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Preço</Label>
            <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="min_order_quantity" className="text-right">Qtd. Mínima</Label>
            <Input id="min_order_quantity" name="min_order_quantity" type="number" min="1" step="1" value={formData.min_order_quantity} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Categoria</Label>
            <select id="category" name="category" value={formData.category} onChange={handleChange} className="col-span-3 border rounded-md px-2 py-1">
                <option value="Salgados">Salgados</option>
                <option value="Doces">Doces</option>
                <option value="Especiais">Especiais</option>
                <option value="Bebidas">Bebidas</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">Tags</Label>
            <Input id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="Destaque, Novo, etc." className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">Imagem</Label>
            <div className="col-span-3">
              <Input id="image" type="file" onChange={handleFileChange} accept="image/*" />
              {previewImage && <img src={previewImage} alt="Prévia" className="mt-2 w-20 h-20 object-cover rounded-md" />}
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}