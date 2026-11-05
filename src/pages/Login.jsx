import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import "../styles/Login.css";
import introPhoto from "../assets/intro-photo.png";
import { supabase } from "../lib/supabase";

import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";

const translations = {
  th: {
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
    emailRequired: "กรุณากรอกอีเมล",
    emailInvalid: "รูปแบบอีเมลไม่ถูกต้อง",
    passwordRequired: "กรุณากรอกรหัสผ่าน",
  },
  en: {
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
    emailRequired: "Please enter your email address.",
    emailInvalid: "Please enter a valid email address.",
    passwordRequired: "Please enter your password.",
  },
  zh: {
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
    emailRequired: "请输入电子邮件。",
    emailInvalid: "电子邮件格式不正确。",
    passwordRequired: "请输入密码。",
  },
  ru: {
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
    emailRequired: "Пожалуйста, введите электронную почту.",
    emailInvalid: "Неверный формат электронной почты.",
    passwordRequired: "Пожалуйста, введите пароль.",
  },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState("parent");
  const [language, setLanguage] = useLanguage();
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // เก็บเป็น "key" ของข้อความ เพื่อให้เปลี่ยนภาษาแล้วข้อความ error เปลี่ยนตาม
  const [errors, setErrors] = useState({});

  const t = translations[language];

  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setHasError(false);
  };

  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "emailRequired";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = "emailInvalid";
    }

    if (!password) {
      newErrors.password = "passwordRequired";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (loading) return;

    setHasError(false);

    // ช่องไหนว่างหรือไม่ถูกต้อง จะหยุดตรงนี้ ไม่เรียก Supabase
    if (!validateForm()) return;

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      setHasError(true);
      return;
    }

    navigate(location.state?.from || "/");
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

          <form onSubmit={handleLogin} noValidate>
            <label htmlFor="login-email">{t.email}</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearError("email");
              }}
              placeholder="example@email.com"
              autoComplete="email"
              className={errors.email ? "input-error" : ""}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && (
              <p className="login-field-error">{t[errors.email]}</p>
            )}

            <label htmlFor="login-password">{t.password}</label>
            <div
              className={
                errors.password
                  ? "login-password-wrapper input-error"
                  : "login-password-wrapper"
              }
            >
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearError("password");
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? t.hide : t.show}
              </button>
            </div>
            {errors.password && (
              <p className="login-field-error">{t[errors.password]}</p>
            )}

            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>{t.remember}</span>
            </label>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? t.loggingIn : t.login}
            </button>
          </form>

          <div className="login-links">
            <Link to="/forgot-password" state={{ email: email.trim() }}>
              {t.forgot}
            </Link>
            <span>•</span>
            <Link to="/register">{t.register}</Link>
          </div>

          <Link to="/" className="login-back">
            {t.back}
          </Link>

          {hasError && (
            <div className="login-error-info" role="alert">
              <strong>{t.errorTitle}</strong>
              <p>{t.errorText}</p>
            </div>
          )}
        </section>
      </main>

      <SiteFooter language={language} />
    </div>
  );
}

export default Login;