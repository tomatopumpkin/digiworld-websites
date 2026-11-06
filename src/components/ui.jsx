import { useEffect } from 'react';

export const t = {
  blue: '#2864D7', ink: '#18324F', muted: '#567087', line: '#DCE7F1', bg: '#F5F9FD',
  soft: '#E4F1FF', green: '#207855', greenBg: '#DEF3E9', yellowBg: '#FFF0B8',
  purpleBg: '#EDE8FF', amber: '#A46722', red: '#C0392B',
};
export const font = "'Noto Sans Thai', 'Inter', system-ui, sans-serif";

export function Pill({ bg = t.soft, color = t.ink, children }) {
  return (
    <span style={{ display: 'inline-block', padding: '5px 12px', background: bg, color, borderRadius: 100,
      fontSize: 12, fontWeight: 600, lineHeight: '18.6px', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

export function Card({ children, style, ...rest }) {
  return (
    <section {...rest} style={{ background: 'white', borderRadius: 24, padding: 24,
      display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0, ...style }}>
      {children}
    </section>
  );
}

export function Btn({ primary, style, ...props }) {
  return (
    <button type="button" {...props} style={{
      height: 38, padding: '0 16px', borderRadius: 100, fontFamily: font, fontSize: 13, fontWeight: 600,
      cursor: props.disabled ? 'not-allowed' : 'pointer', opacity: props.disabled ? 0.5 : 1,
      border: primary ? '1px solid transparent' : `1px solid ${t.line}`,
      background: primary ? t.blue : 'white', color: primary ? 'white' : t.ink, whiteSpace: 'nowrap', ...style }} />
  );
}

export const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: 12, background: t.bg, border: `1px solid ${t.line}`,
  borderRadius: 10, fontFamily: font, fontSize: 13, color: t.ink,
};

export function Field({ label, children, style }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: t.muted }}>{label}</span>
      {children}
    </label>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,50,79,.45)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 24, padding: 24, width: '100%', maxWidth: 480,
          maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16,
          fontFamily: font, color: t.ink }}>
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 400 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
