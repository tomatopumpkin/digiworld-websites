import React from "react";
import { Link, useLocation } from "react-router-dom";

import "../styles/RegisterSuccess.css";

import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";

// (header/footer text lives in lib/siteText.js)
const translations = {
  th: {
    title: "สมัครสมาชิกสำเร็จ",
    description: "บัญชีของคุณพร้อมแล้ว กรุณาเข้าสู่ระบบเพื่อเริ่มใช้งาน Digiworld",
    login: "เข้าสู่ระบบ",
    back: "← กลับหน้าแรก",
  },
  en: {
    title: "Registration Successful",
    description: "Your account is ready. Please log in to start using Digiworld.",
    login: "Log in",
    back: "← Back to Home",
  },
  zh: {
    title: "注册成功",
    description: "您的账户已准备就绪，请登录以开始使用 Digiworld。",
    login: "登录",
    back: "← 返回首页",
  },
  ru: {
    title: "Регистрация прошла успешно",
    description: "Ваш аккаунт готов. Войдите, чтобы начать пользоваться Digiworld.",
    login: "Войти",
    back: "← Вернуться на главную",
  },
};

function RegisterSuccess() {
  const location = useLocation();
  const [language, setLanguage] = useLanguage();

  const email = location.state?.email || "";
  const t = translations[language] || translations.th;

  return (
    <div className="success-page">
      <SiteHeader language={language} onLanguageChange={setLanguage} />

      <main className="success-main">
        <section className="success-card">
          <h1>{t.title}</h1>
          <p>{t.description}</p>

          <Link
            to="/login"
            state={{ language, email }}
            className="success-primary-button"
          >
            {t.login}
          </Link>

          <Link to="/" className="success-back-link">
            {t.back}
          </Link>
        </section>
      </main>

      <SiteFooter language={language} />
    </div>
  );
}

export default RegisterSuccess;