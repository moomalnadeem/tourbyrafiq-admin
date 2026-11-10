'use client';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type Toast = { id: number; text: string; tone: 'info' | 'error' };
const Ctx = createContext<(text: string, tone?: Toast['tone']) => void>(() => undefined);

/** Toasts (Figma "States & toasts"). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast['tone'] = 'info') => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, text, tone }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'calc(24px + var(--bottom-nav-h))', zIndex: 80, display: 'flex', flexDirection: 'column', gap: 8, width: 'min(92vw, 420px)' }}>
        {items.map((t) => (
          <div key={t.id} role="status" style={{ background: t.tone === 'error' ? 'var(--c-bad)' : 'var(--c-ink)', color: '#fff', padding: '12px 16px', borderRadius: 12, fontSize: 14, boxShadow: 'var(--shadow-pop)' }}>{t.text}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export const useToast = () => useContext(Ctx);
