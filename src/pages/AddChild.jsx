import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/AddChild.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";
import useSession from "../lib/useSession";
import { supabase } from "../lib/supabase";

// ---------------------------------------------------------------
// Settings (change the paths / column names to match your project)
// ---------------------------------------------------------------
const PARENT_AREA_PATH = "/parent-portal";
const LOGIN_PATH = "/login";
const MAX_AGE = 18;

// If your students table has an owner column (e.g. "parent_id" or "user_id")
// and it is NOT filled automatically by a database default, put its name here.
// The signed-in user's id will be saved into it. Leave "" if not needed.
const OWNER_COLUMN = "parent_id";

// Column names in the students table
const COL = {
  displayName: "name", // shown as the child's name on the portal (= nickname)
  fullName: "full_name",
  englishName: "english_name",
  birthDate: "birth_date",
  age: "age",
  emergency: "emergency_contact", // ชื่อผู้ติดต่อฉุกเฉิน
  emergencyPhone: "emergency_phone", // เบอร์โทรผู้ติดต่อฉุกเฉิน (ต้องเพิ่มคอลัมน์ ดู SQL)
  notes: "care_notes",
};

// Gregorian calendar for every language (years shown as ค.ศ.)
const LOCALES = {
  th: "th-TH-u-ca-gregory",
  en: "en-GB",
};

// Thai + English for now (other languages fall back to English)
const translations = {
  th: {
    back: "← บุตรหลานของฉัน / เพิ่มโปรไฟล์",
    eyebrow: "PARENT PORTAL / ADD CHILD",
    title: "เพิ่มโปรไฟล์บุตรหลาน",
    subtitle: "เพิ่มสมาชิกตัวน้อยในครอบครัวของคุณ โดยไม่ต้องสมัครบัญชีผู้ปกครองใหม่",
    tabChildren: "บุตรหลานของฉัน",
    tabSchedule: "ตารางเรียน",
    tabHistory: "ประวัติการเรียน",
    tabPackages: "แพ็กเกจและชำระเงิน",
    soon: "เร็ว ๆ นี้",
    childInfo: "ข้อมูลบุตรหลาน",
    required: "* จำเป็นต้องระบุ",
    fullName: "ชื่อ–นามสกุล *",
    fullNamePh: "กรอกชื่อและนามสกุลบุตรหลาน",
    nickname: "ชื่อเล่น *",
    nicknamePh: "กรอกชื่อเล่น",
    englishName: "ชื่อภาษาอังกฤษ *",
    englishNamePh: "กรอกชื่อภาษาอังกฤษ",
    birthDate: "วันเดือนปีเกิด *",
    birthPh: "เลือกวันเดือนปีเกิด",
    birthHint: "ใช้เพื่อแนะนำคอร์สที่เหมาะกับช่วงอายุ",
    age: "อายุ",
    agePh: "คำนวณจากวันเกิดอัตโนมัติ",
    ageHint: "จะแสดงเมื่อระบุวันเกิดแล้ว",
    ageValue: "{n} ปี",
    yearPrefix: "ค.ศ. ",
    weekdays: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
    prevMonth: "เดือนก่อนหน้า",
    nextMonth: "เดือนถัดไป",
    monthLabel: "เดือน",
    yearLabel: "ปี",
    careInfo: "ข้อมูลเพื่อการดูแล",
    emergencyName: "ชื่อผู้ติดต่อฉุกเฉิน *",
    emergencyNamePh: "กรอกชื่อผู้ติดต่อฉุกเฉิน",
    emergencyPhone: "เบอร์โทรศัพท์ผู้ติดต่อฉุกเฉิน *",
    emergencyPhonePh: "เช่น 081 234 5678",
    emergencyHint: "ใช้เพื่อการดูแลในกรณีจำเป็นเท่านั้น",
    notes: "บันทึกการเรียนรู้ / อาการแพ้ (ไม่บังคับ)",
    notesPh: "ระบุเฉพาะข้อมูลที่จำเป็นต่อการดูแล เช่น อาการแพ้หรือสิ่งที่ครูควรทราบ",
    notesHint: "ข้อมูลละเอียดอ่อน เห็นเฉพาะผู้ปกครองและเจ้าหน้าที่หรือครูที่เกี่ยวข้อง",
    save: "บันทึกโปรไฟล์บุตรหลาน",
    saving: "กำลังบันทึก...",
    cancel: "ยกเลิก / กลับไปบุตรหลาน",
    saveNote: "บันทึกเฉพาะโปรไฟล์ใหม่ {others}และยังไม่ลงทะเบียนคอร์ส",
    saveNoteOthers: "ไม่เปลี่ยนข้อมูล{names} ",
    errFullName: "กรุณากรอกชื่อและนามสกุล",
    errNickname: "กรุณากรอกชื่อเล่น",
    errEnglishName: "กรุณากรอกชื่อภาษาอังกฤษ",
    errBirth: "กรุณาระบุวันเกิด",
    errBirthFuture: "วันเกิดต้องไม่เป็นวันในอนาคต",
    errBirthOld: "ระบบรองรับเด็กอายุไม่เกิน {n} ปี",
    errEmergencyName: "กรุณากรอกชื่อผู้ติดต่อฉุกเฉิน",
    errEmergencyPhone: "กรุณากรอกเบอร์โทรศัพท์ที่ติดต่อได้",
    errEmergencyPhoneBad: "เบอร์โทรศัพท์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
    errSave: "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง หรือติดต่อทาง LINE",
    linked: "เชื่อมกับบัญชีนี้อัตโนมัติ",
    mainParent: "ผู้ปกครองหลัก",
    phone: "โทรศัพท์ผู้ปกครอง: {phone}",
    useAccountContact: "ใช้ข้อมูลติดต่อจากบัญชีปัจจุบัน",
    familyNote: "โปรไฟล์ใหม่จะอยู่ในครอบครัวเดียวกับ{names} คุณจัดการลูกทุกคนได้จากบัญชีนี้",
    familyNoteEmpty: "โปรไฟล์ใหม่จะอยู่ในบัญชีของคุณ และจัดการได้จากบัญชีนี้",
    and: "และ",
    or: "หรือ",
    studentTitle: "ลูกมีบัญชีเข้าสู่ระบบของตัวเองได้",
    optional: "ทางเลือก · ทำภายหลังได้",
    studentText1:
      "หลังบันทึกโปรไฟล์ ไปที่โปรไฟล์เด็ก → “เปิดใช้งานบัญชีนักเรียน” เพื่อกำหนดชื่อผู้ใช้และส่งลิงก์ไปยังอีเมลผู้ปกครอง",
    studentText2:
      "คุณช่วยลูกตั้งรหัสผ่านผ่านลิงก์ได้ ไม่ต้องใช้อีเมลส่วนตัวของเด็ก และบัญชียังคงเชื่อมกับครอบครัวนี้",
    studentCta: "บันทึกโปรไฟล์ก่อน แล้วเปิดใช้งานบัญชี →",
    startTitle: "เริ่มจากโปรไฟล์ แล้วค่อยเลือกคอร์ส",
    startText:
      "เมื่อเพิ่มสำเร็จ เลือกเด็กคนนี้ก่อนซื้อแพ็กเกจหรือจองคลาส ยอดเรียนจะแสดงตามโปรไฟล์ที่เลือก",
    loading: "กำลังโหลด...",
    loginTitle: "กรุณาเข้าสู่ระบบเพื่อเพิ่มโปรไฟล์บุตรหลาน",
    loginBtn: "เข้าสู่ระบบ",
  },
  en: {
    back: "← My children / Add profile",
    eyebrow: "PARENT PORTAL / ADD CHILD",
    title: "Add a child profile",
    subtitle: "Add a little family member without creating a new parent account.",
    tabChildren: "My children",
    tabSchedule: "Schedule",
    tabHistory: "Class history",
    tabPackages: "Packages & payments",
    soon: "Coming soon",
    childInfo: "Child details",
    required: "* Required",
    fullName: "Full name *",
    fullNamePh: "Enter your child's full name",
    nickname: "Nickname *",
    nicknamePh: "Enter nickname",
    englishName: "English name *",
    englishNamePh: "Enter English name",
    birthDate: "Date of birth *",
    birthPh: "Select date of birth",
    birthHint: "Used to suggest courses that suit their age",
    age: "Age",
    agePh: "Calculated from date of birth",
    ageHint: "Shown once a date of birth is entered",
    ageValue: "{n} yrs",
    yearPrefix: "",
    weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    prevMonth: "Previous month",
    nextMonth: "Next month",
    monthLabel: "Month",
    yearLabel: "Year",
    careInfo: "Care information",
    emergencyName: "Emergency contact name *",
    emergencyNamePh: "Enter the emergency contact's name",
    emergencyPhone: "Emergency contact phone *",
    emergencyPhonePh: "e.g. 081 234 5678",
    emergencyHint: "Used for care in necessary cases only",
    notes: "Learning notes / allergies (optional)",
    notesPh: "Only what's needed for care, e.g. allergies or things the teacher should know",
    notesHint: "Sensitive information — visible only to you and relevant staff or teachers",
    save: "Save child profile",
    saving: "Saving...",
    cancel: "Cancel / back to my children",
    saveNote: "Saves the new profile only. {others}No course is enrolled yet.",
    saveNoteOthers: "Details for {names} are not changed. ",
    errFullName: "Please enter the full name",
    errNickname: "Please enter a nickname",
    errEnglishName: "Please enter the English name",
    errBirth: "Please enter the date of birth",
    errBirthFuture: "Date of birth can't be in the future",
    errBirthOld: "Children up to {n} years old are supported",
    errEmergencyName: "Please enter the emergency contact's name",
    errEmergencyPhone: "Please enter a phone number we can reach",
    errEmergencyPhoneBad: "That phone number doesn't look right. Please check it.",
    errSave: "Couldn't save. Please try again or contact us on LINE.",
    linked: "Linked to this account automatically",
    mainParent: "Primary parent",
    phone: "Parent phone: {phone}",
    useAccountContact: "Uses the contact details from your current account",
    familyNote: "The new profile will be in the same family as {names}. Manage every child from this account.",
    familyNoteEmpty: "The new profile will be in your account and managed from here.",
    and: "and",
    or: "or",
    studentTitle: "Your child can have their own login",
    optional: "Optional · can be done later",
    studentText1:
      "After saving, open the child's profile → “Activate student account” to set a username and send a link to the parent's email.",
    studentText2:
      "You can help your child set a password via the link — no personal email needed — and the account stays linked to this family.",
    studentCta: "Save the profile first, then activate the account →",
    startTitle: "Start with the profile, then choose a course",
    startText:
      "Once added, pick this child before buying a package or booking a class. Balances show by the selected profile.",
    loading: "Loading...",
    loginTitle: "Please sign in to add a child profile",
    loginBtn: "Sign in",
  },
};

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
const fill = (text, values) =>
  Object.entries(values).reduce((r, [k, v]) => r.split(`{${k}}`).join(v), text);

const pad = (n) => String(n).padStart(2, "0");

// month is zero-based (like Date)
const toStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

const todayStr = () => {
  const d = new Date();
  return toStr(d.getFullYear(), d.getMonth(), d.getDate());
};

// "YYYY-MM-DD" -> { y, m (zero-based), d } or null
const parseDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [y, m, d] = value.split("-").map(Number);
  return { y, m: m - 1, d };
};

// Age in whole years from "YYYY-MM-DD" (null if invalid)
const ageFrom = (value) => {
  const p = parseDate(value);
  if (!p) return null;
  const now = new Date();
  let age = now.getFullYear() - p.y;
  if (now.getMonth() < p.m || (now.getMonth() === p.m && now.getDate() < p.d)) age -= 1;
  return age;
};

const maskPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 6) return "";
  return `${digits.slice(0, 2)}* *** ${digits.slice(-4)}`;
};

const initialOf = (name) => (name && name.trim() ? Array.from(name.trim())[0].toUpperCase() : "?");

// ---------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3 8.5h14M7 2.8v3.4M13 2.8v3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

function Field({ id, label, hint, error, children }) {
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
function DatePicker({ id, value, onChange, maxDate, yearsBack, language, t, invalid, describedBy }) {
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

// ---------------------------------------------------------------
// Page
// ---------------------------------------------------------------
function AddChild() {
  const [language, setLanguage] = useLanguage();
  const { session, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const user = session?.user;
  const userId = user?.id;
  const t = translations[language] || translations.en;

  const [values, setValues] = useState({
    fullName: "",
    nickname: "",
    englishName: "",
    birthDate: "",
    emergencyName: "",
    emergencyPhone: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveDetail, setSaveDetail] = useState("");
  const [siblings, setSiblings] = useState([]);

  const setField = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
  };
  const set = (key) => (e) => setField(key, e.target.value);

  // Names of the children already on this account (for the side card + footnote)
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.from("students").select("id, name").order("name");
        if (!cancelled && !error) setSiblings((data ?? []).map((s) => s.name).filter(Boolean));
      } catch (e) {
        console.warn("Load siblings:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const age = ageFrom(values.birthDate);
  const ageText = age !== null && age >= 0 ? fill(t.ageValue, { n: age }) : "";

  const joinNames = (names, word) => {
    if (names.length <= 1) return names.join("");
    return `${names.slice(0, -1).join(", ")} ${word} ${names[names.length - 1]}`;
  };
  const familyNames = joinNames(siblings, t.and); // "มะลิและปุณณ์"
  const footNames = joinNames(siblings, t.or); // "มะลิหรือปุณณ์"

  const parentName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "");
  const phone = maskPhone(user?.phone || user?.user_metadata?.phone);

  const footNote = useMemo(
    () =>
      fill(t.saveNote, {
        others: siblings.length ? fill(t.saveNoteOthers, { names: footNames }) : "",
      }),
    [t, siblings, footNames]
  );

  // ---------- Actions ----------
  const validate = () => {
    const e = {};
    if (!values.fullName.trim()) e.fullName = t.errFullName;
    if (!values.nickname.trim()) e.nickname = t.errNickname;
    if (!values.englishName.trim()) e.englishName = t.errEnglishName;
    if (!values.birthDate) e.birthDate = t.errBirth;
    else if (age === null || age < 0) e.birthDate = t.errBirthFuture;
    else if (age > MAX_AGE) e.birthDate = fill(t.errBirthOld, { n: MAX_AGE });
    if (!values.emergencyName.trim()) e.emergencyName = t.errEmergencyName;
    const phoneDigits = values.emergencyPhone.replace(/\D/g, "");
    if (!values.emergencyPhone.trim()) e.emergencyPhone = t.errEmergencyPhone;
    else if (phoneDigits.length < 9 || phoneDigits.length > 15) e.emergencyPhone = t.errEmergencyPhoneBad;
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (submitting) return;

    const found = validate();
    setErrors(found);
    setSaveError("");
    setSaveDetail("");
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      document.getElementById(`ac-${first}`)?.focus();
      return;
    }

    const payload = {
      [COL.displayName]: values.nickname.trim(),
      [COL.fullName]: values.fullName.trim(),
      [COL.englishName]: values.englishName.trim(),
      [COL.birthDate]: values.birthDate,
      [COL.age]: age,
      [COL.emergency]: values.emergencyName.trim(),
      [COL.emergencyPhone]: values.emergencyPhone.trim(),
      [COL.notes]: values.notes.trim() || null,
    };
    if (OWNER_COLUMN && userId) payload[OWNER_COLUMN] = userId;

    setSubmitting(true);
    const { error } = await supabase.from("students").insert(payload);
    setSubmitting(false);

    if (error) {
      console.error("Add child error:", error);
      setSaveError(t.errSave);
      setSaveDetail(error.message || "");
      return;
    }

    navigate(PARENT_AREA_PATH);
  };

  // ---------- Not-ready states ----------
  const renderGate = (title, action) => (
    <div className="ac-container">
      <section className="ac-card ac-gate">
        <h2>{title}</h2>
        {action}
      </section>
    </div>
  );

  let body;
  if (sessionLoading) {
    body = renderGate(t.loading);
  } else if (!user) {
    body = renderGate(
      t.loginTitle,
      <Link className="ac-primary" to={LOGIN_PATH}>
        {t.loginBtn}
      </Link>
    );
  } else {
    body = (
      <div className="ac-container">
        <Link className="ac-back" to={PARENT_AREA_PATH}>
          {t.back}
        </Link>

        <header className="ac-head">
          <p className="ac-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="ac-sub">{t.subtitle}</p>
        </header>

        <div className="ac-tabs" role="tablist">
          <Link role="tab" aria-selected="true" className="ac-tab is-on" to={PARENT_AREA_PATH}>
            {t.tabChildren}
          </Link>
          {[t.tabSchedule, t.tabHistory, t.tabPackages].map((label) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected="false"
              className="ac-tab"
              disabled
              title={t.soon}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ac-layout">
          <form className="ac-main" onSubmit={submit} noValidate>
            {/* Child details */}
            <section className="ac-card">
              <div className="ac-card-head">
                <h2>{t.childInfo}</h2>
                <span className="ac-required">{t.required}</span>
              </div>

              <Field id="ac-fullName" label={t.fullName} error={errors.fullName}>
                <input
                  id="ac-fullName"
                  className="ac-input"
                  type="text"
                  autoComplete="off"
                  placeholder={t.fullNamePh}
                  value={values.fullName}
                  onChange={set("fullName")}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "ac-fullName-msg" : undefined}
                />
              </Field>

              <div className="ac-row">
                <Field id="ac-nickname" label={t.nickname} error={errors.nickname}>
                  <input
                    id="ac-nickname"
                    className="ac-input"
                    type="text"
                    autoComplete="off"
                    placeholder={t.nicknamePh}
                    value={values.nickname}
                    onChange={set("nickname")}
                    aria-invalid={Boolean(errors.nickname)}
                    aria-describedby={errors.nickname ? "ac-nickname-msg" : undefined}
                  />
                </Field>
                <Field id="ac-englishName" label={t.englishName} error={errors.englishName}>
                  <input
                    id="ac-englishName"
                    className="ac-input"
                    type="text"
                    autoComplete="off"
                    placeholder={t.englishNamePh}
                    value={values.englishName}
                    onChange={set("englishName")}
                    aria-invalid={Boolean(errors.englishName)}
                    aria-describedby={errors.englishName ? "ac-englishName-msg" : undefined}
                  />
                </Field>
              </div>

              <div className="ac-row">
                <Field
                  id="ac-birthDate"
                  label={t.birthDate}
                  hint={t.birthHint}
                  error={errors.birthDate}
                >
                  <DatePicker
                    id="ac-birthDate"
                    value={values.birthDate}
                    onChange={(v) => setField("birthDate", v)}
                    maxDate={todayStr()}
                    yearsBack={MAX_AGE}
                    language={language}
                    t={t}
                    invalid={Boolean(errors.birthDate)}
                    describedBy="ac-birthDate-msg"
                  />
                </Field>
                <Field id="ac-age" label={t.age} hint={t.ageHint}>
                  <input
                    id="ac-age"
                    className="ac-input is-readonly"
                    type="text"
                    readOnly
                    tabIndex={-1}
                    placeholder={t.agePh}
                    value={ageText}
                  />
                </Field>
              </div>
            </section>

            {/* Care information */}
            <section className="ac-card">
              <h2>{t.careInfo}</h2>

              <div className="ac-row">
                <Field id="ac-emergencyName" label={t.emergencyName} error={errors.emergencyName}>
                  <input
                    id="ac-emergencyName"
                    className="ac-input"
                    type="text"
                    autoComplete="off"
                    placeholder={t.emergencyNamePh}
                    value={values.emergencyName}
                    onChange={set("emergencyName")}
                    aria-invalid={Boolean(errors.emergencyName)}
                    aria-describedby={errors.emergencyName ? "ac-emergencyName-msg" : undefined}
                  />
                </Field>
                <Field
                  id="ac-emergencyPhone"
                  label={t.emergencyPhone}
                  hint={t.emergencyHint}
                  error={errors.emergencyPhone}
                >
                  <input
                    id="ac-emergencyPhone"
                    className="ac-input"
                    type="tel"
                    inputMode="tel"
                    autoComplete="off"
                    maxLength={20}
                    placeholder={t.emergencyPhonePh}
                    value={values.emergencyPhone}
                    onChange={(e) =>
                      setField("emergencyPhone", e.target.value.replace(/[^\d+\-\s]/g, ""))
                    }
                    aria-invalid={Boolean(errors.emergencyPhone)}
                    aria-describedby="ac-emergencyPhone-msg"
                  />
                </Field>
              </div>

              <Field id="ac-notes" label={t.notes} hint={t.notesHint}>
                <textarea
                  id="ac-notes"
                  className="ac-input is-area"
                  rows={3}
                  placeholder={t.notesPh}
                  value={values.notes}
                  onChange={set("notes")}
                  aria-describedby="ac-notes-msg"
                />
              </Field>
            </section>

            {/* Actions */}
            <div className="ac-actions-wrap">
              {saveError && (
                <div className="ac-alert" role="alert">
                  {saveError}
                  {saveDetail && <small>{saveDetail}</small>}
                </div>
              )}
              <div className="ac-actions">
                <button type="submit" className="ac-primary" disabled={submitting}>
                  {submitting ? t.saving : t.save}
                </button>
                <Link className="ac-outline" to={PARENT_AREA_PATH}>
                  {t.cancel}
                </Link>
              </div>
              <p className="ac-hint">{footNote}</p>
            </div>
          </form>

          {/* Side cards */}
          <aside className="ac-side">
            <section className="ac-linked">
              <span className="ac-chip">{t.linked}</span>
              <div className="ac-parent">
                <span className="ac-avatar" aria-hidden="true">
                  {initialOf(parentName)}
                </span>
                <div>
                  <strong>{parentName}</strong>
                  <small>{t.mainParent}</small>
                </div>
              </div>
              <div className="ac-lines">
                {phone && <p>{fill(t.phone, { phone })}</p>}
                <p>{t.useAccountContact}</p>
              </div>
              <hr />
              <p className="ac-family">
                {siblings.length
                  ? fill(t.familyNote, { names: familyNames })
                  : t.familyNoteEmpty}
              </p>
            </section>

            <section className="ac-card ac-student">
              <span className="ac-student-icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <rect x="4" y="3" width="18" height="20" rx="3.5" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="13" cy="10.5" r="3" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M7.5 19c.8-2.6 3-3.8 5.5-3.8s4.7 1.2 5.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <h3>{t.studentTitle}</h3>
              <span className="ac-chip is-grey">{t.optional}</span>
              <p>{t.studentText1}</p>
              <p>{t.studentText2}</p>
              <p className="ac-student-cta">{t.studentCta}</p>
            </section>

            <div className="ac-note">
              <span className="ac-note-icon" aria-hidden="true">ⓘ</span>
              <div>
                <strong>{t.startTitle}</strong>
                <p>{t.startText}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="ac-page">
      <SiteHeader language={language} onLanguageChange={setLanguage} />
      {body}
      <SiteFooter language={language} />
    </div>
  );
}

export default AddChild;
