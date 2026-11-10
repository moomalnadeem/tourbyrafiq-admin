'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, FormField, Input, Logo } from '@/components/atoms';
import { OtpInput } from '@/components/molecules/OtpInput';

/** Admin sign in & 2-step verification (Figma AD0) — also used for the tour guide panel. */
export function LoginScreen({ portal }: { portal: 'admin' | 'guide' }) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(''); const [code, setCode] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function call(path: string, body: any) {
    const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json(); if (!r.ok) throw new Error(d.message); return d;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: 'linear-gradient(160deg, #1e1714 0%, #2a201b 55%, #3b2a20 100%)' }}>
      <form style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 20, padding: 'clamp(24px, 5vw, 40px)', display: 'grid', gap: 18, boxShadow: 'var(--shadow-pop)' }}
        onSubmit={async (e) => {
          e.preventDefault(); setErr(''); setBusy(true);
          try {
            if (step === 'email') { await call('/api/auth/otp', { email, portal }); setStep('code'); }
            else { await call('/api/auth/verify', { email, code, portal }); router.replace(portal === 'guide' ? '/guide' : '/'); router.refresh(); }
          } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
        }}>
        <Logo width={120} href={null} />
        <div>
          <p style={{ fontSize: 11.5, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--c-brand)', fontWeight: 600 }}>{portal === 'guide' ? 'Tour guide panel' : 'Admin panel'}</p>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 30 }}>{step === 'email' ? 'Sign in' : 'Two-step verification'}</h1>
          <p style={{ color: 'var(--c-muted)', fontSize: 14 }}>{step === 'email' ? 'Use your work email. We’ll send a one-time code.' : `Enter the 6-digit code sent to ${email}.`}</p>
        </div>
        {step === 'email'
          ? <FormField label="Work email">{(id) => <Input id={id} type="email" required autoFocus autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />}</FormField>
          : <OtpInput value={code} onChange={setCode} autoFocus />}
        {err && <p role="alert" style={{ color: 'var(--c-bad)', fontSize: 13 }}>{err}</p>}
        <Button type="submit" size="lg" full disabled={busy || (step === 'code' && code.length !== 6)}>{busy ? 'Please wait…' : step === 'email' ? 'Send code' : 'Verify & sign in'}</Button>
        {step === 'code' && <button type="button" onClick={() => { setStep('email'); setCode(''); }} style={{ border: 0, background: 'none', color: 'var(--c-brand)', textDecoration: 'underline' }}>Use a different email</button>}
        <p style={{ fontSize: 12, color: 'var(--c-muted)' }}>Access is restricted to authorised staff. Every sign-in is recorded.</p>
      </form>
    </div>
  );
}
