import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import "../styles/ParentReschedule.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";
import useSession from "../lib/useSession";
import { supabase } from "../lib/supabase";

// ---------------------------------------------------------------
// Settings
// ---------------------------------------------------------------
const TZ = "Asia/Bangkok";
const CANCEL_MINUTES = 30; // ต้องตรงกับค่า 30 นาทีใน SQL (reschedule_booking)
const PARENT_AREA_PATH = "/parent-portal";
const SCHEDULE_PATH = "/parent-schedule";
const HISTORY_PATH = "/parent-history";
const PACKAGES_PATH = "/parent-packages";
const LOGIN_PATH = "/login";
const LINE_URL = "https://line.me/R/ti/p/%40digiworldphuket";
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

const translations = {
  th: {
    eyebrow: "PARENT PORTAL / RESCHEDULE",
    title: "เลื่อนคลาส",
    subtitle: "เปลี่ยนวันเรียนของ{name}เป็นรอบที่สะดวก โดยไม่เสียครั้งเรียนเพิ่ม",
    guardian: "บัญชีครอบครัว · เข้าสู่ระบบแล้ว",
    tabKids: "บุตรหลานของฉัน",
    tabSchedule: "ตารางเรียน",
    tabHistory: "ประวัติการเรียน",
    tabPackages: "แพ็กเกจและชำระเงิน",
    back: "← กลับตารางเรียน",
    oldTitle: "คลาสเดิมที่ต้องการเลื่อน",
    oldBadge: "ยืนยันแล้ว · หัก 1 ครั้งเมื่อจองแล้ว",
    bookingNo: "เลขที่การจอง {code}",
    pkgLine: "แพ็กเกจ {n} ครั้ง · ไม่มีวันหมดอายุ",
    age: "อายุ {n} ปี",
    room: "ห้อง {room}",
    minutes: "{n} นาที",
    pickTitle: "เลือกรอบเรียนใหม่",
    pickSub: "รอบของ {course} · {studio}",
    dateLabel: "วันที่ต้องการเรียน",
    noOptions: "ยังไม่มีรอบอื่นของคอร์สนี้ในตอนนี้ กรุณาติดต่อโรงเรียนทาง LINE",
    seatsOf: "ว่าง {left} / {cap} ที่นั่ง",
    full: "เต็ม · 0 / {cap} ที่นั่ง",
    picked: "เลือกรอบนี้แล้ว",
    cannotPick: "เลือกรอบนี้ไม่ได้",
    tapPick: "แตะเพื่อเลือก",
    notFoundHint: "ไม่พบรอบที่สะดวก? เปลี่ยนวันที่เพื่อดูรอบอื่นได้",
    ruleTitle: "เลื่อนได้ล่วงหน้าอย่างน้อย {w}",
    ruleUntil: "รายการนี้เลื่อนได้ถึง {date} เวลา {time} น.",
    ruleLate: "หากเหลือไม่ถึง {w} กรุณาติดต่อโรงเรียนเพื่อขอความช่วยเหลือ",
    ruleExpired: "เลยกำหนดเลื่อนผ่านเว็บแล้ว กรุณาติดต่อโรงเรียนทาง LINE",
    reviewTitle: "ตรวจสอบการเลื่อนคลาส",
    statusWaiting: "รอยืนยัน · ยังไม่เปลี่ยนวันเรียน",
    statusNoPick: "ยังไม่ได้เลือกรอบใหม่",
    oldLabel: "เดิม",
    newLabel: "ใหม่ →",
    extraCost: "ค่าใช้จ่ายเพิ่มเติม",
    extraSessions: "ครั้งเรียนที่หักเพิ่ม",
    balance: "ยังไม่จอง ก่อน → หลังเลื่อน",
    times: "{n} ครั้ง",
    sum: "เรียนแล้ว {done} + จองแล้ว {booked} + ยังไม่จอง {open} = {total} ครั้ง",
    keepNote:
      "คลาสเดิมยังคงอยู่จนกว่าจะเลื่อนสำเร็จ เมื่อสำเร็จ รอบใหม่จะแทนที่รอบเดิมในการจอง {code} ไม่สร้างการจองซ้ำและไม่คืนครั้งเรียน",
    confirm: "ยืนยันเลื่อนคลาส · ไม่หักเพิ่ม",
    confirming: "กำลังเลื่อนคลาส...",
    keep: "กลับโดยคงคลาสเดิม",
    checkTitle: "ตรวจสอบอีกครั้งเมื่อกดยืนยัน เพื่อให้วันเรียนของลูกไม่สะดุด",
    check1: "ระบบจะตรวจที่นั่งว่าง ยอดแพ็กเกจ และเวลาเรียนที่อาจชนกับคลาสอื่นก่อนยืนยัน",
    check2: "หากรอบใหม่เต็มหรือเลื่อนไม่สำเร็จ คลาสเดิมจะยังอยู่ และยอดยังไม่จองคงเดิม {n} ครั้ง โดยไม่หักเพิ่ม",
    successTitle: "เลื่อนคลาสสำเร็จ",
    successText: "รอบเรียนของ{name}เปลี่ยนเป็น {when} แล้ว ไม่มีการหักครั้งเรียนเพิ่ม",
    successBtn: "กลับตารางเรียน",
    optionsErrorTitle: "ยังเปิดรอบให้เลือกไม่ได้",
    optionsErrorText: "ระบบเลื่อนคลาสยังไม่พร้อมใช้งาน กรุณาติดต่อทีมงานทาง LINE",
    contactLine: "ติดต่อทาง LINE",
    errTooLate: "เลยกำหนดเลื่อนคลาสแล้ว กรุณาติดต่อโรงเรียน",
    errFull: "รอบที่เลือกเต็มแล้ว คลาสเดิมยังอยู่ กรุณาเลือกรอบอื่น",
    errAlready: "บุตรหลานจองรอบนี้ไว้แล้ว กรุณาเลือกรอบอื่น",
    errConflict: "เวลาเรียนชนกับคลาสอื่นของบุตรหลาน กรุณาเลือกรอบอื่น",
    errCourse: "รอบที่เลือกไม่ใช่คอร์สเดียวกัน",
    errSession: "ไม่พบรอบที่เลือก กรุณารีเฟรชหน้าแล้วลองอีกครั้ง",
    errBooking: "ไม่พบการจองนี้",
    errNoFn: "ระบบเลื่อนคลาสยังไม่พร้อมใช้งาน กรุณาติดต่อทีมงานทาง LINE",
    errGeneric: "เลื่อนคลาสไม่สำเร็จ คลาสเดิมยังอยู่ กรุณาลองอีกครั้งหรือติดต่อทาง LINE",
    hoursUnit: "{n} ชม.",
    minutesUnit: "{n} นาที",
    loading: "กำลังโหลด...",
    loadError: "โหลดข้อมูลไม่สำเร็จ",
    loadErrorText: "กรุณาลองอีกครั้ง หรือติดต่อทาง LINE",
    retry: "ลองอีกครั้ง",
    loginTitle: "กรุณาเข้าสู่ระบบเพื่อเข้าพื้นที่ผู้ปกครอง",
    loginBtn: "เข้าสู่ระบบ",
    notFoundTitle: "ไม่พบการจองนี้",
    notFoundText: "การจองอาจถูกยกเลิกแล้ว หรือไม่ใช่ของบัญชีนี้",
  },
  en: {
    eyebrow: "PARENT PORTAL / RESCHEDULE",
    title: "Reschedule class",
    subtitle: "Move {name}'s class to a time that suits you, at no extra session cost.",
    guardian: "Family account · Signed in",
    tabKids: "My children",
    tabSchedule: "Schedule",
    tabHistory: "Class history",
    tabPackages: "Packages & payments",
    back: "← Back to schedule",
    oldTitle: "Class to reschedule",
    oldBadge: "Confirmed · 1 session deducted at booking",
    bookingNo: "Booking no. {code}",
    pkgLine: "{n}-session package · Never expires",
    age: "{n} yrs old",
    room: "{room} room",
    minutes: "{n} min",
    pickTitle: "Choose a new session",
    pickSub: "{course} sessions · {studio}",
    dateLabel: "Preferred date",
    noOptions: "No other sessions for this course right now. Please contact the school on LINE.",
    seatsOf: "{left} / {cap} seats open",
    full: "Full · 0 / {cap} seats",
    picked: "Selected",
    cannotPick: "Can't select",
    tapPick: "Tap to select",
    notFoundHint: "Can't find a time? Change the date to see other sessions.",
    ruleTitle: "Reschedule at least {w} ahead",
    ruleUntil: "This booking can be moved until {date} at {time}",
    ruleLate: "If less than {w} remain, please contact the school for help.",
    ruleExpired: "The online reschedule deadline has passed. Please contact the school on LINE.",
    reviewTitle: "Review reschedule",
    statusWaiting: "Pending · class not changed yet",
    statusNoPick: "No new session selected",
    oldLabel: "From",
    newLabel: "To →",
    extraCost: "Extra cost",
    extraSessions: "Extra sessions deducted",
    balance: "Not booked: before → after",
    times: "{n} left",
    sum: "Attended {done} + booked {booked} + not booked {open} = {total} sessions",
    keepNote:
      "The original class stays until the change succeeds. Then the new session replaces the old one in booking {code} — no duplicate booking and no session refund.",
    confirm: "Confirm reschedule · no extra deduction",
    confirming: "Rescheduling...",
    keep: "Keep original class",
    checkTitle: "We re-check when you confirm so your child's class isn't disrupted",
    check1: "The system checks open seats, package balance and clashes with other classes before confirming.",
    check2: "If the new session is full or the change fails, the original class stays and the not-booked balance stays at {n}.",
    successTitle: "Class rescheduled",
    successText: "{name}'s class is now on {when}. No extra session was deducted.",
    successBtn: "Back to schedule",
    optionsErrorTitle: "Can't load sessions yet",
    optionsErrorText: "Online rescheduling isn't available yet. Please contact us on LINE.",
    contactLine: "Contact us on LINE",
    errTooLate: "The reschedule deadline has passed. Please contact the school.",
    errFull: "That session is full. Your original class is unchanged — please pick another.",
    errAlready: "Your child is already booked in that session. Please pick another.",
    errConflict: "That time clashes with another class. Please pick another.",
    errCourse: "That session is for a different course.",
    errSession: "Session not found. Please refresh and try again.",
    errBooking: "Booking not found.",
    errNoFn: "Online rescheduling isn't available yet. Please contact us on LINE.",
    errGeneric: "Couldn't reschedule. Your original class is unchanged. Try again or contact us on LINE.",
    hoursUnit: "{n} hr",
    minutesUnit: "{n} min",
    loading: "Loading...",
    loadError: "Couldn't load your data",
    loadErrorText: "Please try again or contact us on LINE.",
    retry: "Try again",
    loginTitle: "Please sign in to open the parent area",
    loginBtn: "Sign in",
    notFoundTitle: "Booking not found",
    notFoundText: "It may have been cancelled, or it doesn't belong to this account.",
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
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="#2864D7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------
// Page
// ---------------------------------------------------------------
function ParentReschedule() {
  const { id } = useParams();
  const [language, setLanguage] = useLanguage();
  const { session, loading: sessionLoading } = useSession();
  const user = session?.user;
  const userId = user?.id;
  const t = translations[language] || translations.en;
  const locale = LOCALES[language] || LOCALES.en;

  const [booking, setBooking] = useState(null);
  const [packages, setPackages] = useState([]);
  const [mine, setMine] = useState([]);
  const [options, setOptions] = useState([]);
  const [optionsFailed, setOptionsFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const [dateKey, setDateKey] = useState("");
  const [pickId, setPickId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(null);

  const stampFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }),
    [locale]
  );
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
  const longLabel = (iso) => {
    const parts = Object.fromEntries(
      longFormatter.formatToParts(new Date(iso)).map((p) => [p.type, p.value])
    );
    const weekday = (parts.weekday || "").replace(/^วัน/, "");
    return `${weekday} ${parts.day} ${parts.month} ${parts.year}`;
  };

  // ---------- Load ----------
  const load = useCallback(async () => {
    setFailed(false);
    setBooking(null);
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, status, session_id, student_id, students(id, name, full_name, english_name, age), class_sessions(id, course_id, starts_at, duration_min, teacher_name, room)"
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Load booking error:", error);
      setFailed(true);
      return;
    }
    if (!data || data.status !== "confirmed" || !data.class_sessions || !data.students) {
      setBooking(null);
      return;
    }
    setBooking(data);

    const [pkgRows, mineRows, opts] = await Promise.all([
      safe(supabase.from("packages").select("*").eq("student_id", data.student_id), "packages"),
      safe(
        supabase
          .from("bookings")
          .select("id, status, class_sessions(course_id, starts_at)")
          .eq("student_id", data.student_id)
          .eq("status", "confirmed"),
        "my bookings"
      ),
      supabase.rpc("reschedule_options", { p_booking_id: String(id) }),
    ]);
    setPackages(pkgRows);
    setMine(mineRows);
    if (opts.error) {
      console.warn("reschedule_options:", opts.error.message);
      setOptions([]);
      setOptionsFailed(true);
    } else {
      setOptionsFailed(false);
      setOptions(Array.isArray(opts.data) ? opts.data : []);
    }
  }, [id]);

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

  // ---------- Derived ----------
  const old = booking?.class_sessions;
  const student = booking?.students;

  const summary = useMemo(() => {
    if (!old) return { total: 0, open: 0, booked: 0, done: 0, price: null };
    const pkgs = packages
      .filter((p) => p.course_id === old.course_id)
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
    const total = pkgs.reduce((n, p) => n + (p.total_sessions || 0), 0);
    const open = pkgs.reduce((n, p) => n + (p.sessions_remaining || 0), 0);
    const now = Date.now();
    const booked = mine.filter(
      (b) =>
        b.class_sessions &&
        b.class_sessions.course_id === old.course_id &&
        new Date(b.class_sessions.starts_at).getTime() > now
    ).length;
    const doneCount = Math.max(total - open - booked, 0);
    return { total, open, booked, done: doneCount, price: pkgs.length ? pkgs[pkgs.length - 1].price : null };
  }, [old, packages, mine]);

  const opts = useMemo(
    () =>
      options
        .filter((o) => o && o.starts_at)
        .map((o) => {
          const cap = typeof o.capacity === "number" ? o.capacity : null;
          const left = cap === null ? null : Math.max(cap - (o.booked || 0), 0);
          return { ...o, cap, left, full: left !== null && left <= 0 };
        })
        .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)),
    [options]
  );

  const days = useMemo(() => {
    const map = new Map();
    opts.forEach((o) => {
      const key = dayKey(o.starts_at);
      if (!map.has(key)) map.set(key, { key, iso: o.starts_at, free: false });
      if (!o.full) map.get(key).free = true;
    });
    return [...map.values()];
  }, [opts]);

  useEffect(() => {
    if (!days.length) return;
    if (!days.some((d) => d.key === dateKey)) {
      const first = days.find((d) => d.free) || days[0];
      setDateKey(first.key);
      setPickId("");
    }
  }, [days, dateKey]);

  const daySessions = opts.filter((o) => dayKey(o.starts_at) === dateKey);
  const picked = opts.find((o) => String(o.id) === pickId && !o.full) || null;

  const deadline = old ? new Date(new Date(old.starts_at).getTime() - CANCEL_MINUTES * 60000) : null;
  const canChange = Boolean(deadline && deadline.getTime() > Date.now());

  const windowText =
    CANCEL_MINUTES % 60 === 0
      ? fill(t.hoursUnit, { n: CANCEL_MINUTES / 60 })
      : fill(t.minutesUnit, { n: CANCEL_MINUTES });

  const parentName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "");

  const errorText = (error) => {
    const msg = `${error?.message || ""} ${error?.details || ""}`;
    if (msg.includes("too_late")) return t.errTooLate;
    if (msg.includes("session_full")) return t.errFull;
    if (msg.includes("already_booked")) return t.errAlready;
    if (msg.includes("time_conflict")) return t.errConflict;
    if (msg.includes("wrong_course")) return t.errCourse;
    if (msg.includes("session_not_found")) return t.errSession;
    if (msg.includes("booking_not_found")) return t.errBooking;
    if (error?.code === "PGRST202" || /function/i.test(msg)) return t.errNoFn;
    return t.errGeneric;
  };

  const confirm = async () => {
    if (!picked || submitting || !canChange) return;
    setSubmitting(true);
    setSubmitError("");
    const { error } = await supabase.rpc("reschedule_booking", {
      p_booking_id: String(id),
      p_new_session_id: String(picked.id),
    });
    setSubmitting(false);
    if (error) {
      console.error("reschedule_booking:", error);
      setSubmitError(errorText(error));
      return;
    }
    setDone(picked);
  };

  // ---------- Gates ----------
  const gate = (title, text, action) => (
    <div className="rs-container">
      <section className="rs-card rs-gate">
        <h2>{title}</h2>
        {text && <p>{text}</p>}
        {action}
      </section>
    </div>
  );

  const tabs = (
    <div className="rs-tabs" role="tablist">
      <Link className="rs-tab" to={PARENT_AREA_PATH} role="tab" aria-selected="false">
        {t.tabKids}
      </Link>
      <Link className="rs-tab is-on" to={SCHEDULE_PATH} role="tab" aria-selected="true">
        {t.tabSchedule}
      </Link>
      <Link className="rs-tab" to={HISTORY_PATH} role="tab" aria-selected="false">
        {t.tabHistory}
      </Link>
      <Link className="rs-tab" to={PACKAGES_PATH} role="tab" aria-selected="false">
        {t.tabPackages}
      </Link>
    </div>
  );

  let body;
  if (sessionLoading || loading) {
    body = gate(t.loading);
  } else if (!user) {
    body = gate(
      t.loginTitle,
      "",
      <Link className="rs-btn is-primary" to={LOGIN_PATH}>
        {t.loginBtn}
      </Link>
    );
  } else if (failed) {
    body = gate(
      t.loadError,
      t.loadErrorText,
      <button type="button" className="rs-btn is-primary" onClick={reload}>
        {t.retry}
      </button>
    );
  } else if (!booking) {
    body = gate(
      t.notFoundTitle,
      t.notFoundText,
      <Link className="rs-btn is-primary" to={SCHEDULE_PATH}>
        {t.successBtn}
      </Link>
    );
  } else {
    const code = bookingCode(booking.id);
    const oldWhen = `${stampFormatter.format(new Date(old.starts_at))} · ${rangeLabel(old)}`;
    const teacherRoom = [old.teacher_name, old.room ? fill(t.room, { room: old.room }) : null]
      .filter(Boolean)
      .join(" · ");

    body = (
      <div className="rs-container">
        {/* Head */}
        <header className="rs-head">
          <div>
            <p className="rs-eyebrow">{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p className="rs-sub">{fill(t.subtitle, { name: student.name })}</p>
          </div>
          <div className="rs-parent">
            <span className="rs-avatar" style={{ background: "#EDE8FF" }} aria-hidden="true">
              {initialOf(parentName)}
            </span>
            <div>
              <strong>{parentName}</strong>
              <small>{t.guardian}</small>
            </div>
          </div>
        </header>

        {tabs}

        <Link className="rs-back" to={SCHEDULE_PATH}>
          {t.back}
        </Link>

        {/* Original class */}
        <section className="rs-card rs-old">
          <div className="rs-old-head">
            <h2>{t.oldTitle}</h2>
            <span className="rs-pill is-green">{t.oldBadge}</span>
          </div>
          <div className="rs-old-main">
            <div className="rs-old-who">
              <span className="rs-avatar is-sm" style={{ background: "#E4F1FF" }} aria-hidden="true">
                {initialOf(student.name)}
              </span>
              <div>
                <strong>{[student.name, student.english_name].filter(Boolean).join(" / ")}</strong>
                <small>
                  {[student.full_name, student.age ? fill(t.age, { n: student.age }) : null]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
              </div>
            </div>
            <div className="rs-old-course">
              <strong>{courseName(old.course_id)}</strong>
              <small>{[teacherRoom, STUDIO].filter(Boolean).join(" · ")}</small>
            </div>
            <div className="rs-old-when">
              <strong>{longLabel(old.starts_at)}</strong>
              <span>
                {rangeLabel(old)} · {fill(t.minutes, { n: old.duration_min })}
              </span>
            </div>
          </div>
          <hr />
          <div className="rs-old-foot">
            <small>{fill(t.bookingNo, { code })}</small>
            <small>
              {[
                summary.total ? fill(t.pkgLine, { n: summary.total }) : null,
                summary.price ? `฿${Number(summary.price).toLocaleString("en-US")}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </small>
          </div>
        </section>

        {done ? (
          <section className="rs-card rs-success">
            <h2>{t.successTitle}</h2>
            <p>
              {fill(t.successText, {
                name: student.name,
                when: `${stampFormatter.format(new Date(done.starts_at))} · ${rangeLabel(done)}`,
              })}
            </p>
            <Link className="rs-btn is-primary" to={SCHEDULE_PATH}>
              {t.successBtn}
            </Link>
          </section>
        ) : (
          <div className="rs-layout">
            {/* Left */}
            <div className="rs-left">
              <section className="rs-card rs-pick">
                <div>
                  <h2>{t.pickTitle}</h2>
                  <p className="rs-muted">
                    {fill(t.pickSub, { course: courseName(old.course_id), studio: STUDIO })}
                  </p>
                </div>

                {optionsFailed ? (
                  <div className="rs-empty">
                    <strong>{t.optionsErrorTitle}</strong>
                    <p>{t.optionsErrorText}</p>
                    <a className="rs-btn is-primary" href={LINE_URL} target="_blank" rel="noopener noreferrer">
                      {t.contactLine}
                    </a>
                  </div>
                ) : days.length === 0 ? (
                  <div className="rs-empty">
                    <p>{t.noOptions}</p>
                    <a className="rs-btn is-primary" href={LINE_URL} target="_blank" rel="noopener noreferrer">
                      {t.contactLine}
                    </a>
                  </div>
                ) : (
                  <>
                    <label className="rs-field">
                      <span>{t.dateLabel}</span>
                      <div className="rs-select">
                        <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
                          <rect x="2.4" y="3.5" width="14.2" height="13.4" rx="2.4" stroke="#2864D7" strokeWidth="1.6" />
                          <path d="M2.4 7.6h14.2M6.3 2v3M12.7 2v3" stroke="#2864D7" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                        <select
                          value={dateKey}
                          onChange={(e) => {
                            setDateKey(e.target.value);
                            setPickId("");
                          }}
                        >
                          {days.map((d) => (
                            <option key={d.key} value={d.key}>
                              {longLabel(d.iso)}
                            </option>
                          ))}
                        </select>
                        <ChevronIcon />
                      </div>
                    </label>

                    <div className="rs-slots">
                      {daySessions.map((o) => {
                        const on = String(o.id) === pickId && !o.full;
                        const seats =
                          o.left === null
                            ? ""
                            : o.full
                            ? fill(t.full, { cap: o.cap })
                            : fill(t.seatsOf, { left: o.left, cap: o.cap });
                        return (
                          <button
                            type="button"
                            key={o.id}
                            disabled={o.full}
                            className={`rs-slot${on ? " is-on" : ""}${o.full ? " is-full" : ""}`}
                            onClick={() => setPickId(String(o.id))}
                          >
                            <span className="rs-radio" aria-hidden="true">
                              {on ? "✓" : o.full ? "–" : ""}
                            </span>
                            <span className="rs-slot-main">
                              <strong>{rangeLabel(o)}</strong>
                              <small>
                                {[
                                  o.teacher_name,
                                  o.room ? fill(t.room, { room: o.room }) : null,
                                  fill(t.minutes, { n: o.duration_min }),
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </small>
                            </span>
                            <span className="rs-slot-side">
                              {seats && <b>{seats}</b>}
                              <small>{o.full ? t.cannotPick : on ? t.picked : t.tapPick}</small>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="rs-muted">{t.notFoundHint}</p>
                  </>
                )}
              </section>

              <div className="rs-note">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="10" cy="10" r="8.1" stroke="#2864D7" strokeWidth="1.8" />
                  <path d="M10 9v5" stroke="#2864D7" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="10" cy="6.2" r="1" fill="#2864D7" />
                </svg>
                <div>
                  <strong>{fill(t.ruleTitle, { w: windowText })}</strong>
                  {canChange ? (
                    <>
                      <p>
                        {fill(t.ruleUntil, {
                          date: shortFormatter.format(deadline),
                          time: hhmm(deadline.toISOString()),
                        })}
                      </p>
                      <p className="is-muted">{fill(t.ruleLate, { w: windowText })}</p>
                    </>
                  ) : (
                    <p>{t.ruleExpired}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: review */}
            <aside className="rs-card rs-review">
              <h2>{t.reviewTitle}</h2>
              <span className="rs-pill is-yellow">{picked ? t.statusWaiting : t.statusNoPick}</span>

              <div className="rs-compare">
                <div className="rs-compare-row">
                  <span className="rs-compare-label">{t.oldLabel}</span>
                  <div>
                    <strong>{oldWhen}</strong>
                    <small>{teacherRoom}</small>
                  </div>
                </div>
                <div className="rs-compare-row is-new">
                  <span className="rs-compare-label">{t.newLabel}</span>
                  <div>
                    <strong>
                      {picked
                        ? `${stampFormatter.format(new Date(picked.starts_at))} · ${rangeLabel(picked)}`
                        : "—"}
                    </strong>
                    <small>
                      {picked
                        ? [
                            picked.teacher_name,
                            picked.room ? fill(t.room, { room: picked.room }) : null,
                            fill(t.minutes, { n: picked.duration_min }),
                          ]
                            .filter(Boolean)
                            .join(" · ")
                        : ""}
                    </small>
                  </div>
                </div>
              </div>

              <hr />

              <dl className="rs-sum">
                <div>
                  <dt>{t.extraCost}</dt>
                  <dd>฿0</dd>
                </div>
                <div>
                  <dt>{t.extraSessions}</dt>
                  <dd>{fill(t.times, { n: 0 })}</dd>
                </div>
                <div>
                  <dt>{t.balance}</dt>
                  <dd className="is-big">
                    {summary.open} → {summary.open} {language === "th" ? "ครั้ง" : ""}
                  </dd>
                </div>
              </dl>
              <small className="rs-muted">
                {fill(t.sum, {
                  done: summary.done,
                  booked: summary.booked,
                  open: summary.open,
                  total: summary.total,
                })}
              </small>

              <hr />

              <p className="rs-keep">{fill(t.keepNote, { code })}</p>

              {submitError && (
                <div className="rs-alert" role="alert">
                  {submitError}
                </div>
              )}

              <div className="rs-actions">
                <button
                  type="button"
                  className="rs-btn is-primary is-block"
                  disabled={!picked || submitting || !canChange}
                  onClick={confirm}
                >
                  {submitting ? t.confirming : t.confirm}
                </button>
                <Link className="rs-btn is-outline is-block" to={SCHEDULE_PATH}>
                  {t.keep}
                </Link>
              </div>
            </aside>
          </div>
        )}

        {/* Bottom check note */}
        <div className="rs-note">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 2l6 2.5v5c0 4-2.6 6.6-6 8-3.4-1.4-6-4-6-8v-5L10 2z"
              stroke="#2864D7"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <strong>{t.checkTitle}</strong>
            <p>{t.check1}</p>
            <p>{fill(t.check2, { n: summary.open })}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rs-page">
      <SiteHeader language={language} onLanguageChange={setLanguage} />
      {body}
      <SiteFooter language={language} />
    </div>
  );
}

export default ParentReschedule;