
import React, { useState, useEffect } from 'react';
import { Gecko } from '@/api/entities';
import { User } from '@/api/entities';
import { PlusCircle, Loader2, Search, Users } from 'lucide-react'; // Added Users icon
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GeckoCard from '../components/my-geckos/GeckoCard';
import GeckoForm from '../components/my-geckos/GeckoForm';
import CSVImportModal from '../components/my-geckos/CSVImportModal';
import GeckoDetailModal from '../components/my-geckos/GeckoDetailModal'; // Import the new detail modal

export default function MyGeckosPage() { // Renamed component from MyGeckos
    const [geckos, setGeckos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // Added as per outline, though not explicitly used for layout toggling in provided JSX
    const [showForm, setShowForm] = useState(false); // Replaces isFormOpen
    const [editingGecko, setEditingGecko] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false); // Preserved from original
    const [selectedGecko, setSelectedGecko] = useState(null); // For detail view

    // Renamed loadData to loadGeckos and modified to accept currentUser
    const loadGeckos = async (currentUser) => {
        setIsLoading(true);
        try {
            const userGeckos = await Gecko.filter({ created_by: currentUser.email }, '-created_date');
            setGeckos(userGeckos);

            // If a gecko was selected for detail view, update its data after reload
            if (selectedGecko) {
                const updatedSelectedGecko = userGeckos.find(g => g.id === selectedGecko.id);
                setSelectedGecko(updatedSelectedGecko || null); // Set to null if it was deleted or no longer found
            }
        } catch (error) {
            console.error("Failed to load geckos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                await loadGeckos(currentUser); // Pass currentUser to loadGeckos
            } catch (error) {
                console.error("Failed to load initial data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // handleFormSave -> handleFormSubmit
    const handleFormSubmit = async () => {
        setShowForm(false);
        setEditingGecko(null);
        if (user) { // Ensure user is loaded before trying to load geckos
            await loadGeckos(user);
        }
    };

    const handleEdit = (gecko) => {
        setEditingGecko(gecko);
        setShowForm(true);
        setSelectedGecko(null); // Close detail modal if open when opening form
    };
    
    // New handler for opening gecko detail modal
    const handleView = (gecko) => {
        setSelectedGecko(gecko);
        setShowForm(false); // Close form if open when opening detail modal
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this gecko? This will also remove associated records.')) {
            try {
                await Gecko.delete(id);
                // After deletion, refresh data and close any open modals
                if (user) {
                    await loadGeckos(user);
                }
                setSelectedGecko(null); // Close detail modal if the deleted gecko was open
                setShowForm(false); // Close form
            } catch (error) {
                console.error("Failed to delete gecko:", error);
            }
        }
    };
    
    const filteredGeckos = geckos.filter(gecko =>
        gecko.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gecko.gecko_id_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gecko.morphs_traits?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-100">My Gecko Collection</h1>
                        <p className="text-slate-400 mt-1">Manage your geckos, track their lineage, and plan breedings.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-slate-600 hover:bg-slate-800" onClick={() => setIsImportModalOpen(true)}>Import from CSV</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setEditingGecko(null); setShowForm(true); setSelectedGecko(null); }}>
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Add Gecko
                        </Button>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search by name, ID, or morph..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-slate-900 border-slate-700 text-white"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-20">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
                    </div>
                ) : showForm ? ( // Conditionally render form if showForm is true
                    <GeckoForm
                        gecko={editingGecko} // Changed prop name from geckoToEdit
                        userGeckos={geckos}
                        // currentUser prop removed as per outline, form should handle user context internally or through onSubmit
                        onSubmit={handleFormSubmit} // Changed prop name from onSave
                        onCancel={() => {
                            setShowForm(false);
                            setEditingGecko(null);
                        }}
                        // onDelete prop removed from GeckoForm as per outline, handled via detail modal or directly from list
                    />
                ) : ( // Otherwise render the gecko grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredGeckos.map(gecko => (
                            <GeckoCard
                                key={gecko.id}
                                gecko={gecko}
                                onEdit={handleEdit}
                                onView={handleView} // Changed prop name from onCardClick
                            />
                        ))}
                    </div>
                )}
                
                {filteredGeckos.length === 0 && !isLoading && !showForm && ( // Added !showForm condition
                     <div className="text-center py-20 bg-slate-900 rounded-lg">
                        <Users className="w-16 h-16 mx-auto text-slate-500 mb-4" /> {/* New icon */}
                        <h3 className="text-xl font-semibold text-slate-300">No Geckos Found</h3>
                        <p className="text-slate-400 mt-2">Add your first gecko to get started!</p> {/* Updated message */}
                    </div>
                )}
                
                {selectedGecko && ( // Conditionally render detail modal if a gecko is selected
                    <GeckoDetailModal
                        gecko={selectedGecko}
                        onClose={() => setSelectedGecko(null)}
                        onUpdate={async () => { // Callback for data changes within the modal (e.g., editing)
                            if (user) {
                                await loadGeckos(user);
                            }
                        }}
                        onDelete={handleDelete} // Pass delete handler to detail modal
                    />
                )}

                {/* CSVImportModal is preserved from the original file */}
                <CSVImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onImportComplete={async () => {
                        if (user) {
                            await loadGeckos(user);
                        }
                    }}
                />
            </div>
        </div>
    );
}
