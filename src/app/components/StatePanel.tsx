import type { PropsWithChildren, ReactNode } from 'react';

type StatePanelProps = PropsWithChildren<{
  actions?: ReactNode;
  eyebrow: string;
  message: string;
  title: string;
  tone?: 'default' | 'error';
}>;

export function StatePanel({ actions, children, eyebrow, message, title, tone = 'default' }: StatePanelProps) {
  return (
    <section className={`panel-card state-card${tone === 'error' ? ' state-card--error' : ''}`} aria-live="polite">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="muted-copy">{message}</p>
      {children}
      {actions ? <div className="button-row">{actions}</div> : null}
    </section>
  );
}
