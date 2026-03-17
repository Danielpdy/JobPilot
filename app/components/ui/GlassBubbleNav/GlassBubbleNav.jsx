'use client';
import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import styles from './GlassBubbleNav.module.css';

const GlassBubbleNav = ({ items, defaultIndex = 0, activeIndex: externalIndex, onChange, orientation = 'vertical' }) => {
  const isControlled = externalIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const activeIndex = isControlled ? externalIndex : internalIndex;

  const bubbleRef = useRef(null);
  const buttonRefs = useRef([]);
  const containerRef = useRef(null);
  const prevIndexRef = useRef(activeIndex);
  const isHorizontal = orientation === 'horizontal';

  const positionBubble = (index, animate = true) => {
    const bubble = bubbleRef.current;
    if (!bubble) return;

    if (index < 0) {
      gsap.to(bubble, { opacity: 0, duration: 0.15 });
      return;
    }

    const btn = buttonRefs.current[index];
    if (!btn) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const x = btnRect.left - containerRect.left;
    const y = btnRect.top - containerRect.top;
    const w = btnRect.width;
    const h = btnRect.height;

    if (!animate) {
      gsap.set(bubble, { x, y, width: w, height: h, opacity: 1 });
      return;
    }

    gsap.to(bubble, { opacity: 1, duration: 0.1 });

    const prevIndex = prevIndexRef.current;
    const prevBtn = prevIndex >= 0 ? buttonRefs.current[prevIndex] : null;

    if (prevBtn) {
      const prevRect = prevBtn.getBoundingClientRect();
      const movingForward = isHorizontal
        ? btnRect.left > prevRect.left
        : btnRect.top > prevRect.top;

      if (isHorizontal) {
        const stretchX = movingForward ? x - (w * 0.15) : x;
        gsap.to(bubble, { x: stretchX, y, width: w * 1.3, height: h, duration: 0.18, ease: 'power2.out' });
      } else {
        const stretchY = movingForward ? y - (h * 0.15) : y;
        gsap.to(bubble, { x, y: stretchY, width: w, height: h * 1.3, duration: 0.18, ease: 'power2.out' });
      }
    }

    gsap.to(bubble, {
      x, y, width: w, height: h,
      duration: 0.55,
      ease: 'elastic.out(1, 0.55)',
      delay: prevBtn ? 0.12 : 0,
    });
  };

  useLayoutEffect(() => {
    positionBubble(activeIndex, false);
  }, []);

  // React to controlled index changes
  useEffect(() => {
    if (!isControlled) return;
    positionBubble(externalIndex, true);
    prevIndexRef.current = externalIndex;
  }, [externalIndex]);

  const handleClick = (index) => {
    prevIndexRef.current = activeIndex;
    if (!isControlled) {
      positionBubble(index, true);
      setInternalIndex(index);
    }
    onChange?.(index, items[index]);
  };

  // Re-position on resize
  useEffect(() => {
    const onResize = () => positionBubble(activeIndex, false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeIndex]);

  return (
    <nav
      ref={containerRef}
      className={`${styles.nav} ${isHorizontal ? styles.horizontal : styles.vertical}`}
    >
      <div ref={bubbleRef} className={styles.bubble} />
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
