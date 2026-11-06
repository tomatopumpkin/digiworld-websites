import React, { useEffect, useMemo, useRef, useState } from "react";

// ===============================================================
// ส่วนที่ใช้ร่วมกันของหน้า AddChild และ EditChild
// (ช่องฟอร์ม, ปฏิทินเลือกวันเกิด, ฟังก์ชันช่วยต่าง ๆ)
// วางที่ src/components/ChildFormParts.jsx
// ===============================================================

// Gregorian calendar for every language (years shown as ค.ศ.)
export const LOCALES = {
  th: "th-TH-u-ca-gregory",
  en: "en-GB",
};

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
export const fill = (text, values) =>
  Object.entries(values).reduce((r, [k, v]) => r.split(`{${k}}`).join(v), text);

export const pad = (n) => String(n).padStart(2, "0");

// month is zero-based (like Date)
export const toStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

export const todayStr = () => {
  const d = new Date();
  return toStr(d.getFullYear(), d.getMonth(), d.getDate());
};

// "YYYY-MM-DD" -> { y, m (zero-based), d } or null
export const parseDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [y, m, d] = value.split("-").map(Number);
  return { y, m: m - 1, d };
};

// Age in whole years from "YYYY-MM-DD" (null if invalid)
export const ageFrom = (value) => {
  const p = parseDate(value);
  if (!p) return null;
  const now = new Date();
  let age = now.getFullYear() - p.y;
  if (now.getMonth() < p.m || (now.getMonth() === p.m && now.getDate() < p.d)) age -= 1;
  return age;
};

export const maskPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 6) return "";
  return `${digits.slice(0, 2)}* *** ${digits.slice(-4)}`;
};

export const initialOf = (name) => (name && name.trim() ? Array.from(name.trim())[0].toUpperCase() : "?");

// ---------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3 8.5h14M7 2.8v3.4M13 2.8v3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export function Field({ id, label, hint, error, children }) {
  return (
    <div className="ac-field">
      <label className="ac-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="ac-error" id={`${id}-msg`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className="ac-hint" id={`${id}-msg`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

// Calendar pop-up for the date of birth (month + year dropdowns, Sunday first)
export function DatePicker({ id, value, onChange, maxDate, yearsBack, language, t, invalid, describedBy }) {
  const dateLocale = language === "th" ? LOCALES.th : LOCALES.en;
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);

  const parsed = parseDate(value);
  const nowYear = new Date().getFullYear();
  const [view, setView] = useState({
    y: parsed ? parsed.y : nowYear - 6,
    m: parsed ? parsed.m : new Date().getMonth(),
  });

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const monthNames = useMemo(() => {
    const f = new Intl.DateTimeFormat(dateLocale, { month: "long" });
    return Array.from({ length: 12 }, (_, i) => f.format(new Date(2021, i, 1)));
  }, [dateLocale]);

  const years = useMemo(() => {
    const list = Array.from({ length: yearsBack + 1 }, (_, i) => nowYear - i);
    if (!list.includes(view.y)) list.push(view.y);
    return list.sort((a, b) => b - a);
  }, [yearsBack, nowYear, view.y]);

  // Always 6 weeks (42 cells) so the pop-up keeps the same height
  const cells = useMemo(() => {
    const firstWeekday = new Date(view.y, view.m, 1).getDay();
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(view.y, view.m, 1 - firstWeekday + i);
      return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate(), other: d.getMonth() !== view.m };
    });
  }, [view]);

  const display = parsed
    ? new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "long", year: "numeric" }).format(
        new Date(parsed.y, parsed.m, parsed.d)
      )
    : "";

  const shift = (delta) =>
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const nextFirst = new Date(view.y, view.m + 1, 1);
  const nextDisabled = toStr(nextFirst.getFullYear(), nextFirst.getMonth(), 1) > maxDate;
  const prevDisabled = view.y <= nowYear - yearsBack && view.m === 0;

  const toggle = () => {
    if (!open && parsed) setView({ y: parsed.y, m: parsed.m });
    setOpen((o) => !o);
  };

  const pick = (cell) => {
    onChange(toStr(cell.y, cell.m, cell.d));
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div className="ac-date" ref={wrapRef}>
      <button
        type="button"
        id={id}
        ref={buttonRef}
        className={`ac-input ac-date-btn${display ? "" : " is-empty"}`}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      >
        <span>{display || t.birthPh}</span>
        <CalendarIcon />
      </button>

      {open && (
        <div className="ac-cal" role="dialog" aria-label={t.birthDate}>
          <div className="ac-cal-head">
            <div className="ac-cal-month">
              <button
                type="button"
                className="ac-cal-nav"
                onClick={() => shift(-1)}
                disabled={prevDisabled}
                aria-label={t.prevMonth}
              >
                ‹
              </button>
              <select
                className="ac-cal-select is-month"
                value={view.m}
                onChange={(e) => setView((v) => ({ ...v, m: Number(e.target.value) }))}
                aria-label={t.monthLabel}
              >
                {monthNames.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="ac-cal-nav"
                onClick={() => shift(1)}
                disabled={nextDisabled}
                aria-label={t.nextMonth}
              >
                ›
              </button>
            </div>
            <select
              className="ac-cal-select is-year"
              value={view.y}
              onChange={(e) => setView((v) => ({ ...v, y: Number(e.target.value) }))}
              aria-label={t.yearLabel}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {t.yearPrefix}
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="ac-cal-week" aria-hidden="true">
            {t.weekdays.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="ac-cal-grid">
            {cells.map((c) => {
              const str = toStr(c.y, c.m, c.d);
              const disabled = str > maxDate;
              const selected = str === value;
              return (
                <button
                  key={str}
                  type="button"
                  className={`ac-cal-day${c.other ? " is-other" : ""}${selected ? " is-on" : ""}`}
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => pick(c)}
                >
                  {c.d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
