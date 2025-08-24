
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { User } from '@/api/entities';
import { Note } from '@/api/entities';
import LoadingScreen from '../components/LoadingScreen';
import { motion } from 'framer-motion';
import { Cloud, LogOut, Loader } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function dev() {
    const [pageState, setPageState] = useState('loading');
    const [user, setUser] = useState(null);
    const [note, setNote] = useState(null);
    const [content, setContent] = useState('');
    const [saveStatus, setSaveStatus] = useState('Ready');
    const saveTimeoutRef = useRef(null);

    useEffect(() => {
        const initializeAndAuth = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);

                const notes = await Note.list();
                let userNote;
                if (notes && notes.length > 0) {
                    userNote = notes[0];
                } else {
                    userNote = await Note.create({
                        content: '<h1>A Blank Canvas</h1><p>The best ideas start here. Your work saves automatically.</p>'
                    });
                }
                setNote(userNote);
                setContent(userNote.content || '');
                setSaveStatus('Saved');
                setPageState('authenticated');
                
            } catch (error) {
                try {
                    await User.loginWithRedirect(window.location.href);
                } catch (redirectError) {
                    setPageState('error'); 
                }
            }
        };

        initializeAndAuth();
    }, []);

    const handleContentChange = (newContent) => {
        setContent(newContent);
        setSaveStatus('Saving');

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            if (!note) return;
            try {
                await Note.update(note.id, { content: newContent });
                setSaveStatus('Saved');
            } catch (error) {
                setSaveStatus('Error');
            }
        }, 1500);
    };
    
    const handleLogout = async () => {
        await User.logout();
        window.location.href = createPageUrl('Home');
    };

    // Standard toolbar configuration, which will be styled by the <style> tag below.
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    if (pageState === 'loading') {
        return <LoadingScreen progress={75} message="Loading document..." />;
    }
    if (pageState === 'error') {
         return <div style={{padding: '2rem', textAlign: 'center'}}>Could not redirect to login. Please refresh.</div>;
    }

    if (pageState === 'authenticated') {
        const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
        const userInitials = user?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || user?.email?.[0] || 'U';

        const SaveStatusIndicator = () => {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '13px' }}>
                    {saveStatus === 'Saving' && <Loader className="animate-spin" size={14} />}
                    {saveStatus === 'Saved' && <Cloud size={14} />}
                    <span>{saveStatus}</span>
                </div>
            );
        };

        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{ 
                    height: '100vh', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    background: '#fafafa'
                }}
            >
                 <header style={{
                    height: '50px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    borderBottom: '1px solid #e5e5e7',
                    background: '#fafafa',
                    flexShrink: 0,
                }}>
                    <SaveStatusIndicator />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', background: '#eee',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', border: '1px solid #ddd'
                        }}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ color: '#555', fontWeight: 500 }}>{userInitials}</span>
                            )}
                        </div>
                        <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <LogOut size={18} style={{ color: '#888' }} />
                        </button>
                    </div>
                </header>

                <main style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '40px 24px',
                    overflow: 'hidden', // Prevent double scrollbars
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '820px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 25px rgba(0,0,0,0.07)',
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%', // <-- CRUCIAL FIX: Make the white container take full height
                    }}>
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={handleContentChange}
                            modules={modules}
                        />
                    </div>
                </main>


                {/* Custom Styling for a polished look */}
                <style>{`
                    /* This structure ensures the Quill editor fills its container correctly */
                    .quill {
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                    }

                    .ql-toolbar {
                        border-left: none !important;
                        border-right: none !important;
                        border-top: none !important;
                        border-bottom: 1px solid #e5e5e7 !important;
                        background: #fdfdfd !important;
                        padding: 12px 16px !important;
                        flex-shrink: 0; /* Toolbar should not shrink */
                    }
                    .ql-toolbar button, .ql-toolbar .ql-picker-label {
                        margin-right: 4px;
                        border-radius: 6px;
                        transition: background-color 0.15s ease;
                    }
                    .ql-toolbar button:hover, .ql-toolbar .ql-picker-label:hover {
                        background-color: #e9e9eb !important;
                        color: #1d1d1f !important;
                    }
                    .ql-toolbar button.ql-active, .ql-toolbar .ql-picker.ql-active .ql-picker-label, .ql-toolbar .ql-picker-item.ql-selected {
                        background-color: #333 !important;
                        color: white !important;
                    }
                    .ql-toolbar button.ql-active .ql-stroke {
                        stroke: white !important;
                    }
                    .ql-container {
                        border: none !important;
                        font-size: 16px !important;
                        flex-grow: 1; /* Make the text container grow */
                        overflow-y: auto; /* Allow the text container to scroll */
                        position: relative; /* Needed for editor to behave */
                    }
                    .ql-editor {
                        padding: 48px !important;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                        line-height: 1.7 !important;
                        font-size: 17px !important;
                        color: #1d1d1f !important;
                        /* Height is removed from here to allow natural growth inside the scrolling container */
                    }
                    .ql-editor h1 { font-size: 2.5rem !important; line-height: 1.2 !important; margin-bottom: 1.5rem !important; font-weight: 700 !important; }
                    .ql-editor h2 { font-size: 2rem !important; line-height: 1.3 !important; margin-bottom: 1.2rem !important; font-weight: 600 !important; }
                    .ql-editor h3 { font-size: 1.25rem !important; line-height: 1.4 !important; margin-bottom: 1rem !important; font-weight: 600 !important; }
                `}</style>
            </motion.div>
        );
    }
}
