import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, useId } from 'react';
import { cx } from '@/lib/utils/format';
import s from './Field.module.css';

/** Form atoms (Figma "Form / Field"). Use FormField molecule for label + hint + error. */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  ({ className, invalid, ...rest }, ref) => <input ref={ref} className={cx(s.control, invalid && s.invalid, className)} {...rest} />,
);
Input.displayName = 'Input';

export const Select = ({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) => <select className={cx(s.control, className)} {...rest}>{children}</select>;
export const Textarea = ({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className={cx(s.control, className)} {...rest} />;

export function FormField({ label, hint, error, children, id }: { label: string; hint?: string; error?: string; children: (id: string) => ReactNode; id?: string }) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={s.field}>
      <label className={s.label} htmlFor={fid}>{label}</label>
      {children(fid)}
      {error ? <span className={s.error} role="alert">{error}</span> : hint ? <span className={s.hint}>{hint}</span> : null}
    </div>
  );
}
