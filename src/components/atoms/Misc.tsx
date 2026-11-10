import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cx } from '@/lib/utils/format';
import { Icon } from './Icon';
import s from './Misc.module.css';

export const Container = ({ children, className, as: T = 'div' }: { children: ReactNode; className?: string; as?: ElementType }) => <T className={cx(s.container, className)}>{children}</T>;

export const Section = ({ children, tone, className, id, labelledBy }: { children: ReactNode; tone?: 'cream' | 'white' | 'dark'; className?: string; id?: string; labelledBy?: string }) => (
  <section id={id} aria-labelledby={labelledBy} className={cx(s.section, tone && s[tone], className)}><div className={s.container}>{children}</div></section>
);

export const Spinner = ({ label = 'Loading' }: { label?: string }) => <span className={s.spinner} role="status" aria-label={label} />;
export const Skeleton = ({ style }: { style?: CSSProperties }) => <div className={s.skeleton} style={style} aria-hidden />;

export const Rating = ({ value, count }: { value: number; count?: number }) => (
  <span className={s.stars} aria-label={`Rated ${value} out of 5`}>
    <Icon name="star" size={14} /><span>{Number(value).toFixed(1)}</span>{count !== undefined && <small>({count})</small>}
  </span>
);
