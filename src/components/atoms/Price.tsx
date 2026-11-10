import { cx, money } from '@/lib/utils/format';
import s from './Price.module.css';

/** Price with the UAE Dirham symbol (Figma component "Icon / Dirham"). */
export function Price({ amount, from, per, size = 'md', className }: { amount: number | string; from?: boolean; per?: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <div className={cx(s.wrap, s[size], className)}>
      {from && <span className={s.from}>From</span>}
      <span className={s.row}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/icons/dirham.svg" alt="AED" className={s.dirham} width={18} height={16} />
        {money(amount)}
        {per && <span className={s.per}>{per}</span>}
      </span>
    </div>
  );
}
