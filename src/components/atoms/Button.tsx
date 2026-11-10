import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/utils/format';
import { Icon, type IconName } from './Icon';
import s from './Button.module.css';

type Variant = 'primary' | 'gold' | 'glass' | 'outline' | 'ghost' | 'dark';
interface Common { variant?: Variant; size?: 'sm' | 'md' | 'lg'; icon?: IconName; iconLeft?: IconName; full?: boolean; children: ReactNode; className?: string }

export function Button({ variant = 'primary', size = 'md', icon, iconLeft, full, className, children, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cx(s.btn, s[variant], s[size], full && s.full, className)} {...rest}>
      {iconLeft && <Icon name={iconLeft} size={14} />}{children}{icon && <Icon name={icon} size={14} />}
    </button>
  );
}

export function ButtonLink({ href, variant = 'primary', size = 'md', icon, iconLeft, full, className, children, external }: Common & { href: string; external?: boolean }) {
  const cls = cx(s.btn, s[variant], s[size], full && s.full, className);
  const inner = <>{iconLeft && <Icon name={iconLeft} size={14} />}{children}{icon && <Icon name={icon} size={14} />}</>;
  return external
    ? <a className={cls} href={href} target="_blank" rel="noopener noreferrer">{inner}</a>
    : <Link className={cls} href={href}>{inner}</Link>;
}
