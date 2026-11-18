import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import "../styles/EditChild.css"; // มีสไตล์ช่องกรอก + ปฏิทิน (ac-*) อยู่ในไฟล์นี้แล้ว
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { Field, DatePicker, fill, todayStr, ageFrom, maskPhone, initialOf, LOCALES } from "../components/ChildFormParts";
import useLanguage from "../lib/useLanguage";
import useSession from "../lib/useSession";
import { supabase } from "../lib/supabase";

const PARENT_AREA_PATH = "/parent-portal";
const LOGIN_PATH = "/login";

const translations = {
  th: {
    back: "← บุตรหลานของฉัน / แก้ไขโปรไฟล์{name}",
    eyebrow: "PARENT PORTAL / EDIT CHILD",
    title: "แก้ไขโปรไฟล์บุตรหลาน",
    subtitle: "อัปเดตข้อมูลของ{name}ในครอบครัว {parent} โดยยังคงใช้โปรไฟล์เดิม",
    tabKids: "บุตรหลานของฉัน",
    tabSchedule: "ตารางเรียน",
    tabHistory: "ประวัติการเรียน",
    tabPackages: "แพ็กเกจและชำระเงิน",
    soon: "เร็ว ๆ นี้",
    cardInfo: "ข้อมูลบุตรหลาน",
    required: "* จำเป็นต้องระบุ",
    fullName: "ชื่อ-นามสกุล *",
    fullNamePh: "กรอกชื่อและนามสกุลบุตรหลาน",
    nickname: "ชื่อเล่น *",
    nicknamePh: "กรอกชื่อเล่น",
    englishName: "ชื่อภาษาอังกฤษ *",
    englishNamePh: "กรอกชื่อภาษาอังกฤษ",
    birthDate: "วันเดือนปีเกิด *",
    birthPh: "เลือกวันเดือนปีเกิด",
    birthHintEmpty: "ยังไม่ได้ระบุวันเกิด · กรุณาเพิ่มข้อมูลก่อนบันทึก",
    age: "อายุ",
    agePh: "คำนวณจากวันเกิดอัตโนมัติ",
    ageHintEmpty: "จะแสดงเมื่อระบุวันเกิดจริงแล้ว",
    ageValue: "{n} ปี",
    careCard: "ข้อมูลเพื่อการดูแล",
    emergencyName: "ชื่อผู้ติดต่อฉุกเฉิน *",
    emergencyNamePh: "กรอกชื่อผู้ติดต่อฉุกเฉิน",
    emergencyPhone: "เบอร์โทรศัพท์ผู้ติดต่อฉุกเฉิน *",
    emergencyPhonePh: "เช่น 081 234 5678",
    emergencyHint: "ใช้เพื่อการดูแลในกรณีจำเป็นเท่านั้น",
    notes: "บันทึกการเรียนรู้ / อาการแพ้ (ไม่บังคับ)",
    notesPh: "ยังไม่ได้ระบุ · เพิ่มเฉพาะข้อมูลที่จำเป็นต่อการดูแล",
    notesHint: "ข้อมูลละเอียดอ่อน เห็นเฉพาะผู้ปกครองและเจ้าหน้าที่หรือครูที่เกี่ยวข้อง",
    save: "บันทึกการเปลี่ยนแปลง",
    saving: "กำลังบันทึก...",
    cancel: "ยกเลิก / กลับไปบุตรหลาน",
    footNote: "บันทึกเฉพาะการแก้ไขโปรไฟล์{name} ไม่สร้างโปรไฟล์ใหม่ และไม่เปลี่ยนข้อมูลบุคคลหรือยอดครั้งเรียน",
    editingNow: "กำลังแก้ไขโปรไฟล์นี้",
    oldAge: "อายุเดิม {n} ปี · ข้อมูล ณ {date}",
    ageUnknown: "ยังไม่ระบุอายุ",
    mainGuardian: "ผู้ปกครองหลัก",
    phoneLine: "โทรศัพท์ผู้ติดต่อฉุกเฉิน: {phone}",
    linked: "ยังคงเชื่อมกับบัญชีครอบครัวเดิม",
    onlyThis: "การแก้ไขนี้ใช้กับ{name}เท่านั้น",
    notChange: "ไม่เปลี่ยนข้อมูลบุคคลหรือข้อมูลบัญชีผู้ปกครอง",
    accountTitle: "บัญชีนักเรียนของ{name}",
    accountChip: "จัดการแยกจากข้อมูลโปรไฟล์",
    accountText1: "การบันทึกข้อมูลหน้านี้ไม่สร้างบัญชีนักเรียนใหม่ และไม่เปลี่ยนชื่อผู้ใช้หรือรหัสผ่านของ{name}",
    accountText2: "หากต้องการเปิดใช้งานหรือกู้คืนบัญชี ให้ไปที่โปรไฟล์{name} คุณช่วยลูกตั้งรหัสผ่านผ่านลิงก์ที่ส่งไปยังอีเมลผู้ปกครองได้",
    accountLink: "จัดการบัญชีนักเรียนจากโปรไฟล์{name} →",
    pkgTitle: "แพ็กเกจและครั้งเรียนยังคงเดิม",
    pkgText: "การแก้ไขโปรไฟล์ไม่เปลี่ยนคอร์ส การจอง หรือยอดคงเหลือของ{name}และคนอื่น ยอดเรียนยังแยกตามเด็กแต่ละคน",
    loading: "กำลังโหลด...",
    loginTitle: "กรุณาเข้าสู่ระบบ",
    loginBtn: "เข้าสู่ระบบ",
    notFound: "ไม่พบโปรไฟล์บุตรหลานนี้",
    backBtn: "กลับไปบุตรหลาน",
    errFullName: "กรุณากรอกชื่อ-นามสกุล",
    errNickname: "กรุณากรอกชื่อเล่น",
    errEnglish: "กรุณากรอกชื่อภาษาอังกฤษ",
    errBirth: "กรุณาเลือกวันเดือนปีเกิด",
    errEmergencyName: "กรุณากรอกชื่อผู้ติดต่อฉุกเฉิน",
    errEmergencyPhone: "กรุณากรอกเบอร์โทรศัพท์ผู้ติดต่อฉุกเฉิน",
    errSave: "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง หรือติดต่อทาง LINE",
    prevMonth: "เดือนก่อนหน้า",
    nextMonth: "เดือนถัดไป",
    monthLabel: "เดือน",
    yearLabel: "ปี",
    yearPrefix: "",
    weekdays: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
  },
  en: {
    back: "← My children / Edit {name}'s profile",
    eyebrow: "PARENT PORTAL / EDIT CHILD",
    title: "Edit child profile",
    subtitle: "Update {name}'s details in {parent}'s family. The existing profile is kept.",
    tabKids: "My children",
    tabSchedule: "Schedule",
    tabHistory: "Class history",
    tabPackages: "Packages & payments",
    soon: "Coming soon",
    cardInfo: "Child details",
    required: "* Required",
    fullName: "Full name *",
    fullNamePh: "Enter your child's full name",
    nickname: "Nickname *",
    nicknamePh: "Enter nickname",
    englishName: "English name *",
    englishNamePh: "Enter English name",
    birthDate: "Date of birth *",
    birthPh: "Choose date of birth",
    birthHintEmpty: "No date of birth yet · please add it before saving",
    age: "Age",
    agePh: "Calculated from date of birth",
    ageHintEmpty: "Shown once a date of birth is set",
    ageValue: "{n} yrs",
    careCard: "Care information",
    emergencyName: "Emergency contact name *",
    emergencyNamePh: "Enter emergency contact name",
    emergencyPhone: "Emergency contact phone *",
    emergencyPhonePh: "e.g. 081 234 5678",
    emergencyHint: "Used for care in case of emergency only",
    notes: "Learning notes / allergies (optional)",
    notesPh: "Not specified · add only what is needed for care",
    notesHint: "Sensitive. Visible only to parents and the staff or teachers involved.",
    save: "Save changes",
    saving: "Saving...",
    cancel: "Cancel / back to children",
    footNote: "Only {name}'s profile is updated. No new profile is created and no person data or session balance changes.",
    editingNow: "Editing this profile",
    oldAge: "Previous age {n} · as of {date}",
    ageUnknown: "Age not set",
    mainGuardian: "Main guardian",
    phoneLine: "Emergency contact phone: {phone}",
    linked: "Still linked to the same family account",
    onlyThis: "This edit applies to {name} only",
    notChange: "It doesn't change person data or the parent account",
    accountTitle: "{name}'s student account",
    accountChip: "Managed separately from profile",
    accountText1: "Saving this page doesn't create a student account or change {name}'s username or password.",
    accountText2: "To activate or recover the account, open {name}'s profile. You can help set a password via the link sent to the parent's email.",
    accountLink: "Manage student account from {name}'s profile →",
    pkgTitle: "Packages and sessions unchanged",
    pkgText: "Editing the profile doesn't change courses, bookings or balances for {name} or anyone else. Balances stay separate per child.",
    loading: "Loading...",
    loginTitle: "Please sign in",
    loginBtn: "Sign in",
    notFound: "This child profile was not found",
    backBtn: "Back to children",
    errFullName: "Please enter the full name",
    errNickname: "Please enter a nickname",
    errEnglish: "Please enter the English name",
    errBirth: "Please choose a date of birth",
    errEmergencyName: "Please enter the emergency contact name",
    errEmergencyPhone: "Please enter the emergency contact phone",
    errSave: "Couldn't save. Please try again or contact us on LINE.",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    monthLabel: "Month",
    yearLabel: "Year",
    yearPrefix: "",
    weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  },
};

function EditChild() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useLanguage();
  const { session, loading: sessionLoading } = useSession();
  const user = session?.user;
  const t = translations[language] || translations.en;
  const dateLocale = language === "th" ? LOCALES.th : LOCALES.en;

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    nickname: "",
    englishName: "",
    birth: "",
    notes: "",
    emergencyName: "",
    emergencyPhone: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const parentName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "");
  const masked = maskPhone(form.emergencyPhone);

  // ---------- Load ----------
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("students")
        .select(
          "id, name, full_name, english_name, age, birth_date, care_notes, emergency_contact, emergency_phone"
        )
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error) console.error("Load student error:", error);
      setStudent(data || null);
      if (data) {
        setForm({
          fullName: data.full_name || "",
          nickname: data.name || "",
          englishName: data.english_name || "",
          birth: data.birth_date || "",
          notes: data.care_notes || "",
          emergencyName: data.emergency_contact || parentName,
          emergencyPhone: data.emergency_phone || "",
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, sessionLoading]);

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: "" }));
  };

  const age = ageFrom(form.birth);
  const today = useMemo(() => todayStr(), []);
  const todayLabel = new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
  const nick = form.nickname || student?.name || "";

  // ---------- Save ----------
  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const next = {};
    if (!form.fullName.trim()) next.fullName = t.errFullName;
    if (!form.nickname.trim()) next.nickname = t.errNickname;
    if (!form.englishName.trim()) next.englishName = t.errEnglish;
    if (!form.birth) next.birth = t.errBirth;
    if (!form.emergencyName.trim()) next.emergencyName = t.errEmergencyName;
    if (!form.emergencyPhone.trim()) next.emergencyPhone = t.errEmergencyPhone;
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setSaveError("");
    const { error } = await supabase
      .from("students")
      .update({
        full_name: form.fullName.trim(),
        name: form.nickname.trim(),
        english_name: form.englishName.trim(),
        birth_date: form.birth,
        age,
        care_notes: form.notes.trim() || null,
        emergency_contact: form.emergencyName.trim(),
        emergency_phone: form.emergencyPhone.trim(),
      })
      .eq("id", id);
    setSaving(false);

    if (error) {
      console.error("Save student error:", error);
      setSaveError(`${t.errSave} (${error.code || ""} ${error.message || ""})`);
      return;
    }

    navigate(PARENT_AREA_PATH);
  };

  // ---------- Gates ----------
  const gate = (title, link) => (
    <div className="ec-container">
      <section className="ec-card ec-gate">
        <h2>{title}</h2>
        {link}
      </section>
    </div>
  );

  let body;
  if (sessionLoading || loading) body = gate(t.loading);
  else if (!user)
    body = gate(
      t.loginTitle,
      <Link className="ec-primary" to={LOGIN_PATH}>
        {t.loginBtn}
      </Link>
    );
  else if (!student)
    body = gate(
      t.notFound,
      <Link className="ec-primary" to={PARENT_AREA_PATH}>
        {t.backBtn}
      </Link>
    );
  else
    body = (
      <div className="ec-container">
        <Link className="ec-back" to={PARENT_AREA_PATH}>
          {fill(t.back, { name: nick })}
        </Link>

        <header className="ec-head">
          <p className="ec-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="ec-sub">{fill(t.subtitle, { name: nick, parent: parentName })}</p>
        </header>

        <div className="ec-tabs" role="tablist">
          <button type="button" role="tab" aria-selected="true" className="ec-tab is-on">
            {t.tabKids}
          </button>
          {[t.tabSchedule, t.tabHistory, t.tabPackages].map((l) => (
            <button key={l} type="button" role="tab" className="ec-tab" disabled title={t.soon}>
              {l}
            </button>
          ))}
        </div>

        <form className="ec-layout" onSubmit={submit} noValidate>
          <div className="ec-main">
            {/* ข้อมูลบุตรหลาน */}
            <section className="ec-card">
              <div className="ec-card-head">
                <h2>{t.cardInfo}</h2>
                <small>{t.required}</small>
              </div>

              <Field id="ec-full" label={t.fullName} error={errors.fullName}>
                <input
                  id="ec-full"
                  className="ac-input"
                  placeholder={t.fullNamePh}
                  value={form.fullName}
                  onChange={set("fullName")}
                  aria-invalid={Boolean(errors.fullName)}
                />
              </Field>

              <div className="ec-two">
                <Field id="ec-nick" label={t.nickname} error={errors.nickname}>
                  <input
                    id="ec-nick"
                    className="ac-input"
                    placeholder={t.nicknamePh}
                    value={form.nickname}
                    onChange={set("nickname")}
                    aria-invalid={Boolean(errors.nickname)}
                  />
                </Field>
                <Field id="ec-eng" label={t.englishName} error={errors.englishName}>
                  <input
                    id="ec-eng"
                    className="ac-input"
                    placeholder={t.englishNamePh}
                    value={form.englishName}
                    onChange={set("englishName")}
                    aria-invalid={Boolean(errors.englishName)}
                  />
                </Field>
              </div>

              <div className="ec-two">
                <Field
                  id="ec-birth"
                  label={t.birthDate}
                  hint={form.birth ? "" : t.birthHintEmpty}
                  error={errors.birth}
                >
                  <DatePicker
                    id="ec-birth"
                    value={form.birth}
                    onChange={set("birth")}
                    maxDate={today}
                    yearsBack={18}
                    language={language}
                    t={t}
                    invalid={Boolean(errors.birth)}
                    describedBy="ec-birth-msg"
                  />
                </Field>
                <Field id="ec-age" label={t.age} hint={age === null ? t.ageHintEmpty : ""}>
                  <input
                    id="ec-age"
                    className="ac-input is-readonly"
                    readOnly
                    tabIndex={-1}
                    value={age === null ? "" : fill(t.ageValue, { n: age })}
                    placeholder={t.agePh}
                  />
                </Field>
              </div>
            </section>

            {/* ข้อมูลเพื่อการดูแล */}
            <section className="ec-card">
              <div className="ec-card-head">
                <h2>{t.careCard}</h2>
              </div>

              <div className="ec-two">
                <Field id="ec-em-name" label={t.emergencyName} error={errors.emergencyName}>
                  <input
                    id="ec-em-name"
                    className="ac-input"
                    placeholder={t.emergencyNamePh}
                    value={form.emergencyName}
                    onChange={set("emergencyName")}
                    aria-invalid={Boolean(errors.emergencyName)}
                  />
                </Field>
                <Field
                  id="ec-em-phone"
                  label={t.emergencyPhone}
                  hint={t.emergencyHint}
                  error={errors.emergencyPhone}
                >
                  <input
                    id="ec-em-phone"
                    className="ac-input"
                    inputMode="tel"
                    placeholder={t.emergencyPhonePh}
                    value={form.emergencyPhone}
                    onChange={set("emergencyPhone")}
                    aria-invalid={Boolean(errors.emergencyPhone)}
                  />
                </Field>
              </div>

              <Field id="ec-notes" label={t.notes} hint={t.notesHint}>
                <textarea
                  id="ec-notes"
                  className="ac-input ec-textarea"
                  rows={3}
                  placeholder={t.notesPh}
                  value={form.notes}
                  onChange={set("notes")}
                />
              </Field>
            </section>

            {saveError && (
              <div className="ec-alert" role="alert">
                {saveError}
              </div>
            )}

            <div className="ec-actions">
              <button type="submit" className="ec-primary" disabled={saving}>
                {saving ? t.saving : t.save}
              </button>
              <Link className="ec-outline" to={PARENT_AREA_PATH}>
                {t.cancel}
              </Link>
            </div>
            <small className="ec-foot">{fill(t.footNote, { name: nick })}</small>
          </div>

          {/* ด้านขวา */}
          <aside className="ec-side">
            <section className="ec-panel is-blue">
              <small className="ec-panel-label">{t.editingNow}</small>
              <div className="ec-who">
                <span className="ec-avatar is-white">{initialOf(student.name)}</span>
                <div>
                  <strong>
                    {[student.full_name || student.name, student.english_name]
                      .filter(Boolean)
                      .join(" / ")}
                  </strong>
                  <small>
                    {student.age
                      ? fill(t.oldAge, { n: student.age, date: todayLabel })
                      : t.ageUnknown}
                  </small>
                </div>
              </div>
              <hr />
              <div className="ec-who">
                <span className="ec-avatar is-purple">{initialOf(parentName)}</span>
                <div>
                  <strong>{parentName}</strong>
                  <small>{t.mainGuardian}</small>
                </div>
              </div>
              {masked && <p className="ec-line">{fill(t.phoneLine, { phone: masked })}</p>}
              <p className="ec-line">{t.linked}</p>
              <hr />
              <p className="ec-strong">
                {fill(t.onlyThis, { name: nick })}
                <br />
                {t.notChange}
              </p>
            </section>

            <section className="ec-panel">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="ec-panel-icon"
              >
                <rect x="4" y="3.5" width="16" height="17" rx="3" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M7.5 17c.8-2 2.5-3 4.5-3s3.7 1 4.5 3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <h3>{fill(t.accountTitle, { name: nick })}</h3>
              <span className="ec-chip">{t.accountChip}</span>
              <p>{fill(t.accountText1, { name: nick })}</p>
              <p>{fill(t.accountText2, { name: nick })}</p>
              <span className="ec-soon" title={t.soon}>
                {fill(t.accountLink, { name: nick })}
              </span>
            </section>

            <section className="ec-note">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="8.1" stroke="currentColor" strokeWidth="1.6" />
                <path d="M10 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="10" cy="6.2" r="1" fill="currentColor" />
              </svg>
              <div>
                <strong>{t.pkgTitle}</strong>
                <p>{fill(t.pkgText, { name: nick })}</p>
              </div>
            </section>
          </aside>
        </form>
      </div>
    );

  return (
    <div className="ec-page">
      <SiteHeader language={language} onLanguageChange={setLanguage} />
      {body}
      <SiteFooter language={language} />
    </div>
  );
}

export default EditChild;