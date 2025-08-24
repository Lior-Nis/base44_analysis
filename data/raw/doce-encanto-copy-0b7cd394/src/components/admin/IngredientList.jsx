
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, PlusCircle, MinusCircle, AlertTriangle, Search, Filter } from 'lucide-react';

export default function IngredientList({ ingredients, onEditIngredient, onAddStock, onUseStock, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'low_stock', 'ok'

  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'low_stock') {
      matchesFilter = ing.current_stock <= ing.min_stock_level;
    } else if (filter === 'ok') {
      matchesFilter = ing.current_stock > ing.min_stock_level;
    }

    return matchesSearch && matchesFilter;
  });

  const getStatus = (ingredient) => {
    if (ingredient.current_stock <= 0) {
      return { text: 'Esgotado', color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> };
    }
    if (ingredient.current_stock <= ingredient.min_stock_level) {
      return { text: 'Estoque Baixo', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <AlertTriangle className="w-4 h-4 text-yellow-500" /> };
    }
    return { text: 'Em Estoque', color: 'bg-green-100 text-green-800 border-green-200', icon: null };
  };

  if (isLoading) {
    return <p>Carregando ingredientes...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle>Inventário Atual</CardTitle>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Buscar ingrediente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
                    <option value="all">Todos</option>
                    <option value="low_stock">Estoque Baixo</option>
                    <option value="ok">Estoque OK</option>
                </select>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Ingrediente</th>
                <th className="text-left p-4 font-medium">Estoque Atual</th>
                <th className="text-left p-4 font-medium">Estoque Mínimo</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map(ing => {
                const status = getStatus(ing);
                return (
                  <tr key={ing.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{ing.name}</td>
                    <td className="p-4">{ing.current_stock} {ing.unit_of_measure}</td>
                    <td className="p-4">{ing.min_stock_level} {ing.unit_of_measure}</td>
                    <td className="p-4">
                      <Badge className={status.color}>{status.text}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onAddStock(ing)} className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"><PlusCircle className="w-4 h-4 mr-1"/> Adicionar</Button>
                        <Button size="sm" variant="outline" onClick={() => onUseStock(ing)} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"><MinusCircle className="w-4 h-4 mr-1"/> Dar Baixa</Button>
                        <Button size="sm" variant="ghost" onClick={() => onEditIngredient(ing)}><Edit className="w-4 h-4"/></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredIngredients.length === 0 && <p className="text-center text-gray-500 py-8">Nenhum ingrediente encontrado.</p>}
      </CardContent>
    </Card>
  );
}
