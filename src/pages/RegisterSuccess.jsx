
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import "../styles/Register.css";
import "../styles/RegisterSuccess.css";

import logo from "../assets/Logo.jpeg";

const languages = [
  { code: "th", label: "ไทย", short: "TH" },
  { code: "en", label: "English", short: "EN" },
  { code: "zh", label: "简体中文", short: "ZH" },
  { code: "ru", label: "Русский", short: "RU" },
];

const translations = {
  th: {
    home: "หน้าหลัก",
    courses: "คอร์สเรียน",
    parents: "ผู้ปกครอง",
    booking: "จองคลาสเรียน",
    login: "เข้าสู่ระบบ",
    title: "สมัครสมาชิกสำเร็จแล้ว!",
    description:
      "เราได้ส่งลิงก์ยืนยันบัญชีไปยังอีเมลของคุณแล้ว กรุณาเปิดอีเมลและกดลิงก์ยืนยันก่อนเข้าสู่ระบบ",
    emailLabel: "อีเมลที่ใช้สมัคร",
    emailHint: "หากไม่พบอีเมล กรุณาตรวจสอบในกล่องจดหมายขยะ (Spam)",
    loginHint: "ยืนยันอีเมลเรียบร้อยแล้วใช่ไหม?",
    back: "← กลับหน้าหลัก",
  },

  en: {
    home: "Home",
    courses: "Courses",
    parents: "Parent Portal",
    booking: "Book a Class",
    login: "Log in",
    title: "Registration Successful!",
    description:
      "We have sent an account confirmation link to your email. Please open the email and click the link before logging in.",
    emailLabel: "Registered email",
    emailHint: "If you cannot find the email, please check your Spam folder.",
    loginHint: "Have you confirmed your email?",
    back: "← Back to Home",
  },

  zh: {
    home: "首页",
    courses: "课程",
    parents: "家长中心",
    booking: "预约课程",
    login: "登录",
    title: "注册成功！",
    description:
      "我们已向您的邮箱发送账户确认链接。请打开邮件并点击确认链接，然后再登录。",
    emailLabel: "注册邮箱",
    emailHint: "如果没有收到邮件，请检查垃圾邮件文件夹。",
    loginHint: "您已经确认电子邮箱了吗？",
    back: "← 返回首页",
  },

  ru: {
    home: "Главная",
    courses: "Курсы",
    parents: "Для родителей",
    booking: "Записаться на занятие",
    login: "Войти",
    title: "Регистрация прошла успешно!",
    description:
      "Мы отправили ссылку для подтверждения аккаунта на вашу электронную почту. Откройте письмо и перейдите по ссылке перед входом.",
    emailLabel: "Зарегистрированная почта",
    emailHint: "Если письма нет, проверьте папку «Спам».",
    loginHint: "Вы уже подтвердили электронную почту?",
    back: "← Вернуться на главную",
  },
};

function RegisterSuccess() {
  const location = useLocation();

  const [language, setLanguage] = useState(
    location.state?.language || "th"
  );

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const email = location.state?.email || "";

  const t = translations[language] || translations.th;

  const selectLanguage = (code) => {
    setLanguage(code);
    setIsLanguageOpen(false);
  };

  return (
    <div className="success-page">

      {/* HEADER */}
      <header className="site-header">

        <div className="brand">
          <img src={logo} alt="Digiworld Logo" />

          <div className="brand-text">
            <div className="brand-name">Digiworld</div>
            <div className="brand-tagline">
              CODING &amp; CREATIVE LEARNING
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="main-nav">
          <Link to="/">{t.home}</Link>
          <a href="/courses">{t.courses}</a>
          <a href="/parent-portal">{t.parents}</a>
          <a href="/booking">{t.booking}</a>
        </nav>

        {/* LOGIN BUTTON */}
        <Link
          to="/login"
          state={{
            language,
            email,
          }}
          className="success-login-button"
        >
          {t.login}
        </Link>

        {/* LANGUAGE DROPDOWN */}
        <div className="language-selector-wrapper">

          <button
            type="button"
            className="language-selector"
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            aria-expanded={isLanguageOpen}
          >
            <span className="language-code">
              {languages.find(
                (item) => item.code === language
              )?.short}
            </span>

            <span>
              {languages.find(
                (item) => item.code === language
              )?.label}
            </span>

            <span className="language-arrow">⌄</span>
          </button>

          {isLanguageOpen && (
            <div className="language-dropdown">

              {languages.map((item) => (
                <button
                  type="button"
                  key={item.code}
                  onClick={() => selectLanguage(item.code)}
                  className={
                    language === item.code
                      ? "language-option active"
                      : "language-option"
                  }
                >
                  <span>{item.short}</span>
                  {item.label}
                </button>
              ))}

            </div>
          )}

        </div>

      </header>

      {/* MAIN CONTENT */}
      <main className="success-main">

        <section className="success-card">

          <h1>{t.title}</h1>

          <p>{t.description}</p>

          {email && (
            <div className="success-email">
              <strong>{t.emailLabel}</strong>
              <p>{email}</p>
            </div>
          )}

          <p className="success-email-hint">
            {t.emailHint}
          </p>

          <p>{t.loginHint}</p>

          <Link
            to="/login"
            state={{
              language,
              email,
            }}
            className="success-primary-button"
          >
            {t.login}
          </Link>

          <Link
            to="/"
            className="success-back-link"
          >
            {t.back}
          </Link>

        </section>

      </main>

    </div>
  );
}

export default RegisterSuccess;
