import React, { useEffect, useRef } from 'react';

const MathText = ({ text, className = '' }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && window.renderMathInElement) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true }
                ],
                throwOnError: false
            });
        }
    }, [text]);

    return (
        <div 
            ref={containerRef} 
            className={`math-container ${className}`}
            dangerouslySetInnerHTML={{ __html: (text || '').replace(/\n/g, '<br/>') }}
        />
    );
};

export default MathText;
