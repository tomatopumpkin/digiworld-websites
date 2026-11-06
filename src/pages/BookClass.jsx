import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import "../styles/BookClass.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";
import useSession from "../lib/useSession";
import { supabase } from "../lib/supabase";

// ---------------------------------------------------------------
// Settings (change the paths to match your router)
// ---------------------------------------------------------------
const TZ = "Asia/Bangkok";
const WEEKS_AHEAD = 4;
const CANCEL_MINUTES = 30; // cancel/reschedule at least 30 min before class = refund 1 session
const LEAD_MINUTES = 60; // must match booking_settings.book_lead_minutes in Supabase
const PARENT_AREA_PATH = "/parent-portal";
const LOGIN_PATH = "/login";
const COURSES_PATH = "/courses";
const DAY_MS = 86400000;

// Course names match the Courses page
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

// Thai + English for now (other languages fall back to English)
const translations = {
  th: {
    eyebrow: "ONLINE BOOKING",
    title: "จองคลาสสำหรับ{name}",
    subtitle: "ตรวจคอร์สและยอดก่อนจอง · จองได้เมื่อมีครั้ง · ซื้อคอร์สเมื่อไม่มีครั้ง",
    back: "← กลับพื้นที่ผู้ปกครอง",
    step1: "เลือกเด็ก & คอร์ส",
    step2: "เลือกรอบเรียน",
    step3: "ยืนยันการจอง",
    bookFor: "จองให้",
    ageYears: "{n} ปี",
    packageLine: "แพ็กเกจ {n} ครั้ง",
    noExpiry: "ไม่มีวันหมดอายุ",
    remainingCount: "{n} ครั้ง",
    notBooked: "ที่ยังไม่ได้จอง",
    pickSession: "เลือกรอบเรียน",
    course: "คอร์ส",
    week: "วันที่",
    time: "เวลา",
    allTimes: "ทุกเวลา",
    seatsLeft: "เหลือ {left} / {cap} ที่นั่ง",
    full: "เต็มแล้ว · 0 / {cap} ที่นั่ง",
    pick: "เลือกรอบนี้",
    picked: "เลือกรอบนี้แล้ว ✓",
    closed: "ไม่เปิดรับจอง",
    conflict: "ลูกมีคลาสเวลานี้แล้ว",
    alreadyBooked: "จองรอบนี้แล้ว",
    noCreditsBtn: "ไม่มีครั้งคงเหลือ",
    noSessions: "สัปดาห์นี้ยังไม่มีรอบของคอร์สนี้",
    emptyDays: "{days} ไม่มีรอบคอร์สนี้",
    loading: "กำลังโหลด...",
    infoTitle: "จองได้เมื่อมีที่นั่ง และมีครั้งคงเหลือเท่านั้น",
    infoText:
      "รอบเต็มไม่เปิดให้จอง หากที่นั่งสุดท้ายถูกจองก่อนยืนยัน จะไม่สร้างการจองและไม่หักครั้ง ให้เลือกรอบใหม่ • ไม่จองซ้ำเวลาที่เด็กมีคลาสอยู่แล้ว",
    policyTitle: "นโยบาย: ยกเลิก / เลื่อน ก่อนคลาสเริ่ม ≥{min} นาที",
    policyText:
      "ยกเลิก ≥{min} นาที คืน 1 ครั้ง · เลื่อนเข้ารอบว่างโดยไม่หักเพิ่ม · ภายใน {min} นาที หรือไม่มาเรียน ไม่คืนครั้ง",
    summaryTitle: "สรุปการจองของคุณ",
    statusPending: "รอยืนยัน · ยังไม่หักครั้ง",
    statusDone: "จองสำเร็จ · หักแล้ว 1 ครั้ง",
    summaryEmpty: "ยังไม่ได้เลือกรอบเรียน",
    studio: "DigiWorld Phuket · ห้อง {room}",
    balanceBefore: "คงเหลือก่อนจอง",
    balanceUse: "ใช้สำหรับคลาสนี้",
    balanceAfter: "คงเหลือหลังยืนยัน",
    timesUnit: "{n} ครั้ง",
    useOne: "−1 ครั้ง",
    ack: "ฉันรับทราบนโยบายเลื่อน / ยกเลิก ≥{min} นาที และหัก 1 ครั้งเมื่อจองสำเร็จเท่านั้น",
    confirm: "ยืนยันการจอง",
    confirming: "กำลังจอง...",
    summaryFoot: "ใช้แพ็กเกจที่มีอยู่ · หักครั้งเมื่อจองสำเร็จเท่านั้น",
    bookAnother: "จองรอบอื่นเพิ่ม",
    modalSub: "ตรวจสอบข้อมูลก่อนยืนยัน · ยังไม่หักครั้งจนกว่าจะสำเร็จ",
    modalSummary: "สรุปการจอง",
    policyHeading: "นโยบายสำคัญ",
    policyItem1: "เลื่อน / ยกเลิกได้ ≥{min} นาที ก่อนเริ่มคลาส",
    policyItem2: "หัก 1 ครั้งเมื่อจองสำเร็จเท่านั้น",
    backEdit: "กลับไปแก้ไข",
    noCreditsTitle: "ไม่มีครั้งคงเหลือสำหรับคอร์สนี้",
    noCreditsText: "ซื้อคอร์สเพิ่มเพื่อจองคลาสต่อ",
    buy: "ดูคอร์สและราคา",
    loginTitle: "กรุณาเข้าสู่ระบบก่อนจองคลาส",
    loginBtn: "เข้าสู่ระบบ",
    noStudentsTitle: "ยังไม่มีข้อมูลเด็กในบัญชีนี้",
    noStudentsText: "กรุณาติดต่อทีมงานเพื่อเพิ่มข้อมูลเด็กและแพ็กเกจ",
    noPackageTitle: "ยังไม่มีแพ็กเกจสำหรับเด็กคนนี้",
    noPackageText: "เลือกเด็กคนอื่น หรือซื้อคอร์สเพื่อเริ่มจองคลาส",
    err_SESSION_FULL: "ขออภัย ที่นั่งเต็มแล้ว ยังไม่มีการจองและไม่หักครั้ง กรุณาเลือกรอบใหม่",
    err_TIME_CONFLICT: "เด็กมีคลาสอื่นในเวลาที่ทับกัน กรุณาเลือกรอบใหม่",
    err_NO_SESSIONS_LEFT: "ไม่มีครั้งคงเหลือสำหรับคอร์สนี้",
    err_SESSION_NOT_OPEN: "รอบนี้ปิดรับจองแล้ว กรุณาเลือกรอบใหม่",
    err_SESSION_STARTED: "รอบนี้เริ่มไปแล้ว กรุณาเลือกรอบใหม่",
    err_TOO_SOON: "ต้องจองล่วงหน้าอย่างน้อย {lead} นาทีก่อนคลาสเริ่ม กรุณาเลือกรอบใหม่",
    err_ALREADY_BOOKED: "เด็กจองรอบนี้ไว้แล้ว",
    err_COURSE_MISMATCH: "รอบนี้ไม่ตรงกับคอร์สในแพ็กเกจ",
    err_GENERIC: "ไม่สามารถจองได้ในขณะนี้ กรุณาลองอีกครั้ง หรือติดต่อทาง LINE",
  },
  en: {
    eyebrow: "ONLINE BOOKING",
    title: "Book a class for {name}",
    subtitle: "Check course and balance first · Book when sessions remain · Buy a course when none left",
    back: "← Back to parent area",
    step1: "Choose child & course",
    step2: "Choose a session",
    step3: "Confirm booking",
    bookFor: "Booking for",
    ageYears: "{n} yrs",
    packageLine: "{n}-session package",
    noExpiry: "Never expires",
    remainingCount: "{n} left",
    notBooked: "not yet booked",
    pickSession: "Choose a session",
    course: "Course",
    week: "Dates",
    time: "Time",
    allTimes: "All times",
    seatsLeft: "{left} / {cap} seats left",
    full: "Full · 0 / {cap} seats",
    pick: "Select this session",
    picked: "Selected ✓",
    closed: "Not available",
    conflict: "Child has a class at this time",
    alreadyBooked: "Already booked",
    noCreditsBtn: "No sessions left",
    noSessions: "No sessions for this course this week.",
    emptyDays: "No sessions on {days}",
    loading: "Loading...",
    infoTitle: "Booking requires an open seat and remaining sessions",
    infoText:
      "Full sessions can't be booked. If the last seat is taken before you confirm, no booking is created and no session is deducted — please pick another. Overlapping classes can't be booked.",
    policyTitle: "Policy: cancel / reschedule at least {min} min before class",
    policyText:
      "Cancel {min}+ min before: 1 session refunded · Reschedule into an open session at no extra cost · Within {min} min or no-show: no refund",
    summaryTitle: "Your booking summary",
    statusPending: "Pending · nothing deducted yet",
    statusDone: "Booked · 1 session deducted",
    summaryEmpty: "No session selected yet",
    studio: "DigiWorld Phuket · {room} room",
    balanceBefore: "Balance before",
    balanceUse: "Used for this class",
    balanceAfter: "Balance after",
    timesUnit: "{n}",
    useOne: "−1",
    ack: "I understand the cancel / reschedule policy ({min}+ min before class) and that 1 session is deducted only when booking succeeds.",
    confirm: "Confirm booking",
    confirming: "Booking...",
    summaryFoot: "Uses your existing package · deducted only on success",
    bookAnother: "Book another session",
    modalSub: "Review the details before confirming · nothing is deducted until it succeeds",
    modalSummary: "Booking summary",
    policyHeading: "Important policy",
    policyItem1: "Cancel / reschedule at least {min} min before class",
    policyItem2: "1 session is deducted only when booking succeeds",
    backEdit: "Go back",
    noCreditsTitle: "No sessions left for this course",
    noCreditsText: "Buy more sessions to keep booking.",
    buy: "View courses & prices",
    loginTitle: "Please sign in to book a class",
    loginBtn: "Sign in",
    noStudentsTitle: "No children on this account yet",
    noStudentsText: "Please contact our team to add your child and package.",
    noPackageTitle: "No package for this child yet",
    noPackageText: "Pick another child, or buy a course to start booking.",
    err_SESSION_FULL: "Sorry, that session just filled up. Nothing was booked or deducted. Please pick another.",
    err_TIME_CONFLICT: "Your child already has a class at an overlapping time. Please pick another.",
    err_NO_SESSIONS_LEFT: "No sessions left for this course.",
    err_SESSION_NOT_OPEN: "This session is no longer open. Please pick another.",
    err_SESSION_STARTED: "This session has already started. Please pick another.",
    err_TOO_SOON: "Classes must be booked at least {lead} minutes before they start. Please pick another.",
    err_ALREADY_BOOKED: "Your child is already booked into this session.",
    err_COURSE_MISMATCH: "This session doesn't match the course in the package.",
    err_GENERIC: "Unable to book right now. Please try again or contact us on LINE.",
  },
};

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
const fill = (text, values) =>
  Object.entries(values).reduce((r, [k, v]) => r.split(`{${k}}`).join(v), text);

// Everything uses Thai time, regardless of the visitor's device timezone
const dayKey = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const dayDate = (key) => new Date(`${key}T12:00:00+07:00`);
const hhmm = (iso) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso)
  );
const endIso = (s) => new Date(new Date(s.starts_at).getTime() + s.duration_min * 60000).toISOString();
const rangeLabel = (s) => `${hhmm(s.starts_at)}–${hhmm(endIso(s))}`;
const overlaps = (a, b) =>
  new Date(a.starts_at) < new Date(endIso(b)) && new Date(b.starts_at) < new Date(endIso(a));

// Error codes raised by the book_class function in Supabase
const KNOWN_ERRORS = [
  "SESSION_FULL",
  "TIME_CONFLICT",
  "NO_SESSIONS_LEFT",
  "SESSION_NOT_OPEN",
  "SESSION_STARTED",
  "ALREADY_BOOKED",
  "COURSE_MISMATCH",
];

// Errors that mean "this session can't be booked" (the selection is cleared for these)
const CLEAR_SELECTION_ERRORS = [...KNOWN_ERRORS, "TOO_SOON"];

// Works out which error key to show from the Supabase error message
const errorKeyFrom = (message) => {
  const msg = message || "";
  const known = KNOWN_ERRORS.find((c) => msg.includes(c));
  if (known) return known;
  if (/lead|soon|advance|too_late|too_close/i.test(msg)) return "TOO_SOON";
  return "GENERIC";
};

// ---------------------------------------------------------------
// Small icons
// ---------------------------------------------------------------
const InfoIcon = () => (
  <svg className="bk-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="6.25" r="0.9" fill="currentColor" />
  </svg>
);

const CheckCircle = () => (
  <svg className="bk-check" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="9.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M6.8 11.4l3 3 5.4-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="bk-mini" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="3" y="4.5" width="14" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 8.5h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg className="bk-mini" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 6v4.2l2.8 1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronIcon = () => (
  <svg className="bk-chevron" width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TickIcon = () => (
  <svg className="bk-tick" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M4.5 10.5l3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------
// Popup select (same look as the language menu)
// ---------------------------------------------------------------
function PopupSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`bk-field ${open ? "is-open" : ""}`} ref={ref}>
      <span className="bk-field-label">{label}</span>
      <button
        type="button"
        className="bk-select"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{current ? current.label : ""}</span>
        <ChevronIcon />
      </button>

      {open && (
        <ul className="bk-menu" role="listbox">
          {options.map((o) => {
            const on = o.value === value;
            return (
              <li key={String(o.value)}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  className={`bk-menu-item ${on ? "is-on" : ""}`}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <span>{o.label}</span>
                  {on && <TickIcon />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Page
// ---------------------------------------------------------------
function BookClass() {
  const [language, setLanguage] = useLanguage();
  const { session, loading: sessionLoading } = useSession();
  const user = session?.user;
  const userId = user?.id;
  const t = translations[language] || translations.en;
  const locale = LOCALES[language] || LOCALES.en;

  // Child chosen on the Parent Portal (/book-class?student=ID)
  const [searchParams] = useSearchParams();
  const wantedStudent = searchParams.get("student");

  const [loadingInit, setLoadingInit] = useState(true);
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [allSessions, setAllSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [weekIdx, setWeekIdx] = useState(0);
  const [timeFilter, setTimeFilter] = useState("");
  const [activeDay, setActiveDay] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState("");
  const [errorDetail, setErrorDetail] = useState("");
  const [done, setDone] = useState(null);
  const [nowTs, setNowTs] = useState(() => Date.now());

  // Re-check the clock every minute so sessions inside the lead time disappear
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // Start from today (sessions that already started are filtered out in the query)
  const startKey = useMemo(() => dayKey(new Date()), []);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        timeZone: TZ,
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [locale]
  );
  const shortFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: TZ, day: "numeric", month: "short" }),
    [locale]
  );
  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: TZ, weekday: "short" }),
    [locale]
  );
  const dayNumFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: TZ, day: "numeric" }),
    [locale]
  );

  // ---------- Load data ----------
  // One request: children + their packages + confirmed bookings
  const loadStudents = useCallback(async () => {
    const { data, error } = await supabase
      .from("students")
      .select(
        "id, name, age, packages(id, course_id, total_sessions, sessions_remaining, price, created_at), bookings(session_id, status, class_sessions(starts_at, duration_min))"
      )
      .eq("bookings.status", "confirmed")
      .order("name");

    if (error) console.error("Load students error:", error);

    const list = (data ?? []).map((s) => ({
      ...s,
      packages: [...(s.packages ?? [])].sort((x, y) =>
        String(x.created_at).localeCompare(String(y.created_at))
      ),
      bookings: s.bookings ?? [],
    }));

    setStudents(list);
    setStudentId(
      (prev) =>
        prev ||
        (list.find((s) => s.packages.some((p) => p.sessions_remaining > 0)) || list[0])?.id ||
        ""
    );
  }, []);

  // One request: every open regular session (filtered by course in the browser)
  const loadSessions = useCallback(async () => {
    const dayStart = new Date(`${startKey}T00:00:00+07:00`);
    const to = new Date(dayStart.getTime() + WEEKS_AHEAD * 7 * DAY_MS);
    const { data, error } = await supabase
      .from("class_sessions")
      .select("id, course_id, starts_at, duration_min, capacity, booked_count, teacher_name, room")
      .eq("kind", "regular")
      .eq("status", "open")
      .gt("starts_at", new Date().toISOString())
      .lt("starts_at", to.toISOString())
      .order("starts_at");

    if (error) console.error("Load sessions error:", error);
    setAllSessions(data ?? []);
    setLoadingSessions(false);
  }, [startKey]);

  // Current child, packages, bookings and sessions of the chosen course
  const student = students.find((s) => s.id === studentId);
  const packages = student?.packages ?? [];
  const myBookings = student?.bookings ?? [];
  const hasPackage = packages.length > 0;

  // Only sessions of this course that start at least LEAD_MINUTES from now
  const sessions = useMemo(
    () =>
      allSessions.filter(
        (s) =>
          s.course_id === courseId &&
          new Date(s.starts_at).getTime() > nowTs + LEAD_MINUTES * 60000
      ),
    [allSessions, courseId, nowTs]
  );

  // Wait for the login check, then load both requests at the same time
  useEffect(() => {
    if (sessionLoading) return;
    if (!userId) {
      setLoadingInit(false);
      return;
    }
    loadSessions();
    loadStudents().finally(() => setLoadingInit(false));
  }, [userId, sessionLoading, loadStudents, loadSessions]);

  // Open with the child chosen on the Parent Portal (/book-class?student=ID), once
  const appliedStudent = useRef(false);
  useEffect(() => {
    if (appliedStudent.current || !wantedStudent || !students.length) return;
    appliedStudent.current = true;
    if (students.some((s) => s.id === wantedStudent)) setStudentId(wantedStudent);
  }, [wantedStudent, students]);

  useEffect(() => {
    setCourseId("");
    setSelectedId("");
    setDone(null);
    setErrorKey("");
    setErrorDetail("");
    setConfirmOpen(false);
  }, [studentId]);

  // Default course = a course that still has sessions left
  useEffect(() => {
    if (courseId || !packages.length) return;
    const pick = packages.find((p) => p.sessions_remaining > 0) || packages[0];
    setCourseId(pick.course_id);
  }, [packages, courseId]);

  useEffect(() => {
    setSelectedId("");
    setTimeFilter("");
    setActiveDay("");
    setConfirmOpen(false);
  }, [courseId]);

  // Confirm popup: close with Esc, lock page scroll while open
  useEffect(() => {
    if (!confirmOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) setConfirmOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [confirmOpen, submitting]);

  // ---------- Derived values ----------
  const courseOptions = packages.length
    ? COURSES.filter((c) => packages.some((p) => p.course_id === c.id))
    : COURSES;
  const course = COURSES.find((c) => c.id === courseId);
  const coursePackages = packages.filter((p) => p.course_id === courseId);
  const remaining = coursePackages.reduce((n, p) => n + p.sessions_remaining, 0);
  const bookablePackage = coursePackages.find((p) => p.sessions_remaining > 0);
  const infoPackage = bookablePackage || coursePackages[0];

  const packageSubtitle = infoPackage
    ? [
        fill(t.packageLine, { n: infoPackage.total_sessions }),
        infoPackage.price ? `฿${Number(infoPackage.price).toLocaleString("en-US")}` : null,
        t.noExpiry,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  const days = useMemo(() => {
    const base = dayDate(startKey).getTime();
    return Array.from({ length: 7 }, (_, i) =>
      dayKey(new Date(base + (weekIdx * 7 + i) * DAY_MS))
    );
  }, [startKey, weekIdx]);

  const weekSessions = useMemo(
    () => sessions.filter((s) => days.includes(dayKey(s.starts_at))),
    [sessions, days]
  );

  // Sessions grouped by day (not affected by the time filter, so day tabs stay clickable)
  const byDayAll = useMemo(() => {
    const map = {};
    weekSessions.forEach((s) => {
      const k = dayKey(s.starts_at);
      if (!map[k]) map[k] = [];
      map[k].push(s);
    });
    return map;
  }, [weekSessions]);

  const daysWithSessions = days.filter((d) => byDayAll[d]);
  const emptyDays = days.filter((d) => !byDayAll[d]);

  // Only ONE day is shown at a time
  const currentDay = daysWithSessions.includes(activeDay) ? activeDay : daysWithSessions[0] || "";
  const daySessions = useMemo(() => byDayAll[currentDay] || [], [byDayAll, currentDay]);

  // Time options come from the selected day only
  const timeOptions = useMemo(
    () => [...new Set(daySessions.map(rangeLabel))].sort(),
    [daySessions]
  );
  // If the chosen time doesn't exist on this day, fall back to "all times"
  const activeTime = timeOptions.includes(timeFilter) ? timeFilter : "";
  const visible = activeTime ? daySessions.filter((s) => rangeLabel(s) === activeTime) : daySessions;

  const selectedSession = sessions.find((s) => s.id === selectedId);
  const shown = done ? done.session : selectedSession;

  const stateOf = (s) => {
    if (s.id === selectedId) return "selected";
    if (myBookings.some((b) => b.session_id === s.id)) return "booked";
    if (s.booked_count >= s.capacity) return "full";
    if (myBookings.some((b) => b.class_sessions && overlaps(b.class_sessions, s))) return "conflict";
    if (remaining <= 0) return "nocredits";
    return "open";
  };

  // Options for the popup selects
  const courseSelectOptions = courseOptions.map((c) => ({ value: c.id, label: c.name }));
  const weekSelectOptions = Array.from({ length: WEEKS_AHEAD }, (_, w) => {
    const base = dayDate(startKey).getTime();
    const first = dayKey(new Date(base + w * 7 * DAY_MS));
    const last = dayKey(new Date(base + (w * 7 + 6) * DAY_MS));
    return {
      value: w,
      label: `${shortFormatter.format(dayDate(first))} – ${shortFormatter.format(dayDate(last))}`,
    };
  });
  const timeSelectOptions = [
    { value: "", label: t.allTimes },
    ...timeOptions.map((o) => ({ value: o, label: o })),
  ];

  // ---------- Actions ----------
  const pickSession = (s) => {
    setSelectedId(s.id);
    setActiveDay(dayKey(s.starts_at));
    setErrorKey("");
    setErrorDetail("");
    setDone(null);
  };

  const refresh = () => Promise.all([loadStudents(), loadSessions()]);

  const openConfirm = () => {
    if (!selectedSession || remaining <= 0) return;
    setAcknowledged(false);
    setErrorKey("");
    setErrorDetail("");
    setConfirmOpen(true);
  };

  const confirm = async () => {
    if (!selectedSession || submitting) return;

    if (!bookablePackage) {
      setConfirmOpen(false);
      setErrorKey("NO_SESSIONS_LEFT");
      return;
    }

    setSubmitting(true);
    setErrorKey("");
    setErrorDetail("");

    const snapshot = { session: selectedSession, before: remaining };
    const { error } = await supabase.rpc("book_class", {
      p_student_id: studentId,
      p_package_id: bookablePackage.id,
      p_session_id: selectedSession.id,
    });

    setSubmitting(false);
    setConfirmOpen(false);

    if (error) {
      console.error("Booking error:", error);
      const key = errorKeyFrom(error.message);
      setErrorKey(key);
      setErrorDetail(error.message || "");
      // Known "can't book this session" errors clear the selection.
      // Unknown errors keep it so the person can try again.
      if (CLEAR_SELECTION_ERRORS.includes(key)) setSelectedId("");
      await refresh();
      return;
    }

    setDone(snapshot);
    setSelectedId("");
    setAcknowledged(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    await refresh();
  };

  const stepNo = done ? 3 : courseId ? 2 : 1;
  const before = done ? done.before : remaining;
  const after = shown ? before - 1 : before;

  // ---------- Not-ready states ----------
  const renderGate = (title, text, linkTo, linkText) => (
    <div className="bk-container">
      <section className="bk-card bk-gate">
        <h2>{title}</h2>
        {text && <p>{text}</p>}
        {linkTo && (
          <Link className="bk-primary" to={linkTo}>
            {linkText}
          </Link>
        )}
      </section>
    </div>
  );

  let body;
  if (loadingInit) body = renderGate(t.loading);
  else if (!user) body = renderGate(t.loginTitle, "", LOGIN_PATH, t.loginBtn);
  else if (!students.length) body = renderGate(t.noStudentsTitle, t.noStudentsText);
  else
    body = (
      <div className="bk-container">
        <header className="bk-head">
          <div>
            <p className="bk-eyebrow">{t.eyebrow}</p>
            <h1>{fill(t.title, { name: student?.name || "" })}</h1>
            <p className="bk-sub">{t.subtitle}</p>
          </div>
          <Link className="bk-outline" to={PARENT_AREA_PATH}>
            {t.back}
          </Link>
        </header>

        <ol className="bk-steps">
          {[t.step1, t.step2, t.step3].map((label, i) => (
            <li key={label} className={i + 1 <= stepNo ? "is-on" : ""}>
              <span>{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        <div className="bk-layout">
          <div className="bk-main">
            {/* Child + balance */}
            <section className="bk-card">
              <div className="bk-who">
                <span>{t.bookFor}</span>
                {students.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`bk-chip ${s.id === studentId ? "is-on" : ""}`}
                    onClick={() => setStudentId(s.id)}
                  >
                    {s.name}
                    {s.age ? ` · ${fill(t.ageYears, { n: s.age })}` : ""}
                    {s.id === studentId ? " ✓" : ""}
                  </button>
                ))}
              </div>

              {course && (
                <div className="bk-balance">
                  <div>
                    <strong>{course.name}</strong>
                    {packageSubtitle && <small>{packageSubtitle}</small>}
                  </div>
                  <div className="bk-balance-num">
                    <b>{fill(t.remainingCount, { n: remaining })}</b>
                    <small>{t.notBooked}</small>
                  </div>
                </div>
              )}

              {!hasPackage && (
                <div className="bk-nocredit">
                  <div>
                    <strong>{t.noPackageTitle}</strong>
                    <p>{t.noPackageText}</p>
                  </div>
                  <Link className="bk-primary" to={COURSES_PATH}>
                    {t.buy}
                  </Link>
                </div>
              )}

              {course && remaining <= 0 && (
                <div className="bk-nocredit">
                  <div>
                    <strong>{t.noCreditsTitle}</strong>
                    <p>{t.noCreditsText}</p>
                  </div>
                  <Link className="bk-primary" to={COURSES_PATH}>
                    {t.buy}
                  </Link>
                </div>
              )}
            </section>

            {/* Choose a session */}
            {hasPackage && (
              <section className="bk-card">
                <h2>{t.pickSession}</h2>

                <div className="bk-filters">
                  <PopupSelect
                    label={t.course}
                    value={courseId}
                    options={courseSelectOptions}
                    onChange={setCourseId}
                  />
                  <PopupSelect
                    label={t.week}
                    value={weekIdx}
                    options={weekSelectOptions}
                    onChange={(v) => {
                      setWeekIdx(v);
                      setActiveDay("");
                      setTimeFilter("");
                    }}
                  />
                  <PopupSelect
                    label={t.time}
                    value={activeTime}
                    options={timeSelectOptions}
                    onChange={setTimeFilter}
                  />
                </div>

                <div className="bk-days" role="tablist">
                  {days.map((d) => {
                    const has = Boolean(byDayAll[d]);
                    return (
                      <button
                        key={d}
                        type="button"
                        role="tab"
                        disabled={!has}
                        aria-selected={d === currentDay}
                        className={`bk-day ${d === currentDay ? "is-on" : ""}`}
                        onClick={() => setActiveDay(d)}
                      >
                        <small>{weekdayFormatter.format(dayDate(d))}</small>
                        <b>{dayNumFormatter.format(dayDate(d))}</b>
                      </button>
                    );
                  })}
                </div>

                {loadingSessions ? (
                  <p className="bk-muted">{t.loading}</p>
                ) : daysWithSessions.length === 0 ? (
                  <p className="bk-muted">{t.noSessions}</p>
                ) : (
                  <div className="bk-col" key={currentDay}>
                    <h3>{dateFormatter.format(dayDate(currentDay))}</h3>

                    <div className="bk-grid">
                      {visible.map((s) => {
                        const state = stateOf(s);
                        const left = s.capacity - s.booked_count;
                        const disabled = state !== "open" && state !== "selected";
                        return (
                          <article key={s.id} className={`bk-slot is-${state}`}>
                            <div className="bk-slot-top">
                              <strong>{rangeLabel(s)}</strong>
                              {state === "selected" && <CheckCircle />}
                            </div>
                            <p>
                              {[s.teacher_name, s.room, `${s.duration_min} min`]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>

                            {state === "full" ? (
                              <span className="bk-tag is-full">{fill(t.full, { cap: s.capacity })}</span>
                            ) : state === "conflict" ? (
                              <span className="bk-tag is-warn">{t.conflict}</span>
                            ) : state === "booked" ? (
                              <span className="bk-tag is-warn">{t.alreadyBooked}</span>
                            ) : (
                              <span className="bk-tag is-ok">
                                {fill(t.seatsLeft, { left, cap: s.capacity })}
                              </span>
                            )}

                            <button
                              type="button"
                              className={state === "selected" ? "bk-primary" : "bk-outline"}
                              disabled={disabled}
                              onClick={() => pickSession(s)}
                            >
                              {state === "selected"
                                ? t.picked
                                : state === "nocredits"
                                ? t.noCreditsBtn
                                : state === "open"
                                ? t.pick
                                : t.closed}
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}

                {emptyDays.length > 0 && daysWithSessions.length > 0 && (
                  <p className="bk-muted bk-small">
                    {fill(t.emptyDays, {
                      days: emptyDays.map((d) => shortFormatter.format(dayDate(d))).join(", "),
                    })}
                  </p>
                )}
              </section>
            )}

            <div className="bk-note is-blue">
              <InfoIcon />
              <div>
                <strong>{t.infoTitle}</strong>
                <p>{t.infoText}</p>
              </div>
            </div>
            <div className="bk-note is-yellow">
              <InfoIcon />
              <div>
                <strong>{fill(t.policyTitle, { min: CANCEL_MINUTES })}</strong>
                <p>{fill(t.policyText, { min: CANCEL_MINUTES })}</p>
              </div>
            </div>
          </div>

          {/* Booking summary */}
          <aside className="bk-side">
            <section className="bk-card bk-summary">
              <h2>{t.summaryTitle}</h2>
              <span className={`bk-status ${done ? "is-done" : ""}`}>
                {done ? t.statusDone : t.statusPending}
              </span>

              {shown ? (
                <div className="bk-sum-info">
                  <strong>{course?.name}</strong>
                  <p className="bk-muted">
                    {student?.name}
                    {student?.age ? ` · ${fill(t.ageYears, { n: student.age })}` : ""}
                  </p>
                  <p className="bk-line">
                    <CalendarIcon />
                    {dateFormatter.format(dayDate(dayKey(shown.starts_at)))}
                  </p>
                  <p className="bk-line">
                    <ClockIcon />
                    {rangeLabel(shown)}
                    {shown.teacher_name ? ` · ${shown.teacher_name}` : ""}
                  </p>
                  <p className="bk-muted">{fill(t.studio, { room: shown.room || "—" })}</p>
                </div>
              ) : (
                <p className="bk-muted">{t.summaryEmpty}</p>
              )}

              <hr />

              <div className="bk-rows">
                <div>
                  <span>{t.balanceBefore}</span>
                  <b>{fill(t.timesUnit, { n: before })}</b>
                </div>
                <div>
                  <span>{t.balanceUse}</span>
                  <b>{shown ? t.useOne : "—"}</b>
                </div>
                <div>
                  <span>{t.balanceAfter}</span>
                  <b className="is-big">{fill(t.timesUnit, { n: after })}</b>
                </div>
              </div>

              {errorKey && (
                <div className="bk-alert" role="alert">
                  {fill(t[`err_${errorKey}`] || t.err_GENERIC, { lead: LEAD_MINUTES })}
                  {errorKey === "GENERIC" && errorDetail && (
                    <small className="bk-alert-detail">{errorDetail}</small>
                  )}
                </div>
              )}

              {done ? (
                <button type="button" className="bk-outline bk-full" onClick={() => setDone(null)}>
                  {t.bookAnother}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="bk-primary bk-full"
                    disabled={!selectedSession || remaining <= 0 || submitting}
                    onClick={openConfirm}
                  >
                    {t.confirm}
                  </button>
                  <p className="bk-center bk-muted bk-small">{t.summaryFoot}</p>
                </>
              )}
            </section>
          </aside>
        </div>
      </div>
    );

  return (
    <div className="bk-page">
      <SiteHeader language={language} onLanguageChange={setLanguage} />
      {body}
      <SiteFooter language={language} />

      {/* Confirm popup */}
      {confirmOpen && selectedSession && (
        <div
          className="bk-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !submitting) setConfirmOpen(false);
          }}
        >
          <div className="bk-modal" role="dialog" aria-modal="true" aria-labelledby="bk-modal-title">
            <div className="bk-modal-head">
              <h2 id="bk-modal-title">{t.confirm}</h2>
              <p>{t.modalSub}</p>
            </div>

            <div className="bk-modal-block">
              <h3>{t.modalSummary}</h3>
              <div className="bk-modal-course">
                <strong>{course?.name}</strong>
                <p>
                  {student?.name}
                  {student?.age ? ` · ${fill(t.ageYears, { n: student.age })}` : ""}
                </p>
              </div>
              <div className="bk-modal-lines">
                <p className="bk-line">
                  <CalendarIcon />
                  {dateFormatter.format(dayDate(dayKey(selectedSession.starts_at)))}
                </p>
                <p className="bk-line">
                  <ClockIcon />
                  {rangeLabel(selectedSession)}
                  {selectedSession.teacher_name ? ` · ${selectedSession.teacher_name}` : ""}
                </p>
                <p className="bk-muted">{fill(t.studio, { room: selectedSession.room || "—" })}</p>
              </div>
            </div>

            <hr />

            <div className="bk-rows">
              <div>
                <span>{t.balanceBefore}</span>
                <b>{fill(t.timesUnit, { n: remaining })}</b>
              </div>
              <div>
                <span>{t.balanceUse}</span>
                <b>{t.useOne}</b>
              </div>
              <div>
                <span>{t.balanceAfter}</span>
                <b className="is-big">{fill(t.timesUnit, { n: remaining - 1 })}</b>
              </div>
            </div>

            <hr />

            <div className="bk-modal-block">
              <h3>{t.policyHeading}</h3>
              <ul className="bk-policy">
                <li>{fill(t.policyItem1, { min: CANCEL_MINUTES })}</li>
                <li>{t.policyItem2}</li>
              </ul>
            </div>

            <label className="bk-modal-ack">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
              />
              <span>{fill(t.ack, { min: CANCEL_MINUTES })}</span>
            </label>

            <div className="bk-modal-actions">
              <button
                type="button"
                className="bk-outline bk-full"
                disabled={submitting}
                onClick={() => setConfirmOpen(false)}
              >
                {t.backEdit}
              </button>
              <button
                type="button"
                className="bk-primary bk-full"
                disabled={!acknowledged || submitting}
                onClick={confirm}
              >
                {submitting ? t.confirming : t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookClass;