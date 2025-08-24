import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Ingredient } from '@/api/entities';
import IngredientList from './IngredientList';
import IngredientForm from './IngredientForm';
import StockTransactionForm from './StockTransactionForm';
import { Plus, Archive } from 'lucide-react';

export default function InventoryManagement() {
  const [view, setView] = useState('list'); // 'list', 'add_ingredient', 'edit_ingredient', 'add_transaction'
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [transactionType, setTransactionType] = useState('entry'); // 'entry' or 'usage'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    setIsLoading(true);
    try {
      const data = await Ingredient.list('-created_date');
      setIngredients(data);
    } catch (error) {
      console.error("Erro ao carregar ingredientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (formView, ingredient = null, type = 'entry') => {
    setSelectedIngredient(ingredient);
    setTransactionType(type);
    setView(formView);
  };

  const handleCloseForm = () => {
    setView('list');
    setSelectedIngredient(null);
    loadIngredients();
  };

  const renderContent = () => {
    switch (view) {
      case 'add_ingredient':
      case 'edit_ingredient':
        return (
          <IngredientForm
            open={true}
            setOpen={(isOpen) => !isOpen && handleCloseForm()}
            ingredient={selectedIngredient}
            onSave={handleCloseForm}
          />
        );
      case 'add_transaction':
        return (
          <StockTransactionForm
            open={true}
            setOpen={(isOpen) => !isOpen && handleCloseForm()}
            ingredient={selectedIngredient}
            transactionType={transactionType}
            onSave={handleCloseForm}
          />
        );
      case 'list':
      default:
        return (
          <IngredientList
            ingredients={ingredients}
            onEditIngredient={(ingredient) => handleOpenForm('edit_ingredient', ingredient)}
            onAddStock={(ingredient) => handleOpenForm('add_transaction', ingredient, 'entry')}
            onUseStock={(ingredient) => handleOpenForm('add_transaction', ingredient, 'usage')}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Archive className="w-6 h-6 text-orange-500"/>
                Gestão de Estoque de Ingredientes
            </h2>
            <p className="text-gray-600">Controle total da sua matéria-prima.</p>
        </div>
        <Button onClick={() => handleOpenForm('add_ingredient')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Ingrediente
        </Button>
      </div>
      {renderContent()}
    </div>
  );
}