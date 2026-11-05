import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/ForgotPassword.css";
import introPhoto from "../assets/intro-photo.png";
import { supabase } from "../lib/supabase";

import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";

const translations = {
  th: {
    title: "ตั้งรหัสผ่านใหม่",
    subtitle: "เลือกรหัสผ่านที่ปลอดภัยและไม่ซ้ำกับบัญชีอื่น",
    newPassword: "รหัสผ่านใหม่",
    newPasswordPlaceholder: "กรอกรหัสผ่านใหม่",
    confirmPassword: "ยืนยันรหัสผ่านใหม่",
    confirmPasswordPlaceholder: "ยืนยันรหัสผ่านใหม่",
    hint: "อย่างน้อย 8 ตัวอักษร มีตัวอักษรและตัวเลข",
    confirmHint: "รหัสผ่านทั้งสองช่องต้องตรงกัน",
    show: "แสดง",
    hide: "ซ่อน",
    submit: "บันทึกรหัสผ่านใหม่",
    saving: "กำลังบันทึก...",
    passwordRequired: "กรุณากรอกรหัสผ่านใหม่",
    passwordWeak: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีทั้งตัวอักษรและตัวเลข",
    confirmRequired: "กรุณายืนยันรหัสผ่าน",
    mismatch: "รหัสผ่านไม่ตรงกัน",
    samePassword: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม",
    saveError: "ไม่สามารถบันทึกรหัสผ่านได้ กรุณาลองอีกครั้ง",
    checking: "กำลังตรวจสอบลิงก์...",
    expiredTitle: "ลิงก์หมดอายุหรือถูกใช้ไปแล้ว",
    expiredText:
      "ไม่สามารถใช้ลิงก์นี้ได้ กรุณาขอลิงก์ใหม่จากหน้าลืมรหัสผ่าน รหัสผ่านเดิมจะไม่ถูกเปลี่ยน",
    requestAgain: "ขอลิงก์ใหม่ →",
    doneTitle: "ตั้งรหัสผ่านใหม่แล้ว",
    doneText: "ใช้รหัสผ่านใหม่เพื่อเข้าสู่ระบบ ยังไม่ได้เข้าสู่บัญชีโดยอัตโนมัติ",
    goLogin: "กลับไปเข้าสู่ระบบ",
    tagline: "ทุกไอเดียเล็ก ๆ\nเริ่มต้นที่นี่",
    description:
      "ดูแลเส้นทางการเรียนรู้ของลูก จองคลาส และติดตามสิ่งที่เขาสร้างได้ในพื้นที่เดียว",
    brand: "DigiWorld Phuket · Coding & Creative Learning",
    footer: "ข้อมูลบัญชีของคุณได้รับการปกป้อง",
  },
  en: {
    title: "Set a new password",
    subtitle: "Choose a secure password that you don't use on other accounts.",
    newPassword: "New password",
    newPasswordPlaceholder: "Enter a new password",
    confirmPassword: "Confirm new password",
    confirmPasswordPlaceholder: "Confirm your new password",
    hint: "At least 8 characters, with letters and numbers",
    confirmHint: "Both passwords must match",
    show: "Show",
    hide: "Hide",
    submit: "Save new password",
    saving: "Saving...",
    passwordRequired: "Please enter a new password.",
    passwordWeak: "Password must be at least 8 characters with letters and numbers.",
    confirmRequired: "Please confirm your password.",
    mismatch: "Passwords do not match.",
    samePassword: "The new password must be different from the old one.",
    saveError: "Unable to save the password. Please try again.",
    checking: "Checking your link...",
    expiredTitle: "If the link has expired or was already used",
    expiredText:
      "This link can't be used. Please request a new one from the forgot password page. Your old password will not be changed.",
    requestAgain: "Request a new link →",
    doneTitle: "Your password has been updated",
    doneText: "Use your new password to log in. You are not signed in automatically.",
    goLogin: "Back to log in",
    tagline: "Small ideas,\nbig possibilities",
    description:
      "Manage your child's learning journey, book classes and follow their creations in one place.",
    brand: "DigiWorld Phuket · Coding & Creative Learning",
    footer: "Your account information is protected.",
  },
  zh: {
    title: "设置新密码",
    subtitle: "请选择安全且未在其他账户使用过的密码。",
    newPassword: "新密码",
    newPasswordPlaceholder: "请输入新密码",
    confirmPassword: "确认新密码",
    confirmPasswordPlaceholder: "请再次输入新密码",
    hint: "至少8个字符，包含字母和数字",
    confirmHint: "两次输入的密码必须一致",
    show: "显示",
    hide: "隐藏",
    submit: "保存新密码",
    saving: "正在保存...",
    passwordRequired: "请输入新密码。",
    passwordWeak: "密码至少8个字符，且包含字母和数字。",
    confirmRequired: "请确认密码。",
    mismatch: "两次输入的密码不一致。",
    samePassword: "新密码不能与旧密码相同。",
    saveError: "无法保存密码，请重试。",
    checking: "正在检查链接...",
    expiredTitle: "链接已过期或已被使用",
    expiredText: "无法使用此链接。请在忘记密码页面重新申请链接。原密码不会被更改。",
    requestAgain: "重新申请链接 →",
    doneTitle: "密码已更新",
    doneText: "请使用新密码登录。系统不会自动登录。",
    goLogin: "返回登录",
    tagline: "小小创意，\n无限可能",
    description: "在一个地方管理孩子的学习、预约课程并查看作品。",
    brand: "DigiWorld Phuket · Coding & Creative Learning",
    footer: "您的账户信息受到保护。",
  },
  ru: {
    title: "Новый пароль",
    subtitle: "Выберите надёжный пароль, который вы не используете в других аккаунтах.",
    newPassword: "Новый пароль",
    newPasswordPlaceholder: "Введите новый пароль",
    confirmPassword: "Подтвердите новый пароль",
    confirmPasswordPlaceholder: "Повторите новый пароль",
    hint: "Не менее 8 символов, буквы и цифры",
    confirmHint: "Пароли в обоих полях должны совпадать",
    show: "Показать",
    hide: "Скрыть",
    submit: "Сохранить новый пароль",
    saving: "Сохранение...",
    passwordRequired: "Пожалуйста, введите новый пароль.",
    passwordWeak: "Пароль должен содержать не менее 8 символов, буквы и цифры.",
    confirmRequired: "Пожалуйста, подтвердите пароль.",
    mismatch: "Пароли не совпадают.",
    samePassword: "Новый пароль должен отличаться от старого.",
    saveError: "Не удалось сохранить пароль. Попробуйте ещё раз.",
    checking: "Проверка ссылки...",
    expiredTitle: "Если ссылка устарела или уже использована",
    expiredText:
      "Эту ссылку использовать нельзя. Запросите новую на странице восстановления пароля. Прежний пароль не изменится.",
    requestAgain: "Запросить новую ссылку →",
    doneTitle: "Пароль обновлён",
    doneText: "Войдите с новым паролем. Автоматический вход не выполняется.",
    goLogin: "Назад ко входу",
    tagline: "Маленькие идеи,\nбольшие возможности",
    description:
      "Управляйте обучением ребёнка, записывайтесь на занятия и следите за его работами в одном месте.",
    brand: "DigiWorld Phuket · Coding & Creative Learning",
    footer: "Данные вашей учётной записи защищены.",
  },
};

const LINK_CHECK_TIMEOUT_MS = 3000;

function ResetPassword() {
  const [language, setLanguage] = useLanguage();
  const t = translations[language];

  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({}); // เก็บเป็น key ของข้อความ
  const [saveError, setSaveError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // เชื่อเฉพาะ event PASSWORD_RECOVERY (ยิงเมื่ออ่านลิงก์รีเซ็ตสำเร็จเท่านั้น)
  // คนที่ล็อกอินค้างอยู่แล้วพิมพ์ /reset-password เองจะไม่ได้ event นี้ จึงเห็นหน้าลิงก์หมดอายุ
  useEffect(() => {
    let active = true;

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && active) {
        setHasSession(true);
        setChecking(false);
      }
    });

    // ถ้าไม่มี PASSWORD_RECOVERY ภายในเวลาที่กำหนด ถือว่าลิงก์ไม่ถูกต้อง
    const timer = setTimeout(() => {
      if (active) setChecking(false);
    }, LINK_CHECK_TIMEOUT_MS);

    return () => {
      active = false;
      clearTimeout(timer);
      listener.subscription.unsubscribe();
    };
  }, []);

  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSaveError(false);
  };

  const validate = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "passwordRequired";
    } else if (
      password.length < 8 ||
      !/[A-Za-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      newErrors.password = "passwordWeak";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "confirmRequired";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "mismatch";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setSaveError(false);

    if (!validate()) return;

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("Update password error:", error);
      setLoading(false);

      if (error.code === "same_password") {
        setErrors({ password: "samePassword" });
      } else if (error.code === "weak_password") {
        setErrors({ password: "passwordWeak" });
      } else if (
        error.status === 401 ||
        error.status === 403 ||
        error.name === "AuthSessionMissingError"
      ) {
        // ลิงก์หมดอายุหรือ session หายระหว่างกรอก
        setHasSession(false);
      } else {
        setSaveError(true);
      }
      return;
    }

    // ออกจากระบบ แล้วให้เข้าสู่ระบบใหม่ด้วยรหัสผ่านใหม่ (ไม่ล็อกอินอัตโนมัติ)
    await supabase.auth.signOut();

    setLoading(false);
    setDone(true);
  };

  const renderCard = () => {
    if (checking) {
      return <p className="fp-help">{t.checking}</p>;
    }

    // ตั้งรหัสผ่านสำเร็จ
    if (done) {
      return (
        <>
          <div className="fp-success" role="status">
            <strong>{t.doneTitle}</strong>
            <p>{t.doneText}</p>
          </div>

          <Link to="/login" className="fp-outline">
            {t.goLogin}
          </Link>
        </>
      );
    }

    // ลิงก์หมดอายุ / ใช้แล้ว / เปิดหน้านี้ตรงๆ
    if (!hasSession) {
      return (
        <>
          <div className="fp-warning" role="alert">
            <strong>{t.expiredTitle}</strong>
            <p>{t.expiredText}</p>
          </div>

          <Link to="/forgot-password" className="fp-link">
            {t.requestAgain}
          </Link>
        </>
      );
    }

    // ฟอร์มตั้งรหัสผ่านใหม่
    return (
      <form className="fp-form" onSubmit={handleSubmit} noValidate>
        <div className="fp-field">
          <label htmlFor="rp-password">{t.newPassword} *</label>

          <div className="fp-password">
            <input
              id="rp-password"
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder={t.newPasswordPlaceholder}
              autoComplete="new-password"
              className={errors.password ? "input-error" : ""}
              aria-invalid={Boolean(errors.password)}
              onChange={(event) => {
                setPassword(event.target.value);
                clearError("password");
              }}
            />

            <button
              type="button"
              className="fp-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? t.hide : t.show}
            </button>
          </div>

          {errors.password ? (
            <p className="fp-error">{t[errors.password]}</p>
          ) : (
            <p className="fp-hint">{t.hint}</p>
          )}
        </div>

        <div className="fp-field">
          <label htmlFor="rp-confirm">{t.confirmPassword} *</label>

          <div className="fp-password">
            <input
              id="rp-confirm"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              placeholder={t.confirmPasswordPlaceholder}
              autoComplete="new-password"
              className={errors.confirmPassword ? "input-error" : ""}
              aria-invalid={Boolean(errors.confirmPassword)}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                clearError("confirmPassword");
              }}
            />

            <button
              type="button"
              className="fp-toggle"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? t.hide : t.show}
            </button>
          </div>

          {errors.confirmPassword ? (
            <p className="fp-error">{t[errors.confirmPassword]}</p>
          ) : (
            <p className="fp-hint">{t.confirmHint}</p>
          )}
        </div>

        {saveError && (
          <div className="fp-alert" role="alert">
            {t.saveError}
          </div>
        )}

        <button className="login-submit" type="submit" disabled={loading}>
          {loading ? t.saving : t.submit}
        </button>
      </form>
    );
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

          {renderCard()}
        </section>
      </main>

      <SiteFooter language={language} />
    </div>
  );
}

export default ResetPassword;