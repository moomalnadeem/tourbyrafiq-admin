'use client';

/** Accessible on/off switch (role="switch"). */
export function Switch({ checked, onChange, disabled, label, size = 'md' }: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string; size?: 'sm' | 'md';
}) {
  const w = size === 'sm' ? 36 : 44; const h = size === 'sm' ? 20 : 24; const k = h - 6;
  return (
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      style={{
        position: 'relative', width: w, height: h, flex: 'none', borderRadius: 999, border: 0, padding: 0,
        background: checked ? 'var(--c-ok, #2f7a4f)' : '#cfc4b8', cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1, transition: 'background .15s',
      }}
    >
      <span aria-hidden style={{
        position: 'absolute', top: 3, left: checked ? w - k - 3 : 3, width: k, height: k, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', transition: 'left .15s',
      }} />
    </button>
  );
}
