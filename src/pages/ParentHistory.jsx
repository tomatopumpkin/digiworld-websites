import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/ParentHistory.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";
import useSession from "../lib/useSession";
import { supabase } from "../lib/supabase";

const TZ = "Asia/Bangkok";
const PARENT_AREA_PATH = "/parent-portal";
const SCHEDULE_PATH = "/parent-schedule";
const PACKAGES_PATH = "/parent-packages";
const LOGIN_PATH = "/login";
const ADD_CHILD_PATH = "/add-child";
const REPORTS_TABLE = "class_reports";

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
  { id: "30", days: 30 },
  { id: "90", days: 90 },
  { id: "365", days: 365 },
];

const translations = {
  th: {
    eyebrow: "PARENT PORTAL / LEARNING HISTORY",
    title: "ประวัติการเรียน",
    subtitle: "ติดตามคลาสที่เรียนแล้ว อ่านบันทึกจากครู และต่อยอดการเรียนรู้ที่บ้าน",
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
    rangeAll: "ทั้งหมด",
    range30: "30 วันที่ผ่านมา",
    range90: "90 วันที่ผ่านมา",
    range365: "1 ปีที่ผ่านมา",
    apply: "แสดงผล",
    clear: "ล้างตัวกรอง",
    listTitle: "คลาสที่เรียนแล้ว",
    found: "พบ {n} รายการ",
    perKid: "{name} {n} ครั้ง",
    sessionNo: "ครั้งที่ {n}",
    minutes: "{n} นาที",
    attended: "เรียนแล้ว",
    reading: "กำลังอ่าน →",
    readThis: "ดูรายงาน →",
    noDetail: "ยังไม่มีรายละเอียดรายงานให้แสดง",
    age: "อายุ {n} ปี",
    noteTitle: "เข้าเรียนแล้ว ไม่หักครั้งซ้ำ",
    noteText:
      "ครั้งเรียนถูกหักเมื่อจองสำเร็จแล้ว ประวัติหน้านี้แสดงเฉพาะคลาสที่เรียนเสร็จ ไม่รวมการจองล่วงหน้า",
    noteLink: "ดูคลาสที่จองไว้ในตารางเรียน →",
    reportOf: "รายงานการเรียนของ{name}",
    print: "พิมพ์รายงาน",
    learned: "สิ่งที่ได้เรียนรู้ในคลาสนี้",
    skills: "พัฒนาการที่ครูสังเกต",
    teacherNote: "บันทึกจากครู{teacher}",
    teacherNoteNoName: "บันทึกจากครู",
    next: "ก้าวต่อไปของการเรียนรู้",
    atHome: "ที่บ้าน: {text}",
    nextClass: "คลาสถัดไป: {text}",
    reportEmptyTitle: "ยังไม่มีรายงานของคลาสนี้",
    reportEmptyText: "เมื่อครูบันทึกรายงานแล้ว จะแสดงที่นี่ ตอนนี้ดูข้อมูลคลาสได้ด้านบน",
    emptyTitle: "ยังไม่มีประวัติการเรียน",
    emptyText: "เมื่อเรียนคลาสแรกเสร็จ ประวัติจะแสดงที่นี่ หรือลองเปลี่ยนตัวกรอง",
    emptyBtn: "ดูตารางเรียน",
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
    eyebrow: "PARENT PORTAL / LEARNING HISTORY",
    title: "Learning history",
    subtitle: "Follow completed classes, read teacher notes and continue learning at home.",
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
    rangeAll: "All time",
    range30: "Last 30 days",
    range90: "Last 90 days",
    range365: "Last year",
    apply: "Apply",
    clear: "Clear filters",
    listTitle: "Completed classes",
    found: "{n} found",
    perKid: "{name} {n}",
    sessionNo: "Session {n}",
    minutes: "{n} min",
    attended: "Attended",
    reading: "Reading →",
    readThis: "View report →",
    noDetail: "No report details to show yet",
    age: "{n} yrs old",
    noteTitle: "Attended — no second deduction",
    noteText:
      "A session is deducted when booking succeeds. This page only shows classes that are finished, not advance bookings.",
    noteLink: "See booked classes in the schedule →",
    reportOf: "{name}'s learning report",
    print: "Print report",
    learned: "What was learned in this class",
    skills: "Progress the teacher observed",
    teacherNote: "Note from teacher {teacher}",
    teacherNoteNoName: "Note from the teacher",
    next: "Next steps in learning",
    atHome: "At home: {text}",
    nextClass: "Next class: {text}",
    reportEmptyTitle: "No report for this class yet",
    reportEmptyText: "Once the teacher records a report it will appear here.",
    emptyTitle: "No learning history yet",
    emptyText: "Once the first class is finished it will show here, or try changing the filters.",
    emptyBtn: "View schedule",
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

const parseSkills = (value) => {
  let list = value;
  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch {
      list = list.split(",").map((s) => s.trim());
    }
  }
  if (!Array.isArray(list)) return [];
  return list
    .map((x) => {
      if (typeof x === "string") return x;
      if (x && typeof x === "object") {
        return [x.name || x.skill, x.level].filter(Boolean).join(" · ");
      }
      return "";
    })
    .filter(Boolean);
};

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3.5 5.25L7 8.75l3.5-3.5" stroke="#2864D7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Select({ label, value, onChange, children }) {
  return (
    <label className="ph-field">
      <span>{label}</span>
      <div className="ph-select">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {children}
        </select>
        <ChevronIcon />
      </div>
    </label>
  );
}

function ParentHistory() {
  const [language, setLanguage] = useLanguage();
  const { session, loading: sessionLoading } = useSession();
  const user = session?.user;
  const userId = user?.id;
  const t = translations[language] || translations.en;
  const locale = LOCALES[language] || LOCALES.en;

  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState({});
  const [loadedAt, setLoadedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const emptyFilter = { student: "", course: "", range: "all" };
  const [draft, setDraft] = useState(emptyFilter);
  const [applied, setApplied] = useState(emptyFilter);
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);

  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { timeZone: TZ, day: "numeric", month: "long", year: "numeric" }),
    [locale]
  );
  const shortFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }),
    [locale]
  );

  const load = useCallback(async () => {
    setFailed(false);
    const { data, error } = await supabase
      .from("students")
      .select(
        "id, name, full_name, english_name, age, bookings(id, session_id, status, class_sessions(id, course_id, starts_at, duration_min, teacher_name, room))"
      )
      .eq("bookings.status", "confirmed")
      .order("name");

    if (error) {
      console.error("Load history error:", error);
      setFailed(true);
      return;
    }

    const list = (data ?? []).map((s) => ({ ...s, bookings: s.bookings ?? [] }));
    setStudents(list);

    const bookingIds = list.flatMap((s) => s.bookings.map((b) => b.id));
    if (bookingIds.length) {
      const rows = await safe(
        supabase.from(REPORTS_TABLE).select("*").in("booking_id", bookingIds),
        "class reports"
      );
      const map = {};
      rows.forEach((r) => (map[r.booking_id] = r));
      setReports(map);
    } else {
      setReports({});
    }
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

  const allDone = useMemo(() => {
    const now = Date.now();
    const rows = students.flatMap((s) =>
      s.bookings
        .filter((b) => b.class_sessions && new Date(b.class_sessions.starts_at).getTime() <= now)
        .map((b) => ({ id: b.id, student: s, session: b.class_sessions }))
    );
    rows.sort((a, b) => new Date(a.session.starts_at) - new Date(b.session.starts_at));
    const counter = {};
    rows.forEach((r) => {
      const key = `${r.student.id}|${r.session.course_id}`;
      counter[key] = (counter[key] || 0) + 1;
      r.no = counter[key];
    });
    return rows.sort((a, b) => new Date(b.session.starts_at) - new Date(a.session.starts_at));
  }, [students]);

  const courseOptions = useMemo(() => {
    const ids = new Set();
    allDone.forEach((x) => ids.add(x.session.course_id));
    return [...ids].map((id) => ({ id, name: courseName(id) }));
  }, [allDone]);

  const filtered = useMemo(() => {
    const days = RANGES.find((r) => r.id === applied.range)?.days || 0;
    const from = days ? Date.now() - days * 86400000 : 0;
    return allDone.filter(
      (x) =>
        (!applied.student || x.student.id === applied.student) &&
        (!applied.course || x.session.course_id === applied.course) &&
        new Date(x.session.starts_at).getTime() >= from
    );
  }, [allDone, applied]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((x) => {
      const key = dayKey(x.session.starts_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(x);
    });
    return [...map.entries()];
  }, [filtered]);

  const selected = filtered.find((x) => x.id === selectedId) || filtered[0] || null;
  const report = selected ? reports[selected.id] : null;

  const summary = useMemo(() => {
    const counts = {};
    filtered.forEach((x) => (counts[x.student.name] = (counts[x.student.name] || 0) + 1));
    return [
      fill(t.found, { n: filtered.length }),
      ...Object.entries(counts).map(([name, n]) => fill(t.perKid, { name, n })),
    ].join(" · ");
  }, [filtered, t]);

  const parentName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "");

  const rangeText = {
    all: t.rangeAll,
    30: t.range30,
    90: t.range90,
    365: t.range365,
  };

  const gate = (title, text, action) => (
    <div className="ph-container">
      <section className="ph-card ph-gate">
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
      <Link className="ph-btn is-primary" to={LOGIN_PATH}>
        {t.loginBtn}
      </Link>
    );
  } else if (failed) {
    body = gate(
      t.loadError,
      t.loadErrorText,
      <button type="button" className="ph-btn is-primary" onClick={reload}>
        {t.retry}
      </button>
    );
  } else if (!students.length) {
    body = gate(
      t.noStudentsTitle,
      t.noStudentsText,
      <Link className="ph-btn is-primary" to={ADD_CHILD_PATH}>
        {t.addChild}
      </Link>
    );
  } else {
    const learnedText = report?.learned || report?.summary_learned;
    const skillList = report ? parseSkills(report.skills) : [];
    const teacherNote = report?.teacher_note;
    const homeTip = report?.home_tip;
    const nextClass = report?.next_class || report?.next_step;
    const hasReport = Boolean(
      report && (report.title || report.summary || learnedText || skillList.length || teacherNote || homeTip || nextClass)
    );

    body = (
      <div className="ph-container">
        {/* Head */}
        <header className="ph-head">
          <div>
            <p className="ph-eyebrow">{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p className="ph-sub">{t.subtitle}</p>
          </div>
          <div className="ph-parent">
            <span className="ph-avatar is-lg" style={{ background: "#EDE8FF" }} aria-hidden="true">
              {initialOf(parentName)}
            </span>
            <div>
              <strong>{parentName}</strong>
              <small>{t.guardian}</small>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="ph-tabs" role="tablist">
          <Link className="ph-tab" to={PARENT_AREA_PATH} role="tab" aria-selected="false">
            {t.tabKids}
          </Link>
          <Link className="ph-tab" to={SCHEDULE_PATH} role="tab" aria-selected="false">
            {t.tabSchedule}
          </Link>
          <button type="button" role="tab" aria-selected="true" className="ph-tab is-on">
            {t.tabHistory}
          </button>
          <Link className="ph-tab" to={PACKAGES_PATH} role="tab" aria-selected="false">
            {t.tabPackages}
          </Link>
        </div>

        {/* Filters */}
        <div className="ph-filters">
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
            className={`ph-btn ${dirty ? "is-primary" : "is-outline"}`}
            onClick={() => {
              setApplied(draft);
              setSelectedId("");
            }}
          >
            {t.apply}
          </button>
          <button
            type="button"
            className="ph-clear"
            onClick={() => {
              setDraft(emptyFilter);
              setApplied(emptyFilter);
              setSelectedId("");
            }}
          >
            {t.clear}
          </button>
        </div>

        {/* List title */}
        <div className="ph-list-head">
          <h2>{t.listTitle}</h2>
          <span>{summary}</span>
        </div>

        {filtered.length === 0 ? (
          <section className="ph-card ph-empty">
            <strong>{t.emptyTitle}</strong>
            <p>{t.emptyText}</p>
            <Link className="ph-btn is-primary" to={SCHEDULE_PATH}>
              {t.emptyBtn}
            </Link>
          </section>
        ) : (
          <div className="ph-layout">
            <aside className="ph-side">
              {groups.map(([key, items]) => (
                <div key={key} className="ph-group">
                  <div className="ph-date">{dayFormatter.format(new Date(items[0].session.starts_at))}</div>
                  {items.map((x) => {
                    const isOn = selected && selected.id === x.id;
                    const hasDetail = Boolean(reports[x.id]);
                    return (
                      <button
                        type="button"
                        key={x.id}
                        className={`ph-item${isOn ? " is-on" : ""}`}
                        onClick={() => setSelectedId(x.id)}
                      >
                        <div className="ph-item-who">
                          <span
                            className="ph-avatar"
                            style={{ background: toneOf[x.student.id] }}
                            aria-hidden="true"
                          >
                            {initialOf(x.student.name)}
                          </span>
                          <div>
                            <strong>
                              {[x.student.name, x.student.english_name].filter(Boolean).join(" / ")}
                            </strong>
                            <small>
                              {[
                                x.student.full_name,
                                x.student.age ? fill(t.age, { n: x.student.age }) : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </small>
                          </div>
                        </div>
                        <h3>{courseName(x.session.course_id)}</h3>
                        {reports[x.id]?.title && <p className="ph-item-topic">{reports[x.id].title}</p>}
                        <small className="ph-item-meta">
                          {[
                            fill(t.sessionNo, { n: x.no }),
                            x.session.teacher_name,
                            fill(t.minutes, { n: x.session.duration_min }),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </small>
                        <div className="ph-item-foot">
                          <span className="ph-pill">{t.attended}</span>
                          {isOn ? (
                            <span className="ph-reading">{t.reading}</span>
                          ) : hasDetail ? (
                            <span className="ph-reading">{t.readThis}</span>
                          ) : null}
                        </div>
                        {!hasDetail && !isOn && <small className="ph-item-meta">{t.noDetail}</small>}
                      </button>
                    );
                  })}
                </div>
              ))}

              <div className="ph-aside-note">
                <strong>{t.noteTitle}</strong>
                <p>{t.noteText}</p>
                <Link className="ph-link" to={SCHEDULE_PATH}>
                  {t.noteLink}
                </Link>
              </div>
            </aside>

            {selected && (
              <section className="ph-card ph-report">
                <div className="ph-report-head">
                  <div>
                    <h2>{fill(t.reportOf, { name: selected.student.name })}</h2>
                    <p>
                      {[
                        courseName(selected.session.course_id),
                        fill(t.sessionNo, { n: selected.no }),
                        shortFormatter.format(new Date(selected.session.starts_at)),
                        selected.session.teacher_name,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <button type="button" className="ph-btn is-outline is-sm" onClick={() => window.print()}>
                    {t.print}
                  </button>
                </div>

                {!hasReport ? (
                  <div className="ph-report-empty">
                    <strong>{t.reportEmptyTitle}</strong>
                    <p>{t.reportEmptyText}</p>
                    <div className="ph-facts">
                      <span>{rangeLabel(selected.session)}</span>
                      {selected.session.room && <span>{selected.session.room}</span>}
                      <span>{fill(t.minutes, { n: selected.session.duration_min })}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {(report.title || report.summary) && (
                      <div className="ph-block">
                        {report.title && <h3 className="ph-title">{report.title}</h3>}
                        {report.summary && <p>{report.summary}</p>}
                      </div>
                    )}

                    {report.image_url && (
                      <figure className="ph-figure">
                        <img src={report.image_url} alt={report.image_caption || report.title || ""} />
                        {report.image_caption && <figcaption>{report.image_caption}</figcaption>}
                      </figure>
                    )}

                    {learnedText && (
                      <div className="ph-block">
                        <h4>{t.learned}</h4>
                        <p>{learnedText}</p>
                      </div>
                    )}

                    {skillList.length > 0 && (
                      <div className="ph-block">
                        <h4>{t.skills}</h4>
                        <div className="ph-chips">
                          {skillList.map((s, i) => (
                            <span key={s} className={`ph-chip ${i % 2 ? "is-green" : "is-blue"}`}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {teacherNote && (
                      <div className="ph-quote">
                        <strong>
                          {selected.session.teacher_name
                            ? fill(t.teacherNote, { teacher: selected.session.teacher_name })
                            : t.teacherNoteNoName}
                        </strong>
                        <p>“{teacherNote}”</p>
                      </div>
                    )}

                    {(homeTip || nextClass) && (
                      <div className="ph-block">
                        <h4>{t.next}</h4>
                        {homeTip && <p>{fill(t.atHome, { text: homeTip })}</p>}
                        {nextClass && <p>{fill(t.nextClass, { text: nextClass })}</p>}
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        )}

        <small className="ph-foot">
          {loadedAt
            ? fill(t.updatedAt, {
                date: shortFormatter.format(new Date(loadedAt)),
                time: hhmm(loadedAt),
              })
            : ""}
        </small>
      </div>
    );
  }

  return (
    <div className="ph-page">
      <SiteHeader language={language} onLanguageChange={setLanguage} />
      {body}
      <SiteFooter language={language} />
    </div>
  );
}

export default ParentHistory;