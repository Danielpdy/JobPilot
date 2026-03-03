'use client';
import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import styles from './GlassBubbleNav.module.css';

const GlassBubbleNav = ({ items, defaultIndex = 0, onChange, orientation = 'vertical' }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const bubbleRef = useRef(null);
  const buttonRefs = useRef([]);
  const containerRef = useRef(null);
  const isHorizontal = orientation === 'horizontal';

  const moveBubble = (index, animate = true) => {
    const btn = buttonRefs.current[index];
    const bubble = bubbleRef.current;
    if (!btn || !bubble) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const x = isHorizontal ? btnRect.left - containerRect.left : 0;
    const y = isHorizontal ? 0 : btnRect.top - containerRect.top;
    const w = btnRect.width;
    const h = btnRect.height;

    if (!animate) {
      gsap.set(bubble, { x, y, width: w, height: h });
      return;
    }

    // Liquid stretch: briefly elongate in the direction of travel
    const prevBtn = buttonRefs.current[activeIndex];
    if (prevBtn) {
      const prevRect = prevBtn.getBoundingClientRect();
      const movingForward = isHorizontal
        ? btnRect.left > prevRect.left
        : btnRect.top > prevRect.top;

      if (isHorizontal) {
        const stretchX = movingForward ? x - (w * 0.15) : x;
        const stretchW = w * 1.3;
        gsap.to(bubble, {
          x: stretchX, width: stretchW,
          duration: 0.18, ease: 'power2.out'
        });
      } else {
        const stretchY = movingForward ? y - (h * 0.15) : y;
        const stretchH = h * 1.3;
        gsap.to(bubble, {
          y: stretchY, height: stretchH,
          duration: 0.18, ease: 'power2.out'
        });
      }
    }

    // Then spring to final position
    gsap.to(bubble, {
      x, y, width: w, height: h,
      duration: 0.55,
      ease: 'elastic.out(1, 0.55)',
      delay: 0.12
    });
  };

  useLayoutEffect(() => {
    moveBubble(activeIndex, false);
  }, []);

  const handleClick = (index) => {
    moveBubble(index, true);
    setActiveIndex(index);
    onChange?.(index, items[index]);
  };

  // Re-position on resize
  useEffect(() => {
    const onResize = () => moveBubble(activeIndex, false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeIndex]);

  return (
    <nav
      ref={containerRef}
      className={`${styles.nav} ${isHorizontal ? styles.horizontal : styles.vertical}`}
    >
      {/* The glass bubble */}
      <div ref={bubbleRef} className={styles.bubble} />

      {/* Nav items */}
      {items.map((item, i) => (
        <button
          key={i}
          ref={el => (buttonRefs.current[i] = el)}
          onClick={() => handleClick(i)}
          className={`${styles.navBtn} ${activeIndex === i ? styles.active : ''}`}
        >
          {item.icon && <span className={styles.icon}>{item.icon}</span>}
          <span className={styles.label}>{item.label}</span>
          {item.badge && <span className={styles.badge}>{item.badge}</span>}
        </button>
      ))}
    </nav>
  );
};

export default GlassBubbleNav;
