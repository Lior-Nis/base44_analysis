import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Gecko, User, BreedingPlan } from '@/api/entities';
import { Loader2, Users, Search, ZoomIn, ZoomOut, GitBranch, Heart, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import _ from 'lodash';

// A more robust GeckoCardNode that can be reused
const GeckoCardNode = ({ gecko, onNodeClick, isSelected, size = 'normal', isFaded = false, className = '' }) => {
    if (!gecko) {
        return <UnknownCardNode size={size} />;
    }
    const hasImage = gecko.image_urls && gecko.image_urls.length > 0;
    
    const sizes = {
        tiny: { card: 'w-24 h-32', name: 'text-[11px]', id: 'text-[9px]', icon: 'w-6 h-6' },
        small: { card: 'w-32 h-40', name: 'text-xs', id: 'text-[10px]', icon: 'w-8 h-8' },
        normal: { card: 'w-40 h-48', name: 'text-sm', id: 'text-xs', icon: 'w-12 h-12' },
    };
    const { card: cardSize, name: nameTextSize, id: idTextSize, icon: iconSize } = sizes[size] || sizes.normal;
    
    const sexIcon = gecko.sex === 'Male' ? '♂' : gecko.sex === 'Female' ? '♀' : '?';
    const sexColor = gecko.sex === 'Male' ? 'text-blue-400' : gecko.sex === 'Female' ? 'text-pink-400' : 'text-gray-400';
    
    return (
        <Card
            className={`flex-shrink-0 relative transition-all duration-300 overflow-hidden ${cardSize} ${className} ${isSelected ? 'ring-2 ring-emerald-400 shadow-2xl z-10' : 'shadow-lg'} bg-slate-800/80 backdrop-blur-sm border-slate-700 hover:shadow-xl hover:ring-2 hover:ring-emerald-500/50 cursor-pointer ${isFaded ? 'opacity-50' : ''}`}
            onClick={(e) => { e.stopPropagation(); onNodeClick(gecko.id); }}
        >
            <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                {hasImage ? (
                    <img src={gecko.image_urls[0]} alt={gecko.name} className="w-full h-full object-cover" />
                ) : (
                    <Users className={`${iconSize} text-slate-500`} />
                )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-1">
                    <h4 className={`font-bold ${nameTextSize} text-white leading-tight truncate drop-shadow-md`}>
                        {gecko.name}
                    </h4>
                    <span className={`font-bold ${nameTextSize} ${sexColor} drop-shadow-md`}>
                        {sexIcon}
                    </span>
                </div>
                <p className={`${idTextSize} text-white/90 truncate drop-shadow-md`}>
                    {gecko.gecko_id_code || 'No ID'}
                </p>
            </div>
        </Card>
    );
};

// Simplified UnknownCard
const UnknownCardNode = ({ size = 'normal' }) => {
    const cardSize = size === 'tiny' ? 'w-24 h-32' : size === 'small' ? 'w-32 h-40' : 'w-40 h-48';
    return (
        <div className={`flex-shrink-0 flex flex-col items-center justify-center bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg ${cardSize}`}>
            <Users className={`${size === 'tiny' ? 'w-6 h-6' : 'w-8 h-8'} text-slate-500 mb-2`} />
            <span className="text-xs text-slate-500">Unknown</span>
        </div>
    );
};


export default function Lineage() {
    const [myGeckos, setMyGeckos] = useState([]);
    const [allGeckosMap, setAllGeckosMap] = useState({});
    const [allBreedingPlans, setAllBreedingPlans] = useState([]);
    
    const [selectedGeckoId, setSelectedGeckoId] = useState(null);
    const [lineage, setLineage] = useState({});
    const [mates, setMates] = useState([]);
    const [offspring, setOffspring] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingLineage, setIsLoadingLineage] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [scale, setScale] = useState(1);
    const mainContentRef = useRef(null);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const currentUser = await User.me();
            // Fetch user's geckos for the dropdown, all visible geckos for tree building, and breeding plans
            const [userGeckos, allVisibleGeckos, breedingPlans] = await Promise.all([
                Gecko.filter({ created_by: currentUser.email }), // Only user's geckos for the dropdown
                Gecko.list(), // All readable geckos (user's + public) for the lineage map
                BreedingPlan.list()
            ]);
            
            setMyGeckos(userGeckos);
            setAllGeckosMap(_.keyBy(allVisibleGeckos, 'id')); // Use the complete list for the map
            setAllBreedingPlans(breedingPlans);
        } catch (error) {
            console.error("Failed to load initial data:", error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const getLineageFor = useCallback(async (geckoId, generations = 3, currentGen = 1) => {
        if (currentGen > generations || !geckoId) {
            return null;
        }
        // Use the comprehensive map to find ancestors
        const gecko = allGeckosMap[geckoId];
        if (!gecko) return null;

        const [sire, dam] = await Promise.all([
            getLineageFor(gecko.sire_id, generations, currentGen + 1),
            getLineageFor(gecko.dam_id, generations, currentGen + 1)
        ]);
        return { ...gecko, sire, dam };
    }, [allGeckosMap]);

    const handleSelectGecko = useCallback(async (geckoId) => {
        if (!geckoId || !allGeckosMap[geckoId]) {
            setLineage({});
            setMates([]);
            setOffspring([]);
            setSelectedGeckoId(null);
            return;
        }
        setIsLoadingLineage(true);
        setSelectedGeckoId(geckoId);
        
        // Fetch Lineage using the recursive function
        const lineageData = await getLineageFor(geckoId, 3);
        setLineage(lineageData || {});

        // Find Offspring by searching the entire map
        const foundOffspring = Object.values(allGeckosMap).filter(g => g.sire_id === geckoId || g.dam_id === geckoId);
        setOffspring(foundOffspring);

        // Find Mates from all available breeding plans
        const mateIds = new Set();
        allBreedingPlans.forEach(plan => {
            if (plan.sire_id === geckoId) mateIds.add(plan.dam_id);
            if (plan.dam_id === geckoId) mateIds.add(plan.sire_id);
        });
        const foundMates = Array.from(mateIds).map(id => allGeckosMap[id]).filter(Boolean);
        setMates(foundMates);
        
        setIsLoadingLineage(false);
    }, [getLineageFor, allGeckosMap, allBreedingPlans]);

    const renderGeneration = (gecko, generation) => {
        if (!gecko) {
            return <UnknownCardNode size={generation >= 2 ? 'small' : 'normal'} />;
        }
        
        const cardSize = generation >= 2 ? 'small' : 'normal';

        return (
            <div className="flex items-center">
                <GeckoCardNode gecko={gecko} onNodeClick={handleSelectGecko} isSelected={selectedGeckoId === gecko.id} size={cardSize} />
                {(gecko.sire || gecko.dam) && (
                    <>
                        <div className="w-4 md:w-8 border-t-2 border-slate-600"></div>
                        <div className="flex flex-col gap-2 md:gap-4 relative">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-[2px] bg-slate-600"></div>
                           <div className="absolute left-0 top-0 h-[2px] w-4 bg-slate-600"></div>
                          <div className="absolute left-0 bottom-0 h-[2px] w-4 bg-slate-600"></div>
                        </div>
                    </>
                )}
                <div className="flex flex-col gap-2 md:gap-4">
                    {gecko.sire && renderGeneration(gecko.sire, generation + 1)}
                    {gecko.dam && renderGeneration(gecko.dam, generation + 1)}
                </div>
            </div>
        );
    };

    const filteredSelectableGeckos = myGeckos.filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        g.gecko_id_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden">
            <header className="p-4 border-b border-slate-700 flex-shrink-0 z-20 bg-slate-950/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                     <div>
                        <h1 className="text-2xl font-bold text-slate-100">Gecko Lineage Viewer</h1>
                        <p className="text-slate-400">Select a gecko to view its family tree, mates, and offspring.</p>
                    </div>
                     <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-grow">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                type="text" placeholder="Search your geckos..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-slate-800 border-slate-600 w-full md:w-64"
                            />
                        </div>
                        <Select onValueChange={handleSelectGecko} value={selectedGeckoId || ''}>
                            <SelectTrigger className="w-full md:w-[250px] bg-slate-800 border-slate-600">
                                <SelectValue placeholder="Select a gecko" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600 text-slate-200">
                                {isLoading ? (
                                    <div className="flex items-center justify-center p-2"><Loader2 className="animate-spin w-4 h-4 mr-2" /> Loading...</div>
                                ) : (
                                    filteredSelectableGeckos.map(gecko => (
                                        <SelectItem key={gecko.id} value={gecko.id}>{gecko.name} ({gecko.gecko_id_code})</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                     </div>
                </div>
            </header>
            <main ref={mainContentRef} className="flex-1 overflow-auto relative">
                 <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut className="w-4 h-4" /></Button>
                    <span className="bg-slate-900/80 px-3 py-1 rounded-md text-sm font-mono">{Math.round(scale * 100)}%</span>
                    <Button size="icon" variant="outline" onClick={() => setScale(s => Math.min(1.5, s + 0.1))}><ZoomIn className="w-4 h-4" /></Button>
                </div>
                
                <div className="p-8 min-h-full min-w-max" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                    {isLoadingLineage ? (
                         <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-emerald-500 animate-spin" /></div>
                    ) : selectedGeckoId && lineage?.id ? (
                        <div className="space-y-12">
                            {/* Ancestor Tree */}
                            <div className="flex">
                                {renderGeneration(lineage, 1)}
                            </div>
                            {/* Mates and Offspring */}
                            <div className="space-y-8 pt-8 border-t-2 border-slate-700">
                                {mates.length > 0 && (
                                     <div>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Heart/> Mates ({mates.length})</h2>
                                        <div className="flex gap-4 overflow-x-auto pb-4">
                                            {mates.map(mate => <GeckoCardNode key={mate.id} gecko={mate} onNodeClick={handleSelectGecko} size="small"/>)}
                                        </div>
                                    </div>
                                )}
                                {offspring.length > 0 && (
                                     <div>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users2/> Offspring ({offspring.length})</h2>
                                         <div className="flex gap-4 overflow-x-auto pb-4">
                                            {offspring.map(child => <GeckoCardNode key={child.id} gecko={child} onNodeClick={handleSelectGecko} size="small"/>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-500 fixed inset-0">
                            <div className="text-center">
                                <GitBranch className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                                <p className="text-lg">Select a gecko from the dropdown to begin exploring lineages.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}