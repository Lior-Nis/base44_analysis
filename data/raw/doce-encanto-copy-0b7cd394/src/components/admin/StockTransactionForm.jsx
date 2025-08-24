
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Ingredient, StockEntry, StockUsage } from '@/api/entities';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function StockTransactionForm({ open, setOpen, ingredient, transactionType, onSave }) {
  const [quantity, setQuantity] = useState(0);
  const [details, setDetails] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    supplier: '',
    invoice_number: '',
    reason: '',
    cost_per_unit: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const isEntry = transactionType === 'entry';
  const title = isEntry ? 'Registrar Entrada de Estoque' : 'Registrar Saída/Baixa de Estoque';
  const description = `Registrando ${isEntry ? 'entrada' : 'baixa'} para: ${ingredient?.name}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity <= 0) {
      alert('A quantidade deve ser maior que zero.');
      return;
    }
    setIsLoading(true);

    try {
      const currentStock = ingredient.current_stock || 0;
      let newStock;

      if (isEntry) {
        await StockEntry.create({
          ingredient_id: ingredient.id,
          quantity: parseFloat(quantity),
          entry_date: details.date,
          supplier: details.supplier,
          invoice_number: details.invoice_number,
          cost_per_unit: parseFloat(details.cost_per_unit) || ingredient.average_cost || 0
        });
        newStock = currentStock + parseFloat(quantity);
      } else { // 'usage'
        if (currentStock < quantity) {
          alert('Quantidade de consumo maior que o estoque atual!');
          setIsLoading(false);
          return;
        }
        await StockUsage.create({
          ingredient_id: ingredient.id,
          quantity: parseFloat(quantity),
          usage_date: details.date,
          reason: details.reason
        });
        newStock = currentStock - parseFloat(quantity);
      }

      await Ingredient.update(ingredient.id, { current_stock: newStock });
      onSave();

    } catch (error) {
      console.error(`Erro ao registrar ${transactionType}:`, error);
      alert('Ocorreu um erro ao salvar a transação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantidade ({ingredient?.unit_of_measure})</Label>
              <Input type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0.01" />
            </div>
            <div>
              <Label>Data</Label>
              <Input type="date" name="date" value={details.date} onChange={handleChange} required />
            </div>
          </div>
          {isEntry ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label>Fornecedor</Label>
                      <Input name="supplier" value={details.supplier} onChange={handleChange} />
                  </div>
                  <div>
                      <Label>Nº Nota Fiscal</Label>
                      <Input name="invoice_number" value={details.invoice_number} onChange={handleChange} />
                  </div>
              </div>
              <div>
                <Label>Custo por Unidade (deixa em branco para usar a média)</Label>
                <Input type="number" step="0.01" name="cost_per_unit" value={details.cost_per_unit} onChange={handleChange} />
              </div>
            </>
          ) : (
            <div>
              <Label>Motivo do Consumo</Label>
              <Textarea name="reason" placeholder="Ex: Produção de 10 bolos, Perda, etc." value={details.reason} onChange={handleChange} />
            </div>
          )}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
