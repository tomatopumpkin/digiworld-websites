import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/ParentSchedule.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";
import useSession from "../lib/useSession";
import { supabase } from "../lib/supabase";

const TZ = "Asia/Bangkok";
const CANCEL_MINUTES = 30;
const PARENT_AREA_PATH = "/parent-portal";
const HISTORY_PATH = "/parent-history";
const PACKAGES_PATH = "/parent-packages";
const RESCHEDULE_PATH = "/parent-reschedule";
const CANCEL_PATH = "/parent-cancel";
const BOOK_PATH = "/book-class";
const LOGIN_PATH = "/login";
const ADD_CHILD_PATH = "/add-child";
const MAX_OPEN = 4;
const STUDIO = "DigiWorld Phuket";

const COURSES = [
  { id: "matata", name: "Matata" },
  { id: "scratch", name: "Scratch & Game Design" },
  { id: "procreate", name: "Procreate" },
  { id: "spike-essential", name: "LEGO SPIKE Essential" },
  { id: "roblox", name: "Roblox Game Maker" },
  { id: "python", name: "Python Programming" },
  { id: "spike-prime", name: "LEGO SPIKE Prime" },
];

const LOCALES = {
  th: "th-TH-u-ca-gregory",
  en: "en-GB",
  zh: "zh-CN",
  ru: "ru-RU",
};

const TONES = ["#E4F1FF", "#EDE8FF", "#DEF3E9", "#FFF0B8"];

const RANGES = [
  { id: "all", days: 0 },
  { id: "7", days: 7 },
  { id: "14", days: 14 },
  { id: "30", days: 30 },
  { id: "90", days: 90 },
];

const translations = {
  th: {
    eyebrow: "PARENT PORTAL / CLASS SCHEDULE",
    title: "ตารางเรียน",
    subtitle: "ดูคลาสที่จองไว้ของลูก และจัดการวันเรียนได้ในที่เดียว",
    guardian: "บัญชีครอบครัว · เข้าสู่ระบบแล้ว",
    tabKids: "บุตรหลานของฉัน",
    tabSchedule: "ตารางเรียน",
    tabHistory: "ประวัติการเรียน",
    tabPackages: "แพ็กเกจและชำระเงิน",
    soon: "เร็ว ๆ นี้",
    fChild: "บุตรหลาน",
    fChildAll: "บุตรหลานทุกคน",
    fCourse: "คอร์สเรียน",
    fCourseAll: "ทุกคอร์ส",
    fRange: "ช่วงวันที่",
    rangeAll: "ทั้งหมดที่กำลังจะมาถึง",
    range7: "7 วันข้างหน้า",
    range14: "14 วันข้างหน้า",
    range30: "30 วันข้างหน้า",
    range90: "90 วันข้างหน้า",
    apply: "แสดงผล",
    clear: "ล้างตัวกรอง",
    activeFilters: "ตัวกรองที่ใช้อยู่: {list}",
    bookedTitle: "คลาสที่จองไว้ · {n} คลาส",
    bookedSub: "การจองที่กำลังจะมาถึง{who}",
    whoAll: "ของบุตรหลานทุกคน",
    whoOne: "ของ{name}",
    bookMore: "＋ จองคลาสเพิ่มเติม",
    dayCount: "{studio} · {n} คลาส",
    minutesPerClass: "{n} นาที / คลาส",
    minutesOnly: "{n} นาที",
    age: "อายุ {n} ปี",
    room: "ห้อง {room}",
    confirmed: "ยืนยันแล้ว",
    viewBooking: "ดูการจอง ↗",
    cancelUntil: "ยกเลิกเพื่อคืนครั้งได้ถึง {date} เวลา {time} น. · หักครั้งจากการจองแล้ว",
    cancelPassed: "เลยกำหนดยกเลิกเพื่อคืนครั้งแล้ว · หักครั้งจากการจองแล้ว",
    reschedule: "เลื่อนคลาส",
    cancelBooking: "ยกเลิกการจอง",
    emptyTitle: "ไม่พบคลาสที่จองไว้",
    emptyText: "ลองเปลี่ยนตัวกรอง หรือเลือกรอบเรียนที่สะดวกแล้วจองได้เลย",
    emptyBtn: "ดูรอบเรียนและจองคลาส",
    openTitle: "อยากเรียนเพิ่ม? เลือกรอบว่างได้เลย",
    openSub: "รอบด้านล่างยังไม่ได้จอง · ตรวจที่นั่งอีกครั้งเมื่อยืนยันการจอง",
    openAll: "ดูตารางรอบว่างทั้งหมด →",
    seats: "เหลือ {left} / {cap} ที่นั่ง",
    openFor: "สำหรับ{name} · ยังไม่จองเหลือ {n} ครั้ง",
    pick: "เลือกรอบนี้",
    ruleTitle: "เงื่อนไขการใช้ครั้งเรียนและการเปลี่ยนแผน",
    rule1:
      "หัก 1 ครั้งเมื่อจองสำเร็จเท่านั้น · เข้าเรียนไม่หักซ้ำ · ยกเลิกล่วงหน้า ≥{w} คืน 1 ครั้ง · เลื่อนเข้ารอบว่างไม่หักเพิ่ม",
    rule2: "ภายใน {w} หรือไม่มาเรียน ไม่คืนครั้ง กรุณาติดต่อโรงเรียนเพื่อขอความช่วยเหลือ",
    hoursUnit: "{n} ชม.",
    minutesUnit: "{n} นาที",
    updatedAt: "ข้อมูลอัปเดตเมื่อ {date} {time} น.",
    loading: "กำลังโหลด...",
    loadError: "โหลดข้อมูลไม่สำเร็จ",
    loadErrorText: "กรุณาลองอีกครั้ง หรือติดต่อทาง LINE",
    retry: "ลองอีกครั้ง",
    loginTitle: "กรุณาเข้าสู่ระบบเพื่อเข้าพื้นที่ผู้ปกครอง",
    loginBtn: "เข้าสู่ระบบ",
    noStudentsTitle: "ยังไม่มีข้อมูลเด็กในบัญชีนี้",
    noStudentsText: "เพิ่มโปรไฟล์บุตรหลานของคุณเพื่อเริ่มต้น",
    addChild: "＋ เพิ่มบุตรหลาน",
  },
  en: {
    eyebrow: "PARENT PORTAL / CLASS SCHEDULE",
    title: "Class schedule",
    subtitle: "See your children's booked classes and manage class days in one place.",
    guardian: "Family account · Signed in",
    tabKids: "My children",
    tabSchedule: "Schedule",
    tabHistory: "Class history",
    tabPackages: "Packages & payments",
    soon: "Coming soon",
    fChild: "Child",
    fChildAll: "All children",
    fCourse: "Course",
    fCourseAll: "All courses",
    fRange: "Date range",
    rangeAll: "All upcoming",
    range7: "Next 7 days",
    range14: "Next 14 days",
    range30: "Next 30 days",
    range90: "Next 90 days",
    apply: "Apply",
    clear: "Clear filters",
    activeFilters: "Active filters: {list}",
    bookedTitle: "Booked classes · {n}",
    bookedSub: "Upcoming bookings {who}",
    whoAll: "for all children",
    whoOne: "for {name}",
    bookMore: "＋ Book more classes",
    dayCount: "{studio} · {n} classes",
    minutesPerClass: "{n} min / class",
    minutesOnly: "{n} min",
    age: "{n} yrs old",
    room: "{room} room",
    confirmed: "Confirmed",
    viewBooking: "View booking ↗",
    cancelUntil: "Cancel for a refund until {date} at {time} · session already deducted",
    cancelPassed: "Refund deadline has passed · session already deducted",
    reschedule: "Reschedule",
    cancelBooking: "Cancel booking",
    emptyTitle: "No booked classes found",
    emptyText: "Try changing the filters, or pick a session and book in a few steps.",
    emptyBtn: "Browse sessions and book",
    openTitle: "Want more? Pick an open session",
    openSub: "Sessions below are not booked yet · seats are re-checked when you confirm",
    openAll: "View all open sessions →",
    seats: "{left} / {cap} seats left",
    openFor: "For {name} · {n} not booked yet",
    pick: "Pick this session",
    ruleTitle: "Session usage and change policy",
    rule1:
      "1 session is deducted on successful booking only · attending doesn't deduct again · cancel {w}+ ahead for 1 session back · rescheduling into an open session costs nothing extra",
    rule2: "Within {w} or if you miss class, no refund. Please contact the school for help.",
    hoursUnit: "{n} hr",
    minutesUnit: "{n} min",
    updatedAt: "Updated {date} {time}",
    loading: "Loading...",
    loadError: "Couldn't load your data",
    loadErrorText: "Please try again or contact us on LINE.",
    retry: "Try again",
    loginTitle: "Please sign in to open the parent area",
    loginBtn: "Sign in",
    noStudentsTitle: "No children on this account yet",
    noStudentsText: "Add your child's profile to get started.",
    addChild: "＋ Add a child",
  },
};

const fill = (text, values) =>
  Object.entries(values).reduce((r, [k, v]) => r.split(`{${k}}`).join(v), text);

const hhmm = (iso) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso)
  );
const endIso = (s) => new Date(new Date(s.starts_at).getTime() + s.duration_min * 60000).toISOString();
const rangeLabel = (s) => `${hhmm(s.starts_at)}–${hhmm(endIso(s))}`;
const courseName = (id) => COURSES.find((c) => c.id === id)?.name || id;
const initialOf = (name) => (name && name.trim() ? Array.from(name.trim())[0].toUpperCase() : "?");
const dayKey = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const bookingCode = (id) => `DW-${String(id).replace(/-/g, "").slice(0, 8).toUpperCase()}`;

const safe = async (query, label) => {
  try {
    const { data, error } = await query;
    if (error) {
      console.warn(`${label}:`, error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.warn(`${label}:`, e);
    return [];
  }
};

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3.5 5.25L7 8.75l3.5-3.5" stroke="#2864D7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="8.1" stroke="#2864D7" strokeWidth="1.8" />
    <path d="M10 9v5" stroke="#2864D7" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="10" cy="6.2" r="1" fill="#2864D7" />
  </svg>
);

function Select({ label, value, onChange, children }) {
  return (
    <label className="ps-field">
      <span>{label}</span>
      <div className="ps-select">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {children}
        </select>
        <ChevronIcon />
      </div>
    </label>
  );
}

function ParentSchedule() {
  const [language, setLanguage] = useLanguage();
  const { session, loading: sessionLoading } = useSession();
  const user = session?.user;
  const userId = user?.id;
  const t = translations[language] || translations.en;
  const locale = LOCALES[language] || LOCALES.en;

  const [students, setStudents] = useState([]);
  const [openSessions, setOpenSessions] = useState([]);
  const [loadedAt, setLoadedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const emptyFilter = { student: "", course: "", range: "all" };
  const [draft, setDraft] = useState(emptyFilter);
  const [applied, setApplied] = useState(emptyFilter);
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);

  const shortFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: TZ, day: "numeric", month: "short" }),
    [locale]
  );
  const longFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        timeZone: TZ,
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [locale]
  );
  const stampFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }),
    [locale]
  );

  const longLabel = (iso) => {
    const parts = Object.fromEntries(
      longFormatter.formatToParts(new Date(iso)).map((p) => [p.type, p.value])
    );
    const weekday = (parts.weekday || "").replace(/^วัน/, "");
    return `${weekday} ${parts.day} ${parts.month} ${parts.year}`;
  };

  const load = useCallback(async () => {
    setFailed(false);
    const { data, error } = await supabase
      .from("students")
      .select(
        "id, name, full_name, english_name, age, packages(id, course_id, total_sessions, sessions_remaining, created_at), bookings(id, session_id, status, class_sessions(id, course_id, starts_at, duration_min, teacher_name, room))"
      )
      .eq("bookings.status", "confirmed")
      .order("name");

    if (error) {
      console.error("Load schedule error:", error);
      setFailed(true);
      return;
    }

    setStudents(
      (data ?? []).map((s) => ({
        ...s,
        packages: s.packages ?? [],
        bookings: s.bookings ?? [],
      }))
    );

    const rows = await safe(
      supabase
        .from("class_sessions")
        .select("*")
        .gt("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(40),
      "open sessions"
    );
    setOpenSessions(rows);
    setLoadedAt(new Date().toISOString());
  }, []);

  useEffect(() => {
    if (sessionLoading) return;
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [userId, sessionLoading, load]);

  const reload = () => {
    setLoading(true);
    load().finally(() => setLoading(false));
  };

  const toneOf = useMemo(() => {
    const map = {};
    students.forEach((s, i) => (map[s.id] = TONES[i % TONES.length]));
    return map;
  }, [students]);

  const allBooked = useMemo(() => {
    const now = Date.now();
    return students
      .flatMap((s) =>
        s.bookings
          .filter((b) => b.class_sessions && new Date(b.class_sessions.starts_at).getTime() > now)
          .map((b) => ({ id: b.id, student: s, session: b.class_sessions }))
      )
      .sort((a, b) => new Date(a.session.starts_at) - new Date(b.session.starts_at));
  }, [students]);

  const courseOptions = useMemo(() => {
    const ids = new Set();
    students.forEach((s) => {
      s.packages.forEach((p) => ids.add(p.course_id));
      s.bookings.forEach((b) => b.class_sessions && ids.add(b.class_sessions.course_id));
    });
    return [...ids].map((id) => ({ id, name: courseName(id) }));
  }, [students]);

  const filtered = useMemo(() => {
    const days = RANGES.find((r) => r.id === applied.range)?.days || 0;
    const limit = days ? Date.now() + days * 86400000 : Infinity;
    return allBooked.filter(
      (x) =>
        (!applied.student || x.student.id === applied.student) &&
        (!applied.course || x.session.course_id === applied.course) &&
        new Date(x.session.starts_at).getTime() <= limit
    );
  }, [allBooked, applied]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((x) => {
      const key = dayKey(x.session.starts_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(x);
    });
    return [...map.entries()];
  }, [filtered]);

  const openCards = useMemo(() => {
    const cards = [];
    for (const sess of openSessions) {
      if (applied.course && sess.course_id !== applied.course) continue;
      for (const s of students) {
        if (applied.student && s.id !== applied.student) continue;
        const remaining = s.packages
          .filter((p) => p.course_id === sess.course_id)
          .reduce((n, p) => n + (p.sessions_remaining || 0), 0);
        if (remaining <= 0) continue;
        const already = s.bookings.some(
          (b) => b.session_id === sess.id || b.class_sessions?.id === sess.id
        );
        if (already) continue;
        cards.push({ key: `${sess.id}-${s.id}`, sess, student: s, remaining });
        if (cards.length >= MAX_OPEN) return cards;
      }
    }
    return cards;
  }, [openSessions, students, applied]);

  const parentName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "");

  const windowText =
    CANCEL_MINUTES % 60 === 0
      ? fill(t.hoursUnit, { n: CANCEL_MINUTES / 60 })
      : fill(t.minutesUnit, { n: CANCEL_MINUTES });

  const selectedStudent = students.find((s) => s.id === applied.student);
  const who = selectedStudent ? fill(t.whoOne, { name: selectedStudent.name }) : t.whoAll;

  const rangeText = {
    all: t.rangeAll,
    7: t.range7,
    14: t.range14,
    30: t.range30,
    90: t.range90,
  };

  const activeList = [
    selectedStudent ? selectedStudent.name : null,
    applied.course ? courseName(applied.course) : null,
    applied.range !== "all" ? rangeText[applied.range] : null,
  ].filter(Boolean);

  const gate = (title, text, action) => (
    <div className="ps-container">
      <section className="ps-card ps-gate">
        <h2>{title}</h2>
        {text && <p>{text}</p>}
        {action}
      </section>
    </div>
  );

  let body;
  if (sessionLoading || loading) {
    body = gate(t.loading);
  } else if (!user) {
    body = gate(
      t.loginTitle,
      "",
      <Link className="ps-btn is-primary" to={LOGIN_PATH}>
        {t.loginBtn}
      </Link>
    );
  } else if (failed) {
    body = gate(
      t.loadError,
      t.loadErrorText,
      <button type="button" className="ps-btn is-primary" onClick={reload}>
        {t.retry}
      </button>
    );
  } else if (!students.length) {
    body = gate(
      t.noStudentsTitle,
      t.noStudentsText,
      <Link className="ps-btn is-primary" to={ADD_CHILD_PATH}>
        {t.addChild}
      </Link>
    );
  } else {
    body = (
      <div className="ps-container">
        {/* Head */}
        <header className="ps-head">
          <div>
            <p className="ps-eyebrow">{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p className="ps-sub">{t.subtitle}</p>
          </div>
          <div className="ps-parent">
            <span className="ps-avatar is-lg" style={{ background: "#EDE8FF" }} aria-hidden="true">
              {initialOf(parentName)}
            </span>
            <div>
              <strong>{parentName}</strong>
              <small>{t.guardian}</small>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="ps-tabs" role="tablist">
          <Link className="ps-tab" to={PARENT_AREA_PATH} role="tab" aria-selected="false">
            {t.tabKids}
          </Link>
          <button type="button" role="tab" aria-selected="true" className="ps-tab is-on">
            {t.tabSchedule}
          </button>
          <Link className="ps-tab" to={HISTORY_PATH} role="tab" aria-selected="false">
            {t.tabHistory}
          </Link>
          <Link className="ps-tab" to={PACKAGES_PATH} role="tab" aria-selected="false">
            {t.tabPackages}
          </Link>
        </div>

        {/* Filters */}
        <div className="ps-filters">
          <Select
            label={t.fChild}
            value={draft.student}
            onChange={(v) => setDraft((d) => ({ ...d, student: v }))}
          >
            <option value="">{t.fChildAll}</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Select
            label={t.fCourse}
            value={draft.course}
            onChange={(v) => setDraft((d) => ({ ...d, course: v }))}
          >
            <option value="">{t.fCourseAll}</option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            label={t.fRange}
            value={draft.range}
            onChange={(v) => setDraft((d) => ({ ...d, range: v }))}
          >
            {RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {rangeText[r.id]}
              </option>
            ))}
          </Select>
          <button
            type="button"
            className={`ps-btn ${dirty ? "is-primary" : "is-outline"}`}
            onClick={() => setApplied(draft)}
          >
            {t.apply}
          </button>
          <button
            type="button"
            className="ps-clear"
            onClick={() => {
              setDraft(emptyFilter);
              setApplied(emptyFilter);
            }}
          >
            {t.clear}
          </button>
        </div>

        {/* Booked classes */}
        <section className="ps-card">
          <div className="ps-card-head">
            <div>
              <h2>{fill(t.bookedTitle, { n: filtered.length })}</h2>
              <p>{fill(t.bookedSub, { who })}</p>
              {activeList.length > 0 && (
                <p style={{ color: "#2864D7", marginTop: 4 }}>
                  {fill(t.activeFilters, { list: activeList.join(" · ") })}
                </p>
              )}
            </div>
            <Link
              className="ps-btn is-primary"
              to={`${BOOK_PATH}${applied.student ? `?student=${applied.student}` : ""}`}
            >
              {t.bookMore}
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="ps-empty">
              <strong>{t.emptyTitle}</strong>
              <p>{t.emptyText}</p>
              <Link className="ps-btn is-primary" to={BOOK_PATH}>
                {t.emptyBtn}
              </Link>
            </div>
          ) : (
            groups.map(([key, items]) => (
              <div key={key}>
                <div className="ps-day">
                  <strong>{longLabel(items[0].session.starts_at)}</strong>
                  <span>{fill(t.dayCount, { studio: STUDIO, n: items.length })}</span>
                </div>

                {items.map(({ id, student, session: s }) => {
                  const deadline = new Date(new Date(s.starts_at).getTime() - CANCEL_MINUTES * 60000);
                  const beforeDeadline = deadline.getTime() > Date.now();
                  return (
                    <article key={id} className="ps-class">
                      <div className="ps-class-main">
                        <div className="ps-time">
                          <strong>{rangeLabel(s)}</strong>
                          <small>{fill(t.minutesPerClass, { n: s.duration_min })}</small>
                        </div>

                        <div className="ps-who">
                          <div className="ps-who-top">
                            <span
                              className="ps-avatar"
                              style={{ background: toneOf[student.id] }}
                              aria-hidden="true"
                            >
                              {initialOf(student.name)}
                            </span>
                            <div>
                              <strong>
                                {[student.name, student.english_name].filter(Boolean).join(" / ")}
                              </strong>
                              <small>
                                {[
                                  student.full_name,
                                  student.age ? fill(t.age, { n: student.age }) : null,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </small>
                            </div>
                          </div>
                          <h3>{courseName(s.course_id)}</h3>
                        </div>

                        <div className="ps-where">
                          <span>
                            {[s.teacher_name, s.room ? fill(t.room, { room: s.room }) : null]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                          <small>{STUDIO}</small>
                          <small>{bookingCode(id)}</small>
                        </div>

                        <div className="ps-status">
                          <span className="ps-pill">{t.confirmed}</span>
                          <Link className="ps-link" to={`${BOOK_PATH}?student=${student.id}`}>
                            {t.viewBooking}
                          </Link>
                        </div>
                      </div>

                      <div className="ps-class-foot">
                        <small>
                          {beforeDeadline
                            ? fill(t.cancelUntil, {
                                date: shortFormatter.format(deadline),
                                time: hhmm(deadline.toISOString()),
                              })
                            : t.cancelPassed}
                        </small>
                        <div className="ps-class-actions">
                          <Link className="ps-btn is-outline is-sm" to={`${RESCHEDULE_PATH}/${id}`}>
                            {t.reschedule}
                          </Link>
                          <Link className="ps-btn is-danger is-sm" to={`${CANCEL_PATH}/${id}`}>
                            {t.cancelBooking}
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ))
          )}
        </section>

        {/* Open sessions */}
        {openCards.length > 0 && (
          <section className="ps-open">
            <div className="ps-open-head">
              <div>
                <h2>{t.openTitle}</h2>
                <p>{t.openSub}</p>
              </div>
              <Link className="ps-link" to={BOOK_PATH}>
                {t.openAll}
              </Link>
            </div>
            <div className="ps-open-grid">
              {openCards.map(({ key, sess, student, remaining }) => {
                const hasSeats = typeof sess.capacity === "number" && typeof sess.seats_left === "number";
                return (
                  <div key={key} className="ps-open-card">
                    <div className="ps-open-top">
                      <strong>
                        {stampFormatter.format(new Date(sess.starts_at))} · {rangeLabel(sess)}
                      </strong>
                      {hasSeats && (
                        <span className="ps-seat">
                          {fill(t.seats, { left: sess.seats_left, cap: sess.capacity })}
                        </span>
                      )}
                    </div>
                    <h3>{courseName(sess.course_id)}</h3>
                    <div className="ps-open-foot">
                      <div>
                        <span>
                          {[
                            sess.teacher_name,
                            sess.room ? fill(t.room, { room: sess.room }) : null,
                            fill(t.minutesOnly, { n: sess.duration_min }),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        <small>{fill(t.openFor, { name: student.name, n: remaining })}</small>
                      </div>
                      <Link
                        className="ps-btn is-outline is-sm"
                        to={`${BOOK_PATH}?student=${student.id}&session=${sess.id}`}
                      >
                        {t.pick}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Policy */}
        <div className="ps-note">
          <InfoIcon />
          <div>
            <strong>{t.ruleTitle}</strong>
            <p>{fill(t.rule1, { w: windowText })}</p>
            <p>{fill(t.rule2, { w: windowText })}</p>
          </div>
        </div>

        <small className="ps-foot">
          {loadedAt
            ? fill(t.updatedAt, {
                date: stampFormatter.format(new Date(loadedAt)),
                time: hhmm(loadedAt),
              })
            : ""}
        </small>
      </div>
    );
  }

  return (
    <div className="ps-page">
      <SiteHeader language={language} onLanguageChange={setLanguage} />
      {body}
      <SiteFooter language={language} />
    </div>
  );
}

export default ParentSchedule;
