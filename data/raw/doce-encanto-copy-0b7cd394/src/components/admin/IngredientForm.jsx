import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ingredient } from '@/api/entities';
import { Loader2 } from 'lucide-react';

export default function IngredientForm({ open, setOpen, ingredient, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    unit_of_measure: 'kg',
    default_supplier: '',
    average_cost: 0,
    min_stock_level: 0,
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name || '',
        unit_of_measure: ingredient.unit_of_measure || 'kg',
        default_supplier: ingredient.default_supplier || '',
        average_cost: ingredient.average_cost || 0,
        min_stock_level: ingredient.min_stock_level || 0,
        location: ingredient.location || ''
      });
    } else {
      setFormData({
        name: '',
        unit_of_measure: 'kg',
        default_supplier: '',
        average_cost: 0,
        min_stock_level: 0,
        location: ''
      });
    }
  }, [ingredient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSave = {
        ...formData,
        average_cost: parseFloat(formData.average_cost),
        min_stock_level: parseFloat(formData.min_stock_level)
    };
    try {
      if (ingredient?.id) {
        await Ingredient.update(ingredient.id, dataToSave);
      } else {
        await Ingredient.create(dataToSave);
      }
      onSave();
    } catch (error) {
      console.error("Erro ao salvar ingrediente:", error);
      alert('Ocorreu um erro ao salvar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ingredient ? 'Editar Ingrediente' : 'Novo Ingrediente'}</DialogTitle>
          <DialogDescription>Preencha os detalhes do ingrediente para controle de estoque.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label>Nome do Ingrediente</Label>
            <Input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Unidade de Medida</Label>
              <select name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                <option value="kg">kg (Quilograma)</option>
                <option value="g">g (Grama)</option>
                <option value="un">un (Unidade)</option>
                <option value="L">L (Litro)</option>
                <option value="ml">ml (Mililitro)</option>
              </select>
            </div>
            <div>
              <Label>Estoque Mínimo</Label>
              <Input name="min_stock_level" type="number" value={formData.min_stock_level} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>Fornecedor Padrão</Label>
                <Input name="default_supplier" value={formData.default_supplier} onChange={handleChange} />
            </div>
            <div>
                <Label>Custo Médio (por unidade)</Label>
                <Input name="average_cost" type="number" step="0.01" value={formData.average_cost} onChange={handleChange} />
            </div>
          </div>
          <div>
            <Label>Localização no Armazém</Label>
            <Input name="location" value={formData.location} onChange={handleChange} />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}