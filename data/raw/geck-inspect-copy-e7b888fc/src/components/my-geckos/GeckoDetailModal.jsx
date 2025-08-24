import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeightRecord } from '@/api/entities';
import { format } from 'date-fns';
import { X, Plus, Trash2, LineChart, Loader2 } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Input } from '@/components/ui/input';

export default function GeckoDetailModal({ gecko, onClose, onUpdate }) {
  const [weightRecords, setWeightRecords] = useState([]);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeightRecords = async () => {
      if (gecko) {
        setIsLoading(true);
        const records = await WeightRecord.filter({ gecko_id: gecko.id }, '-record_date');
        setWeightRecords(records);
        setIsLoading(false);
      }
    };
    fetchWeightRecords();
  }, [gecko]);

  const handleAddWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) return;

    const newRecord = {
      gecko_id: gecko.id,
      weight_grams: parseFloat(newWeight),
      record_date: new Date().toISOString().split('T')[0],
    };

    const createdRecord = await WeightRecord.create(newRecord);
    setWeightRecords([createdRecord, ...weightRecords]);
    setNewWeight('');
    setShowAddWeight(false);
  };

  const handleDeleteWeight = async (recordId) => {
    if (window.confirm("Are you sure you want to delete this weight record?")) {
      await WeightRecord.delete(recordId);
      setWeightRecords(weightRecords.filter(r => r.id !== recordId));
    }
  };

  const chartData = [...weightRecords].reverse().map(r => ({
    date: format(new Date(r.record_date), 'MMM d'),
    weight: r.weight_grams,
    fullDate: format(new Date(r.record_date), 'PPP')
  }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] flex flex-col bg-slate-900 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700">
          <CardTitle className="text-slate-100">{gecko.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 overflow-y-auto flex-1 grid md:grid-cols-2 gap-8">
          {/* Left Column: Details */}
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-lg overflow-hidden">
                <img 
                    src={gecko.image_urls?.[0] || 'https://i.imgur.com/sw9gnDp.png'} 
                    alt={gecko.name} 
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="grid grid-cols-2 gap-4 text-slate-300">
                <p><strong>Sex:</strong> {gecko.sex}</p>
                <p><strong>ID:</strong> {gecko.gecko_id_code || 'N/A'}</p>
                <p><strong>Status:</strong> {gecko.status}</p>
                <p><strong>Hatch Date:</strong> {gecko.hatch_date ? format(new Date(gecko.hatch_date), 'PPP') : 'N/A'}</p>
                <p className="col-span-2"><strong>Morphs:</strong> {gecko.morphs_traits || 'N/A'}</p>
            </div>
          </div>

          {/* Right Column: Weight Tracking */}
          <div className="space-y-4 flex flex-col">
            <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2"><LineChart/> Weight History</h3>
            
            {isLoading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-emerald-400"/></div>
            ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                    <RechartsLineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(134, 239, 172, 0.2)" />
                        <XAxis dataKey="date" stroke="#a7f3d0" />
                        <YAxis stroke="#a7f3d0" domain={['dataMin - 2', 'dataMax + 2']} unit="g"/>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#022c22', border: '1px solid rgba(134, 239, 172, 0.2)'}} 
                          labelStyle={{ color: '#d1fae5' }}
                          itemStyle={{ color: '#86efac' }}
                          formatter={(value) => [`${value}g`, 'Weight']}
                          labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                        />
                        <Legend wrapperStyle={{ color: '#d1fae5' }} />
                        <Line type="monotone" dataKey="weight" stroke="#86efac" strokeWidth={2} dot={{r: 4}} activeDot={{ r: 8 }} />
                    </RechartsLineChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-slate-400 text-center py-8">No weight records yet.</p>
            )}

            {!showAddWeight ? (
              <Button onClick={() => setShowAddWeight(true)} variant="outline" className="mt-auto">
                <Plus className="w-4 h-4 mr-2" /> Add Weight Record
              </Button>
            ) : (
              <div className="flex gap-2 items-center mt-auto">
                <Input
                  type="number"
                  placeholder="Weight in grams"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="bg-slate-800"
                />
                <Button onClick={handleAddWeight}>Save</Button>
                <Button variant="ghost" onClick={() => setShowAddWeight(false)}>Cancel</Button>
              </div>
            )}
            
            <div className="overflow-y-auto space-y-2 flex-grow pr-2">
                {weightRecords.map(record => (
                    <div key={record.id} className="flex justify-between items-center bg-slate-800 p-2 rounded">
                        <span className="text-slate-300">{format(new Date(record.record_date), 'PPP')}</span>
                        <span className="font-bold text-emerald-400">{record.weight_grams}g</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteWeight(record.id)}>
                            <Trash2 className="w-4 h-4 text-red-500"/>
                        </Button>
                    </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}