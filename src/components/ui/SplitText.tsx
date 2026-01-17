'use client';

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: 'chars' | 'words' | 'lines';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 50,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useGSAP(() => {
    if (!containerRef.current || !isClient) return;

    const container = containerRef.current;
    const elements = container.querySelectorAll('.split-char');

    if (elements.length === 0) return;

    gsap.fromTo(
      elements,
      { ...from },
      {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          once: true,
        },
        onComplete: () => {
          onLetterAnimationComplete?.();
        }
      }
    );
  }, { scope: containerRef, dependencies: [isClient, text] });

  // Split text into characters or words
  const splitContent = () => {
    if (splitType === 'words') {
      return text.split(' ').map((word, wordIndex) => (
        <span key={wordIndex} className="split-char inline-block" style={{ marginRight: '0.25em' }}>
          {word}
        </span>
      ));
    }
    
    // Split by characters (default)
    return text.split('').map((char, charIndex) => (
      <span
        key={charIndex}
        className="split-char inline-block"
        style={{ 
          display: char === ' ' ? 'inline' : 'inline-block',
          whiteSpace: char === ' ' ? 'pre' : 'normal'
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  const style: React.CSSProperties = {
    textAlign,
    overflow: 'hidden',
    display: 'inline-block',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  };

  const Tag = tag as keyof JSX.IntrinsicElements;

  return (
    <div ref={containerRef} style={{ textAlign }}>
      <Tag style={style} className={className}>
        {isClient ? splitContent() : text}
      </Tag>
    </div>
  );
};

export default SplitText;
