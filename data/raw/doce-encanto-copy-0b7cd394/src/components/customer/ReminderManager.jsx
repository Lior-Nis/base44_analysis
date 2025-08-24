
import React, { useState, useEffect } from 'react';
import { CustomerReminder } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Edit, Trash2, Bell, Loader2, Cake, HeartHandshake, GraduationCap, Briefcase, Calendar as CalendarIcon } from 'lucide-react';

const reminderIcons = {
  aniversario: <Cake className="w-5 h-5 text-pink-500" />,
  casamento: <HeartHandshake className="w-5 h-5 text-purple-500" />,
  formatura: <GraduationCap className="w-5 h-5 text-blue-500" />,
  reuniao: <Briefcase className="w-5 h-5 text-green-500" />,
  outro: <CalendarIcon className="w-5 h-5 text-gray-500" />,
};

export default function ReminderManager({ user }) {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentReminder, setCurrentReminder] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    reminder_date: null,
    reminder_type: 'aniversario',
    description: '',
  });

  useEffect(() => {
    if (user?.email) {
      loadReminders();
    }
  }, [user]);

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const data = await CustomerReminder.filter({ customer_email: user.email }, '-reminder_date');
      setReminders(data);
    } catch (error) {
      console.error("Erro ao carregar lembretes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (reminder = null) => {
    setCurrentReminder(reminder);
    if (reminder) {
      setFormData({
        title: reminder.title,
        reminder_date: new Date(reminder.reminder_date),
        reminder_type: reminder.reminder_type,
        description: reminder.description || '',
      });
    } else {
      setFormData({
        title: '',
        reminder_date: null,
        reminder_type: 'aniversario',
        description: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleSaveReminder = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.reminder_date) {
      alert('Por favor, preencha o título e a data.');
      return;
    }

    const dataToSave = {
      ...formData,
      customer_email: user.email,
      reminder_date: formData.reminder_date.toISOString().split('T')[0],
    };

    try {
      if (currentReminder) {
        await CustomerReminder.update(currentReminder.id, dataToSave);
      } else {
        await CustomerReminder.create(dataToSave);
      }
      setIsFormOpen(false);
      loadReminders();
    } catch (error) {
      console.error('Erro ao salvar lembrete:', error);
      alert('Não foi possível salvar o lembrete.');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (window.confirm('Tem certeza que deseja excluir este lembrete?')) {
      try {
        await CustomerReminder.delete(reminderId);
        loadReminders();
      } catch (error) {
        console.error('Erro ao excluir lembrete:', error);
        alert('Não foi possível excluir o lembrete.');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            Datas Especiais e Lembretes
          </CardTitle>
          <CardDescription>Nunca se esqueça de uma data importante. Nós te avisaremos!</CardDescription>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Lembrete
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Nenhuma data especial cadastrada.</p>
            <p className="text-sm">Adicione aniversários, casamentos e outros eventos para receber lembretes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0">
                  {reminderIcons[reminder.reminder_type] || reminderIcons.outro}
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold">{reminder.title}</h4>
                  <p className="text-sm text-gray-600">
                    {format(new Date(reminder.reminder_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleOpenForm(reminder)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteReminder(reminder.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentReminder ? 'Editar Lembrete' : 'Adicionar Novo Lembrete'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveReminder} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Evento</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Aniversário da Mãe"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data do Evento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.reminder_date ? 
                        format(formData.reminder_date, 'PPP', { locale: ptBR }) : 
                        <span>Escolha uma data</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.reminder_date}
                      onSelect={(date) => setFormData({ ...formData, reminder_date: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Evento</Label>
                <Select
                  value={formData.reminder_type}
                  onValueChange={(value) => setFormData({ ...formData, reminder_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aniversario">Aniversário</SelectItem>
                    <SelectItem value="casamento">Casamento</SelectItem>
                    <SelectItem value="formatura">Formatura</SelectItem>
                    <SelectItem value="reuniao">Reunião/Empresarial</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Alguma observação? Ex: 'Ela adora bolo de chocolate'"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
