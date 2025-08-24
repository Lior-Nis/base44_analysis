import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoadmapItem } from '@/api/entities';
import { RoadmapVote } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowUp, 
    Plus, 
    X, 
    ChevronUp, 
    MessageSquare, 
    Lightbulb,
    Zap,
    Bug,
    Link as LinkIcon,
    ArrowLeft
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createPageUrl } from '@/utils';

const ROADMAP_COLUMNS = [
    { title: 'Backlog', description: 'Ideas and requests waiting to be prioritized' },
    { title: 'Next up', description: 'Planned for upcoming development' },
    { title: 'In Progress', description: 'Currently being worked on' },
    { title: 'Done', description: 'Completed and shipped features' }
];

const RoadmapCard = React.memo(({ item, provided, isDragging, onUpvote, userVotes, user, isAdmin }) => {
    const hasVoted = userVotes.has(item.id);
    const isCompleted = item.column === 'Done';
    
    const categoryConfig = {
        feature: { icon: Lightbulb, color: 'bg-blue-100 text-blue-700', label: 'Feature' },
        improvement: { icon: Zap, color: 'bg-purple-100 text-purple-700', label: 'Improvement' },
        bug: { icon: Bug, color: 'bg-red-100 text-red-700', label: 'Bug Fix' },
        integration: { icon: LinkIcon, color: 'bg-green-100 text-green-700', label: 'Integration' }
    };

    const effortConfig = {
        small: { label: 'Small', color: 'bg-gray-100 text-gray-600' },
        medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
        large: { label: 'Large', color: 'bg-orange-100 text-orange-700' },
        epic: { label: 'Epic', color: 'bg-red-100 text-red-700' }
    };

    const CategoryIcon = categoryConfig[item.category]?.icon || Lightbulb;

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="group"
            style={{
                ...provided.draggableProps.style,
                cursor: isAdmin ? 'move' : 'default'
            }}
        >
            <motion.div
                layoutId={`roadmap-${item.id}`}
                className={`bg-white rounded-lg border transition-all p-4 ${
                    isDragging 
                        ? 'shadow-2xl border-gray-300 scale-105' 
                        : 'shadow-sm hover:shadow-md hover:border-gray-300 border-gray-200/80'
                } ${isCompleted ? 'opacity-75' : ''}`}
            >
                <div className="flex justify-between items-start mb-3">
                    <h3 className={`font-medium text-gray-800 text-sm flex-1 pr-2 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {item.title}
                    </h3>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpvote(item);
                        }}
                        disabled={!user || isCompleted}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                            hasVoted 
                                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        } ${!user || isCompleted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <ArrowUp className="w-3 h-3" />
                        <span>{item.upvotes || 0}</span>
                    </button>
                </div>

                {item.description && (
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                        {item.description}
                    </p>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge className={`${categoryConfig[item.category]?.color} text-xs font-normal flex items-center gap-1`}>
                            <CategoryIcon className="w-3 h-3" />
                            {categoryConfig[item.category]?.label}
                        </Badge>
                        {item.estimated_effort && (
                            <Badge variant="outline" className={`${effortConfig[item.estimated_effort]?.color} text-xs font-normal`}>
                                {effortConfig[item.estimated_effort]?.label}
                            </Badge>
                        )}
                    </div>
                    <div className="text-xs text-gray-400">
                        {item.created_by?.split('@')[0]}
                    </div>
                </div>
            </motion.div>
        </div>
    );
});

const RoadmapColumn = React.memo(({ column, items, onUpvote, userVotes, user, isAdmin }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50/70 rounded-2xl p-4 w-80 h-full flex flex-col flex-shrink-0"
        >
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-gray-800">{column.title}</h2>
                    <span className="text-sm font-medium text-gray-500 bg-white rounded-full px-2 py-1">
                        {items.length}
                    </span>
                </div>
                <p className="text-xs text-gray-500 leading-tight">{column.description}</p>
            </div>

            <Droppable droppableId={column.title} isDropDisabled={!isAdmin}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-grow min-h-[200px] rounded-lg transition-colors duration-200 ${
                            snapshot.isDraggingOver && isAdmin ? 'bg-gray-200/80' : 'bg-transparent'
                        }`}
                    >
                        {items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!isAdmin}>
                                {(provided, snapshot) => (
                                    <div className="mb-3">
                                        <RoadmapCard
                                            item={item}
                                            provided={provided}
                                            isDragging={snapshot.isDragging}
                                            onUpvote={onUpvote}
                                            userVotes={userVotes}
                                            user={user}
                                            isAdmin={isAdmin}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </motion.div>
    );
});

const RoadmapModal = React.memo(({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('feature');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setTitle('');
            setDescription('');
            setCategory('feature');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (title.trim()) {
            onSubmit({ title: title.trim(), description: description.trim(), category });
            onClose();
        }
    };

    const categories = [
        { value: 'feature', label: 'Feature Request', icon: Lightbulb },
        { value: 'improvement', label: 'Improvement', icon: Zap },
        { value: 'bug', label: 'Bug Fix', icon: Bug },
        { value: 'integration', label: 'Integration', icon: LinkIcon }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-200/50 w-full max-w-lg"
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full"
                >
                    <X className="w-5 h-5" />
                </Button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Idea</h2>
                    <p className="text-gray-600">Help shape the future of FlowTask by sharing your feature requests and ideas.</p>
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What would you like to see in FlowTask?"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-lg font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                />

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your idea in more detail (optional)..."
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 resize-none"
                />

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <div className="grid grid-cols-2 gap-2">
                        {categories.map(cat => {
                            const IconComponent = cat.icon;
                            return (
                                <button
                                    key={cat.value}
                                    onClick={() => setCategory(cat.value)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                        category === cat.value
                                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                                    }`}
                                >
                                    <IconComponent className="w-4 h-4" />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={!title.trim()}
                    className="w-full bg-gray-900 text-white rounded-2xl py-3 font-medium hover:bg-gray-800 disabled:bg-gray-300"
                >
                    Submit Idea
                </Button>
            </motion.div>
        </motion.div>
    );
});

export default function RoadmapPage() {
    const [user, setUser] = useState(null);
    const [roadmapItems, setRoadmapItems] = useState({});
    const [userVotes, setUserVotes] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '', isVisible: false });

    const isAdmin = user?.email === 'gmxhodel@gmail.com';

    const showToast = useCallback((message, type) => {
        setToast({ message, type, isVisible: true });
    }, []);

    useEffect(() => {
        const initializeRoadmap = async () => {
            try {
                setLoading(true);
                
                const currentUser = await User.me().catch(() => null);
                setUser(currentUser);

                const [items, votes] = await Promise.all([
                    RoadmapItem.list('order_position'),
                    currentUser ? RoadmapVote.filter({ user_email: currentUser.email }) : []
                ]);

                // Group items by column
                const itemsByColumn = {};
                ROADMAP_COLUMNS.forEach(col => {
                    itemsByColumn[col.title] = items
                        .filter(item => item.column === col.title)
                        .sort((a, b) => a.order_position - b.order_position);
                });

                setRoadmapItems(itemsByColumn);
                setUserVotes(new Set(votes.map(v => v.roadmap_item_id)));
            } catch (error) {
                console.error('Failed to load roadmap:', error);
                showToast('Failed to load roadmap', 'error');
            } finally {
                setLoading(false);
            }
        };

        initializeRoadmap();
    }, [showToast]);

    const handleDragEnd = useCallback(async (result) => {
        if (!isAdmin) return;

        const { source, destination, draggableId } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

        const sourceCol = source.droppableId;
        const destCol = destination.droppableId;

        // Optimistic UI update
        const newRoadmapItems = { ...roadmapItems };
        const sourceTasks = Array.from(newRoadmapItems[sourceCol]);
        const [movedItem] = sourceTasks.splice(source.index, 1);

        const destTasks = Array.from(newRoadmapItems[destCol]);
        destTasks.splice(destination.index, 0, { ...movedItem, column: destCol });

        newRoadmapItems[sourceCol] = sourceTasks.map((item, idx) => ({ ...item, order_position: idx }));
        newRoadmapItems[destCol] = destTasks.map((item, idx) => ({ ...item, order_position: idx }));

        setRoadmapItems(newRoadmapItems);

        try {
            await RoadmapItem.update(draggableId, {
                column: destCol,
                order_position: destination.index,
                ...(destCol === 'Done' && { completed_at: new Date().toISOString() })
            });
            showToast('Item moved successfully', 'success');
        } catch (error) {
            console.error('Failed to update item:', error);
            setRoadmapItems(roadmapItems); // Revert on error
            showToast('Failed to move item', 'error');
        }
    }, [isAdmin, roadmapItems, showToast]);

    const handleUpvote = useCallback(async (item) => {
        if (!user) {
            showToast('Please log in to vote', 'error');
            return;
        }

        const hasVoted = userVotes.has(item.id);

        try {
            if (hasVoted) {
                // Remove vote
                const voteToRemove = await RoadmapVote.filter({ 
                    roadmap_item_id: item.id, 
                    user_email: user.email 
                });
                if (voteToRemove[0]) {
                    await RoadmapVote.delete(voteToRemove[0].id);
                }
                await RoadmapItem.update(item.id, { upvotes: Math.max(0, (item.upvotes || 0) - 1) });
                setUserVotes(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(item.id);
                    return newSet;
                });
            } else {
                // Add vote
                await RoadmapVote.create({
                    roadmap_item_id: item.id,
                    user_email: user.email
                });
                await RoadmapItem.update(item.id, { upvotes: (item.upvotes || 0) + 1 });
                setUserVotes(prev => new Set([...prev, item.id]));
            }

            // Update local state
            setRoadmapItems(prev => {
                const newItems = { ...prev };
                const columnItems = newItems[item.column].map(i => 
                    i.id === item.id 
                        ? { ...i, upvotes: hasVoted ? Math.max(0, (i.upvotes || 0) - 1) : (i.upvotes || 0) + 1 }
                        : i
                );
                newItems[item.column] = columnItems;
                return newItems;
            });

            showToast(hasVoted ? 'Vote removed' : 'Vote added', 'success');
        } catch (error) {
            console.error('Failed to update vote:', error);
            showToast('Failed to update vote', 'error');
        }
    }, [user, userVotes, showToast]);

    const handleSubmitIdea = useCallback(async (ideaData) => {
        if (!user) {
            showToast('Please log in to submit ideas', 'error');
            return;
        }

        try {
            const backlogItems = roadmapItems['Backlog'] || [];
            const newItem = await RoadmapItem.create({
                ...ideaData,
                column: 'Backlog',
                order_position: backlogItems.length,
                created_by: user.email
            });

            setRoadmapItems(prev => ({
                ...prev,
                'Backlog': [...(prev['Backlog'] || []), newItem]
            }));

            showToast('Idea submitted successfully!', 'success');
        } catch (error) {
            console.error('Failed to submit idea:', error);
            showToast('Failed to submit idea', 'error');
        }
    }, [user, roadmapItems, showToast]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-4">Loading FlowTask Roadmap...</div>
                    <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={() => window.location.href = '/Todo'}
                                    variant="ghost"
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Board
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">FlowTask Roadmap</h1>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Shape the future of FlowTask by sharing ideas and voting on features
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gray-900 text-white hover:bg-gray-800 rounded-2xl px-4 py-2 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Share Idea
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="flex-grow p-6 overflow-x-auto">
                    <div className="flex gap-6 h-full min-w-max">
                        {ROADMAP_COLUMNS.map(column => (
                            <RoadmapColumn
                                key={column.title}
                                column={column}
                                items={roadmapItems[column.title] || []}
                                onUpvote={handleUpvote}
                                userVotes={userVotes}
                                user={user}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>
                </main>

                <AnimatePresence>
                    {isModalOpen && (
                        <RoadmapModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onSubmit={handleSubmitIdea}
                        />
                    )}
                </AnimatePresence>

                {toast.isVisible && (
                    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
                        <div className={`px-4 py-2 rounded-lg shadow-lg ${
                            toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {toast.message}
                        </div>
                    </div>
                )}
            </div>
        </DragDropContext>
    );
}