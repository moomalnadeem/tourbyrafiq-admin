import type { ElementType, ReactNode } from 'react';
import { cx } from '@/lib/utils/format';
import s from './Typography.module.css';

type P = { children: ReactNode; className?: string; as?: ElementType };

export const Eyebrow = ({ children, className, gold, as: T = 'p' }: P & { gold?: boolean }) => <T className={cx(s.eyebrow, gold && s.gold, className)}>{children}</T>;
export const Display = ({ children, className, as: T = 'h1' }: P) => <T className={cx(s.display, className)}>{children}</T>;
export const Heading = ({ children, className, level = 2, light, as }: P & { level?: 1 | 2 | 3; light?: boolean }) => {
  const T = (as ?? `h${level}`) as ElementType;
  return <T className={cx(level === 1 ? s.h1 : level === 2 ? s.h2 : s.h3, light && s.light, className)}>{children}</T>;
};
export const Lead = ({ children, className, as: T = 'p' }: P) => <T className={cx(s.lead, className)}>{children}</T>;
export const Small = ({ children, className, as: T = 'p' }: P) => <T className={cx(s.small, className)}>{children}</T>;
