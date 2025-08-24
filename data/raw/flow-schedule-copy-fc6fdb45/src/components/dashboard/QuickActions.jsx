
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Timer, BookOpen, Zap, ArrowLeft, Save, Play, Pause, RotateCcw, Edit2, Eye, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/api/entities";
import { Note } from "@/api/entities";
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

// Action configurations
const actionsConfig = [
  { id: "addTask", label: "Add New Task", icon: PlusCircle, gradient: "linear-gradient(to right, #0ea5e9, #2563eb)", formColor: "bg-sky-50/90" },
  { id: "focusTimer", label: "Start Focus Timer", icon: Timer, gradient: "linear-gradient(to right, #10b981, #14b8a6)", formColor: "bg-green-50/90" },
  { id: "logActivity", label: "Log Activity", icon: BookOpen, gradient: "linear-gradient(to right, #8b5cf6, #6366f1)", formColor: "bg-purple-50/90" },
  { id: "brainstorm", label: "Quick Brainstorm", icon: Zap, gradient: "linear-gradient(to right, #f59e0b, #f97316)", formColor: "bg-yellow-50/90" },
];

// Updated defaultGradient to white transparent to match other cards
const defaultGradient = 'rgba(255, 255, 255, 0.6)';

// --- Quick Add Task Form ---
const QuickAddTaskForm = ({ onSave, onCancel, formColor }) => {
  const [title, setTitle] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault(); if (!title.trim()) return;
    try { await Task.create({ title: title.trim(), category: 'work', priority: 'medium', status: 'todo' }); onSave(); } 
    catch (error) { console.error("Error creating task:", error); }
  };
  return (
    <motion.form onSubmit={handleSubmit} className={`p-4 space-y-3 rounded-2xl ${formColor}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: "circOut", delay: 0.2 }}>
      <Input placeholder="Task Title..." value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border-slate-300 bg-white/70 placeholder:text-slate-500 text-slate-800" />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="rounded-lg text-slate-600 hover:bg-slate-700/10">Cancel</Button>
        <Button type="submit" size="sm" className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg"><Save className="w-4 h-4 mr-1.5"/> Add</Button>
      </div>
    </motion.form>
  );
};

// --- Focus Timer Component ---
const FocusTimerComponent = ({ onCancel, formColor }) => {
  const [initialTimeMinutes, setInitialTimeMinutes] = useState(25);
  const [time, setTime] = useState(initialTimeMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isActive) { setTime(initialTimeMinutes * 60); }
  }, [initialTimeMinutes, isActive]);

  useEffect(() => {
    if (isActive && time > 0) {
      timerRef.current = setInterval(() => { setTime(prevTime => prevTime - 1); }, 1000);
    } else if (!isActive || time === 0) {
      clearInterval(timerRef.current);
      if (time === 0 && isActive) { setIsActive(false); alert("Focus session complete!"); }
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, time]);

  const toggleTimer = () => {
    if (!isActive && initialTimeMinutes <= 0) { alert("Please set a valid duration."); return; }
    setIsActive(!isActive);
  };
  
  const resetTimer = () => { setIsActive(false); setTime(initialTimeMinutes * 60); };
  const handleTimeChange = (e) => {
    const newTime = parseInt(e.target.value, 10);
    if (!isNaN(newTime) && newTime > 0) { setInitialTimeMinutes(newTime); } 
    else if (e.target.value === "") { setInitialTimeMinutes(0); }
  };
  const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div className={`p-4 space-y-4 rounded-2xl text-center ${formColor}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: "circOut", delay: 0.2 }}>
      <div className="text-5xl font-mono text-slate-700 tabular-nums">{formatTime(time)}</div>
      {!isActive && (
        <div className="flex items-center justify-center gap-2">
          <Input type="number" value={initialTimeMinutes === 0 && time === 0 ? "" : initialTimeMinutes} onChange={handleTimeChange} placeholder="Minutes" className="w-24 text-center rounded-lg border-slate-300 bg-white/70" min="1" disabled={isActive}/>
          <span className="text-slate-600">minutes</span>
        </div>
      )}
      <div className="flex justify-center gap-3">
        <Button onClick={toggleTimer} size="lg" className={`rounded-full w-20 h-20 ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white`} disabled={initialTimeMinutes <= 0 && !isActive}>
          {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </Button>
        <Button onClick={resetTimer} variant="outline" size="lg" className="rounded-full w-20 h-20 border-slate-300 hover:bg-slate-200/50 text-slate-600">
          <RotateCcw className="w-7 h-7" />
        </Button>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="rounded-lg text-slate-600 hover:bg-slate-700/10 mt-2">Close Timer</Button>
    </motion.div>
  );
};

// --- Log Activity Component (Past Tasks) ---
const LogActivityComponent = ({ onCancel, formColor }) => {
  const [pastTasks, setPastTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchPastTasks = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const allTasks = await Task.list('-end_time');
        const filtered = allTasks.filter(task => task.status === 'completed' || (task.end_time && parseISO(task.end_time) < now)).slice(0, 5);
        setPastTasks(filtered);
      } catch (error) { console.error("Error fetching past tasks:", error); }
      setLoading(false);
    };
    fetchPastTasks();
  }, []);
  return (
    <motion.div className={`p-4 space-y-3 rounded-2xl ${formColor} max-h-80 overflow-y-auto custom-scrollbar`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: "circOut", delay: 0.2 }}>
      <h4 className="text-md font-medium text-slate-700 mb-2">Recently Completed / Past</h4>
      {loading && <p className="text-slate-500 text-sm">Loading history...</p>}
      {!loading && pastTasks.length === 0 && <p className="text-slate-500 text-sm">No recent activity found.</p>}
      {!loading && pastTasks.map(task => (
        <div key={task.id} className="p-2.5 bg-white/70 rounded-lg shadow-sm border border-slate-200/70">
          <p className="text-sm font-medium text-slate-800">{task.title}</p>
          <p className="text-xs text-slate-500">{task.status === 'completed' ? 'Completed' : 'Ended'} {task.end_time ? formatDistanceToNowStrict(parseISO(task.end_time), { addSuffix: true }) : 'N/A'}</p>
        </div>
      ))}
      <div className="flex justify-end mt-2"><Button type="button" variant="ghost" size="sm" onClick={onCancel} className="rounded-lg text-slate-600 hover:bg-slate-700/10">Close</Button></div>
    </motion.div>
  );
};

// --- Brainstorm (Notes) Component ---
const BrainstormComponent = ({ onCancel, formColor }) => {
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [view, setView] = useState('list');
  const [currentNoteContent, setCurrentNoteContent] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const fetchNotes = async () => { setLoadingNotes(true); try { const fetchedNotes = await Note.list('-created_date'); setNotes(fetchedNotes); } catch (error) { console.error("Error fetching notes:", error); } setLoadingNotes(false); };
  useEffect(() => { fetchNotes(); }, []);
  const handleCreateNewNote = () => { setCurrentNoteContent(''); setSelectedNote(null); setView('create'); };
  const handleViewNote = (note) => { setSelectedNote(note); setCurrentNoteContent(note.content); setView('viewNote'); };
  const handleSaveNote = async () => {
    if (!currentNoteContent.trim()) return;
    try { if (selectedNote && selectedNote.id) { await Note.update(selectedNote.id, { content: currentNoteContent }); } else { await Note.create({ content: currentNoteContent }); } fetchNotes(); setView('list'); } 
    catch (error) { console.error("Error saving note:", error); }
  };
  const handleDeleteNote = async (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) { try { await Note.delete(noteId); fetchNotes(); if (selectedNote && selectedNote.id === noteId) setView('list'); } catch (error) { console.error("Error deleting note:", error); } }
  };
  return (
    <motion.div className={`p-4 space-y-3 rounded-2xl ${formColor} max-h-80 overflow-y-auto custom-scrollbar`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: "circOut", delay: 0.2 }}>
      {view === 'list' && ( <>
          <div className="flex justify-between items-center mb-2"> <h4 className="text-md font-medium text-slate-700">My Notes</h4> <Button size="sm" onClick={handleCreateNewNote} className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs"><PlusCircle className="w-3.5 h-3.5 mr-1"/>New Note</Button> </div>
          {loadingNotes && <p className="text-slate-500 text-sm">Loading notes...</p>}
          {!loadingNotes && notes.length === 0 && <p className="text-slate-500 text-sm">No notes yet. Create one!</p>}
          {!loadingNotes && notes.map(note => ( <div key={note.id} className="p-2.5 bg-white/70 rounded-lg shadow-sm border border-slate-200/70 flex justify-between items-center"> <p className="text-sm text-slate-800 truncate cursor-pointer hover:underline" onClick={() => handleViewNote(note)}>{note.content.substring(0, 30)}{note.content.length > 30 ? '...' : ''}</p> <div className="flex gap-1"> <Button variant="ghost" size="icon" className="w-7 h-7 rounded-md text-slate-500 hover:bg-slate-200/50" onClick={() => handleViewNote(note)}><Eye className="w-4 h-4"/></Button> <Button variant="ghost" size="icon" className="w-7 h-7 rounded-md text-red-500 hover:bg-red-100/50" onClick={() => handleDeleteNote(note.id)}><Trash2 className="w-4 h-4"/></Button> </div> </div> ))}
      </> )}
      {(view === 'create' || (view === 'viewNote' && selectedNote)) && ( <> <Textarea placeholder="Your note..." value={currentNoteContent} onChange={(e) => setCurrentNoteContent(e.target.value)} className="rounded-lg border-slate-300 min-h-[120px] bg-white/80 text-slate-800" /> <div className="flex justify-between items-center mt-2"> <Button variant="ghost" size="sm" onClick={() => setView('list')} className="rounded-lg text-slate-600 hover:bg-slate-700/10">← Back to List</Button> <Button size="sm" onClick={handleSaveNote} className="rounded-lg bg-green-500 hover:bg-green-600 text-white"><Save className="w-4 h-4 mr-1.5"/>{selectedNote?.id ? 'Update' : 'Save'} Note</Button> </div> </> )}
       <div className="flex justify-end mt-3 pt-2 border-t border-slate-200/50"> <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="rounded-lg text-slate-600 hover:bg-slate-700/10">Close Notes</Button> </div>
    </motion.div>
  );
};

// --- Main QuickActions Component ---
export default function QuickActions({ onTaskAdded }) {
  const [activeActionId, setActiveActionId] = useState(null);
  const [expandingGradient, setExpandingGradient] = useState(null); // Used for the expanding overlay
  const [animatedGradient, setAnimatedGradient] = useState(defaultGradient); // Used for the main card background
  const [buttonBounds, setButtonBounds] = useState(null);
  const cardRef = useRef(null);

  const handleActionClick = (action, event) => {
    const cardRect = cardRef.current.getBoundingClientRect();
    const buttonRect = event.currentTarget.getBoundingClientRect();
    
    setButtonBounds({
      top: buttonRect.top - cardRect.top,
      left: buttonRect.left - cardRect.left,
      width: buttonRect.width,
      height: buttonRect.height,
    });
    setExpandingGradient(action.gradient); // Set gradient for the expanding overlay
    setAnimatedGradient(action.gradient); // Also set the main card background immediately for smoother feel
    setActiveActionId(action.id);
  };

  const handleBack = () => {
    setActiveActionId(null);
    setAnimatedGradient(defaultGradient); // Reset main card background to default
    // expandingGradient and buttonBounds will be reset by AnimatePresence exit
  };

  const handleTaskSave = () => {
    handleBack();
    if (onTaskAdded) onTaskAdded();
  };

  const currentActionConfig = activeActionId ? actionsConfig.find(a => a.id === activeActionId) : null;

  return (
    <motion.div 
      ref={cardRef} 
      layout 
      className="relative backdrop-blur-xl rounded-3xl p-4 shadow-xl border border-white/20 overflow-hidden min-h-[280px]" // Removed bg-slate-100/30
      style={{ background: animatedGradient }} // Main background controlled by animatedGradient
      transition={{ duration: 0.4, ease: "circOut" }}
    >
      <AnimatePresence>
        {activeActionId && buttonBounds && expandingGradient && (
          <motion.div
            key="expanding-overlay"
            className="absolute z-10 rounded-3xl" 
            initial={{ 
              top: buttonBounds.top, 
              left: buttonBounds.left, 
              width: buttonBounds.width, 
              height: buttonBounds.height,
              opacity: 0.6
            }}
            animate={{ 
              top: 0, 
              left: 0, 
              width: "100%", 
              height: "100%",
              opacity: 1 
            }}
            exit={{ 
              top: buttonBounds.top, 
              left: buttonBounds.left, 
              width: buttonBounds.width, 
              height: buttonBounds.height,
              opacity: 0,
              transition: { duration: 0.3, ease: "circIn" }
            }}
            transition={{ duration: 0.35, ease: "circOut" }}
            style={{ background: expandingGradient }} // Overlay uses the specific action gradient
          />
        )}
      </AnimatePresence>

      <div className="relative z-20"> {/* Content on top of expanding overlay */}
        <AnimatePresence mode="wait">
          {!activeActionId ? (
            <motion.div 
              key="buttons-view" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1, transition: {delay: 0.2} }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {actionsConfig.map((action) => (
                  <motion.button 
                    key={action.id} 
                    onClick={(e) => handleActionClick(action, e)} 
                    className="flex flex-col items-center justify-center h-24 rounded-2xl p-3 text-white shadow-lg" 
                    style={{ background: action.gradient }} 
                    whileHover={{ scale: 1.07, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)" }} 
                    whileTap={{ scale: 0.93 }}
                  >
                    <action.icon className="w-5 h-5 mb-1.5" />
                    <span className="text-[11px] font-medium text-center leading-tight">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="form-view" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: activeActionId ? 0.15 : 0 }} 
              className="relative"
            >
              <div className="flex items-center mb-3">
                <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2 rounded-full w-8 h-8 hover:bg-black/10 text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h3 className="text-lg font-semibold flex items-center text-white">
                  {currentActionConfig?.icon && <currentActionConfig.icon className="w-5 h-5 mr-2" />}
                  {currentActionConfig?.label}
                </h3>
              </div>
              {activeActionId === "addTask" && currentActionConfig && (<QuickAddTaskForm onSave={handleTaskSave} onCancel={handleBack} formColor={currentActionConfig.formColor} />)}
              {activeActionId === "focusTimer" && currentActionConfig && (<FocusTimerComponent onCancel={handleBack} formColor={currentActionConfig.formColor} />)}
              {activeActionId === "logActivity" && currentActionConfig && (<LogActivityComponent onCancel={handleBack} formColor={currentActionConfig.formColor} />)}
              {activeActionId === "brainstorm" && currentActionConfig && (<BrainstormComponent onCancel={handleBack} formColor={currentActionConfig.formColor} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 5px; width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }
      `}</style>
    </motion.div>
  );
}
