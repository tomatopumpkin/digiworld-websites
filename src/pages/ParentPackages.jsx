import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/ParentPackages.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";
import useSession from "../lib/useSession";
import { supabase } from "../lib/supabase";

// ---------------------------------------------------------------
// Settings
// ---------------------------------------------------------------
const TZ = "Asia/Bangkok";
const CANCEL_MINUTES = 30; // ให้ตรงกับ BookClass.jsx
const PARENT_AREA_PATH = "/parent-portal";
const SCHEDULE_PATH = "/parent-schedule";
const HISTORY_PATH = "/parent-history";
const BOOK_PATH = "/book-class";
const COURSES_PATH = "/courses";
const LOGIN_PATH = "/login";
const ADD_CHILD_PATH = "/add-child";
const LINE_URL = "https://line.me/R/ti/p/%40digiworldphuket";
const MAX_LEDGER = 20;

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

const translations = {
  th: {
    eyebrow: "PARENT PORTAL / PACKAGES & PAYMENTS",
    title: "แพ็กเกจและชำระเงิน",
    subtitle: "ดูครั้งเรียนคงเหลือของลูกแต่ละคน ตรวจสอบการชำระเงินและรายการใช้ครั้งเรียน",
    guardian: "บัญชีครอบครัว · เข้าสู่ระบบแล้ว",
    tabKids: "บุตรหลานของฉัน",
    tabSchedule: "ตารางเรียน",
    tabHistory: "ประวัติการเรียน",
    tabPackages: "แพ็กเกจและชำระเงิน",
    listTitle: "แพ็กเกจของบุตรหลาน",
    listNote: "ยอดแยกตามเด็กและคอร์ส · ไม่ใช่ยอดรวมครอบครัว",
    noExpiry: "ไม่มีวันหมดอายุ",
    packageLine: "แพ็กเกจ {n} ครั้ง",
    perClass: "{n} นาที / คลาส",
    unbookedTitle: "ครั้งที่ยังไม่ได้จอง",
    unbookedSub: "พร้อมใช้จองคลาสถัดไป",
    times: "{n} ครั้ง",
    legendDone: "เรียนแล้ว {n}",
    legendBooked: "จองไว้ {n}",
    legendOpen: "ยังไม่จอง {n}",
    legendTotal: "รวม {n} ครั้ง",
    bookFor: "จองคลาสให้{name}",
    buyMore: "ซื้อแพ็กเกจเพิ่ม",
    noPackageTitle: "ยังไม่มีแพ็กเกจ",
    noPackageText: "ซื้อคอร์สเพื่อเริ่มจองคลาส",
    noPackageBtn: "ดูคอร์สเรียน",
    age: "อายุ {n} ปี",
    payTitle: "ประวัติการชำระเงินและใบเสร็จ",
    payCount: "{n} รายการ · แพ็กเกจปัจจุบันของบุตรหลาน",
    payAllPaid: "ชำระแล้วทุกรายการ",
    payHasPending: "มีรายการรอตรวจสอบ",
    colDateReceipt: "วันที่ / เลขใบเสร็จ",
    colWhoPkg: "ผู้เรียน / แพ็กเกจ",
    colAmount: "ยอดชำระ",
    colStatus: "สถานะ",
    colDoc: "เอกสาร",
    paid: "ชำระแล้ว",
    pending: "รอตรวจสอบ",
    viewReceipt: "ดูใบเสร็จ ↗",
    askReceipt: "ขอใบเสร็จทาง LINE ↗",
    pkgSessions: "{course} {n} ครั้ง",
    payEmpty: "ยังไม่มีรายการชำระเงิน",
    ledgerTitle: "รายการเคลื่อนไหวของครั้งเรียน",
    ledgerSub: "ก่อน → หลัง แสดงยอดที่ยังไม่ได้จองของเด็กแต่ละคน",
    ledgerAll: "บุตรหลานทุกคน",
    colWhen: "วันเวลา / ผู้เรียน",
    colActivity: "กิจกรรม / รายการอ้างอิง",
    colBalance: "ก่อน → หลัง",
    colEffect: "ผลต่อยอด",
    actBooked: "จองคลาส {date}",
    actAttended: "เข้าเรียนครั้งที่ {n}",
    stConfirmed: "ยืนยันแล้ว",
    stAttended: "เรียนแล้ว",
    effBooked: "−1 ครั้ง",
    effNone: "ไม่หักซ้ำ",
    ledgerEmpty: "ยังไม่มีรายการเคลื่อนไหว",
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
    eyebrow: "PARENT PORTAL / PACKAGES & PAYMENTS",
    title: "Packages & payments",
    subtitle: "See each child's remaining sessions, check payments and how sessions were used.",
    guardian: "Family account · Signed in",
    tabKids: "My children",
    tabSchedule: "Schedule",
    tabHistory: "Class history",
    tabPackages: "Packages & payments",
    listTitle: "Children's packages",
    listNote: "Balances are per child and course · not a family total",
    noExpiry: "Never expires",
    packageLine: "{n}-session package",
    perClass: "{n} min / class",
    unbookedTitle: "Sessions not booked yet",
    unbookedSub: "Ready for your next booking",
    times: "{n} left",
    legendDone: "Attended {n}",
    legendBooked: "Booked {n}",
    legendOpen: "Not booked {n}",
    legendTotal: "Total {n}",
    bookFor: "Book a class for {name}",
    buyMore: "Buy another package",
    noPackageTitle: "No package yet",
    noPackageText: "Buy a course to start booking classes.",
    noPackageBtn: "Browse courses",
    age: "{n} yrs old",
    payTitle: "Payment history & receipts",
    payCount: "{n} items · current packages",
    payAllPaid: "All paid",
    payHasPending: "Some items pending",
    colDateReceipt: "Date / receipt no.",
    colWhoPkg: "Student / package",
    colAmount: "Amount",
    colStatus: "Status",
    colDoc: "Document",
    paid: "Paid",
    pending: "Pending",
    viewReceipt: "View receipt ↗",
    askReceipt: "Ask for receipt on LINE ↗",
    pkgSessions: "{course} · {n} sessions",
    payEmpty: "No payments yet",
    ledgerTitle: "Session activity",
    ledgerSub: "Before → after shows each child's not-yet-booked balance",
    ledgerAll: "All children",
    colWhen: "Date / student",
    colActivity: "Activity / reference",
    colBalance: "Before → after",
    colEffect: "Effect",
    actBooked: "Booked class {date}",
    actAttended: "Attended session {n}",
    stConfirmed: "Confirmed",
    stAttended: "Attended",
    effBooked: "−1",
    effNone: "No further deduction",
    ledgerEmpty: "No activity yet",
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
const courseName = (id) => COURSES.find((c) => c.id === id)?.name || id;
const initialOf = (name) => (name && name.trim() ? Array.from(name.trim())[0].toUpperCase() : "?");
const bookingCode = (id) => `DW-${String(id).replace(/-/g, "").slice(0, 8).toUpperCase()}`;
const money = (n) => `฿${Number(n).toLocaleString("en-US")}`;

// ---------------------------------------------------------------
// Page
// ---------------------------------------------------------------
function ParentPackages() {
  const [language, setLanguage] = useLanguage();
  const { session, loading: sessionLoading } = useSession();
  const user = session?.user;
  const userId = user?.id;
  const t = translations[language] || translations.en;
  const locale = LOCALES[language] || LOCALES.en;

  const [students, setStudents] = useState([]);
  const [loadedAt, setLoadedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState("");

  const stampFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }),
    [locale]
  );

  // ---------- Load ----------
  const load = useCallback(async () => {
    setFailed(false);
    const { data, error } = await supabase
      .from("students")
      .select(
        "id, name, full_name, english_name, age, packages(*), bookings(id, session_id, status, created_at, class_sessions(id, course_id, starts_at, duration_min))"
      )
      .eq("bookings.status", "confirmed")
      .order("name");

    if (error) {
      console.error("Load packages error:", error);
      setFailed(true);
      return;
    }

    setStudents(
      (data ?? []).map((s) => ({
        ...s,
        packages: [...(s.packages ?? [])].sort((a, b) =>
          String(a.created_at).localeCompare(String(b.created_at))
        ),
        bookings: s.bookings ?? [],
      }))
    );
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

  // ---------- Derived ----------
  const toneOf = useMemo(() => {
    const map = {};
    students.forEach((s, i) => (map[s.id] = TONES[i % TONES.length]));
    return map;
  }, [students]);

  // การ์ดแพ็กเกจ: 1 ใบต่อเด็ก+คอร์ส
  const cards = useMemo(() => {
    const now = Date.now();
    const list = [];
    students.forEach((s) => {
      const byCourse = {};
      s.packages.forEach((p) => {
        if (!byCourse[p.course_id]) byCourse[p.course_id] = [];
        byCourse[p.course_id].push(p);
      });
      const ids = Object.keys(byCourse);
      if (ids.length === 0) {
        list.push({ key: `${s.id}-none`, student: s, empty: true });
        return;
      }
      ids.forEach((courseId) => {
        const pkgs = byCourse[courseId];
        const total = pkgs.reduce((n, p) => n + (p.total_sessions || 0), 0);
        const remaining = pkgs.reduce((n, p) => n + (p.sessions_remaining || 0), 0);
        const bookedAhead = s.bookings.filter(
          (b) =>
            b.class_sessions &&
            b.class_sessions.course_id === courseId &&
            new Date(b.class_sessions.starts_at).getTime() > now
        ).length;
        const open = Math.min(remaining, total);
        const booked = Math.min(bookedAhead, Math.max(total - open, 0));
        const done = Math.max(total - open - booked, 0);
        const latest = pkgs[pkgs.length - 1];
        const duration = s.bookings.find((b) => b.class_sessions?.course_id === courseId)?.class_sessions
          ?.duration_min;
        list.push({
          key: `${s.id}-${courseId}`,
          student: s,
          courseId,
          name: courseName(courseId),
          total,
          open,
          booked,
          done,
          price: latest?.price,
          duration,
        });
      });
    });
    return list;
  }, [students]);

  // ประวัติชำระเงิน = แพ็กเกจที่ซื้อ
  const payments = useMemo(() => {
    const rows = [];
    students.forEach((s) =>
      s.packages.forEach((p) => {
        const status = String(p.payment_status || "paid");
        rows.push({
          id: p.id,
          at: p.created_at,
          receipt: p.receipt_no || `RC-${String(p.id).replace(/-/g, "").slice(0, 8).toUpperCase()}`,
          who: s.name,
          course: courseName(p.course_id),
          total: p.total_sessions,
          price: p.price,
          paid: /paid|success|complete|ชำระ/i.test(status),
          url: p.receipt_url || null,
        });
      })
    );
    return rows.sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [students]);

  const allPaid = payments.every((p) => p.paid);

  // รายการเคลื่อนไหว: จองคลาส (−1) และเข้าเรียน (ไม่หักซ้ำ) พร้อมยอด ก่อน → หลัง
  const ledger = useMemo(() => {
    const now = Date.now();
    const rows = [];
    students.forEach((s) => {
      const byCourse = {};
      s.bookings.forEach((b) => {
        if (!b.class_sessions) return;
        const cid = b.class_sessions.course_id;
        if (!byCourse[cid]) byCourse[cid] = [];
        byCourse[cid].push(b);
      });
      Object.entries(byCourse).forEach(([courseId, bks]) => {
        const remaining = s.packages
          .filter((p) => p.course_id === courseId)
          .reduce((n, p) => n + (p.sessions_remaining || 0), 0);
        const events = [];
        bks.forEach((b) => {
          const ses = b.class_sessions;
          events.push({ key: `b-${b.id}`, at: b.created_at || ses.starts_at, kind: "booked", delta: -1, booking: b, ses });
          if (new Date(endIso(ses)).getTime() <= now) {
            events.push({ key: `a-${b.id}`, at: endIso(ses), kind: "attended", delta: 0, booking: b, ses });
          }
        });
        events.sort((x, y) => new Date(x.at) - new Date(y.at));
        let balance = remaining + bks.length;
        let attendedNo = 0;
        events.forEach((ev) => {
          const before = balance;
          balance += ev.delta;
          if (ev.kind === "attended") attendedNo += 1;
          rows.push({ ...ev, student: s, courseId, before, after: balance, no: attendedNo });
        });
      });
    });
    return rows.sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [students]);

  const ledgerRows = ledger
    .filter((r) => !ledgerFilter || r.student.id === ledgerFilter)
    .slice(0, MAX_LEDGER);

  const parentName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "");

  const windowText =
    CANCEL_MINUTES % 60 === 0
      ? fill(t.hoursUnit, { n: CANCEL_MINUTES / 60 })
      : fill(t.minutesUnit, { n: CANCEL_MINUTES });

  // ---------- Gates ----------
  const gate = (title, text, action) => (
    <div className="pg-container">
      <section className="pg-panel pg-gate">
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
      <Link className="pg-btn is-primary" to={LOGIN_PATH}>
        {t.loginBtn}
      </Link>
    );
  } else if (failed) {
    body = gate(
      t.loadError,
      t.loadErrorText,
      <button type="button" className="pg-btn is-primary" onClick={reload}>
        {t.retry}
      </button>
    );
  } else if (!students.length) {
    body = gate(
      t.noStudentsTitle,
      t.noStudentsText,
      <Link className="pg-btn is-primary" to={ADD_CHILD_PATH}>
        {t.addChild}
      </Link>
    );
  } else {
    body = (
      <div className="pg-container">
        {/* Head */}
        <header className="pg-head">
          <div>
            <p className="pg-eyebrow">{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p className="pg-sub">{t.subtitle}</p>
          </div>
          <div className="pg-parent">
            <span className="pg-avatar" style={{ background: "#EDE8FF" }} aria-hidden="true">
              {initialOf(parentName)}
            </span>
            <div>
              <strong>{parentName}</strong>
              <small>{t.guardian}</small>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="pg-tabs" role="tablist">
          <Link className="pg-tab" to={PARENT_AREA_PATH} role="tab" aria-selected="false">
            {t.tabKids}
          </Link>
          <Link className="pg-tab" to={SCHEDULE_PATH} role="tab" aria-selected="false">
            {t.tabSchedule}
          </Link>
          <Link className="pg-tab" to={HISTORY_PATH} role="tab" aria-selected="false">
            {t.tabHistory}
          </Link>
          <button type="button" role="tab" aria-selected="true" className="pg-tab is-on">
            {t.tabPackages}
          </button>
        </div>

        {/* Packages */}
        <div className="pg-section-head">
          <h2>{t.listTitle}</h2>
          <span>{t.listNote}</span>
        </div>

        <div className="pg-grid">
          {cards.map((c) => {
            const tone = toneOf[c.student.id];
            const s = c.student;
            const who = [s.name, s.english_name].filter(Boolean).join(" / ");
            const sub = [s.full_name, s.age ? fill(t.age, { n: s.age }) : null].filter(Boolean).join(" · ");

            return (
              <article key={c.key} className="pg-card">
                <div className="pg-card-top">
                  <div className="pg-who">
                    <span className="pg-avatar is-lg" style={{ background: tone }} aria-hidden="true">
                      {initialOf(s.name)}
                    </span>
                    <div>
                      <strong>{who}</strong>
                      <small>{sub}</small>
                    </div>
                  </div>
                  {!c.empty && <span className="pg-chip">{t.noExpiry}</span>}
                </div>

                {c.empty ? (
                  <div className="pg-empty-card">
                    <strong>{t.noPackageTitle}</strong>
                    <p>{t.noPackageText}</p>
                    <Link className="pg-btn is-primary" to={COURSES_PATH}>
                      {t.noPackageBtn}
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="pg-course">
                      <h3>{c.name}</h3>
                      <p>
                        {[
                          fill(t.packageLine, { n: c.total }),
                          c.price ? money(c.price) : null,
                          c.duration ? fill(t.perClass, { n: c.duration }) : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>

                    <div className="pg-tile" style={{ background: tone }}>
                      <div>
                        <strong>{t.unbookedTitle}</strong>
                        <small>{t.unbookedSub}</small>
                      </div>
                      <b>{fill(t.times, { n: c.open })}</b>
                    </div>

                    <div className="pg-bar-wrap">
                      <div
                        className="pg-bar"
                        role="img"
                        aria-label={`${fill(t.legendOpen, { n: c.open })} / ${c.total}`}
                      >
                        {Array.from({ length: c.total }).map((_, i) => (
                          <i
                            key={i}
                            className={i < c.open ? "is-open" : i < c.open + c.booked ? "is-booked" : "is-done"}
                          />
                        ))}
                      </div>
                      <div className="pg-legend">
                        <span>{fill(t.legendDone, { n: c.done })}</span>
                        <span>{fill(t.legendBooked, { n: c.booked })}</span>
                        <span className="is-strong">{fill(t.legendOpen, { n: c.open })}</span>
                        <span>{fill(t.legendTotal, { n: c.total })}</span>
                      </div>
                    </div>

                    <div className="pg-actions">
                      <Link className="pg-btn is-primary" to={`${BOOK_PATH}?student=${s.id}`}>
                        {fill(t.bookFor, { name: s.name })}
                      </Link>
                      <Link className="pg-btn is-outline" to={COURSES_PATH}>
                        {t.buyMore}
                      </Link>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>

        {/* Payments */}
        <section className="pg-panel">
          <div className="pg-panel-head">
            <div>
              <h2>{t.payTitle}</h2>
              <p>{fill(t.payCount, { n: payments.length })}</p>
            </div>
            {payments.length > 0 && (
              <span className={`pg-pill ${allPaid ? "is-green" : "is-yellow"}`}>
                {allPaid ? t.payAllPaid : t.payHasPending}
              </span>
            )}
          </div>

          {payments.length === 0 ? (
            <p className="pg-muted">{t.payEmpty}</p>
          ) : (
            <div className="pg-table-wrap">
              <table className="pg-table">
                <thead>
                  <tr>
                    <th>{t.colDateReceipt}</th>
                    <th>{t.colWhoPkg}</th>
                    <th>{t.colAmount}</th>
                    <th>{t.colStatus}</th>
                    <th>{t.colDoc}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span>{stampFormatter.format(new Date(p.at))}</span>
                        <small>{p.receipt}</small>
                      </td>
                      <td>
                        <strong>{p.who}</strong>
                        <small>{fill(t.pkgSessions, { course: p.course, n: p.total })}</small>
                      </td>
                      <td className="pg-amount">{p.price ? money(p.price) : "—"}</td>
                      <td>
                        <span className={`pg-pill ${p.paid ? "is-green" : "is-yellow"}`}>
                          {p.paid ? t.paid : t.pending}
                        </span>
                      </td>
                      <td>
                        <a
                          className="pg-link"
                          href={p.url || LINE_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {p.url ? t.viewReceipt : t.askReceipt}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Ledger */}
        <section className="pg-panel">
          <div className="pg-panel-head">
            <div>
              <h2>{t.ledgerTitle}</h2>
              <p>{t.ledgerSub}</p>
            </div>
            <label className="pg-filter">
              <select value={ledgerFilter} onChange={(e) => setLedgerFilter(e.target.value)}>
                <option value="">{t.ledgerAll}</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {ledgerRows.length === 0 ? (
            <p className="pg-muted">{t.ledgerEmpty}</p>
          ) : (
            <div className="pg-table-wrap">
              <table className="pg-table">
                <thead>
                  <tr>
                    <th>{t.colWhen}</th>
                    <th>{t.colActivity}</th>
                    <th>{t.colStatus}</th>
                    <th>{t.colBalance}</th>
                    <th>{t.colEffect}</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerRows.map((r) => (
                    <tr key={r.key}>
                      <td>
                        <span>
                          {stampFormatter.format(new Date(r.at))} · {hhmm(r.at)}
                        </span>
                        <strong>{r.student.name}</strong>
                      </td>
                      <td>
                        <span>
                          {r.kind === "booked"
                            ? fill(t.actBooked, { date: stampFormatter.format(new Date(r.ses.starts_at)) })
                            : fill(t.actAttended, { n: r.no })}
                        </span>
                        <small>{r.kind === "booked" ? bookingCode(r.booking.id) : courseName(r.courseId)}</small>
                      </td>
                      <td className="pg-status-text">{r.kind === "booked" ? t.stConfirmed : t.stAttended}</td>
                      <td className="pg-balance">
                        {r.before} → {r.after}
                      </td>
                      <td className={r.kind === "booked" ? "pg-effect is-blue" : "pg-effect"}>
                        {r.kind === "booked" ? t.effBooked : t.effNone}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Policy */}
        <div className="pg-note">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="8.1" stroke="#2864D7" strokeWidth="1.8" />
            <path d="M10 9v5" stroke="#2864D7" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="10" cy="6.2" r="1" fill="#2864D7" />
          </svg>
          <div>
            <strong>{t.ruleTitle}</strong>
            <p>{fill(t.rule1, { w: windowText })}</p>
            <p>{fill(t.rule2, { w: windowText })}</p>
          </div>
        </div>

        <small className="pg-foot">
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
    <div className="pg-page">
      <SiteHeader language={language} onLanguageChange={setLanguage} />
      {body}
      <SiteFooter language={language} />
    </div>
  );
}

export default ParentPackages;