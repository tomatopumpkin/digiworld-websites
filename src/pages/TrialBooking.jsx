import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import "../styles/TrialBooking.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";
import useSession from "../lib/useSession";
import { supabase } from "../lib/supabase";

// ---------------------------------------------------------------
// ตั้งค่า
// ---------------------------------------------------------------
const TRIAL_MINUTES = 45;
const DAYS_AHEAD = 14; // เปิดให้เลือกกี่วันล่วงหน้า (เริ่มจากพรุ่งนี้)
// รอบเวลาตัวอย่าง: ภายหลังควรดึงจากตารางในฐานข้อมูลและตรวจที่นั่งที่ฝั่งเซิร์ฟเวอร์
const SLOT_STARTS = ["10:00", "11:45", "14:00", "16:00"];
const CONTACT = { line: "@digiworldphuket", phone: "081 855 9762" };

// ชื่อคอร์สตรงกับหน้า Courses (ageMin/ageMax ใช้เตือนถ้าอายุไม่ตรง)
const COURSES = [
  { id: "matata", name: "Matata", ageMin: 3, ageMax: 6 },
  { id: "scratch", name: "Scratch & Game Design", ageMin: 6, ageMax: 99 },
  { id: "procreate", name: "Procreate", ageMin: 6, ageMax: 99 },
  { id: "spike-essential", name: "LEGO SPIKE Essential", ageMin: 6, ageMax: 99 },
  { id: "roblox", name: "Roblox Game Maker", ageMin: 8, ageMax: 99 },
  { id: "python", name: "Python Programming", ageMin: 10, ageMax: 99 },
  { id: "spike-prime", name: "LEGO SPIKE Prime", ageMin: 10, ageMax: 99 },
];

const AGES = Array.from({ length: 13 }, (_, i) => i + 3); // 3–15 ปี

const LOCALES = {
  th: "th-TH-u-ca-gregory",
  en: "en-GB",
  zh: "zh-CN",
  ru: "ru-RU",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_ORDER = [
  "parentName",
  "phone",
  "email",
  "nickname",
  "age",
  "courseId",
  "date",
  "slot",
  "consent",
];

// ---------------------------------------------------------------
// ข้อความ 4 ภาษา
// ---------------------------------------------------------------
const translations = {
  th: {
    crumbHome: "หน้าแรก",
    crumbCourses: "คอร์สเรียน",
    crumbTrial: "ทดลองเรียนฟรี",
    step1: "ข้อมูล",
    step2: "ยืนยัน",
    title: "ให้ความอยากรู้ได้ลองลงมือ",
    note: "รอบเวลาที่แสดงเป็นข้อมูลตัวอย่าง ทีมงานจะติดต่อกลับเพื่อยืนยันที่นั่งอีกครั้ง",
    parentSection: "ข้อมูลผู้ปกครอง",
    parentName: "ชื่อ–นามสกุล",
    phone: "เบอร์โทรศัพท์",
    email: "อีเมล",
    childSection: "เล่าเรื่องลูกให้เราฟังสักนิด",
    nickname: "ชื่อเล่น",
    age: "อายุ",
    ageOption: "{n} ปี",
    agePlaceholder: "เลือกอายุ",
    interests: "สนใจอะไรเป็นพิเศษ? (ไม่บังคับ)",
    interestsPlaceholder: "เช่น ชอบต่อ LEGO หรือชอบเล่าเรื่อง",
    course: "คอร์สที่อยากทดลอง",
    coursePlaceholder: "เลือกคอร์ส",
    date: "วันทดลองเรียน",
    datePlaceholder: "เลือกวัน",
    slot: "รอบเวลา",
    slotPlaceholder: "เลือกรอบเวลา",
    slotHelp: "รอบทดลองแยกจากคลาสปกติ ใช้เวลา 45 นาที",
    ageWarning: "คอร์สนี้แนะนำสำหรับอายุ {range} ครูจะช่วยประเมินความพร้อมของลูกให้ในวันทดลองเรียน",
    consent: "ยินยอมให้ใช้ข้อมูลติดต่อและข้อมูลเด็กเพื่อจัดคลาสทดลอง ตามนโยบายความเป็นส่วนตัว",
    review: "ตรวจสอบข้อมูล",
    reviewTitle: "ตรวจสอบก่อนยืนยัน",
    reviewText: "โปรดตรวจสอบข้อมูลให้ถูกต้อง แล้วกดยืนยันเพื่อส่งคำขอทดลองเรียน",
    edit: "← แก้ไขข้อมูล",
    confirm: "ยืนยันทดลองเรียนฟรี",
    submitting: "กำลังส่งคำขอ...",
    submitError: "ไม่สามารถส่งคำขอได้ กรุณาลองอีกครั้ง หรือติดต่อทาง LINE",
    required: "กรุณากรอกข้อมูลนี้",
    selectRequired: "กรุณาเลือกข้อมูลนี้",
    phoneInvalid: "เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)",
    emailInvalid: "รูปแบบอีเมลไม่ถูกต้อง",
    consentRequired: "กรุณายินยอมก่อนส่งคำขอ",
    sideTitle: "คลาสแรกที่ไม่มีข้อผูกมัด",
    badge: "ฟรี · 45 นาที",
    sideCourse: "คอร์ส",
    sideChild: "นักเรียน",
    sideWhen: "วันและเวลา",
    sideDuration: "ระยะเวลา",
    sideDurationValue: "{m} นาที",
    sideCost: "ค่าใช้จ่าย",
    sideFootnote: "DigiWorld Phuket (Robotic)\nอุปกรณ์พร้อมใช้ในคลาส\nไม่หักครั้งจากแพ็กเกจที่มีอยู่",
    childLine: "{name} · อายุ {age} ปี",
    empty: "—",
    tipTitle: "ก่อนส่งแบบฟอร์ม",
    tipText: "กรอกช่องที่มี * ให้ครบ หากอีเมลหรือเบอร์โทรไม่ถูกต้อง จะแสดงข้อความใต้ช่องและยังไม่ส่งคำขอ",
    helpTitle: "ถ้าวันที่เลือกไม่มีรอบที่ต้องการ",
    helpText: "เลือกวันอื่น หรือติดต่อ LINE {line} หรือโทร {phone} ทีมงานจะช่วยหารอบให้",
    openHours: "เปิดทุกวัน 9:30–18:30",
    doneTitle: "ส่งคำขอทดลองเรียนแล้ว",
    doneText: "ทีมงานจะติดต่อกลับทางเบอร์โทรหรืออีเมลที่ให้ไว้ เพื่อยืนยันที่นั่ง",
    doneCourses: "ดูคอร์สอื่น",
    doneHome: "กลับหน้าแรก",
    summaryParent: "ผู้ปกครอง",
  },
  en: {
    crumbHome: "Home",
    crumbCourses: "Courses",
    crumbTrial: "Free Trial",
    step1: "Details",
    step2: "Confirm",
    title: "Let Curiosity Try Something Hands-On",
    note: "The time slots shown are samples. Our team will contact you to confirm your seat.",
    parentSection: "Parent details",
    parentName: "Full name",
    phone: "Phone number",
    email: "Email",
    childSection: "Tell us a little about your child",
    nickname: "Nickname",
    age: "Age",
    ageOption: "{n} years",
    agePlaceholder: "Select age",
    interests: "Any special interests? (optional)",
    interestsPlaceholder: "e.g. loves building with LEGO or telling stories",
    course: "Course to try",
    coursePlaceholder: "Select a course",
    date: "Trial date",
    datePlaceholder: "Select a date",
    slot: "Time slot",
    slotPlaceholder: "Select a time slot",
    slotHelp: "Trial sessions are separate from regular classes and last 45 minutes.",
    ageWarning: "This course is recommended for ages {range}. Our teachers will assess your child's readiness at the trial.",
    consent: "I agree to the use of contact and child information to arrange the trial class, as described in the privacy policy.",
    review: "Review details",
    reviewTitle: "Review before confirming",
    reviewText: "Please check your details, then confirm to send your trial request.",
    edit: "← Edit details",
    confirm: "Confirm free trial",
    submitting: "Sending request...",
    submitError: "Unable to send your request. Please try again or contact us on LINE.",
    required: "Please fill in this field.",
    selectRequired: "Please select an option.",
    phoneInvalid: "Invalid phone number (e.g. 0812345678)",
    emailInvalid: "Please enter a valid email address.",
    consentRequired: "Please agree before sending your request.",
    sideTitle: "A first class with no commitment",
    badge: "FREE · 45 MIN",
    sideCourse: "Course",
    sideChild: "Student",
    sideWhen: "Date & time",
    sideDuration: "Duration",
    sideDurationValue: "{m} minutes",
    sideCost: "Cost",
    sideFootnote: "DigiWorld Phuket (Robotic)\nEquipment provided in class\nDoes not use sessions from an existing package",
    childLine: "{name} · {age} years old",
    empty: "—",
    tipTitle: "Before you submit",
    tipText: "Fill in all fields marked *. If your email or phone number is invalid, a message appears under the field and the request is not sent.",
    helpTitle: "If your date has no suitable slot",
    helpText: "Pick another date, or contact us on LINE {line} or call {phone} and we will help find a slot.",
    openHours: "Open daily 9:30 AM–6:30 PM",
    doneTitle: "Trial request sent",
    doneText: "Our team will contact you by phone or email to confirm your seat.",
    doneCourses: "Browse other courses",
    doneHome: "Back to home",
    summaryParent: "Parent",
  },
  zh: {
    crumbHome: "首页",
    crumbCourses: "课程",
    crumbTrial: "免费试听",
    step1: "填写信息",
    step2: "确认",
    title: "让好奇心动手试一试",
    note: "显示的时段为示例，团队会联系您再次确认名额。",
    parentSection: "家长信息",
    parentName: "姓名",
    phone: "手机号码",
    email: "电子邮箱",
    childSection: "简单介绍一下孩子",
    nickname: "昵称",
    age: "年龄",
    ageOption: "{n} 岁",
    agePlaceholder: "选择年龄",
    interests: "有什么特别的兴趣？（选填）",
    interestsPlaceholder: "例如：喜欢搭乐高、喜欢讲故事",
    course: "想试听的课程",
    coursePlaceholder: "选择课程",
    date: "试听日期",
    datePlaceholder: "选择日期",
    slot: "时间段",
    slotPlaceholder: "选择时间段",
    slotHelp: "试听课与正式课程分开安排，时长 45 分钟。",
    ageWarning: "该课程建议年龄为 {range}。试听当天老师会帮助评估孩子的准备情况。",
    consent: "我同意按照隐私政策，使用联系方式和孩子信息来安排试听课。",
    review: "检查信息",
    reviewTitle: "确认前请检查",
    reviewText: "请核对信息是否正确，然后点击确认提交试听申请。",
    edit: "← 修改信息",
    confirm: "确认免费试听",
    submitting: "正在提交...",
    submitError: "无法提交申请，请重试或通过 LINE 联系我们。",
    required: "请填写此项。",
    selectRequired: "请选择此项。",
    phoneInvalid: "手机号码不正确（例如 0812345678）",
    emailInvalid: "电子邮箱格式不正确。",
    consentRequired: "提交前请先同意。",
    sideTitle: "无需承诺的第一节课",
    badge: "免费 · 45 分钟",
    sideCourse: "课程",
    sideChild: "学生",
    sideWhen: "日期和时间",
    sideDuration: "时长",
    sideDurationValue: "{m} 分钟",
    sideCost: "费用",
    sideFootnote: "DigiWorld Phuket（Robotic）\n课堂提供所需设备\n不会扣除已有套餐的课时",
    childLine: "{name} · {age} 岁",
    empty: "—",
    tipTitle: "提交之前",
    tipText: "请填写所有带 * 的项目。若邮箱或手机号码不正确，会在输入框下方提示，且不会提交申请。",
    helpTitle: "如果所选日期没有合适的时段",
    helpText: "请选择其他日期，或通过 LINE {line} 或电话 {phone} 联系我们，我们会帮您安排。",
    openHours: "每天 9:30–18:30 营业",
    doneTitle: "试听申请已提交",
    doneText: "团队会通过您留下的电话或邮箱联系您确认名额。",
    doneCourses: "查看其他课程",
    doneHome: "返回首页",
    summaryParent: "家长",
  },
  ru: {
    crumbHome: "Главная",
    crumbCourses: "Курсы",
    crumbTrial: "Пробное занятие",
    step1: "Данные",
    step2: "Подтверждение",
    title: "Пусть любопытство попробует на практике",
    note: "Показанное время — примерное. Мы свяжемся с вами, чтобы подтвердить место.",
    parentSection: "Данные родителя",
    parentName: "Имя и фамилия",
    phone: "Телефон",
    email: "Электронная почта",
    childSection: "Расскажите немного о ребёнке",
    nickname: "Имя ребёнка",
    age: "Возраст",
    ageOption: "{n} лет",
    agePlaceholder: "Выберите возраст",
    interests: "Особые интересы? (необязательно)",
    interestsPlaceholder: "Например: любит собирать LEGO или рассказывать истории",
    course: "Курс для пробного занятия",
    coursePlaceholder: "Выберите курс",
    date: "Дата пробного занятия",
    datePlaceholder: "Выберите дату",
    slot: "Время",
    slotPlaceholder: "Выберите время",
    slotHelp: "Пробное занятие проходит отдельно от обычных и длится 45 минут.",
    ageWarning: "Курс рекомендован для возраста {range}. На пробном занятии преподаватель оценит готовность ребёнка.",
    consent: "Я согласен(на) на использование контактных данных и данных ребёнка для организации пробного занятия согласно политике конфиденциальности.",
    review: "Проверить данные",
    reviewTitle: "Проверьте перед подтверждением",
    reviewText: "Убедитесь, что данные верны, и подтвердите заявку на пробное занятие.",
    edit: "← Изменить данные",
    confirm: "Подтвердить бесплатное занятие",
    submitting: "Отправка заявки...",
    submitError: "Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в LINE.",
    required: "Заполните это поле.",
    selectRequired: "Выберите вариант.",
    phoneInvalid: "Неверный номер телефона (например, 0812345678)",
    emailInvalid: "Неверный формат электронной почты.",
    consentRequired: "Подтвердите согласие перед отправкой.",
    sideTitle: "Первое занятие без обязательств",
    badge: "БЕСПЛАТНО · 45 МИН",
    sideCourse: "Курс",
    sideChild: "Ученик",
    sideWhen: "Дата и время",
    sideDuration: "Длительность",
    sideDurationValue: "{m} минут",
    sideCost: "Стоимость",
    sideFootnote: "DigiWorld Phuket (Robotic)\nОборудование выдаётся на занятии\nЗанятия из действующего пакета не списываются",
    childLine: "{name} · {age} лет",
    empty: "—",
    tipTitle: "Перед отправкой",
    tipText: "Заполните все поля со звёздочкой *. Если почта или телефон указаны неверно, под полем появится сообщение, а заявка не отправится.",
    helpTitle: "Если на выбранную дату нет подходящего времени",
    helpText: "Выберите другую дату или свяжитесь с нами в LINE {line} либо по телефону {phone}.",
    openHours: "Ежедневно 9:30–18:30",
    doneTitle: "Заявка отправлена",
    doneText: "Мы свяжемся с вами по телефону или почте, чтобы подтвердить место.",
    doneCourses: "Посмотреть другие курсы",
    doneHome: "На главную",
    summaryParent: "Родитель",
  },
};

// ---------------------------------------------------------------
// ตัวช่วย
// ---------------------------------------------------------------
const fill = (text, values) =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.split(`{${key}}`).join(value),
    text
  );

const pad = (n) => String(n).padStart(2, "0");

const toISODate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const addMinutes = (time, minutes) => {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
};

const slotLabel = (start) => `${start}–${addMinutes(start, TRIAL_MINUTES)}`;

const normalizePhone = (value) => {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+66")) return `0${digits.slice(3)}`;
  if (digits.startsWith("66") && digits.length === 11) return `0${digits.slice(2)}`;
  return digits.replace(/\D/g, "");
};

const buildDates = () => {
  const list = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = 1; i <= DAYS_AHEAD; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    list.push(d);
  }
  return list;
};

const INITIAL = {
  parentName: "",
  phone: "",
  email: "",
  nickname: "",
  age: "",
  interests: "",
  courseId: "",
  date: "",
  slot: "",
  consent: false,
};

// ---------------------------------------------------------------
// คอมโพเนนต์ย่อย
// ---------------------------------------------------------------
function Field({ id, label, required = true, error, help, children }) {
  return (
    <div className="tb-field">
      <label htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {error ? (
        <p className="tb-error" id={`${id}-msg`}>
          {error}
        </p>
      ) : (
        help && <p className="tb-help">{help}</p>
      )}
    </div>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <div className="tb-row">
      <span>{label}</span>
      <strong className={strong ? "is-cost" : ""}>{value}</strong>
    </div>
  );
}

// ---------------------------------------------------------------
// หน้าหลัก
// ---------------------------------------------------------------
function TrialBooking() {
  const location = useLocation();
  const [language, setLanguage] = useLanguage();
  const { session } = useSession();
  const t = translations[language] || translations.en;
  const locale = LOCALES[language] || LOCALES.en;

  const initialCourse = COURSES.some((c) => c.id === location.state?.courseId)
    ? location.state.courseId
    : "";

  const [values, setValues] = useState({ ...INITIAL, courseId: initialCourse });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("form"); // form | review | done
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // เติมอีเมลจากบัญชีที่ล็อกอินอยู่ (ถ้ายังไม่ได้กรอก)
  useEffect(() => {
    const accountEmail = session?.user?.email;
    if (accountEmail) {
      setValues((prev) => (prev.email ? prev : { ...prev, email: accountEmail }));
    }
  }, [session]);

  const dates = useMemo(buildDates, []);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [locale]
  );

  const shortDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }),
    [locale]
  );

  const course = COURSES.find((c) => c.id === values.courseId);
  const ageNumber = Number(values.age);

  const ageOutOfRange =
    course && ageNumber && (ageNumber < course.ageMin || ageNumber > course.ageMax);

  const ageRange = course
    ? course.ageMax >= 99
      ? `${course.ageMin}+`
      : `${course.ageMin}–${course.ageMax}`
    : "";

  const selectedDate = dates.find((d) => toISODate(d) === values.date);

  const update = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSubmitError(false);
  };

  const validate = () => {
    const next = {};

    if (!values.parentName.trim()) next.parentName = "required";

    if (!values.phone.trim()) next.phone = "required";
    else if (!/^0\d{8,9}$/.test(normalizePhone(values.phone))) next.phone = "phoneInvalid";

    if (!values.email.trim()) next.email = "required";
    else if (!EMAIL_REGEX.test(values.email.trim())) next.email = "emailInvalid";

    if (!values.nickname.trim()) next.nickname = "required";
    if (!values.age) next.age = "selectRequired";
    if (!values.courseId) next.courseId = "selectRequired";
    if (!values.date) next.date = "selectRequired";
    if (!values.slot) next.slot = "selectRequired";
    if (!values.consent) next.consent = "consentRequired";

    setErrors(next);

    const firstKey = FIELD_ORDER.find((key) => next[key]);
    if (firstKey) {
      const el = document.getElementById(`tb-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }
    }

    return !firstKey;
  };

  const goReview = (event) => {
    event.preventDefault();
    if (validate()) {
      setStep("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submit = async () => {
    if (submitting) return;

    setSubmitting(true);
    setSubmitError(false);

    const { error } = await supabase.from("trial_bookings").insert({
      parent_name: values.parentName.trim(),
      phone: normalizePhone(values.phone),
      email: values.email.trim().toLowerCase(),
      child_nickname: values.nickname.trim(),
      child_age: ageNumber,
      interests: values.interests.trim() || null,
      course_id: values.courseId,
      trial_date: values.date,
      trial_time: values.slot,
      locale: language,
    });

    setSubmitting(false);

    if (error) {
      console.error("Trial booking error:", error);
      setSubmitError(true);
      return;
    }

    setStep("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const errorText = (field) => (errors[field] ? t[errors[field]] : "");

  const whenText =
    selectedDate && values.slot
      ? `${shortDateFormatter.format(selectedDate)} · ${values.slot}`
      : t.empty;

  const childText =
    values.nickname.trim() && values.age
      ? fill(t.childLine, { name: values.nickname.trim(), age: values.age })
      : t.empty;

  const stepIndex = step === "form" ? 1 : 2;

  // ---------- ฟอร์ม ----------
  const renderForm = () => (
    <form className="tb-main" onSubmit={goReview} noValidate>
      <section className="tb-card">
        <h2>{t.parentSection}</h2>

        <Field id="tb-parentName" label={t.parentName} error={errorText("parentName")}>
          <input
            id="tb-parentName"
            type="text"
            autoComplete="name"
            value={values.parentName}
            className={errors.parentName ? "has-error" : ""}
            aria-invalid={Boolean(errors.parentName)}
            onChange={(e) => update("parentName", e.target.value)}
          />
        </Field>

        <div className="tb-two">
          <Field id="tb-phone" label={t.phone} error={errorText("phone")}>
            <input
              id="tb-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="081 234 5678"
              value={values.phone}
              className={errors.phone ? "has-error" : ""}
              aria-invalid={Boolean(errors.phone)}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>

          <Field id="tb-email" label={t.email} error={errorText("email")}>
            <input
              id="tb-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={values.email}
              className={errors.email ? "has-error" : ""}
              aria-invalid={Boolean(errors.email)}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="tb-card">
        <h2>{t.childSection}</h2>

        <div className="tb-two">
          <Field id="tb-nickname" label={t.nickname} error={errorText("nickname")}>
            <input
              id="tb-nickname"
              type="text"
              value={values.nickname}
              className={errors.nickname ? "has-error" : ""}
              aria-invalid={Boolean(errors.nickname)}
              onChange={(e) => update("nickname", e.target.value)}
            />
          </Field>

          <Field id="tb-age" label={t.age} error={errorText("age")}>
            <select
              id="tb-age"
              value={values.age}
              className={errors.age ? "has-error" : ""}
              aria-invalid={Boolean(errors.age)}
              onChange={(e) => update("age", e.target.value)}
            >
              <option value="">{t.agePlaceholder}</option>
              {AGES.map((n) => (
                <option key={n} value={n}>
                  {fill(t.ageOption, { n })}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field id="tb-interests" label={t.interests} required={false}>
          <textarea
            id="tb-interests"
            rows={2}
            maxLength={300}
            placeholder={t.interestsPlaceholder}
            value={values.interests}
            onChange={(e) => update("interests", e.target.value)}
          />
        </Field>

        <Field id="tb-courseId" label={t.course} error={errorText("courseId")}>
          <select
            id="tb-courseId"
            value={values.courseId}
            className={errors.courseId ? "has-error" : ""}
            aria-invalid={Boolean(errors.courseId)}
            onChange={(e) => update("courseId", e.target.value)}
          >
            <option value="">{t.coursePlaceholder}</option>
            {COURSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        {ageOutOfRange && (
          <p className="tb-warning" role="status">
            {fill(t.ageWarning, { range: ageRange })}
          </p>
        )}

        <div className="tb-two">
          <Field id="tb-date" label={t.date} error={errorText("date")}>
            <select
              id="tb-date"
              value={values.date}
              className={errors.date ? "has-error" : ""}
              aria-invalid={Boolean(errors.date)}
              onChange={(e) => update("date", e.target.value)}
            >
              <option value="">{t.datePlaceholder}</option>
              {dates.map((d) => (
                <option key={toISODate(d)} value={toISODate(d)}>
                  {dateFormatter.format(d)}
                </option>
              ))}
            </select>
          </Field>

          <Field id="tb-slot" label={t.slot} error={errorText("slot")}>
            <select
              id="tb-slot"
              value={values.slot}
              className={errors.slot ? "has-error" : ""}
              aria-invalid={Boolean(errors.slot)}
              onChange={(e) => update("slot", e.target.value)}
            >
              <option value="">{t.slotPlaceholder}</option>
              {SLOT_STARTS.map((start) => (
                <option key={start} value={slotLabel(start)}>
                  {slotLabel(start)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <p className="tb-help">{t.slotHelp}</p>
      </section>

      <div className="tb-consent">
        <label>
          <input
            id="tb-consent"
            type="checkbox"
            checked={values.consent}
            aria-invalid={Boolean(errors.consent)}
            onChange={(e) => update("consent", e.target.checked)}
          />
          <span>{t.consent} *</span>
        </label>
        {errors.consent && <p className="tb-error">{t[errors.consent]}</p>}
      </div>

      <button type="submit" className="tb-primary">
        {t.review}
      </button>
    </form>
  );

  // ---------- ตรวจสอบก่อนยืนยัน ----------
  const renderReview = () => (
    <div className="tb-main">
      <section className="tb-card">
        <h2>{t.reviewTitle}</h2>
        <p className="tb-help">{t.reviewText}</p>

        <dl className="tb-review">
          <div>
            <dt>{t.summaryParent}</dt>
            <dd>
              {values.parentName.trim()}
              <br />
              {normalizePhone(values.phone)} · {values.email.trim()}
            </dd>
          </div>
          <div>
            <dt>{t.sideChild}</dt>
            <dd>
              {childText}
              {values.interests.trim() && (
                <>
                  <br />
                  {values.interests.trim()}
                </>
              )}
            </dd>
          </div>
          <div>
            <dt>{t.sideCourse}</dt>
            <dd>{course?.name}</dd>
          </div>
          <div>
            <dt>{t.sideWhen}</dt>
            <dd>
              {selectedDate && dateFormatter.format(selectedDate)} · {values.slot}
            </dd>
          </div>
        </dl>
      </section>

      {submitError && (
        <div className="tb-alert" role="alert">
          {t.submitError}
        </div>
      )}

      <div className="tb-actions">
        <button
          type="button"
          className="tb-link"
          onClick={() => setStep("form")}
          disabled={submitting}
        >
          {t.edit}
        </button>
        <button
          type="button"
          className="tb-primary"
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? t.submitting : t.confirm}
        </button>
      </div>
    </div>
  );

  // ---------- สำเร็จ ----------
  const renderDone = () => (
    <div className="tb-main">
      <section className="tb-card tb-done" role="status">
        <h2>{t.doneTitle}</h2>
        <p>{t.doneText}</p>

        <dl className="tb-review">
          <div>
            <dt>{t.sideCourse}</dt>
            <dd>{course?.name}</dd>
          </div>
          <div>
            <dt>{t.sideChild}</dt>
            <dd>{childText}</dd>
          </div>
          <div>
            <dt>{t.sideWhen}</dt>
            <dd>
              {selectedDate && dateFormatter.format(selectedDate)} · {values.slot}
            </dd>
          </div>
        </dl>

        <div className="tb-actions">
          <Link className="tb-outline" to="/courses">
            {t.doneCourses}
          </Link>
          <Link className="tb-primary" to="/">
            {t.doneHome}
          </Link>
        </div>
      </section>
    </div>
  );

  return (
    <div className="tb-page">
      <SiteHeader language={language} onLanguageChange={setLanguage} />

      <div className="tb-container">
        <nav className="tb-crumbs" aria-label="Breadcrumb">
          <Link to="/">{t.crumbHome}</Link>
          <span>/</span>
          <Link to="/courses">{t.crumbCourses}</Link>
          <span>/</span>
          <span aria-current="page">{t.crumbTrial}</span>
        </nav>

        <header className="tb-head">
          <p className="tb-steps" aria-label={`${stepIndex} / 2`}>
            <span className={stepIndex === 1 ? "is-current" : ""}>1 {t.step1}</span>
            <span aria-hidden="true">→</span>
            <span className={stepIndex === 2 ? "is-current" : ""}>2 {t.step2}</span>
          </p>
          <h1>{t.title}</h1>
          <p className="tb-note">{t.note}</p>
        </header>

        <div className="tb-layout">
          {step === "form" && renderForm()}
          {step === "review" && renderReview()}
          {step === "done" && renderDone()}

          <aside className="tb-side">
            <section className="tb-card">
              <h2>{t.sideTitle}</h2>
              <span className="tb-badge">{t.badge}</span>

              <SummaryRow label={t.sideCourse} value={course?.name || t.empty} />
              <SummaryRow label={t.sideChild} value={childText} />
              <SummaryRow label={t.sideWhen} value={whenText} />
              <SummaryRow
                label={t.sideDuration}
                value={fill(t.sideDurationValue, { m: TRIAL_MINUTES })}
              />
              <SummaryRow label={t.sideCost} value="฿0" strong />

              <p className="tb-footnote">{t.sideFootnote}</p>
            </section>

            <section className="tb-tip tone-blue">
              <h3>{t.tipTitle}</h3>
              <p>{t.tipText}</p>
            </section>

            <section className="tb-tip tone-yellow">
              <h3>{t.helpTitle}</h3>
              <p>{fill(t.helpText, CONTACT)}</p>
              <p className="tb-hours">{t.openHours}</p>
            </section>
          </aside>
        </div>
      </div>

      <SiteFooter language={language} />
    </div>
  );
}

export default TrialBooking;
