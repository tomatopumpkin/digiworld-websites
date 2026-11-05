import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/BookClass.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";
import useSession from "../lib/useSession";
import { supabase } from "../lib/supabase";

// ---------------------------------------------------------------
// ตั้งค่า (แก้ path ให้ตรงกับ router ของคุณ)
// ---------------------------------------------------------------
const TZ = "Asia/Bangkok";
const WEEKS_AHEAD = 4;
const PARENT_AREA_PATH = "/parent-portal";
const LOGIN_PATH = "/login";
const COURSES_PATH = "/courses";
const DAY_MS = 86400000;

// ชื่อคอร์สตรงกับหน้า Courses
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

// ตอนนี้มีไทย + อังกฤษ (ภาษาอื่นจะใช้อังกฤษไปก่อน) เพิ่ม zh / ru ได้ด้วยการคัดลอกโครงสร้างเดียวกัน
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
    remainingCount: "{n} ครั้ง",
    notBooked: "ที่ยังไม่ได้จอง",
    pickSession: "เลือกรอบเรียน",
    course: "คอร์ส",
    week: "สัปดาห์",
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
    policyTitle: "นโยบายยกเลิก / เลื่อน ≥24 ชม.",
    policyText:
      "ยกเลิก ≥24 ชม. คืน 1 ครั้ง · เลื่อนเข้ารอบว่างโดยไม่หักเพิ่ม · ภายใน 24 ชม. หรือไม่มาเรียน ไม่คืนครั้ง",
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
    ack: "ฉันรับทราบนโยบายเลื่อน / ยกเลิก ≥24 ชม. และหัก 1 ครั้งเมื่อจองสำเร็จเท่านั้น",
    confirm: "ยืนยันการจอง",
    confirming: "กำลังจอง...",
    summaryFoot: "ใช้แพ็กเกจที่มีอยู่ · หักครั้งเมื่อจองสำเร็จเท่านั้น",
    bookAnother: "จองรอบอื่นเพิ่ม",
    noCreditsTitle: "ไม่มีครั้งคงเหลือสำหรับคอร์สนี้",
    noCreditsText: "ซื้อคอร์สเพิ่มเพื่อจองคลาสต่อ",
    buy: "ดูคอร์สและราคา",
    loginTitle: "กรุณาเข้าสู่ระบบก่อนจองคลาส",
    loginBtn: "เข้าสู่ระบบ",
    noStudentsTitle: "ยังไม่มีข้อมูลเด็กในบัญชีนี้",
    noStudentsText: "กรุณาติดต่อทีมงานเพื่อเพิ่มข้อมูลเด็กและแพ็กเกจ",
    err_SESSION_FULL: "ขออภัย ที่นั่งเต็มแล้ว ยังไม่มีการจองและไม่หักครั้ง กรุณาเลือกรอบใหม่",
    err_TIME_CONFLICT: "เด็กมีคลาสอื่นในเวลาที่ทับกัน กรุณาเลือกรอบใหม่",
    err_NO_CREDITS: "ไม่มีครั้งคงเหลือสำหรับคอร์สนี้",
    err_SESSION_NOT_OPEN: "รอบนี้ปิดรับจองแล้ว กรุณาเลือกรอบใหม่",
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
    remainingCount: "{n} left",
    notBooked: "not yet booked",
    pickSession: "Choose a session",
    course: "Course",
    week: "Week",
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
    policyTitle: "Cancel / reschedule ≥24 hrs",
    policyText:
      "Cancel ≥24 hrs: 1 session refunded · Reschedule into an open slot at no extra cost · Within 24 hrs or no-show: no refund",
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
    ack: "I understand the cancel / reschedule ≥24 hrs policy and that 1 session is deducted only when booking succeeds.",
    confirm: "Confirm booking",
    confirming: "Booking...",
    summaryFoot: "Uses your existing package · deducted only on success",
    bookAnother: "Book another session",
    noCreditsTitle: "No sessions left for this course",
    noCreditsText: "Buy more sessions to keep booking.",
    buy: "View courses & prices",
    loginTitle: "Please sign in to book a class",
    loginBtn: "Sign in",
    noStudentsTitle: "No children on this account yet",
    noStudentsText: "Please contact our team to add your child and package.",
    err_SESSION_FULL: "Sorry, that session just filled up. Nothing was booked or deducted. Please pick another.",
    err_TIME_CONFLICT: "Your child already has a class at an overlapping time. Please pick another.",
    err_NO_CREDITS: "No sessions left for this course.",
    err_SESSION_NOT_OPEN: "This session is no longer open. Please pick another.",
    err_GENERIC: "Unable to book right now. Please try again or contact us on LINE.",
  },
};

// ---------------------------------------------------------------
// ตัวช่วย
// ---------------------------------------------------------------
const fill = (text, values) =>
  Object.entries(values).reduce((r, [k, v]) => r.split(`{${k}}`).join(v), text);

// ทุกอย่างอิงเวลาไทย ไม่ขึ้นกับ timezone ของเครื่องผู้ใช้
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

const KNOWN_ERRORS = ["SESSION_FULL", "TIME_CONFLICT", "NO_CREDITS", "SESSION_NOT_OPEN"];

// ---------------------------------------------------------------
// หน้าหลัก
// ---------------------------------------------------------------
function BookClass() {
  const [language, setLanguage] = useLanguage();
  const { session } = useSession();
  const user = session?.user;
  const t = translations[language] || translations.en;
  const locale = LOCALES[language] || LOCALES.en;

  const [loadingInit, setLoadingInit] = useState(true);
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [packages, setPackages] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [weekIdx, setWeekIdx] = useState(0);
  const [timeFilter, setTimeFilter] = useState("");
  const [activeDay, setActiveDay] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState("");
  const [done, setDone] = useState(null);

  // เริ่มจากพรุ่งนี้ (ตามนโยบายยกเลิก/เลื่อน ≥24 ชม.)
  const tomorrowKey = useMemo(() => dayKey(new Date(Date.now() + DAY_MS)), []);

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

  // ---------- โหลดข้อมูล ----------
  const loadStudents = useCallback(async () => {
    const { data } = await supabase.from("students").select("id, name, age").order("name");
    setStudents(data ?? []);
    setStudentId((prev) => prev || data?.[0]?.id || "");
    setLoadingInit(false);
  }, []);

  const loadStudentData = useCallback(async (id) => {
    const [pk, bk] = await Promise.all([
      supabase
        .from("packages")
        .select("course_id, total_sessions, sessions_remaining")
        .eq("student_id", id),
      supabase
        .from("bookings")
        .select("session_id, class_sessions(starts_at, duration_min)")
        .eq("student_id", id)
        .eq("status", "confirmed"),
    ]);
    setPackages(pk.data ?? []);
    setMyBookings(bk.data ?? []);
  }, []);

  const loadSessions = useCallback(
    async (cid) => {
      setLoadingSessions(true);
      const from = new Date(`${tomorrowKey}T00:00:00+07:00`);
      const to = new Date(from.getTime() + WEEKS_AHEAD * 7 * DAY_MS);
      const { data } = await supabase
        .from("class_sessions")
        .select("id, starts_at, duration_min, capacity, booked_count, teacher_name, room")
        .eq("kind", "regular")
        .eq("status", "open")
        .eq("course_id", cid)
        .gte("starts_at", from.toISOString())
        .lt("starts_at", to.toISOString())
        .order("starts_at");
      setSessions(data ?? []);
      setLoadingSessions(false);
    },
    [tomorrowKey]
  );

  useEffect(() => {
    if (user) loadStudents();
    else setLoadingInit(false);
  }, [user, loadStudents]);

  useEffect(() => {
    if (!studentId) return;
    setPackages([]);
    setMyBookings([]);
    setCourseId("");
    setSelectedId("");
    setDone(null);
    loadStudentData(studentId);
  }, [studentId, loadStudentData]);

  // เลือกคอร์สเริ่มต้น = คอร์สที่ยังมีครั้งเหลือ
  useEffect(() => {
    if (courseId || !packages.length) return;
    const pick = packages.find((p) => p.sessions_remaining > 0) || packages[0];
    setCourseId(pick.course_id);
  }, [packages, courseId]);

  useEffect(() => {
    setSelectedId("");
    setTimeFilter("");
    setActiveDay("");
    if (!courseId) {
      setSessions([]);
      return;
    }
    loadSessions(courseId);
  }, [courseId, loadSessions]);

  // ---------- ค่าที่คำนวณ ----------
  const student = students.find((s) => s.id === studentId);
  const courseOptions = packages.length
    ? COURSES.filter((c) => packages.some((p) => p.course_id === c.id))
    : COURSES;
  const course = COURSES.find((c) => c.id === courseId);
  const coursePackages = packages.filter((p) => p.course_id === courseId);
  const remaining = coursePackages.reduce((n, p) => n + p.sessions_remaining, 0);
  const totalSessions = coursePackages[0]?.total_sessions;

  const days = useMemo(() => {
    const base = dayDate(tomorrowKey).getTime();
    return Array.from({ length: 7 }, (_, i) =>
      dayKey(new Date(base + (weekIdx * 7 + i) * DAY_MS))
    );
  }, [tomorrowKey, weekIdx]);

  const weekSessions = useMemo(
    () => sessions.filter((s) => days.includes(dayKey(s.starts_at))),
    [sessions, days]
  );
  const timeOptions = useMemo(
    () => [...new Set(weekSessions.map(rangeLabel))].sort(),
    [weekSessions]
  );
  const visible = timeFilter ? weekSessions.filter((s) => rangeLabel(s) === timeFilter) : weekSessions;

  const byDay = useMemo(() => {
    const map = {};
    visible.forEach((s) => {
      const k = dayKey(s.starts_at);
      if (!map[k]) map[k] = [];
      map[k].push(s);
    });
    return map;
  }, [visible]);

  const daysWithSessions = days.filter((d) => byDay[d]);
  const emptyDays = days.filter((d) => !byDay[d]);
  const selectedSession = sessions.find((s) => s.id === selectedId);
  const shown = done ? done.session : selectedSession;
  const currentDay = activeDay || daysWithSessions[0] || "";

  const stateOf = (s) => {
    if (s.id === selectedId) return "selected";
    if (myBookings.some((b) => b.session_id === s.id)) return "booked";
    if (s.booked_count >= s.capacity) return "full";
    if (myBookings.some((b) => b.class_sessions && overlaps(b.class_sessions, s))) return "conflict";
    if (remaining <= 0) return "nocredits";
    return "open";
  };

  // ---------- การกระทำ ----------
  const pickSession = (s) => {
    setSelectedId(s.id);
    setActiveDay(dayKey(s.starts_at));
    setErrorKey("");
    setDone(null);
  };

  const jumpToDay = (key) => {
    setActiveDay(key);
    const el = document.getElementById(`bk-day-${key}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const refresh = () => Promise.all([loadStudentData(studentId), loadSessions(courseId)]);

  const confirm = async () => {
    if (!selectedSession || submitting) return;
    setSubmitting(true);
    setErrorKey("");

    const snapshot = { session: selectedSession, before: remaining };
    const { error } = await supabase.rpc("book_class", {
      p_student_id: studentId,
      p_session_id: selectedSession.id,
    });

    setSubmitting(false);

    if (error) {
      console.error("Booking error:", error);
      setErrorKey(KNOWN_ERRORS.find((c) => error.message.includes(c)) || "GENERIC");
      setSelectedId("");
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

  // ---------- หน้าที่ยังไม่พร้อม ----------
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
            {/* เด็ก + ยอดคงเหลือ */}
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
                    {totalSessions && <small>{fill(t.packageLine, { n: totalSessions })}</small>}
                  </div>
                  <div className="bk-balance-num">
                    <b>{fill(t.remainingCount, { n: remaining })}</b>
                    <small>{t.notBooked}</small>
                  </div>
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

            {/* เลือกรอบเรียน */}
            <section className="bk-card">
              <h2>{t.pickSession}</h2>

              <div className="bk-filters">
                <label>
                  <span>{t.course}</span>
                  <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                    {courseOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{t.week}</span>
                  <select
                    value={weekIdx}
                    onChange={(e) => {
                      setWeekIdx(Number(e.target.value));
                      setActiveDay("");
                    }}
                  >
                    {Array.from({ length: WEEKS_AHEAD }, (_, w) => {
                      const base = dayDate(tomorrowKey).getTime();
                      const first = dayKey(new Date(base + w * 7 * DAY_MS));
                      const last = dayKey(new Date(base + (w * 7 + 6) * DAY_MS));
                      return (
                        <option key={w} value={w}>
                          {shortFormatter.format(dayDate(first))} – {shortFormatter.format(dayDate(last))}
                        </option>
                      );
                    })}
                  </select>
                </label>
                <label>
                  <span>{t.time}</span>
                  <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                    <option value="">{t.allTimes}</option>
                    {timeOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="bk-days" role="tablist">
                {days.map((d) => {
                  const has = Boolean(byDay[d]);
                  return (
                    <button
                      key={d}
                      type="button"
                      role="tab"
                      disabled={!has}
                      aria-selected={d === currentDay}
                      className={`bk-day ${d === currentDay ? "is-on" : ""}`}
                      onClick={() => jumpToDay(d)}
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
                <div className="bk-cols">
                  {daysWithSessions.map((d) => (
                    <div className="bk-col" key={d} id={`bk-day-${d}`}>
                      <h3>{dateFormatter.format(dayDate(d))}</h3>

                      {byDay[d].map((s) => {
                        const state = stateOf(s);
                        const left = s.capacity - s.booked_count;
                        const disabled = state !== "open" && state !== "selected";
                        return (
                          <article key={s.id} className={`bk-slot is-${state}`}>
                            <div className="bk-slot-top">
                              <strong>{rangeLabel(s)}</strong>
                              {state === "selected" && <span aria-hidden="true">✓</span>}
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
                  ))}
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

            <div className="bk-note is-blue">
              <div>
                <strong>{t.infoTitle}</strong>
                <p>{t.infoText}</p>
              </div>
            </div>
            <div className="bk-note is-yellow">
              <div>
                <strong>{t.policyTitle}</strong>
                <p>{t.policyText}</p>
              </div>
            </div>
          </div>

          {/* สรุปการจอง */}
          <aside className="bk-side">
            <section className="bk-card bk-summary">
              <h2>{t.summaryTitle}</h2>
              <span className={`bk-status ${done ? "is-done" : ""}`}>
                {done ? t.statusDone : t.statusPending}
              </span>

              {shown ? (
                <div className="bk-sum-info">
                  <strong>{course?.name}</strong>
                  <p>
                    {student?.name}
                    {student?.age ? ` · ${fill(t.ageYears, { n: student.age })}` : ""}
                  </p>
                  <p>📅 {dateFormatter.format(dayDate(dayKey(shown.starts_at)))}</p>
                  <p>
                    🕒 {rangeLabel(shown)}
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
                <p className="bk-alert" role="alert">
                  {t[`err_${errorKey}`]}
                </p>
              )}

              {done ? (
                <button type="button" className="bk-outline bk-full" onClick={() => setDone(null)}>
                  {t.bookAnother}
                </button>
              ) : (
                <>
                  <label className="bk-ack">
                    <input
                      type="checkbox"
                      checked={acknowledged}
                      onChange={(e) => setAcknowledged(e.target.checked)}
                    />
                    <span>{t.ack}</span>
                  </label>

                  <button
                    type="button"
                    className="bk-primary bk-full"
                    disabled={!selectedSession || !acknowledged || remaining <= 0 || submitting}
                    onClick={confirm}
                  >
                    {submitting ? t.confirming : t.confirm}
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
    </div>
  );
}

export default BookClass;
