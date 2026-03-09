'use client';
import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import GlassSurface from '../GlassSurface/GlassSurface';

export default function GlassNavIndicator({ items, defaultIndex = 0, pillHeight = 40 }) {
  const [active, setActive] = useState(defaultIndex);
  const [hovered, setHovered] = useState(null);
  const containerRef = useRef(null);
  const indicatorRef = useRef(null);
  const itemRefs = useRef([]);

  const targetIndex = hovered ?? active;

  const moveIndicator = (index, instant = false) => {
    const container = containerRef.current;
    const item = itemRefs.current[index];
    const indicator = indicatorRef.current;
    if (!container || !item || !indicator) return;

    const cRect = container.getBoundingClientRect();
    const iRect = item.getBoundingClientRect();

    if (instant) {
      gsap.set(indicator, { x: iRect.left - cRect.left, width: iRect.width });
    } else {
      gsap.to(indicator, {
        x: iRect.left - cRect.left,
        width: iRect.width,
        duration: 0.38,
        ease: 'power3.out',
      });
    }
  };

  // Set initial position after layout
  useEffect(() => {
    const t = setTimeout(() => moveIndicator(defaultIndex, true), 30);
    return () => clearTimeout(t);
  }, []);

  // Animate on hover / active change
  useEffect(() => {
    moveIndicator(targetIndex);
  }, [targetIndex]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
      }}
    >
      {/* GSAP moves this wrapper; GlassSurface fills it 100% */}
      <div
        ref={indicatorRef}
        style={{
          position: 'absolute',
          top: `calc(50% - ${pillHeight / 2}px)`,
          left: 0,
          height: pillHeight,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <GlassSurface
          width="100%"
          height="100%"
          borderRadius={50}
          borderWidth={0.1}
          brightness={80}
          opacity={0.85}
          blur={10}
          distortionScale={-160}
          redOffset={0}
          greenOffset={10}
          blueOffset={20}
          style={{ position: 'absolute', inset: 0 }}
        />
      </div>

      {items.map((item, i) => (
        <a
          key={item.label}
          ref={(el) => (itemRefs.current[i] = el)}
          href={item.href}
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '6px 14px',
            fontSize: '0.875rem',
            fontWeight: targetIndex === i ? 600 : 500,
            color: targetIndex === i ? '#0B2D72' : 'rgba(11,45,114,0.65)',
            textDecoration: 'none',
            borderRadius: '50px',
            transition: 'color 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => setActive(i)}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
