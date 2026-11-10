'use client';
import { useRef } from 'react';
import s from './OtpInput.module.css';

/** 6-digit code input (Figma "Form / Code digit"). Supports paste and auto-advance. */
export function OtpInput({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

  const set = (i: number, d: string) => {
    const next = digits.slice(); next[i] = d; onChange(next.join('').slice(0, 6));
  };

  return (
    <div className={s.otp} role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={1}
          aria-label={`Digit ${i + 1}`} value={d} autoFocus={autoFocus && i === 0}
          onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); if (!v) return set(i, ''); set(i, v[v.length - 1]); refs.current[i + 1]?.focus(); }}
          onKeyDown={(e) => { if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus(); }}
          onPaste={(e) => { const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); if (t) { e.preventDefault(); onChange(t); refs.current[Math.min(5, t.length)]?.focus(); } }} />
      ))}
    </div>
  );
}
