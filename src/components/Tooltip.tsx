'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

type Side = 'right' | 'bottom' | 'top' | 'left';

export function Tooltip({
  children,
  text,
  side = 'right',
  delay = 800,
  className = '',
}: {
  children: React.ReactNode;
  text: string;
  side?: Side;
  delay?: number;
  className?: string;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (!ref.current || !text) return;
    const r = ref.current.getBoundingClientRect();
    const GAP = 8;
    let x = 0, y = 0;
    if (side === 'right')  { x = r.right + GAP;         y = r.top + r.height / 2; }
    if (side === 'left')   { x = r.left  - GAP;         y = r.top + r.height / 2; }
    if (side === 'bottom') { x = r.left  + r.width / 2; y = r.bottom + GAP; }
    if (side === 'top')    { x = r.left  + r.width / 2; y = r.top - GAP; }
    setPos({ x, y });
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [text, side, delay]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => setPos(null), 200);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const style: React.CSSProperties =
    side === 'right'  ? { left: pos?.x, top: pos?.y, transform: 'translateY(-50%)' } :
    side === 'left'   ? { left: pos?.x, top: pos?.y, transform: 'translate(-100%, -50%)' } :
    side === 'bottom' ? { left: pos?.x, top: pos?.y, transform: 'translateX(-50%)' } :
                        { left: pos?.x, top: pos?.y, transform: 'translate(-50%, -100%)' };

  return (
    <div ref={ref} className={className} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {pos && text && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed', zIndex: 9999, pointerEvents: 'none',
            opacity: visible ? 1 : 0,
            transition: 'opacity 200ms ease',
            ...style,
          }}
          className="bg-slate-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl max-w-[180px] leading-snug"
        >
          {text}
        </div>,
        document.body,
      )}
    </div>
  );
}
