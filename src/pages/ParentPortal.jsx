import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/ParentPortal.css";
import "../styles/ParentKid.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";
import useSession from "../lib/useSession";
import { supabase } from "../lib/supabase";

// ---------------------------------------------------------------
// Settings (change the paths / names to match your project)
// ---------------------------------------------------------------
const TZ = "Asia/Bangkok";
const CANCEL_MINUTES = 30; // keep in sync with BookClass.jsx
const BOOK_PATH = "/book-class";
const COURSES_PATH = "/courses";
const LOGIN_PATH = "/login";
const ADD_CHILD_PATH = "/add-child"; // หน้าเพิ่มโปรไฟล์บุตรหลาน (AddChild.jsx)
const LINE_ID = "@digiworldphuket";
const LINE_URL = "https://line.me/R/ti/p/%40digiworldphuket";
const MAX_UPCOMING = 5;
const MAX_HISTORY = 5;

// "ข่าวดีจากครู" card. Expected columns:
// id, student_id, teacher_name, course_id, message, created_at, work_url (optional)
// If the table doesn't exist or is empty, the card is simply hidden.
// Set SHOW_TEACHER_NOTES to false to skip the request completely.
const SHOW_TEACHER_NOTES = true;
const TEACHER_NOTES_TABLE = "teacher_notes";

// Same names as the Courses page (could be moved to a shared file, e.g. lib/courses.js)
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

// Soft colours for each child (cycled by position) — from the Figma design
const TONES = ["#E4F1FF", "#EDE8FF", "#DEF3E9", "#FFF0B8"];

// Thai + English for now (other languages fall back to English)
const translations = {
  th: {
    topChip: "PARENT PORTAL · Logged In",
    greeting: "สวัสดี {name}! ☀️",
    subtitle: "วันนี้คุณอยากให้ลูกเรียนอะไรบ้าง?",
    account: "บัญชีครอบครัว · ตั้งค่า ▾",
    soon: "เร็ว ๆ นี้",
    tabOverview: "ภาพรวมครอบครัว",
    tabSchedule: "ตารางเรียน",
    tabHistory: "ประวัติการเรียน",
    tabPackages: "แพ็กเกจและชำระเงิน",
    familyTitle: "บุตรหลานของคุณ",
    addChild: "＋ เพิ่มบุตรหลาน",
    editProfile: "แก้ไขโปรไฟล์ ↗",
    bookFor: "จองคลาสให้{name}",
    buySimple: "ซื้อแพ็กเกจ ↗",
    hasRemaining: "✓ มีแพ็กเกจคงเหลือสำหรับจอง {course}",
    noRemaining: "แพ็กเกจ {course} ใช้ครบแล้ว ซื้อแพ็กเกจใหม่เพื่อจองต่อ",
    ageYears: "อายุ {n} ปี",
    coursesCount: "{n} คอร์สที่ลงทะเบียน",
    noCourses: "ยังไม่มีคอร์ส",
    profile: "ดูโปรไฟล์ ↗",
    packageLine: "แพ็กเกจ {n} ครั้ง",
    noExpiry: "ไม่มีวันหมดอายุ",
    remaining: "เหลือ {n} ครั้ง",
    usage: "เรียนแล้ว {done} ครั้ง · จองล่วงหน้า {booked} ครั้ง",
    book: "จองคลาส",
    progress: "ดูพัฒนาการ",
    buy: "ซื้อแพ็กเกจใหม่ ↗",
    noPackageTitle: "ยังไม่มีแพ็กเกจสำหรับเด็กคนนี้",
    noPackageText: "ซื้อคอร์สเพื่อเริ่มจองคลาส",
    nextTitle: "คลาสถัดไป",
    confirmedCount: "ยืนยันแล้ว {n} คลาส",
    deducted: "หัก 1 ครั้งเมื่อจองสำเร็จ",
    studio: "DigiWorld Phuket",
    room: "ห้อง {room}",
    timeSuffix: " น.",
    reschedule: "เลื่อนคลาส",
    cancel: "ยกเลิก",
    allSchedule: "ดูตารางทั้งหมดและจองคลาสถัดไป ↗",
    emptyTitle: "ยังไม่มีคลาสที่จองไว้",
    emptyText: "เลือกรอบเรียนที่สะดวก แล้วจองได้ในไม่กี่ขั้นตอน",
    emptyBtn: "ดูรอบเรียนและจองคลาส",
    hoursUnit: "{n} ชม.",
    minutesUnit: "{n} นาที",
    policyTitle: "เปลี่ยนแผนได้ ล่วงหน้า {w}",
    policyText:
      "ยกเลิกล่วงหน้า ≥{w} คืน 1 ครั้ง เลื่อนเป็นรอบที่มีที่นั่งโดยไม่หักเพิ่ม หลังจากนั้นหรือไม่มาเรียน ไม่คืนครั้ง กรุณาติดต่อทีมดูแล",
    newsTitle: "ข่าวดีจากครู",
    newsViewWork: "ดูผลงาน ↗",
    histTitle: "ประวัติการเรียนและจอง",
    histAll: "ทั้ง {n} คน",
    colDate: "วันที่",
    colWho: "นักเรียน / คอร์ส",
    colActivity: "กิจกรรม",
    colStatus: "สถานะ",
    colEffect: "ผลต่อครั้ง",
    actAttended: "เข้าเรียนรอบ {time}",
    actBooked: "จองคลาส {date} {time}",
    actCancelled: "ยกเลิกรอบ {date} {time}",
    stAttended: "เรียนแล้ว",
    stBooked: "ยืนยันแล้ว",
    stCancelled: "ยกเลิกแล้ว",
    effNone: "ไม่หักซ้ำ",
    effBooked: "−1 ครั้ง",
    effDash: "—",
    histEmpty: "ยังไม่มีประวัติการเรียนหรือการจอง",
    histNote:
      "ยอดคงเหลือแสดงครั้งที่ยังไม่ได้จอง ไม่ใช่จำนวนครั้งที่ยังไม่เข้าเรียน • ประวัติ {n} รายการล่าสุด",
    updatedAt: "ข้อมูลอัปเดตเมื่อ {time} น.",
    help: "ต้องการความช่วยเหลือ? LINE {line}",
    loading: "กำลังโหลด...",
    loadError: "โหลดข้อมูลไม่สำเร็จ",
    loadErrorText: "กรุณาลองอีกครั้ง หรือติดต่อทาง LINE",
    retry: "ลองอีกครั้ง",
    loginTitle: "กรุณาเข้าสู่ระบบเพื่อเข้าพื้นที่ผู้ปกครอง",
    loginBtn: "เข้าสู่ระบบ",
    noStudentsTitle: "ยังไม่มีข้อมูลเด็กในบัญชีนี้",
    noStudentsText:
      "เพิ่มโปรไฟล์บุตรหลานของคุณเพื่อเริ่มต้น หรือติดต่อทีมงานหากต้องการความช่วยเหลือ",
    contact: "ติดต่อทีมงานทาง LINE",
  },
  en: {
    topChip: "PARENT PORTAL · Logged In",
    greeting: "Hello, {name}! ☀️",
    subtitle: "What would you like your child to learn today?",
    account: "Family account · Settings ▾",
    soon: "Coming soon",
    tabOverview: "Family overview",
    tabSchedule: "Schedule",
    tabHistory: "Class history",
    tabPackages: "Packages & payments",
    familyTitle: "Your children",
    addChild: "＋ Add a child",
    editProfile: "Edit profile ↗",
    bookFor: "Book a class for {name}",
    buySimple: "Buy a package ↗",
    hasRemaining: "✓ Package available to book {course}",
    noRemaining: "{course} package fully used — buy a new one to keep booking",
    ageYears: "{n} yrs old",
    coursesCount: "{n} course enrolled",
    noCourses: "No courses yet",
    profile: "View profile ↗",
    packageLine: "{n}-session package",
    noExpiry: "Never expires",
    remaining: "{n} left",
    usage: "Attended {done} · Booked ahead {booked}",
    book: "Book a class",
    progress: "View progress",
    buy: "Buy a new package ↗",
    noPackageTitle: "No package for this child yet",
    noPackageText: "Buy a course to start booking classes.",
    nextTitle: "Upcoming classes",
    confirmedCount: "{n} confirmed",
    deducted: "1 session deducted on booking",
    studio: "DigiWorld Phuket",
    room: "{room} room",
    timeSuffix: "",
    reschedule: "Reschedule",
    cancel: "Cancel",
    allSchedule: "View full schedule and book next class ↗",
    emptyTitle: "No classes booked yet",
    emptyText: "Pick a session that suits you and book in a few steps.",
    emptyBtn: "Browse sessions and book",
    hoursUnit: "{n} hr",
    minutesUnit: "{n} min",
    policyTitle: "Change plans at least {w} ahead",
    policyText:
      "Cancel {w}+ ahead: 1 session refunded. Reschedule into a session with open seats at no extra cost. After that, or if you miss class, no refund. Please contact our team.",
    newsTitle: "Good news from the teacher",
    newsViewWork: "View work ↗",
    histTitle: "Class and booking history",
    histAll: "All {n} children",
    colDate: "Date",
    colWho: "Student / course",
    colActivity: "Activity",
    colStatus: "Status",
    colEffect: "Sessions",
    actAttended: "Attended {time} session",
    actBooked: "Booked class {date} {time}",
    actCancelled: "Cancelled {date} {time} session",
    stAttended: "Attended",
    stBooked: "Confirmed",
    stCancelled: "Cancelled",
    effNone: "No further deduction",
    effBooked: "−1",
    effDash: "—",
    histEmpty: "No classes or bookings yet.",
    histNote:
      "The balance shows sessions not booked yet, not sessions you haven't attended • Latest {n} entries",
    updatedAt: "Updated at {time}",
    help: "Need help? LINE {line}",
    loading: "Loading...",
    loadError: "Couldn't load your data",
    loadErrorText: "Please try again or contact us on LINE.",
    retry: "Try again",
    loginTitle: "Please sign in to open the parent area",
    loginBtn: "Sign in",
    noStudentsTitle: "No children on this account yet",
    noStudentsText:
      "Add your child's profile to get started, or contact our team if you need help.",
    contact: "Contact us on LINE",
  },
};

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
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

// Extra requests must never break the page: on any error they just return []
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

// ---------------------------------------------------------------
// Small icons
// ---------------------------------------------------------------
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M5 8a5 5 0 0110 0c0 4.5 1.5 5.5 1.5 5.5h-13S5 12.5 5 8z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M8.5 16.5a1.6 1.6 0 003 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="8.1" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10 9v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="10" cy="6.2" r="1" fill="currentColor" />
  </svg>
);

const BulbIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path
      d="M10 21h8M11 24.5h6M14 3.5a7 7 0 00-4 12.7c.7.6 1 1.4 1 2.3h6c0-.9.3-1.7 1-2.3A7 7 0 0014 3.5z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ---------------------------------------------------------------
// Page
// ---------------------------------------------------------------
function ParentPortal() {
  const [language, setLanguage] = useLanguage();
  const { session, loading: sessionLoading } = useSession();
  const user = session?.user;
  const userId = user?.id;
  const t = translations[language] || translations.en;
  const locale = LOCALES[language] || LOCALES.en;

  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);
  const [note, setNote] = useState(null);
  const [histFilter, setHistFilter] = useState("");
  const [loadedAt, setLoadedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: TZ, month: "short" }),
    [locale]
  );
  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: TZ, day: "numeric" }),
    [locale]
  );
  const shortFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: TZ, day: "numeric", month: "short" }),
    [locale]
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        timeZone: TZ,
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [locale]
  );

  // ---------- Load data ----------
  const load = useCallback(async () => {
    setFailed(false);

    // Main request: children + packages + confirmed bookings (with their session)
    const { data, error } = await supabase
      .from("students")
      .select(
        "id, name, full_name, english_name, age, packages(id, course_id, total_sessions, sessions_remaining, price, created_at), bookings(id, session_id, status, class_sessions(id, course_id, starts_at, duration_min, teacher_name, room))"
      )
      .eq("bookings.status", "confirmed")
      .order("name");

    if (error) {
      console.error("Load parent portal error:", error);
      setFailed(true);
      return;
    }

    const list = (data ?? []).map((s) => ({
      ...s,
      packages: [...(s.packages ?? [])].sort((x, y) =>
        String(x.created_at).localeCompare(String(y.created_at))
      ),
      bookings: s.bookings ?? [],
    }));
    setStudents(list);

    // Extra requests (history + teacher note) — a failure here only hides that section
    const ids = list.map((s) => s.id);
    if (ids.length) {
      const [historyRows, noteRows] = await Promise.all([
        safe(
          supabase
            .from("bookings")
            .select("id, student_id, status, created_at, class_sessions(course_id, starts_at, duration_min)")
            .in("student_id", ids)
            .order("created_at", { ascending: false })
            .limit(30),
          "history"
        ),
        SHOW_TEACHER_NOTES
          ? safe(
              supabase
                .from(TEACHER_NOTES_TABLE)
                .select("id, student_id, teacher_name, course_id, message, created_at, work_url")
                .in("student_id", ids)
                .order("created_at", { ascending: false })
                .limit(1),
              "teacher note"
            )
          : Promise.resolve([]),
      ]);
      setHistory(historyRows);
      setNote(noteRows[0] || null);
    } else {
      setHistory([]);
      setNote(null);
    }

    setLoadedAt(hhmm(new Date().toISOString()));
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

  // ---------- Derived values ----------
  // Future confirmed bookings of all children, soonest first
  const upcoming = useMemo(() => {
    const now = Date.now();
    return students
      .flatMap((s) =>
        s.bookings
          .filter((b) => b.class_sessions && new Date(b.class_sessions.starts_at).getTime() > now)
          .map((b) => ({ id: b.id, student: s, session: b.class_sessions }))
      )
      .sort((a, b) => new Date(a.session.starts_at) - new Date(b.session.starts_at));
  }, [students]);

  // One entry per child: their courses with balance and usage
  const kids = useMemo(() => {
    const now = Date.now();
    const list = students.map((s, index) => {
      const future = s.bookings.filter(
        (b) => b.class_sessions && new Date(b.class_sessions.starts_at).getTime() > now
      );
      const byCourse = {};
      s.packages.forEach((p) => {
        if (!byCourse[p.course_id]) byCourse[p.course_id] = [];
        byCourse[p.course_id].push(p);
      });
      const courses = Object.entries(byCourse).map(([id, pkgs]) => {
        const total = pkgs.reduce((n, p) => n + p.total_sessions, 0);
        const remaining = pkgs.reduce((n, p) => n + p.sessions_remaining, 0);
        const booked = future.filter((b) => b.class_sessions.course_id === id).length;
        // "remaining" = not yet booked, so attended = total - remaining - booked ahead
        const done = Math.max(total - remaining - booked, 0);
        const latest = pkgs[pkgs.length - 1];
        return { id, name: courseName(id), total, remaining, booked, done, price: latest.price };
      });
      return {
        student: s,
        courses,
        tone: TONES[index % TONES.length],
        subtitle: [s.full_name, s.english_name].filter(Boolean).join(" / "),
        remainingTotal: courses.reduce((n, c) => n + c.remaining, 0),
      };
    });
    // เด็กที่เหลือจำนวนครั้งรวมมากที่สุดขึ้นก่อน (เท่ากันให้เรียงตามชื่อเหมือนเดิม)
    // สีการ์ดกำหนดจากลำดับชื่อก่อนเรียง จึงไม่เปลี่ยนสีเมื่อลำดับสลับ
    return list.sort((a, b) => b.remainingTotal - a.remainingTotal);
  }, [students]);

  // History rows. Status is worked out from the booking:
  //   cancelled            -> "ยกเลิกแล้ว"
  //   confirmed, past      -> "เรียนแล้ว"   (assumes a past confirmed booking = attended)
  //   confirmed, upcoming  -> "ยืนยันแล้ว"  (−1 ครั้ง)
  const historyRows = useMemo(() => {
    const now = Date.now();
    const nameOf = (id) => students.find((s) => s.id === id)?.name || "";
    return history
      .filter((b) => b.class_sessions && (!histFilter || b.student_id === histFilter))
      .map((b) => {
        const s = b.class_sessions;
        const past = new Date(s.starts_at).getTime() <= now;
        const cancelled = /cancel/i.test(b.status || "");
        const kind = cancelled ? "cancelled" : past ? "attended" : "booked";
        const when = kind === "attended" ? s.starts_at : b.created_at || s.starts_at;
        const time = `${rangeLabel(s)}${t.timeSuffix}`;
        const sessionDate = shortFormatter.format(new Date(s.starts_at));
        const activity =
          kind === "attended"
            ? fill(t.actAttended, { time })
            : kind === "booked"
            ? fill(t.actBooked, { date: sessionDate, time: hhmm(s.starts_at) })
            : fill(t.actCancelled, { date: sessionDate, time: hhmm(s.starts_at) });
        return {
          id: b.id,
          when,
          date: dateFormatter.format(new Date(when)),
          who: `${nameOf(b.student_id)} · ${courseName(s.course_id)}`,
          activity,
          status: { attended: t.stAttended, booked: t.stBooked, cancelled: t.stCancelled }[kind],
          tone: kind === "attended" ? "is-green" : "",
          effect: { attended: t.effNone, booked: t.effBooked, cancelled: t.effDash }[kind],
        };
      })
      .sort((a, b) => new Date(b.when) - new Date(a.when))
      .slice(0, MAX_HISTORY);
  }, [history, students, histFilter, t, shortFormatter, dateFormatter]);

  const parentName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "");
  const parentFirstName = parentName.split(" ")[0];

  const windowText =
    CANCEL_MINUTES % 60 === 0
      ? fill(t.hoursUnit, { n: CANCEL_MINUTES / 60 })
      : fill(t.minutesUnit, { n: CANCEL_MINUTES });

  // ---------- Not-ready states ----------
  const renderGate = (title, text, action) => (
    <div className="pp-container">
      <section className="pp-card pp-gate">
        <h2>{title}</h2>
        {text && <p>{text}</p>}
        {action}
      </section>
    </div>
  );

  let body;
  if (sessionLoading || loading) {
    body = renderGate(t.loading);
  } else if (!user) {
    body = renderGate(
      t.loginTitle,
      "",
      <Link className="pp-primary" to={LOGIN_PATH}>
        {t.loginBtn}
      </Link>
    );
  } else if (failed) {
    body = renderGate(
      t.loadError,
      t.loadErrorText,
      <button type="button" className="pp-primary" onClick={reload}>
        {t.retry}
      </button>
    );
  } else if (!students.length) {
    body = renderGate(
      t.noStudentsTitle,
      t.noStudentsText,
      <>
        <Link className="pp-primary" to={ADD_CHILD_PATH}>
          {t.addChild}
        </Link>{" "}
        <a className="pp-link" href={LINE_URL} target="_blank" rel="noopener noreferrer">
          {t.contact}
        </a>
      </>
    );
  } else {
    body = (
      <div className="pp-container">
        {/* Heading */}
        <header className="pp-head">
          <div className="pp-head-text">
            <span className="pp-top-chip">{t.topChip}</span>
            <h1>{fill(t.greeting, { name: parentFirstName })}</h1>
            <p className="pp-sub">{t.subtitle}</p>
          </div>
          <div className="pp-parent">
            <span className="pp-bell">
              <BellIcon />
            </span>
            <span className="pp-avatar is-round" style={{ background: "#EDE8FF" }} aria-hidden="true">
              {initialOf(parentName)}
            </span>
            <div>
              <strong>{parentName}</strong>
              <small>{t.account}</small>
            </div>
          </div>
        </header>

        {/* Tabs (only the overview exists for now) */}
        <div className="pp-tabs" role="tablist">
          <button type="button" role="tab" aria-selected="true" className="pp-tab is-on">
            {t.tabOverview}
          </button>
          {[t.tabSchedule, t.tabHistory, t.tabPackages].map((label) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected="false"
              className="pp-tab"
              disabled
              title={t.soon}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Family header */}
        <div className="pp-family">
          <h2>{t.familyTitle}</h2>
          <Link className="pp-primary" to={ADD_CHILD_PATH}>
            {t.addChild}
          </Link>
        </div>

        {/* Children */}
        <div className="pp-kids">
          {kids.map(({ student, courses, tone, subtitle }) => (
            <article key={student.id} className="pk-card">
              <div className="pk-top">
                <span className="pk-avatar" style={{ background: tone }} aria-hidden="true">
                  {initialOf(student.name)}
                </span>
                <div className="pk-name">
                  <strong>{student.name}</strong>
                  {subtitle && <small>{subtitle}</small>}
                </div>
                <span className="pk-edit" aria-disabled="true" title={t.soon}>
                  {t.editProfile}
                </span>
              </div>

              <div className="pk-chips">
                {student.age ? (
                  <span className="pk-chip is-blue">{fill(t.ageYears, { n: student.age })}</span>
                ) : null}
                <span className="pk-chip">
                  {courses.length ? fill(t.coursesCount, { n: courses.length }) : t.noCourses}
                </span>
              </div>

              {courses.length === 0 ? (
                <div className="pp-empty">
                  <div>
                    <strong>{t.noPackageTitle}</strong>
                    <p className="pp-muted">{t.noPackageText}</p>
                  </div>
                  <Link className="pp-primary is-sm" to={COURSES_PATH}>
                    {t.buy}
                  </Link>
                </div>
              ) : (
                <>
                  {courses.map((c) => (
                    <React.Fragment key={c.id}>
                      <div className="pk-tile" style={{ background: tone }}>
                        <span className="pk-tile-title">{c.name}</span>
                        <div className="pk-tile-row">
                          <span>
                            {[
                              fill(t.packageLine, { n: c.total }),
                              c.price ? `฿${Number(c.price).toLocaleString("en-US")}` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                          <b>{fill(t.remaining, { n: c.remaining })}</b>
                        </div>
                        <div
                          className="pk-bar"
                          role="img"
                          aria-label={`${fill(t.remaining, { n: c.remaining })} / ${c.total}`}
                        >
                          {Array.from({ length: c.total }).map((_, i) => (
                            <i key={i} className={i < c.remaining ? "is-on" : ""} />
                          ))}
                        </div>
                        <small>
                          {fill(t.usage, { done: c.done, booked: c.booked })} · {t.noExpiry}
                        </small>
                      </div>
                      <p className={`pk-status${c.remaining > 0 ? " is-ok" : ""}`}>
                        {fill(c.remaining > 0 ? t.hasRemaining : t.noRemaining, { course: c.name })}
                      </p>
                    </React.Fragment>
                  ))}

                  <div className="pk-actions">
                    <Link className="pk-primary" to={`${BOOK_PATH}?student=${student.id}`}>
                      {fill(t.bookFor, { name: student.name })}
                    </Link>
                    <span className="pk-outline" aria-disabled="true" title={t.soon}>
                      {t.progress}
                    </span>
                    <Link className="pk-link" to={COURSES_PATH}>
                      {t.buySimple}
                    </Link>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>

        {/* Upcoming classes + side notes */}
        <div className="pp-bottom">
          <section className="pp-next">
            <div className="pp-next-head">
              <h2>{t.nextTitle}</h2>
              {upcoming.length > 0 && (
                <span className="pp-badge">{fill(t.confirmedCount, { n: upcoming.length })}</span>
              )}
            </div>

            {upcoming.length === 0 ? (
              <div className="pp-empty">
                <strong>{t.emptyTitle}</strong>
                <p className="pp-muted">{t.emptyText}</p>
                <Link className="pp-primary is-sm" to={BOOK_PATH}>
                  {t.emptyBtn}
                </Link>
              </div>
            ) : (
              <>
                {upcoming.slice(0, MAX_UPCOMING).map(({ id, student, session: s }) => (
                  <div key={id} className="pp-class">
                    <div className="pp-class-top">
                      <div className="pp-date">
                        <small>{monthFormatter.format(new Date(s.starts_at))}</small>
                        <b>{dayFormatter.format(new Date(s.starts_at))}</b>
                      </div>
                      <div className="pp-class-info">
                        <strong>{courseName(s.course_id)}</strong>
                        <span>
                          {[
                            student.name,
                            `${rangeLabel(s)}${t.timeSuffix}`,
                            s.teacher_name,
                            s.room ? fill(t.room, { room: s.room }) : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        <small>
                          {t.studio} · {dateFormatter.format(new Date(s.starts_at))}
                        </small>
                      </div>
                    </div>
                    <div className="pp-class-foot">
                      <span className="pp-chip">{t.deducted}</span>
                      <div className="pp-class-actions">
                        <a
                          className="pp-outline is-sm"
                          href={LINE_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t.reschedule}
                        </a>
                        <a
                          className="pp-outline is-sm"
                          href={LINE_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t.cancel}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                <Link className="pp-link" to={BOOK_PATH}>
                  {t.allSchedule}
                </Link>
              </>
            )}
          </section>

          <aside className="pp-side">
            <div className="pp-note">
              <span className="pp-note-icon">
                <InfoIcon />
              </span>
              <div>
                <strong>{fill(t.policyTitle, { w: windowText })}</strong>
                <p>{fill(t.policyText, { w: windowText })}</p>
              </div>
            </div>

            {note && (
              <div className="pp-news">
                <span className="pp-news-icon">
                  <BulbIcon />
                </span>
                <h3>{t.newsTitle}</h3>
                <p className="pp-news-quote">“{note.message}”</p>
                <small>
                  {[
                    note.teacher_name,
                    note.course_id ? courseName(note.course_id) : null,
                    note.created_at ? shortFormatter.format(new Date(note.created_at)) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
                {note.work_url && (
                  <a
                    className="pp-link is-strong"
                    href={note.work_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.newsViewWork}
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>

        {/* History */}
        <section className="pp-hist">
          <div className="pp-hist-head">
            <h2>{t.histTitle}</h2>
            <label className="pp-filter">
              <span className="pp-sr">{t.histTitle}</span>
              <select value={histFilter} onChange={(e) => setHistFilter(e.target.value)}>
                <option value="">{fill(t.histAll, { n: students.length })}</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {historyRows.length === 0 ? (
            <p className="pp-muted">{t.histEmpty}</p>
          ) : (
            <div className="pp-table-wrap">
              <table className="pp-table">
                <thead>
                  <tr>
                    <th>{t.colDate}</th>
                    <th>{t.colWho}</th>
                    <th>{t.colActivity}</th>
                    <th>{t.colStatus}</th>
                    <th>{t.colEffect}</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.date}</td>
                      <td>{r.who}</td>
                      <td className="pp-cell-muted">{r.activity}</td>
                      <td>
                        <span className={`pp-tag ${r.tone}`}>{r.status}</span>
                      </td>
                      <td className="pp-cell-muted">{r.effect}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <small className="pp-muted">{fill(t.histNote, { n: MAX_HISTORY })}</small>
        </section>

        <div className="pp-foot">
          <small>{loadedAt ? fill(t.updatedAt, { time: loadedAt }) : ""}</small>
          <a className="pp-link" href={LINE_URL} target="_blank" rel="noopener noreferrer">
            {fill(t.help, { line: LINE_ID })}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="pp-page">
      <SiteHeader language={language} onLanguageChange={setLanguage} />
      {body}
      <SiteFooter language={language} />
    </div>
  );
}

export default ParentPortal;
