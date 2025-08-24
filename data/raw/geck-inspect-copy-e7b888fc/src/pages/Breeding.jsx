
import React, { useState, useEffect } from 'react';
import { Gecko, BreedingPlan, Egg, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Loader2, GitBranch, Heart, Edit, Trash2, ChevronDown, ChevronUp, Egg as EggIcon, Calendar as CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays } from 'date-fns';
import { generateCalendarEvent } from '.@/api/functions/generateCalendarEvent';

function PlanDetails({ plan, onPlanUpdate, onPlanDelete }) {
    const [eggs, setEggs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedPlan, setEditedPlan] = useState(plan);
    const [editingHatchDate, setEditingHatchDate] = useState(null); // eggId to edit

    const loadEggs = async () => {
        setIsLoading(true);
        try {
            const planEggs = await Egg.filter({ breeding_plan_id: plan.id }, '-lay_date');
            setEggs(planEggs);
        } catch (error) {
            console.error("Failed to load eggs:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadEggs();
    }, [plan.id]);

    const handleDeleteEgg = async (eggId) => {
        if (window.confirm("Are you sure you want to permanently delete this egg record?")) {
            try {
                await Egg.delete(eggId);
                loadEggs();
            } catch (error) {
                console.error("Failed to delete egg:", error);
            }
        }
    };

    const handleAddNewEggs = async (count) => {
        const today = new Date();
        const newLayDate = today.toISOString().split('T')[0];
        const expectedHatch = addDays(today, 65);
        
        try {
            for (let i = 0; i < count; i++) {
                await Egg.create({
                    breeding_plan_id: plan.id,
                    lay_date: newLayDate,
                    hatch_date_expected: expectedHatch.toISOString().split('T')[0],
                    status: 'Incubating'
                });
            }
            loadEggs();
        } catch (error) {
            console.error("Failed to add eggs:", error);
        }
    };

    const handleUpdateEggStatus = async (eggId, status) => {
        const updateData = { status };
        const currentEgg = eggs.find(e => e.id === eggId);
        
        if (status === 'Hatched' && currentEgg?.status !== 'Hatched') {
            updateData.hatch_date_actual = new Date().toISOString().split('T')[0];
        }
        try {
            await Egg.update(eggId, updateData);
            loadEggs();
        } catch (error) {
            console.error("Failed to update egg status:", error);
        }
    };
    
    const handleUpdateHatchDate = async (eggId, newDate) => {
        if (!newDate) {
            setEditingHatchDate(null);
            return;
        }
        try {
            await Egg.update(eggId, { hatch_date_actual: newDate });
            setEditingHatchDate(null);
            loadEggs();
        } catch (error) {
            console.error("Failed to update hatch date:", error);
        }
    };

    const handleHatchEgg = async (eggId) => {
        await handleUpdateEggStatus(eggId, 'Hatched');
    };

    const handleAddToCalendar = async (egg) => {
        try {
            const sire = await Gecko.get(plan.sire_id);
            const dam = await Gecko.get(plan.dam_id);
            
            const title = `Gecko Egg Hatching - ${sire.name} x ${dam.name}`;
            const description = `Expected hatch date for egg laid on ${format(new Date(egg.lay_date), 'MMM dd, yyyy')}`;
            const startDate = new Date(egg.hatch_date_expected);
            
            // Create calendar URL for adding to calendar
            const encodedTitle = encodeURIComponent(title);
            const encodedDescription = encodeURIComponent(description);
            const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const startFormatted = formatDate(startDate);
            const endFormatted = formatDate(addDays(startDate, 1));
            
            const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startFormatted}/${endFormatted}&details=${encodedDescription}`;
            
            window.open(calendarUrl, '_blank');
        } catch (error) {
            console.error("Failed to generate calendar event:", error);
        }
    };

    const handleUpdatePlan = async () => {
        await onPlanUpdate(editedPlan);
        setIsEditModalOpen(false);
    };

    const StatusDisplay = ({ egg }) => {
        if (editingHatchDate === egg.id) {
            return (
                <Input 
                    type="date"
                    defaultValue={egg.hatch_date_actual}
                    onBlur={(e) => handleUpdateHatchDate(egg.id, e.target.value)}
                    autoFocus
                    className="bg-slate-800 border-slate-600 h-8"
                />
            );
        }

        const statusConfig = {
            'Hatched': {
                className: "bg-transparent text-green-400 border-green-400 hover:bg-green-900/20",
                text: egg.hatch_date_actual ? `Hatched on ${format(new Date(egg.hatch_date_actual), 'MM/dd/yyyy')}` : 'Hatched'
            },
            'Incubating': {
                className: "bg-transparent text-blue-400 border-blue-400 hover:bg-blue-900/20",
                text: "Incubating"
            },
            'Slug': {
                className: "bg-transparent text-red-400 border-red-400 hover:bg-red-900/20",
                text: "Slug"
            },
            'Infertile': {
                className: "bg-transparent text-red-400 border-red-400 hover:bg-red-900/20",
                text: "Infertile"
            },
            'Stillbirth': {
                className: "bg-transparent text-slate-400 border-slate-400 hover:bg-slate-700/20",
                text: "Stillbirth"
            }
        };

        const config = statusConfig[egg.status] || { className: "bg-transparent text-slate-400 border-slate-400", text: egg.status };
        const baseClasses = "cursor-pointer text-xs font-semibold px-2 py-1 rounded-md border w-full text-center h-8 truncate transition-colors flex items-center justify-center";

        return (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div
                        className={`${baseClasses} ${config.className}`}
                        onClick={(e) => {
                            if (egg.status === 'Hatched') {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingHatchDate(egg.id);
                            }
                        }}
                    >
                        {config.text}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-600 text-slate-200">
                    <DropdownMenuItem onClick={() => handleUpdateEggStatus(egg.id, 'Hatched')}>Hatched</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateEggStatus(egg.id, 'Incubating')}>Incubating</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateEggStatus(egg.id, 'Slug')}>Slug</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateEggStatus(egg.id, 'Infertile')}>Infertile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateEggStatus(egg.id, 'Stillbirth')}>Stillbirth</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <CardContent className="border-t border-slate-700 p-4">
            <div className="flex justify-end items-center mb-4">
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-800" onClick={() => setIsEditModalOpen(true)}>
                        <Edit size={14} className="mr-2"/> Edit Plan
                    </Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAddNewEggs(1)}>
                        <PlusCircle size={14} className="mr-2" /> Add 1 Egg
                    </Button>
                     <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAddNewEggs(2)}>
                        <PlusCircle size={14} className="mr-2" /> Add 2 Eggs
                    </Button>
                 </div>
            </div>

            {isLoading ? (
                <div className="text-center"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto" /></div>
            ) : eggs.length > 0 ? (
                <div className="space-y-3">
                    {eggs.map(egg => (
                        <div key={egg.id} className="grid grid-cols-3 items-center gap-2 bg-slate-800 p-3 rounded-lg">
                            <div className="flex items-center gap-3 col-span-1">
                                <EggIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <div>
                                    <p className="text-slate-200 text-sm">Laid: {format(new Date(egg.lay_date), 'MM/dd/yy')}</p>
                                    <p className="text-xs text-slate-400">Hatch: {format(new Date(egg.hatch_date_expected), 'MM/dd/yy')}</p>
                                </div>
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-2">
                                <div className="flex-1">
                                    <StatusDisplay egg={egg} />
                                </div>
                                {egg.status === 'Incubating' && (
                                    <Button 
                                        size="sm" 
                                        className="bg-green-600 hover:bg-green-700 h-8"
                                        onClick={() => handleHatchEgg(egg.id)}
                                    >
                                        Hatched!
                                    </Button>
                                )}
                                <Button 
                                    size="icon" 
                                    variant="outline"
                                    onClick={() => handleAddToCalendar(egg)}
                                    className="border-slate-600 hover:bg-slate-700 h-8 w-8"
                                >
                                    <CalendarIcon className="w-4 h-4" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    variant="destructive"
                                    onClick={() => handleDeleteEgg(egg.id)}
                                    className="bg-red-900/50 hover:bg-red-900/80 border border-red-500/30 text-red-400 h-8 w-8"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-400 text-center py-4">No eggs have been recorded for this pairing yet.</p>
            )}

            {/* Edit Plan Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Breeding Plan</DialogTitle>
                    </DialogHeader>
                     <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="breeding_id">Breeding ID</Label>
                            <Input 
                                id="breeding_id" 
                                placeholder="e.g., BP001, Flame-01, etc." 
                                value={editedPlan.breeding_id || ''} 
                                onChange={e => setEditedPlan({...editedPlan, breeding_id: e.target.value})} 
                                className="bg-slate-800 border-slate-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pairing_date">Pairing Date</Label>
                            <Input id="pairing_date" type="date" value={editedPlan.pairing_date ? format(new Date(editedPlan.pairing_date), 'yyyy-MM-dd') : ''} onChange={e => setEditedPlan({...editedPlan, pairing_date: e.target.value})} className="bg-slate-800 border-slate-600"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                             <Select value={editedPlan.status} onValueChange={v => setEditedPlan({...editedPlan, status: v})}>
                                <SelectTrigger className="bg-slate-800 border-slate-600"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-600 text-slate-200">
                                    <SelectItem value="Planned">Planned</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Successful">Successful</SelectItem>
                                    <SelectItem value="Failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onPlanDelete(plan.id);
                                setIsEditModalOpen(false);
                            }}
                        >
                            <Trash2 size={14} className="mr-2" />
                            Delete Plan
                        </Button>
                        <Button onClick={handleUpdatePlan} className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardContent>
    );
}

function BreedingPlanCard({ plan, geckos, onPlanUpdate, onPlanDelete, isExpanded, onToggleExpanded }) {
    const [isCopulationModalOpen, setIsCopulationModalOpen] = useState(false);
    const [copulationDate, setCopulationDate] = useState('');
    const [copulationNotes, setCopulationNotes] = useState('');
    
    const getGecko = (id) => geckos.find(g => g.id === id);
    const sire = getGecko(plan.sire_id);
    const dam = getGecko(plan.dam_id);
    
    const handleOpenCopulationModal = () => {
        setCopulationDate(new Date().toISOString().split('T')[0]); // Auto-fill with current date
        setCopulationNotes('');
        setIsCopulationModalOpen(true);
    };

    const handleAddCopulationEvent = async () => {
        if (!copulationDate) return;
        
        try {
            const updatedCopulationEvents = [
                ...(plan.copulation_events || []),
                {
                    date: copulationDate,
                    notes: copulationNotes
                }
            ];
            
            await onPlanUpdate({
                ...plan,
                copulation_events: updatedCopulationEvents
            });
            
            setIsCopulationModalOpen(false);
        } catch (error) {
            console.error("Failed to add copulation event:", error);
        }
    };
    
    const handleAddCopulationToCalendar = async (copulationEvent) => {
        try {
            const sire = await Gecko.get(plan.sire_id);
            const dam = await Gecko.get(plan.dam_id);
            const estimatedLayDate = addDays(new Date(copulationEvent.date), 30);
            
            const title = `Expected Egg Laying - ${sire.name} x ${dam.name}`;
            const description = `Estimated egg laying date based on copulation on ${format(new Date(copulationEvent.date), 'MMM dd, yyyy')}`;
            
            const encodedTitle = encodeURIComponent(title);
            const encodedDescription = encodeURIComponent(description);
            const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const startFormatted = formatDate(estimatedLayDate);
            const endFormatted = formatDate(addDays(estimatedLayDate, 1));
            
            const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startFormatted}/${endFormatted}&details=${encodedDescription}`;
            
            window.open(calendarUrl, '_blank');
        } catch (error) {
            console.error("Failed to generate calendar event:", error);
        }
    };

    return (
        <>
            <Card key={plan.id} className="bg-slate-900 border-slate-700 text-slate-300 flex flex-col overflow-hidden">
                <CardHeader className="p-0">
                    <div className="flex justify-between items-stretch h-20">
                        <div className="flex flex-1">
                            <img 
                                src={sire?.image_urls?.[0] || 'https://via.placeholder.com/100'} 
                                alt={sire?.name} 
                                className="w-20 h-full object-cover" 
                            />
                            <img 
                                src={dam?.image_urls?.[0] || 'https://via.placeholder.com/100'} 
                                alt={dam?.name} 
                                className="w-20 h-full object-cover" 
                            />
                            <div className="ml-4 flex flex-col justify-center flex-1 py-2">
                                <div className="font-bold text-xl text-slate-100">{sire?.name || 'N/A'} & {dam?.name || 'N/A'}</div>
                                {plan.breeding_id && (
                                    <div className="text-sm text-slate-400">ID: {plan.breeding_id}</div>
                                )}
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-slate-600 hover:bg-slate-800 mt-1 w-fit" 
                                    onClick={(e) => { e.stopPropagation(); handleOpenCopulationModal(); }}
                                >
                                    Record Copulation
                                </Button>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleExpanded(plan.id)}
                            className="text-slate-400 hover:text-slate-200 self-start m-2"
                        >
                            {isExpanded ? <ChevronUp className="w-6 h-6"/> : <ChevronDown className="w-6 h-6"/>}
                        </Button>
                    </div>
                </CardHeader>

                {isExpanded && (
                    <>
                        {plan.copulation_events && plan.copulation_events.length > 0 && (
                            <div className="px-6 pb-4">
                                <h5 className="text-md font-semibold text-slate-300 mb-2">Copulation Events</h5>
                                <div className="space-y-2">
                                    {plan.copulation_events.map((event, index) => (
                                        <div key={index} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg">
                                            <div>
                                                <p className="text-slate-200">Date: {format(new Date(event.date), 'MMM dd, yyyy')}</p>
                                                {event.notes && <p className="text-xs text-slate-400">{event.notes}</p>}
                                                <p className="text-xs text-slate-500">Estimated lay date: {format(addDays(new Date(event.date), 30), 'MMM dd, yyyy')}</p>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => handleAddCopulationToCalendar(event)}
                                                className="border-slate-600 hover:bg-slate-700"
                                            >
                                                <CalendarIcon className="w-4 h-4 mr-1" />
                                                Add to Calendar
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <PlanDetails 
                            plan={plan}
                            onPlanUpdate={onPlanUpdate}
                            onPlanDelete={onPlanDelete}
                        />
                    </>
                )}
            </Card>

            {/* Copulation Modal */}
            <Dialog open={isCopulationModalOpen} onOpenChange={setIsCopulationModalOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Record Copulation Event</DialogTitle>
                        <DialogDescription>Record when this pair was observed copulating.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="copulation_date">Copulation Date</Label>
                            <Input id="copulation_date" type="date" value={copulationDate} onChange={e => setCopulationDate(e.target.value)} className="bg-slate-800 border-slate-600" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="copulation_notes">Notes (Optional)</Label>
                            <Textarea id="copulation_notes" value={copulationNotes} onChange={e => setCopulationNotes(e.target.value)} className="bg-slate-800 border-slate-600" placeholder="Any observations about the copulation event..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddCopulationEvent} className="bg-emerald-600 hover:bg-emerald-700">Record Event</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function Breeding() {
    const [breedingPlans, setBreedingPlans] = useState([]);
    const [geckos, setGeckos] = useState([]);
    const [males, setMales] = useState([]);
    const [females, setFemales] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPlan, setNewPlan] = useState({ sire_id: '', dam_id: '', pairing_date: '', status: 'Planned', breeding_id: '' });
    const [expandedPlans, setExpandedPlans] = useState({});
    const [allExpanded, setAllExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlanFilter, setSelectedPlanFilter] = useState('all');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const user = await User.me();
            const [plans, allGeckos] = await Promise.all([
                BreedingPlan.filter({ created_by: user.email }),
                Gecko.filter({ created_by: user.email })
            ]);
            setBreedingPlans(plans.sort((a,b) => new Date(b.created_date) - new Date(a.created_date)));
            setGeckos(allGeckos);
            setMales(allGeckos.filter(g => g.sex === 'Male'));
            setFemales(allGeckos.filter(g => g.sex === 'Female'));
        } catch (error) {
            console.error("Failed to load breeding data:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);
    
    const handleToggleExpanded = (planId) => {
        setExpandedPlans(prev => ({
            ...prev,
            [planId]: !prev[planId]
        }));
    };

    const handleToggleAllExpanded = () => {
        const newState = !allExpanded;
        setAllExpanded(newState);
        const newExpandedPlans = {};
        breedingPlans.forEach(plan => {
            newExpandedPlans[plan.id] = newState;
        });
        setExpandedPlans(newExpandedPlans);
    };

    const handleSaveNewPlan = async () => {
        if (!newPlan.sire_id || !newPlan.dam_id) {
            alert('Please select both a sire and a dam.');
            return;
        }
        try {
            await BreedingPlan.create(newPlan);
            setIsModalOpen(false);
            setNewPlan({ sire_id: '', dam_id: '', pairing_date: '', status: 'Planned', breeding_id: '' });
            loadData();
        } catch (error) {
            console.error('Failed to save plan:', error);
        }
    };
    
    const handleUpdatePlan = async (updatedPlan) => {
        try {
            await BreedingPlan.update(updatedPlan.id, {
                breeding_id: updatedPlan.breeding_id,
                pairing_date: updatedPlan.pairing_date,
                status: updatedPlan.status,
                notes: updatedPlan.notes,
                copulation_events: updatedPlan.copulation_events
            });
            loadData();
        } catch (error) {
            console.error("Failed to update plan:", error);
        }
    };

    const handleDeletePlan = async (planId) => {
        if (window.confirm("Are you sure you want to delete this breeding plan? This will also delete all associated eggs.")) {
            try {
                // First, delete associated eggs
                const eggsToDelete = await Egg.filter({ breeding_plan_id: planId });
                for (const egg of eggsToDelete) {
                    await Egg.delete(egg.id);
                }
                // Then, delete the plan
                await BreedingPlan.delete(planId);
                loadData();
            } catch (error) {
                console.error("Failed to delete breeding plan:", error);
            }
        }
    };

    const handleOpenModal = () => setIsModalOpen(true);

    const filteredPlans = breedingPlans.filter(plan => {
        const sire = geckos.find(g => g.id === plan.sire_id);
        const dam = geckos.find(g => g.id === plan.dam_id);
        const pairName = `${sire?.name || 'N/A'} & ${dam?.name || 'N/A'}`;
        const breedingId = plan.breeding_id || '';
        
        const matchesSearch = searchTerm === '' || 
            pairName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            breedingId.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = selectedPlanFilter === 'all' || plan.id === selectedPlanFilter;
        
        return matchesSearch && matchesFilter;
    });

    const planOptions = breedingPlans.map(plan => {
        const sire = geckos.find(g => g.id === plan.sire_id);
        const dam = geckos.find(g => g.id === plan.dam_id);
        const pairName = `${sire?.name || 'N/A'} & ${dam?.name || 'N/A'}`;
        const displayName = plan.breeding_id ? `${pairName} (ID: ${plan.breeding_id})` : pairName;
        return { id: plan.id, name: displayName };
    }).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="p-4 md:p-8 bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-100">Breeding Manager</h1>
                        <p className="text-slate-400 mt-1">Track your breeding pairs and their progress.</p>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleOpenModal()}>
                        <PlusCircle className="w-5 h-5 mr-2" />
                        New Breeding Plan
                    </Button>
                </div>

                {/* Controls Row */}
                <div className="flex flex-wrap gap-4 mb-6 items-center">
                    <Button
                        variant="outline"
                        onClick={handleToggleAllExpanded}
                        className="border-slate-600 hover:bg-slate-800"
                    >
                        {allExpanded ? 'Collapse All' : 'Expand All'}
                    </Button>
                    
                    <Select value={selectedPlanFilter} onValueChange={setSelectedPlanFilter}>
                        <SelectTrigger className="w-64 bg-slate-800 border-slate-600">
                            <SelectValue placeholder="Select a breeding pair" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600 text-slate-200">
                            <SelectItem value="all">All Breeding Pairs</SelectItem>
                            {planOptions.map(option => (
                                <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        placeholder="Search breeding pairs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 bg-slate-800 border-slate-600"
                    />
                </div>

                {isLoading ? (
                    <div className="text-center"><Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" /></div>
                ) : filteredPlans.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredPlans.map(plan => (
                            <BreedingPlanCard
                                key={plan.id}
                                plan={plan}
                                geckos={geckos}
                                onPlanUpdate={handleUpdatePlan}
                                onPlanDelete={handleDeletePlan}
                                isExpanded={expandedPlans[plan.id] || false}
                                onToggleExpanded={handleToggleExpanded}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-900 rounded-lg">
                        <GitBranch className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-300">No Breeding Plans Found</h3>
                        <p className="text-slate-400 mb-6">
                            {searchTerm || selectedPlanFilter !== 'all' ? 
                                'Try adjusting your search or filter.' : 
                                'Create your first breeding plan to start tracking pairs and eggs.'}
                        </p>
                        {(!searchTerm && selectedPlanFilter === 'all') && (
                            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleOpenModal()}>
                                <PlusCircle className="w-5 h-5 mr-2" />
                                Create First Plan
                            </Button>
                        )}
                    </div>
                )}

                {/* New Plan Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="bg-slate-900 border-slate-700 text-white">
                        <DialogHeader>
                            <DialogTitle>Create New Breeding Plan</DialogTitle>
                            <DialogDescription>Select a sire and dam to create a new pairing.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="breeding_id">Breeding ID (Optional)</Label>
                                <Input 
                                    id="breeding_id" 
                                    placeholder="e.g., BP001, Flame-01, etc." 
                                    value={newPlan.breeding_id} 
                                    onChange={e => setNewPlan({...newPlan, breeding_id: e.target.value})} 
                                    className="bg-slate-800 border-slate-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sire">Sire (Male)</Label>
                                <Select value={newPlan.sire_id} onValueChange={v => setNewPlan({...newPlan, sire_id: v})}>
                                    <SelectTrigger className="bg-slate-800 border-slate-600"><SelectValue placeholder="Select a male" /></SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-600 text-slate-200">
                                        {males.map(g => <SelectItem key={g.id} value={g.id}>{g.name} ({g.gecko_id_code})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dam">Dam (Female)</Label>
                                 <Select value={newPlan.dam_id} onValueChange={v => setNewPlan({...newPlan, dam_id: v})}>
                                    <SelectTrigger className="bg-slate-800 border-slate-600"><SelectValue placeholder="Select a female" /></SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-600 text-slate-200">
                                        {females.map(g => <SelectItem key={g.id} value={g.id}>{g.name} ({g.gecko_id_code})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="pairing_date">Pairing Date</Label>
                                <Input id="pairing_date" type="date" value={newPlan.pairing_date} onChange={e => setNewPlan({...newPlan, pairing_date: e.target.value})} className="bg-slate-800 border-slate-600"/>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSaveNewPlan} className="bg-emerald-600 hover:bg-emerald-700">Save Plan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
