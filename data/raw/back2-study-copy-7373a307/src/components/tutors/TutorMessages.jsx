
import React, { useState, useEffect, useCallback } from 'react';
import { TutorChat } from '@/api/entities';
import { User } from '@/api/entities';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import EmptyState from '../ui/empty-state';
import { motion } from 'framer-motion';
import { useTheme } from '../ui/theme-provider';

const translations = {
  he: {
    noMessages: 'אין לך הודעות עדיין',
    selectConversation: 'בחר שיחה כדי להתחיל',
    loading: 'טוען הודעות...',
    error: 'שגיאה בטעינת ההודעות',
    retry: 'נסה שוב',
    conversations: 'שיחות',
    newMessage: 'הודעה חדשה',
    lastActive: 'פעיל לאחרונה',
    online: 'מחובר/ת'
  },
  en: {
    noMessages: 'You have no messages yet',
    selectConversation: 'Select a conversation to start',
    loading: 'Loading messages...',
    error: 'Error loading messages',
    retry: 'Try again',
    conversations: 'Conversations',
    newMessage: 'New message',
    lastActive: 'Last active',
    online: 'Online'
  },
};

export default function TutorMessages({ user, language }) {
  const [conversations, setConversations] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentsData, setStudentsData] = useState({});
  const [error, setError] = useState(null); // New state for error handling
  const { themeClasses } = useTheme();
  const t = translations[language];

  const fetchConversations = useCallback(async () => {
    if (!user?.tutor_profile_id) return;
    try {
      setError(null); // Clear previous errors on new fetch attempt
      const allMessages = await TutorChat.filter({ tutor_profile_id: user.tutor_profile_id }, '-created_date');
      
      const studentIds = [...new Set(allMessages.map(msg => msg.student_id))];
      
      if (studentIds.length > 0) {
          const students = await User.filter({ id: { $in: studentIds } });
          const studentsMap = students.reduce((acc, student) => {
            if(student) acc[student.id] = student;
            return acc;
          }, {});
          setStudentsData(studentsMap);
      } else {
          setStudentsData({});
      }

      const groupedByStudent = studentIds.map(studentId => {
        const studentMessages = allMessages.filter(msg => msg.student_id === studentId);
        const lastMessage = studentMessages[0]; // Already sorted by date desc
        const unreadCount = studentMessages.filter(msg => !msg.read && msg.sender_type === 'student').length;
        
        return {
          studentId,
          lastMessage,
          unreadCount
        };
      });

      setConversations(groupedByStudent);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      setError(error.message); // Set error message
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const handleSelectConversation = async (studentId) => {
    setSelectedStudentId(studentId);
    // Mark messages as read
    const unreadMessages = conversations
      .find(c => c.studentId === studentId)
      ?.lastMessage?.id 
      ? await TutorChat.filter({
          tutor_profile_id: user.tutor_profile_id,
          student_id: studentId,
          read: false,
          sender_type: 'student'
        })
      : [];

    if (unreadMessages.length > 0) {
      await Promise.all(unreadMessages.map(msg => TutorChat.update(msg.id, { read: true })));
      fetchConversations();
    }
  };

  if (isLoading) {
    return <EmptyState type="loading" title={t.loading} language={language} />;
  }

  if (error) {
    return (
      <EmptyState
        type="noResults"
        title={t.error}
        description={error}
        actionText={t.retry}
        onAction={fetchConversations}
        language={language}
      />
    );
  }

  return (
    <div className={`rounded-xl border ${themeClasses.cardGlass} overflow-hidden shadow-2xl`}>
      {/* Mobile Layout */}
      <div className="md:hidden h-[calc(100vh-200px)]"> {/* Adjusted height for mobile to fit screen better */}
        {!selectedStudentId ? (
          <ConversationList
            conversations={conversations}
            studentsData={studentsData}
            selectedStudentId={selectedStudentId}
            onSelectConversation={handleSelectConversation}
            language={language}
            isMobile={true}
          />
        ) : (
          <ChatWindow
            key={selectedStudentId}
            currentUser={user}
            student={studentsData[selectedStudentId]}
            language={language}
            onBack={() => setSelectedStudentId(null)}
            isMobile={true}
          />
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-[75vh]">
        <ConversationList
          conversations={conversations}
          studentsData={studentsData}
          selectedStudentId={selectedStudentId}
          onSelectConversation={handleSelectConversation}
          language={language}
        />
        <main className="flex-1 flex flex-col">
          {selectedStudentId ? (
            <ChatWindow
              key={selectedStudentId}
              currentUser={user}
              student={studentsData[selectedStudentId]}
              language={language}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                type="noData"
                title={conversations.length > 0 ? t.selectConversation : t.noMessages}
                language={language}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
