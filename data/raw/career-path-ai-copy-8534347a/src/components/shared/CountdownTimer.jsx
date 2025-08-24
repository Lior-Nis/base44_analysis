import React, { useState, useEffect, useRef } from 'react';

export default function CountdownTimer({ 
    targetNumber, 
    duration = 1200, 
    suffix = "", 
    prefix = "",
    className = "",
    triggerOnView = true 
}) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(!triggerOnView);
    const elementRef = useRef();

    useEffect(() => {
        if (!triggerOnView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.3 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [triggerOnView]);

    useEffect(() => {
        if (!isVisible) return;

        let startTime;
        let animationFrameId;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeOutQuart * targetNumber);
            
            setCount(currentCount);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(targetNumber);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isVisible, targetNumber, duration]);

    return (
        <span ref={elementRef} className={className}>
            {prefix}{count}{suffix}
        </span>
    );
}