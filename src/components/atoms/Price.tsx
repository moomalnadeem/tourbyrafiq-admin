import { cx, CURRENCY_SYMBOL, money } from '@/lib/utils/format';
import s from './Price.module.css';

/** Price in US dollars: "$1,280". */
export function Price({ amount, from, per, size = 'md', className }: { amount: number | string; from?: boolean; per?: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <div className={cx(s.wrap, s[size], className)}>
      {from && <span className={s.from}>From</span>}
      <span className={s.row}>
        <span className={s.sym} aria-hidden>{CURRENCY_SYMBOL}</span>
        <span className="sr-only">USD </span>
        {money(amount)}
        {per && <span className={s.per}>{per}</span>}
      </span>
    </div>
  );
}
