import React, { useState, useEffect } from 'react';

export default function TypewriterEffect({ 
    text, 
    speed = 15, 
    delay = 0, 
    className = "", 
    cursor = true,
    onComplete 
}) {
    const [displayText, setDisplayText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, delay + speed);

            return () => clearTimeout(timeout);
        } else if (!isComplete) {
            setIsComplete(true);
            if (onComplete) onComplete();
            
            // Hide cursor after completion
            if (cursor) {
                setTimeout(() => setShowCursor(false), 500);
            }
        }
    }, [currentIndex, text, speed, delay, cursor, onComplete, isComplete]);

    // Cursor blink effect
    useEffect(() => {
        if (!cursor || !showCursor) return;
        
        const interval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 400);

        return () => clearInterval(interval);
    }, [cursor, showCursor]);

    return (
        <span className={className}>
            {displayText}
            {cursor && showCursor && <span className="animate-pulse">|</span>}
        </span>
    );
}