import React, { useRef, useEffect, useMemo, useState } from 'react';

const getBorderRadius = (element, scale) => {
    if (element.borderRadiusTopLeft || element.borderRadiusTopRight || element.borderRadiusBottomLeft || element.borderRadiusBottomRight) {
        return `${(element.borderRadiusTopLeft || 0) * scale}px ${(element.borderRadiusTopRight || 0) * scale}px ${(element.borderRadiusBottomRight || 0) * scale}px ${(element.borderRadiusBottomLeft || 0) * scale}px`;
    }
    return element.borderRadius ? `${element.borderRadius * scale}px` : '0px';
};

const getFillStyle = (element) => {
    if (element.fillType === 'gradient') {
        return { background: element.fill };
    } else if (element.fillType === 'image' && element.backgroundImage) {
        return {
            backgroundImage: `url(${element.backgroundImage})`,
            backgroundSize: element.backgroundSize || 'cover',
            backgroundPosition: element.backgroundPosition || 'center',
            backgroundRepeat: 'no-repeat'
        };
    } else {
        return { backgroundColor: element.fill };
    }
};

const ElementRenderer = ({ element, scale }) => {
    const style = {
        position: 'absolute',
        left: `${element.x * scale}px`,
        top: `${element.y * scale}px`,
        width: `${element.width * scale}px`,
        height: `${element.height * scale}px`,
        transform: `rotate(${element.rotation || 0}deg) scale(${element.scale || 1})`,
        opacity: element.opacity !== undefined ? element.opacity : 1,
        ...getFillStyle(element),
        border: element.stroke !== "transparent" ? `${(element.strokeWidth || 1) * scale}px solid ${element.stroke}` : "none",
        borderRadius: getBorderRadius(element, scale),
    };

    switch (element.type) {
        case 'rectangle':
        case 'frame':
        case 'circle':
             if (element.type === 'circle') style.borderRadius = '50%';
            return React.createElement('div', { style });

        case 'text':
            return React.createElement('div', {
                style: {
                    ...style, 
                    color: element.stroke, 
                    fontSize: `${(element.fontSize || 16) * scale}px`, 
                    fontFamily: element.fontFamily, 
                    fontWeight: element.fontWeight, 
                    fontStyle: element.fontStyle, 
                    textAlign: element.textAlign, 
                    border: 'none', 
                    background: 'transparent', 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word', 
                    overflow: 'hidden'
                }
            }, element.text);
        
        case 'line':
            const x1_rel = element.x1 - element.x;
            const y1_rel = element.y1 - element.y;
            const x2_rel = element.x2 - element.x;
            const y2_rel = element.y2 - element.y;

            return React.createElement('div', { style }, 
                React.createElement('svg', {
                    width: element.width || 1,
                    height: element.height || 1,
                    style: { position: 'absolute', top: 0, left: 0 }
                },
                    React.createElement('line', {
                        x1: x1_rel,
                        y1: y1_rel,
                        x2: x2_rel,
                        y2: y2_rel,
                        stroke: element.stroke || '#FFFFFF',
                        strokeWidth: (element.strokeWidth || 2) * scale,
                        strokeLinecap: "round"
                    })
                )
            );
        
        default:
            return null;
    }
};

export default function ProjectPreview({ elements = [], backgroundColor }) {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);
    
    const boundingBox = useMemo(() => {
        if (!elements || elements.length === 0) {
            return { minX: 0, minY: 0, maxX: 1280, maxY: 720 };
        }
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        elements.forEach(el => {
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + el.width);
            maxY = Math.max(maxY, el.y + el.height);
        });

        const padding = (maxX - minX) * 0.05 || 10;
        return { 
            minX: minX - padding, 
            minY: minY - padding, 
            maxX: maxX + padding, 
            maxY: maxY + padding 
        };
    }, [elements]);
    
    useEffect(() => {
        const currentRef = containerRef.current;
        if (currentRef) {
            const resizeObserver = new ResizeObserver(entries => {
                if (entries[0]) {
                    setContainerWidth(entries[0].contentRect.width);
                }
            });
            resizeObserver.observe(currentRef);
            return () => resizeObserver.disconnect();
        }
    }, []);

    const contentWidth = Math.max(1, boundingBox.maxX - boundingBox.minX);
    const contentHeight = Math.max(1, boundingBox.maxY - boundingBox.minY);

    const scale = containerWidth > 0 && contentWidth > 0 ? containerWidth / contentWidth : 0;

    return React.createElement('div', {
        ref: containerRef,
        className: "w-full h-full overflow-hidden relative",
        style: { backgroundColor: backgroundColor || '#0D1117' }
    },
        React.createElement('div', {
            className: "relative",
            style: {
                width: `${contentWidth}px`,
                height: `${contentHeight}px`,
                transformOrigin: 'top left',
                transform: `scale(${scale}) translate(${-boundingBox.minX}px, ${-boundingBox.minY}px)`,
            }
        },
            elements.map(el => 
                React.createElement(ElementRenderer, { key: el.id, element: el, scale: 1 })
            )
        )
    );
}