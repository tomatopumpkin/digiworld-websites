import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import "../styles/ForgotPassword.css";
import introPhoto from "../assets/intro-photo.png";
import { supabase } from "../lib/supabase";

import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";

const translations = {
  th: {
    title: "ลืมรหัสผ่านใช่ไหม?",
    subtitle: "กรอกอีเมลที่ใช้สมัคร เราจะช่วยให้คุณกลับเข้าสู่บัญชี",
    emailLabel: "อีเมลบัญชีของคุณ",
    emailPlaceholder: "name@example.com",
    hint: "โปรดกรอกอีเมลในรูปแบบ name@example.com",
    privacy:
      "หากมีบัญชีที่ใช้อีเมลนี้ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ โดยไม่เปิดเผยว่าอีเมลใดมีบัญชีอยู่",
    submit: "ส่งลิงก์ตั้งรหัสผ่านใหม่",
    sending: "กำลังส่งลิงก์...",
    back: "← กลับเข้าสู่ระบบ",
    successTitle: "ตรวจสอบกล่องอีเมลของคุณ",
    successText:
      "หากมีบัญชีที่ใช้อีเมลนี้ คุณจะได้รับวิธีตั้งรหัสผ่านใหม่ โปรดตรวจสอบโฟลเดอร์สแปมด้วย หน้านี้ไม่ยืนยันการมีอยู่ของบัญชี",
    resend: "ส่งอีกครั้ง",
    resendIn: "ส่งอีกครั้งหลัง {s} วินาที",
    help: "ยังไม่ได้รับอีเมล? ตรวจการสะกดหรือติดต่อโรงเรียน",
    emailRequired: "กรุณากรอกอีเมล",
    emailInvalid: "รูปแบบอีเมลไม่ถูกต้อง",
    sendError: "ไม่สามารถส่งลิงก์ได้ กรุณารอสักครู่แล้วลองอีกครั้ง",
    rateLimit:
      "ส่งอีเมลบ่อยเกินไป กรุณารอประมาณ 1 ชั่วโมงแล้วลองอีกครั้ง หรือติดต่อโรงเรียน",
    tagline: "ทุกไอเดียเล็ก ๆ\nเริ่มต้นที่นี่",
    description:
      "ดูแลเส้นทางการเรียนรู้ของลูก จองคลาส และติดตามสิ่งที่เขาสร้างได้ในพื้นที่เดียว",
    brand: "DigiWorld Phuket · Coding & Creative Learning",
    footer: "ข้อมูลบัญชีของคุณได้รับการปกป้อง",
  },
  en: {
    title: "Forgot your password?",
    subtitle: "Enter the email you registered with and we'll help you get back in.",
    emailLabel: "Your account email",
    emailPlaceholder: "name@example.com",
    hint: "Please use the format name@example.com",
    privacy:
      "If an account uses this email, we'll send a link to set a new password, without revealing which emails have accounts.",
    submit: "Send reset link",
    sending: "Sending link...",
    back: "← Back to log in",
    successTitle: "Check your inbox",
    successText:
      "If an account uses this email, you'll receive instructions to set a new password. Please check your spam folder too. This page does not confirm whether an account exists.",
    resend: "Send again",
    resendIn: "Send again in {s} seconds",
    help: "Didn't get the email? Check the spelling or contact the school.",
    emailRequired: "Please enter your email address.",
    emailInvalid: "Please enter a valid email address.",
    sendError: "Unable to send the link. Please wait a moment and try again.",
    rateLimit:
      "Too many emails were sent. Please wait about an hour and try again, or contact the school.",
    tagline: "Small ideas,\nbig possibilities",
    description:
      "Manage your child's learning journey, book classes and follow their creations in one place.",
    brand: "DigiWorld Phuket · Coding & Creative Learning",
    footer: "Your account information is protected.",
  },
  zh: {
    title: "忘记密码了吗？",
    subtitle: "输入注册时使用的电子邮件，我们将帮助您重新登录。",
    emailLabel: "您的账户邮箱",
    emailPlaceholder: "name@example.com",
    hint: "请使用 name@example.com 格式",
    privacy: "如果该邮箱已注册，我们会发送设置新密码的链接，且不会透露哪些邮箱已有账户。",
    submit: "发送重置链接",
    sending: "正在发送链接...",
    back: "← 返回登录",
    successTitle: "请查看您的邮箱",
    successText:
      "如果该邮箱已注册，您将收到设置新密码的说明。请同时检查垃圾邮件文件夹。本页面不会确认账户是否存在。",
    resend: "重新发送",
    resendIn: "{s} 秒后可重新发送",
    help: "没有收到邮件？请检查拼写或联系学校。",
    emailRequired: "请输入电子邮箱。",
    emailInvalid: "电子邮箱格式不正确。",
    sendError: "无法发送链接，请稍后再试。",
    rateLimit: "发送邮件过于频繁，请等待约 1 小时后再试，或联系学校。",
    tagline: "小小创意，\n无限可能",
    description: "在一个地方管理孩子的学习、预约课程并查看作品。",
    brand: "DigiWorld Phuket · Coding & Creative Learning",
    footer: "您的账户信息受到保护。",
  },
  ru: {
    title: "Забыли пароль?",
    subtitle: "Введите почту, с которой вы регистрировались, и мы поможем вернуть доступ.",
    emailLabel: "Электронная почта аккаунта",
    emailPlaceholder: "name@example.com",
    hint: "Используйте формат name@example.com",
    privacy:
      "Если аккаунт с этой почтой существует, мы отправим ссылку для установки нового пароля, не раскрывая, какие адреса зарегистрированы.",
    submit: "Отправить ссылку",
    sending: "Отправка ссылки...",
    back: "← Назад ко входу",
    successTitle: "Проверьте почту",
    successText:
      "Если аккаунт с этой почтой существует, вы получите инструкцию по установке нового пароля. Проверьте также папку «Спам». Эта страница не подтверждает наличие аккаунта.",
    resend: "Отправить ещё раз",
    resendIn: "Отправить ещё раз через {s} с",
    help: "Письмо не пришло? Проверьте написание адреса или свяжитесь со школой.",
    emailRequired: "Пожалуйста, введите электронную почту.",
    emailInvalid: "Неверный формат электронной почты.",
    sendError: "Не удалось отправить ссылку. Подождите немного и повторите.",
    rateLimit:
      "Слишком много писем отправлено. Подождите около часа и повторите попытку или свяжитесь со школой.",
    tagline: "Маленькие идеи,\nбольшие возможности",
    description:
      "Управляйте обучением ребёнка, записывайтесь на занятия и следите за его работами в одном месте.",
    brand: "DigiWorld Phuket · Coding & Creative Learning",
    footer: "Данные вашей учётной записи защищены.",
  },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOLDOWN_SECONDS = 60;

function ForgotPassword() {
  const location = useLocation();
  const [language, setLanguage] = useLanguage();
  const t = translations[language];

  const [email, setEmail] = useState(location.state?.email || "");
  const [errorKey, setErrorKey] = useState(""); // เก็บเป็น key เพื่อให้เปลี่ยนภาษาแล้วข้อความเปลี่ยนตาม
  const [sendError, setSendError] = useState(""); // "" | "sendError" | "rateLimit"
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // นับถอยหลังปุ่มส่งอีกครั้ง
  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendResetLink = async () => {
    if (loading || cooldown > 0) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorKey("emailRequired");
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorKey("emailInvalid");
      return;
    }

    setErrorKey("");
    setSendError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      trimmedEmail.toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setLoading(false);

    if (error) {
      console.error("Reset password error:", error);

      const isRateLimit =
        error.status === 429 ||
        error.code === "over_email_send_rate_limit" ||
        /rate limit/i.test(error.message || "");

      setSendError(isRateLimit ? "rateLimit" : "sendError");
      return;
    }

    // แสดงผลสำเร็จเสมอ ไม่บอกว่าอีเมลนี้มีบัญชีหรือไม่
    setSent(true);
    setCooldown(COOLDOWN_SECONDS);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendResetLink();
  };

  return (
    <div className="login-page">
      <SiteHeader language={language} onLanguageChange={setLanguage} />

      <main className="login-main">
        <section className="login-intro">
          <div className="login-eyebrow">SMALL IDEAS, BIG POSSIBILITIES</div>

          <h1>
            {t.tagline.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {index > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </h1>

          <p className="login-description">{t.description}</p>

          <img
            className="login-intro-image"
            src={introPhoto}
            alt="Digiworld Coding and Creative Learning"
          />

          <p className="login-brand-caption">
            {t.brand}
            <br />
            {t.footer}
          </p>
        </section>

        <section className="login-card">
          <h2>{t.title}</h2>
          <p className="login-subtitle">{t.subtitle}</p>

          <form className="fp-form" onSubmit={handleSubmit} noValidate>
            <div className="fp-field">
              <label htmlFor="fp-email">{t.emailLabel}</label>

              <input
                id="fp-email"
                type="email"
                value={email}
                placeholder={t.emailPlaceholder}
                autoComplete="email"
                className={errorKey ? "input-error" : ""}
                aria-invalid={Boolean(errorKey)}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrorKey("");
                  setSendError("");
                }}
              />

              {errorKey ? (
                <p className="fp-error">{t[errorKey]}</p>
              ) : (
                <p className="fp-hint">{t.hint}</p>
              )}
            </div>

            <p className="fp-privacy">{t.privacy}</p>

            {sendError && (
              <div className="fp-alert" role="alert">
                {t[sendError]}
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading || cooldown > 0}
            >
              {loading ? t.sending : t.submit}
            </button>
          </form>

          <Link to="/login" className="fp-back">
            {t.back}
          </Link>

          {sent && (
            <>
              <div className="fp-divider" />

              <div className="fp-success" role="status">
                <strong>{t.successTitle}</strong>
                <p>{t.successText}</p>
              </div>

              <button
                type="button"
                className="fp-resend"
                onClick={sendResetLink}
                disabled={loading || cooldown > 0}
              >
                {cooldown > 0
                  ? t.resendIn.replace("{s}", cooldown)
                  : t.resend}
              </button>

              <p className="fp-help">{t.help}</p>
            </>
          )}
        </section>
      </main>

      <SiteFooter language={language} />
    </div>
  );
}

export default ForgotPassword;