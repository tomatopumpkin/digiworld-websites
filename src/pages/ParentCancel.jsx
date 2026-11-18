import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import "../styles/ParentCancel.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";
import useSession from "../lib/useSession";
import { supabase } from "../lib/supabase";

const TZ = "Asia/Bangkok";
const CANCEL_MINUTES = 30; // ต้องตรงกับ ParentSchedule.jsx และ cancel_booking ใน Supabase
const PARENT_AREA_PATH = "/parent-portal";
const SCHEDULE_PATH = "/parent-schedule";
const HISTORY_PATH = "/parent-history";
const PACKAGES_PATH = "/parent-packages";
const LOGIN_PATH = "/login";
const LINE_ID = "@digiworldphuket";
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
    crumbPortal: "← Parent Portal",
    crumbSchedule: "ตารางเรียน",
    crumbCancel: "ยกเลิกการจองคลาส",
    title: "ต้องการยกเลิกคลาสนี้ใช่ไหม?",
    titleDone: "ยกเลิกคลาสเรียบร้อยแล้ว",
    subtitle: "ตรวจสอบรายละเอียดและจำนวนครั้งเรียนที่จะได้รับคืน ก่อนยืนยันการยกเลิก",
    subtitleDone: "ระบบคืนครั้งเรียนเข้าแพ็กเกจเดิมของบุตรหลานแล้ว",
    statusPending: "รอการยืนยัน · ยังไม่ยกเลิก",
    statusDone: "ยกเลิกแล้ว · คืน 1 ครั้ง",
    tabKids: "ข้อมูลบุตรหลาน",
    tabSchedule: "ตารางเรียน",
    tabHistory: "ประวัติการเรียน",
    tabPackages: "แพ็กเกจ & การชำระเงิน",
    cardTitle: "การจองที่จะยกเลิก",
    cardTitleDone: "การจองที่ยกเลิกแล้ว",
    booked: "ยืนยันการจองแล้ว",
    cancelled: "ยกเลิกแล้ว",
    student: "ผู้เรียน",
    date: "วันที่",
    time: "เวลา",
    teacher: "ครูผู้สอน",
    place: "สถานที่",
    room: "{room} room",
    age: "อายุ {n} ปี",
    minutes: "{n} นาที",
    bookingNo: "เลขที่การจอง",
    packageLine: "แพ็กเกจเดิม · ไม่มีวันหมดอายุ",
    packageValue: "{n} ครั้ง",
    deductNote: "คลาสนี้หัก 1 ครั้งเมื่อจองแล้ว และจะไม่หักซ้ำเมื่อเข้าเรียน",
    refundOkTitle: "ยังอยู่ในช่วงยกเลิกและรับคืน 1 ครั้ง",
    refundOkUntil: "ยกเลิกได้ถึง {date} เวลา {time}",
    refundOkText: "แจ้งล่วงหน้าอย่างน้อย {w} ก่อนเริ่มคลาส จึงคืนครั้งเรียนให้แพ็กเกจเดิม",
    refundLateTitle: "เลยกำหนดยกเลิกเพื่อรับคืนครั้งแล้ว",
    refundLateText: "เหลือไม่ถึง {w} ก่อนเริ่มคลาส จึงยกเลิกเองในระบบไม่ได้ กรุณาติดต่อโรงเรียน",
    policyText: "หากเหลือไม่ถึง {w} หรือไม่มาเรียน จะไม่คืนครั้งเรียน กรุณาติดต่อโรงเรียน",
    contact: "LINE {line} · ทุกวัน 9:30–18:30",
    sideTitle: "ก่อนยืนยันการยกเลิก",
    sideTitleDone: "สรุปหลังยกเลิก",
    sideText: "การจองยังคงอยู่ และยังไม่มีการคืนครั้งเรียน จนกว่าคุณจะกดยืนยันและยกเลิกสำเร็จ",
    sideTextDone: "ครั้งเรียนถูกคืนเข้าแพ็กเกจเดิมเรียบร้อยแล้ว",
    balanceTitle: "ครั้งเรียนที่ยังไม่ได้จองของ{name}",
    balanceNow: "ยอดปัจจุบัน",
    balanceAfter: "เมื่อยกเลิกสำเร็จ",
    balanceAfterDone: "ยอดหลังยกเลิก",
    timesUnit: "ครั้ง",
    refundTo: "คืนเข้าแพ็กเกจเดิม",
    refundPlus: "+1 ครั้ง",
    refundNote: "คืนเป็นครั้งเรียนเท่านั้น ไม่คืนเงินเป็นเงินสด",
    afterTitle: "เมื่อยกเลิกสำเร็จ",
    afterText:
      "{name}จะไม่มีคลาสนี้ในวันที่ {date} เวลา {range} และที่นั่งเดิมจะเปิดให้ผู้อื่นจอง ไม่มีการสร้างคลาสทดแทนอัตโนมัติ",
    confirm: "ยืนยันยกเลิกและคืน 1 ครั้ง",
    confirming: "กำลังยกเลิก...",
    keep: "เก็บการจองนี้ไว้",
    keepNote: "หากเก็บการจองไว้ ตารางเรียนและยอดครั้งจะไม่เปลี่ยน",
    backSchedule: "กลับไปตารางเรียน",
    bookAgain: "จองคลาสใหม่",
    contactBtn: "ติดต่อโรงเรียนทาง LINE",
    loading: "กำลังโหลด...",
    loginTitle: "กรุณาเข้าสู่ระบบก่อนยกเลิกคลาส",
    loginBtn: "เข้าสู่ระบบ",
    notFoundTitle: "ไม่พบการจองนี้",
    notFoundText: "การจองอาจถูกยกเลิกไปแล้ว หรือไม่ใช่ของบัญชีนี้",
    alreadyTitle: "การจองนี้ถูกยกเลิกไปแล้ว",
    alreadyText: "ตรวจดูตารางเรียนล่าสุดได้ที่หน้าตารางเรียน",
    err_TOO_LATE: "เลยกำหนดยกเลิกแล้ว กรุณาติดต่อโรงเรียนทาง LINE",
    err_ALREADY_CANCELLED: "การจองนี้ถูกยกเลิกไปแล้ว",
    err_SESSION_STARTED: "คลาสนี้เริ่มไปแล้ว ไม่สามารถยกเลิกได้",
    err_GENERIC: "ไม่สามารถยกเลิกได้ในขณะนี้ กรุณาลองอีกครั้ง หรือติดต่อทาง LINE",
    hoursUnit: "{n} ชั่วโมง",
    minutesUnit: "{n} นาที",
  },
  en: {
    crumbPortal: "← Parent Portal",
    crumbSchedule: "Schedule",
    crumbCancel: "Cancel booking",
    title: "Cancel this class?",
    titleDone: "Class cancelled",
    subtitle: "Review the details and the session you'll get back before you confirm.",
    subtitleDone: "The session has been returned to your child's package.",
    statusPending: "Pending · not cancelled yet",
    statusDone: "Cancelled · 1 session refunded",
    tabKids: "My children",
    tabSchedule: "Schedule",
    tabHistory: "Class history",
    tabPackages: "Packages & payments",
    cardTitle: "Booking to cancel",
    cardTitleDone: "Cancelled booking",
    booked: "Booking confirmed",
    cancelled: "Cancelled",
    student: "Student",
    date: "Date",
    time: "Time",
    teacher: "Teacher",
    place: "Location",
    room: "{room} room",
    age: "{n} yrs old",
    minutes: "{n} min",
    bookingNo: "Booking no.",
    packageLine: "Original package · never expires",
    packageValue: "{n} sessions",
    deductNote: "1 session was deducted when you booked, and it won't be deducted again when attending.",
    refundOkTitle: "Still within the refund window (1 session back)",
    refundOkUntil: "Cancel until {date} at {time}",
    refundOkText: "Cancelled at least {w} before class, so the session returns to the original package.",
    refundLateTitle: "The refund deadline has passed",
    refundLateText: "Less than {w} before class, so it can't be cancelled online. Please contact the school.",
    policyText: "Within {w} of class, or if you miss it, no session is refunded. Please contact the school.",
    contact: "LINE {line} · Daily 9:30–18:30",
    sideTitle: "Before you confirm",
    sideTitleDone: "After cancelling",
    sideText: "Your booking stays and no session is returned until you confirm and the cancellation succeeds.",
    sideTextDone: "The session has been returned to the original package.",
    balanceTitle: "{name}'s unbooked sessions",
    balanceNow: "Current balance",
    balanceAfter: "After cancelling",
    balanceAfterDone: "Balance now",
    timesUnit: "left",
    refundTo: "Returned to original package",
    refundPlus: "+1 session",
    refundNote: "Refunded as a session only, not as cash.",
    afterTitle: "Once cancelled",
    afterText:
      "{name} won't have this class on {date} at {range}, and the seat opens up for others. No replacement class is created automatically.",
    confirm: "Cancel and refund 1 session",
    confirming: "Cancelling...",
    keep: "Keep this booking",
    keepNote: "If you keep the booking, your schedule and balance don't change.",
    backSchedule: "Back to schedule",
    bookAgain: "Book a new class",
    contactBtn: "Contact the school on LINE",
    loading: "Loading...",
    loginTitle: "Please sign in to cancel a class",
    loginBtn: "Sign in",
    notFoundTitle: "Booking not found",
    notFoundText: "It may already be cancelled, or it doesn't belong to this account.",
    alreadyTitle: "This booking is already cancelled",
    alreadyText: "Check your latest classes on the schedule page.",
    err_TOO_LATE: "The cancellation deadline has passed. Please contact the school on LINE.",
    err_ALREADY_CANCELLED: "This booking is already cancelled.",
    err_SESSION_STARTED: "This class has already started and can't be cancelled.",
    err_GENERIC: "Unable to cancel right now. Please try again or contact us on LINE.",
    hoursUnit: "{n} hr",
    minutesUnit: "{n} min",
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
const bookingCode = (id) => `DW-${String(id).replace(/-/g, "").slice(0, 8).toUpperCase()}`;

const KNOWN_ERRORS = ["TOO_LATE", "ALREADY_CANCELLED", "SESSION_STARTED"];
const errorKeyFrom = (message) => {
  const msg = message || "";
  return KNOWN_ERRORS.find((c) => msg.includes(c)) || "GENERIC";
};

/* ---------- Icons ---------- */
const Svg = ({ children, size = 20, className }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);
const UserIcon = () => (
  <Svg>
    <circle cx="10" cy="6.5" r="3.2" />
    <path d="M3.5 17c.6-3.3 3.1-5 6.5-5s5.9 1.7 6.5 5" />
  </Svg>
);
const CalendarIcon = () => (
  <Svg>
    <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
    <path d="M3 8.5h14M7 2.5v3M13 2.5v3" />
  </Svg>
);
const ClockIcon = () => (
  <Svg>
    <circle cx="10" cy="10" r="7.5" />
    <path d="M10 6v4.2l2.8 1.6" />
  </Svg>
);
const TeacherIcon = () => (
  <Svg>
    <path d="M10 4L2 8l8 4 8-4-8-4z" />
    <path d="M5.5 10v3.5c0 1 2 2.5 4.5 2.5s4.5-1.5 4.5-2.5V10" />
  </Svg>
);
const PinIcon = () => (
  <Svg>
    <path d="M10 17.5s5.5-4.7 5.5-9.2a5.5 5.5 0 10-11 0c0 4.5 5.5 9.2 5.5 9.2z" />
    <circle cx="10" cy="8.3" r="2" />
  </Svg>
);
const ArrowIcon = () => (
  <Svg size={24} className="pc-arrow">
    <path d="M3.5 10h13M12 5.5l4.5 4.5-4.5 4.5" />
  </Svg>
);
const InfoIcon = () => (
  <Svg size={18}>
    <circle cx="10" cy="10" r="8" />
    <path d="M10 9v5" />
    <circle cx="10" cy="6.2" r="0.6" fill="currentColor" />
  </Svg>
);

function ParentCancel() {
  const { id } = useParams();
  const [language, setLanguage] = useLanguage();
  const { session, loading: sessionLoading } = useSession();
  const user = session?.user;
  const userId = user?.id;
  const t = translations[language] || translations.en;
  const locale = LOCALES[language] || LOCALES.en;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState("");
  const [done, setDone] = useState(null); // { before, after }

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }),
    [locale]
  );

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "*, students(id, name, english_name, age, packages(id, course_id, total_sessions, sessions_remaining, price)), class_sessions(id, course_id, starts_at, duration_min, teacher_name, room)"
      )
      .eq("id", id)
      .maybeSingle();

    if (error) console.error("Load booking error:", error);
    setBooking(data || null);
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

  const student = booking?.students;
  const cls = booking?.class_sessions;
  const packages = student?.packages ?? [];
  const coursePackages = cls ? packages.filter((p) => p.course_id === cls.course_id) : [];
  const originalPackage =
    coursePackages.find((p) => p.id === booking?.package_id) || coursePackages[0] || null;
  const remaining = coursePackages.reduce((n, p) => n + (p.sessions_remaining || 0), 0);

  const deadline = cls ? new Date(new Date(cls.starts_at).getTime() - CANCEL_MINUTES * 60000) : null;
  const canRefund = Boolean(deadline && deadline.getTime() > Date.now());

  const windowText =
    CANCEL_MINUTES % 60 === 0
      ? fill(t.hoursUnit, { n: CANCEL_MINUTES / 60 })
      : fill(t.minutesUnit, { n: CANCEL_MINUTES });

  const confirm = async () => {
    if (!booking || submitting || !canRefund) return;
    setSubmitting(true);
    setErrorKey("");

    const snapshot = { before: remaining, after: remaining + 1 };
    const { error } = await supabase.rpc("cancel_booking", { p_booking_id: booking.id });

    setSubmitting(false);

    if (error) {
      console.error("Cancel error:", error);
      setErrorKey(errorKeyFrom(error.message));
      await load();
      return;
    }

    setDone(snapshot);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const gate = (title, text, action) => (
    <div className="pc-container">
      <section className="pc-card pc-gate">
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
      <Link className="pc-btn is-primary" to={LOGIN_PATH}>
        {t.loginBtn}
      </Link>
    );
  } else if (!booking || !cls || !student) {
    body = gate(
      t.notFoundTitle,
      t.notFoundText,
      <Link className="pc-btn is-primary" to={SCHEDULE_PATH}>
        {t.backSchedule}
      </Link>
    );
  } else if (booking.status !== "confirmed" && !done) {
    body = gate(
      t.alreadyTitle,
      t.alreadyText,
      <Link className="pc-btn is-primary" to={SCHEDULE_PATH}>
        {t.backSchedule}
      </Link>
    );
  } else {
    const before = done ? done.before : remaining;
    const after = done ? done.after : remaining + 1;
    const studentLine = [
      [student.name, student.english_name].filter(Boolean).join(" / "),
      student.age ? fill(t.age, { n: student.age }) : null,
    ]
      .filter(Boolean)
      .join(" · ");
    const dateText = dateFormatter.format(new Date(cls.starts_at));

    body = (
      <div className="pc-container">
        <nav className="pc-crumb" aria-label="breadcrumb">
          <Link to={PARENT_AREA_PATH}>{t.crumbPortal}</Link>
          <span>/</span>
          <Link to={SCHEDULE_PATH}>{t.crumbSchedule}</Link>
          <span>/</span>
          <span>{t.crumbCancel}</span>
        </nav>

        <header className="pc-head">
          <div>
            <h1>{done ? t.titleDone : t.title}</h1>
            <p>{done ? t.subtitleDone : t.subtitle}</p>
          </div>
          <span className={`pc-status ${done ? "is-done" : ""}`}>
            {done ? t.statusDone : t.statusPending}
          </span>
        </header>

        <div className="pc-tabs" role="tablist">
          <Link className="pc-tab" to={PARENT_AREA_PATH} role="tab" aria-selected="false">
            {t.tabKids}
          </Link>
          <Link className="pc-tab is-on" to={SCHEDULE_PATH} role="tab" aria-selected="true">
            {t.tabSchedule}
          </Link>
          <Link className="pc-tab" to={HISTORY_PATH} role="tab" aria-selected="false">
            {t.tabHistory}
          </Link>
          <Link className="pc-tab" to={PACKAGES_PATH} role="tab" aria-selected="false">
            {t.tabPackages}
          </Link>
        </div>

        <div className="pc-layout">
          {/* Left: booking details */}
          <div className="pc-main">
            <section className="pc-card">
              <div className="pc-card-head">
                <h2>{done ? t.cardTitleDone : t.cardTitle}</h2>
                <span className={`pc-pill ${done ? "is-muted" : ""}`}>
                  {done ? t.cancelled : t.booked}
                </span>
              </div>

              <div className="pc-course">{courseName(cls.course_id)}</div>

              <dl className="pc-info">
                <div>
                  <UserIcon />
                  <dt>{t.student}</dt>
                  <dd>{studentLine}</dd>
                </div>
                <div>
                  <CalendarIcon />
                  <dt>{t.date}</dt>
                  <dd>{dateText}</dd>
                </div>
                <div>
                  <ClockIcon />
                  <dt>{t.time}</dt>
                  <dd>
                    {rangeLabel(cls)} ({fill(t.minutes, { n: cls.duration_min })})
                  </dd>
                </div>
                <div>
                  <TeacherIcon />
                  <dt>{t.teacher}</dt>
                  <dd>{cls.teacher_name || "—"}</dd>
                </div>
                <div>
                  <PinIcon />
                  <dt>{t.place}</dt>
                  <dd>
                    {[cls.room ? fill(t.room, { room: cls.room }) : null, STUDIO]
                      .filter(Boolean)
                      .join(" · ")}
                  </dd>
                </div>
              </dl>

              <hr />

              <div className="pc-rows">
                <div>
                  <span>{t.bookingNo}</span>
                  <b>{bookingCode(booking.id)}</b>
                </div>
                {originalPackage && (
                  <div>
                    <span>{t.packageLine}</span>
                    <b>
                      {fill(t.packageValue, { n: originalPackage.total_sessions })}
                      {originalPackage.price
                        ? ` · ฿${Number(originalPackage.price).toLocaleString("en-US")}`
                        : ""}
                    </b>
                  </div>
                )}
                <p>{t.deductNote}</p>
              </div>
            </section>

            {!done && (
              <div className={`pc-banner ${canRefund ? "is-ok" : "is-late"}`}>
                <CalendarIcon />
                <div>
                  <strong>{canRefund ? t.refundOkTitle : t.refundLateTitle}</strong>
                  {canRefund && (
                    <span>
                      {fill(t.refundOkUntil, {
                        date: dateFormatter.format(deadline),
                        time: hhmm(deadline.toISOString()),
                      })}
                    </span>
                  )}
                  <p>
                    {canRefund
                      ? fill(t.refundOkText, { w: windowText })
                      : fill(t.refundLateText, { w: windowText })}
                  </p>
                </div>
              </div>
            )}

            <div className="pc-policy">
              <InfoIcon />
              <div>
                <p>{fill(t.policyText, { w: windowText })}</p>
                <a href={LINE_URL} target="_blank" rel="noopener noreferrer">
                  {fill(t.contact, { line: LINE_ID })}
                </a>
              </div>
            </div>
          </div>

          {/* Right: confirm panel */}
          <aside className="pc-side">
            <section className="pc-card pc-confirm">
              <div>
                <h2>{done ? t.sideTitleDone : t.sideTitle}</h2>
                <p className="pc-muted">{done ? t.sideTextDone : t.sideText}</p>
              </div>

              <div className="pc-balance">
                <strong>{fill(t.balanceTitle, { name: student.name })}</strong>
                <div className="pc-balance-row">
                  <div>
                    <b>
                      {before} <small>{t.timesUnit}</small>
                    </b>
                    <span>{t.balanceNow}</span>
                  </div>
                  <ArrowIcon />
                  <div className="is-after">
                    <b>
                      {after} <small>{t.timesUnit}</small>
                    </b>
                    <span>{done ? t.balanceAfterDone : t.balanceAfter}</span>
                  </div>
                </div>
                <hr />
                <div className="pc-refund">
                  <span>{t.refundTo}</span>
                  <b>{t.refundPlus}</b>
                </div>
                <p>{t.refundNote}</p>
              </div>

              <div>
                <strong className="pc-after-title">{t.afterTitle}</strong>
                <p className="pc-muted">
                  {fill(t.afterText, {
                    name: student.name,
                    date: dateText,
                    range: rangeLabel(cls),
                  })}
                </p>
              </div>

              <hr />

              {errorKey && (
                <div className="pc-alert" role="alert">
                  {t[`err_${errorKey}`] || t.err_GENERIC}
                </div>
              )}

              {done ? (
                <div className="pc-actions">
                  <Link className="pc-btn is-primary is-block" to={SCHEDULE_PATH}>
                    {t.backSchedule}
                  </Link>
                  <Link className="pc-btn is-outline is-block" to="/book-class">
                    {t.bookAgain}
                  </Link>
                </div>
              ) : (
                <div className="pc-actions">
                  {canRefund ? (
                    <button
                      type="button"
                      className="pc-btn is-danger is-block"
                      disabled={submitting}
                      onClick={confirm}
                    >
                      {submitting ? t.confirming : t.confirm}
                    </button>
                  ) : (
                    <a
                      className="pc-btn is-danger is-block"
                      href={LINE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.contactBtn}
                    </a>
                  )}
                  <Link className="pc-btn is-outline is-block" to={SCHEDULE_PATH}>
                    {t.keep}
                  </Link>
                  <p className="pc-center">{t.keepNote}</p>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="pc-page">
      <SiteHeader language={language} onLanguageChange={setLanguage} />
      {body}
      <SiteFooter language={language} />
    </div>
  );
}

export default ParentCancel;
