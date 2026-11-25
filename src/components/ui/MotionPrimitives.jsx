import { useEffect, useRef, useState } from 'react';
import { Box, Button } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { Link } from 'react-router-dom';

/**
 * Smoothly rotates key phrases in hero copy (pauses on hover/focus and honors reduced motion).
 */
export function FlipWords({ words = [], intervalMs = 2600 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || paused || words.length <= 1) return undefined;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs, paused, reducedMotion]);

  if (!words.length) return null;
  const current = words[index % words.length];

  return (
    <Box
      component="span"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ display: 'inline-block', color: 'var(--mantine-color-teal-3)' }}
    >
      <span key={current} className={reducedMotion ? undefined : 'flip-word-enter'}>
        {current}
      </span>
    </Box>
  );
}

/**
 * Counts smoothly from 0 to target once visible in the viewport.
 */
export function AnimatedCounter({ target, prefix = '', suffix = '', durationMs = 900 }) {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(reducedMotion ? target : 0);
  const ref = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return undefined;
    }
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / durationMs, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(target * eased));
          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, durationMs, reducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

/**
 * Attaches pointer-tracking radial spotlight variables (--spot-x / --spot-y) to a container.
 */
export function SpotlightWrap({ children, className = '', style, ...rest }) {
  const reducedMotion = useReducedMotion();

  const handlePointerMove = (e) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };

  return (
    <Box
      onPointerMove={handlePointerMove}
      className={`spotlight-card ${className}`.trim()}
      style={style}
      {...rest}
    >
      {children}
    </Box>
  );
}

/**
 * Accessible infinite horizontal marquee of clickable skill/course tracks.
 */
export function TrackMarquee({ items = [] }) {
  const reducedMotion = useReducedMotion();
  const rendered = reducedMotion ? items : [...items, ...items];

  return (
    <Box className="marquee-wrapper" role="region" aria-label="Popular skill and language tracks">
      <div className="marquee-track">
        {rendered.map((item, idx) => (
          <Button
            key={`${item.label}-${idx}`}
            component={Link}
            to={item.to}
            variant="default"
            size="sm"
            radius="xl"
            tabIndex={!reducedMotion && idx >= items.length ? -1 : undefined}
            aria-hidden={!reducedMotion && idx >= items.length ? true : undefined}
            leftSection={item.badge ? (
              <Box
                component="span"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  backgroundColor: 'var(--mantine-color-indigo-5)',
                  display: 'inline-block',
                }}
              />
            ) : null}
            styles={{
              root: {
                flexShrink: 0,
                fontWeight: 600,
                boxShadow: 'var(--mantine-shadow-xs)',
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </Box>
  );
}

/**
 * Lightweight IntersectionObserver reveal wrapper for sections.
 */
export function ScrollReveal({ children, delayMs = 0 }) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(reducedMotion);
  const ref = useRef(null);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return undefined;
    }
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <Box
      ref={ref}
      className={`reveal-up ${visible ? 'is-visible' : ''}`.trim()}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </Box>
  );
}
