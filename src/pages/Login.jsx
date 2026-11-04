
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/Login.css";
import logo from "../assets/Logo.jpeg";
import introPhoto from "../assets/intro-photo.png";
import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState("parent");
  const [language, setLanguage] = useState("th");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const translations = {
    th: {
      home: "หน้าหลัก",
      courses: "คอร์สเรียน",
      parents: "ผู้ปกครอง",
      booking: "จองคลาสเรียน",
      trial: "ทดลองเรียนฟรี ↗",
      welcome: "ยินดีต้อนรับกลับมา",
      subtitle: "เข้าสู่พื้นที่ผู้ปกครอง ครู หรือแอดมิน",
      parent: "ผู้ปกครอง",
      teacher: "ครู",
      admin: "แอดมิน",
      roleNote:
        "ผู้ปกครองสมัครเองได้ ครูและแอดมินใช้บัญชีที่โรงเรียนเชิญ ระบบตรวจสอบสิทธิ์จากบัญชี ไม่ใช่แท็บที่เลือก",
      email: "อีเมล",
      password: "รหัสผ่าน",
      show: "แสดง",
      hide: "ซ่อน",
      remember: "จดจำฉันบนอุปกรณ์นี้",
      login: "เข้าสู่ระบบ",
      forgot: "ลืมรหัสผ่าน?",
      register: "สมัครบัญชีผู้ปกครอง",
      back: "← กลับหน้าแรก",
      errorTitle: "กรณีเข้าสู่ระบบไม่สำเร็จ",
      errorText: "กรุณาตรวจสอบอีเมลและรหัสผ่าน แล้วลองอีกครั้ง",
      tagline: "ทุกไอเดียเล็ก ๆ\nเริ่มต้นที่นี่",
      description:
        "ดูแลเส้นทางการเรียนรู้ของลูก จองคลาส และติดตามสิ่งที่เขาสร้างได้ในพื้นที่เดียว",
      brand: "DigiWorld Phuket · Coding & Creative Learning",
      footer: "ข้อมูลบัญชีของคุณได้รับการปกป้อง",
      loggingIn: "กำลังเข้าสู่ระบบ...",
      empty: "กรุณากรอกอีเมลและรหัสผ่าน",
      success: "เข้าสู่ระบบสำเร็จ",
      forgotSuccess: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว",
      forgotError: "ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้ กรุณาลองอีกครั้ง",
    },
    en: {
      home: "Home",
      courses: "Courses",
      parents: "Parent Portal",
      booking: "Book a Class",
      trial: "Free Trial ↗",
      welcome: "Welcome back",
      subtitle: "Sign in to the parent, teacher or admin portal",
      parent: "Parent",
      teacher: "Teacher",
      admin: "Admin",
      roleNote:
        "Parents can register. Teachers and admins use accounts invited by the school. Access is verified by account permissions, not by this selection.",
      email: "Email",
      password: "Password",
      show: "Show",
      hide: "Hide",
      remember: "Remember me on this device",
      login: "Log in",
      forgot: "Forgot password?",
      register: "Create a parent account",
      back: "← Back to Home",
      errorTitle: "Unable to sign in",
      errorText: "Please check your email and password and try again.",
      tagline: "Small ideas,\nbig possibilities",
      description:
        "Manage your child's learning journey, book classes and follow their creations in one place.",
      brand: "DigiWorld Phuket · Coding & Creative Learning",
      footer: "Your account information is protected.",
      loggingIn: "Signing in...",
      empty: "Please enter your email and password.",
      success: "Login successful",
      forgotSuccess: "A password reset link has been sent to your email.",
      forgotError: "Unable to send the reset link. Please try again.",
    },
    zh: {
      home: "首页",
      courses: "课程",
      parents: "家长中心",
      booking: "预约课程",
      trial: "免费试听 ↗",
      welcome: "欢迎回来",
      subtitle: "登录家长、教师或管理员空间",
      parent: "家长",
      teacher: "教师",
      admin: "管理员",
      roleNote: "家长可以自行注册。教师和管理员使用学校邀请的账户。",
      email: "电子邮件",
      password: "密码",
      show: "显示",
      hide: "隐藏",
      remember: "在此设备上记住我",
      login: "登录",
      forgot: "忘记密码？",
      register: "注册家长账户",
      back: "← 返回首页",
      errorTitle: "登录失败",
      errorText: "请检查电子邮件和密码，然后重试。",
      tagline: "小小创意，\n无限可能",
      description: "在一个地方管理孩子的学习、预约课程并查看作品。",
      brand: "DigiWorld Phuket · Coding & Creative Learning",
      footer: "您的账户信息受到保护。",
      loggingIn: "正在登录...",
      empty: "请输入电子邮件和密码。",
      success: "登录成功",
      forgotSuccess: "密码重置链接已发送到您的电子邮件。",
      forgotError: "无法发送重置链接，请重试。",
    },
    ru: {
      home: "Главная",
      courses: "Курсы",
      parents: "Для родителей",
      booking: "Записаться",
      trial: "Бесплатный урок ↗",
      welcome: "С возвращением",
      subtitle: "Войдите в кабинет родителя, учителя или администратора",
      parent: "Родитель",
      teacher: "Учитель",
      admin: "Администратор",
      roleNote:
        "Родители могут зарегистрироваться самостоятельно. Учителя и администраторы используют приглашённые школой аккаунты.",
      email: "Электронная почта",
      password: "Пароль",
      show: "Показать",
      hide: "Скрыть",
      remember: "Запомнить меня на этом устройстве",
      login: "Войти",
      forgot: "Забыли пароль?",
      register: "Создать аккаунт родителя",
      back: "← На главную",
      errorTitle: "Не удалось войти",
      errorText: "Проверьте электронную почту и пароль и попробуйте снова.",
      tagline: "Маленькие идеи,\nбольшие возможности",
      description:
        "Управляйте обучением ребёнка, записывайтесь на занятия и следите за его работами в одном месте.",
      brand: "DigiWorld Phuket · Coding & Creative Learning",
      footer: "Данные вашей учётной записи защищены.",
      loggingIn: "Выполняется вход...",
      empty: "Введите электронную почту и пароль.",
      success: "Вход выполнен",
      forgotSuccess: "Ссылка для сброса пароля отправлена на вашу почту.",
      forgotError: "Не удалось отправить ссылку. Попробуйте ещё раз.",
    },
  };

  const t = translations[language];

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!email.trim() || !password) {
      setMessage(t.empty);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(t.errorText);
      return;
    }

    navigate("/parent-portal");
  };

  const handleForgotPassword = async () => {
    setMessage("");

    if (!email.trim()) {
      setMessage(
        language === "th"
          ? "กรุณากรอกอีเมลก่อนกดลืมรหัสผ่าน"
          : "Please enter your email first."
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/login`,
      }
    );

    setLoading(false);

    setMessage(error ? t.forgotError : t.forgotSuccess);
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <Link to="/" className="login-brand">
          <img src={logo} alt="Digiworld Logo" />
          <div>
            <div className="login-brand-name">Digiworld</div>
            <div className="login-brand-tagline">
              CODING & CREATIVE LEARNING
            </div>
          </div>
        </Link>

        <nav className="login-nav">
          <Link to="/">{t.home}</Link>
          <Link to="/courses">{t.courses}</Link>
          <Link to="/parent-portal">{t.parents}</Link>
          <Link to="/booking">{t.booking}</Link>
        </nav>

        <Link to="/booking" className="login-trial-button">
          {t.trial}
        </Link>

        <select
          className="login-language"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          aria-label="Select language"
        >
          <option value="th">TH · ไทย</option>
          <option value="en">EN · English</option>
          <option value="zh">ZH · 简体中文</option>
          <option value="ru">RU · Русский</option>
        </select>
      </header>

      <main className="login-main">
        <section className="login-intro">
          <div className="login-eyebrow">
            SMALL IDEAS, BIG POSSIBILITIES
          </div>

          <h1>{t.tagline.split("\n").map((line, index) => (
            <React.Fragment key={index}>
              {index > 0 && <br />}
              {line}
            </React.Fragment>
          ))}</h1>

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
          <h2>{t.welcome}</h2>
          <p className="login-subtitle">{t.subtitle}</p>

          <div className="login-role-tabs">
            <button
              type="button"
              className={role === "parent" ? "active" : ""}
              onClick={() => setRole("parent")}
            >
              {t.parent}
            </button>

            <button
              type="button"
              className={role === "teacher" ? "active" : ""}
              onClick={() => setRole("teacher")}
            >
              {t.teacher}
            </button>

            <button
              type="button"
              className={role === "admin" ? "active" : ""}
              onClick={() => setRole("admin")}
            >
              {t.admin}
            </button>
          </div>

          <p className="login-role-note">{t.roleNote}</p>

          <form onSubmit={handleLogin}>
            <label htmlFor="login-email">{t.email}</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
              required
            />

            <label htmlFor="login-password">{t.password}</label>
            <div className="login-password-wrapper">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? t.hide : t.show}
              </button>
            </div>

            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>{t.remember}</span>
            </label>

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? t.loggingIn : t.login}
            </button>
          </form>

          <div className="login-links">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              {t.forgot}
            </button>
            <span>•</span>
            <Link to="/register">{t.register}</Link>
          </div>

          <Link to="/" className="login-back">
            {t.back}
          </Link>

          {message && (
            <div className="login-message" role="status">
              {message}
            </div>
          )}

          <div className="login-error-info">
            <strong>{t.errorTitle}</strong>
            <p>{t.errorText}</p>
          </div>
        </section>
      </main>

      <footer className="login-footer">
        <div>
          <strong>DigiWorld Phuket (Robotic)</strong>
          <span>LINE @digiworldphuket · 081 855 9762</span>
        </div>
        <div>
          <span>เปิดทุกวัน 9:30 AM–6:30 PM</span>
          <span>Terms / Privacy</span>
        </div>
      </footer>
    </div>
  );
}

export default Login;