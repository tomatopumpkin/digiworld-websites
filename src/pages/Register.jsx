import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

import introPhoto from "../assets/intro-photo.png";
import { supabase } from "../lib/supabase";

import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";

// ================= TRANSLATIONS =================
// (header/footer text lives in lib/siteText.js)

const translations = {
  th: {
    badge: "SMALL IDEAS, BIG POSSIBILITIES",
    heroTitle: "ทุกไอเดียเล็ก ๆ\nเริ่มต้นที่นี่",
    heroDescription:
      "ดูแลเส้นทางการเรียนรู้ของลูก จองคลาส และติดตามสิ่งที่เขาสร้างได้ในพื้นที่เดียว",
    schoolDescription: "DigiWorld Phuket · Coding & Creative Learning",
    footerNote: "Digiworld · Coding & Creative Learning",
    formTitle: "เริ่มต้นกับ Digiworld",
    formDescription: "สร้างบัญชีผู้ปกครอง เพิ่มบุตรหลานได้หลังสมัคร",
    fullName: "ชื่อ–นามสกุลผู้ปกครอง",
    fullNamePlaceholder: "กรอกชื่อ–นามสกุล",
    email: "อีเมล",
    emailPlaceholder: "กรอกอีเมล",
    phone: "เบอร์โทรศัพท์",
    phonePlaceholder: "กรอกเบอร์โทรศัพท์",
    phoneHint: "กรอกหมายเลขที่ติดต่อได้ 10 หลัก",
    password: "รหัสผ่าน",
    passwordPlaceholder: "กรอกรหัสผ่าน",
    passwordHint: "อย่างน้อย 8 ตัวอักษร",
    confirmPassword: "ยืนยันรหัสผ่าน",
    confirmPasswordPlaceholder: "ยืนยันรหัสผ่าน",
    showPassword: "แสดง",
    hidePassword: "ซ่อน",
    acceptTerms: "ฉันยอมรับข้อกำหนดการใช้งาน และได้อ่านนโยบายความเป็นส่วนตัว",
    receiveNews: "ฉันต้องการรับข่าวคอร์สและกิจกรรม (ไม่บังคับ ถอนความยินยอมได้)",
    createAccount: "สร้างบัญชีผู้ปกครอง",
    alreadyMember: "เป็นสมาชิกแล้ว?",
    login: "เข้าสู่ระบบ →",
    nameError: "กรุณากรอกชื่อ–นามสกุล",
    emailRequired: "กรุณากรอกอีเมล",
    emailInvalid: "รูปแบบอีเมลไม่ถูกต้อง",
    emailExists: "อีเมลนี้สมัครสมาชิกไว้แล้ว ไม่สามารถสมัครซ้ำได้",
    forgotPassword: "ลืมรหัสผ่าน?",
    loginNow: "เข้าสู่ระบบ",
    resetSending: "กำลังส่งลิงก์...",
    resetSent: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว",
    resetError: "ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้ กรุณาลองอีกครั้ง",
    phoneRequired: "กรุณากรอกเบอร์โทรศัพท์",
    phoneError: "กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก",
    passwordRequired: "กรุณากรอกรหัสผ่าน",
    passwordError: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
    confirmPasswordRequired: "กรุณายืนยันรหัสผ่าน",
    mismatchError: "รหัสผ่านไม่ตรงกัน",
    termsError: "กรุณายอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว",
    signupSuccess:
      "สมัครสมาชิกสำเร็จแล้ว! กรุณาตรวจสอบอีเมลและกดลิงก์ยืนยันก่อนเข้าสู่ระบบ",
    signupError: "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง",
    signupLoading: "กำลังสร้างบัญชี...",
  },

  en: {
    badge: "SMALL IDEAS, BIG POSSIBILITIES",
    heroTitle: "Every little idea\nstarts here",
    heroDescription:
      "Manage your child's learning journey, book classes, and follow their creations in one place.",
    schoolDescription: "DigiWorld Phuket · Coding & Creative Learning",
    footerNote: "Digiworld · Coding & Creative Learning",
    formTitle: "Get Started with Digiworld",
    formDescription:
      "Create a parent account. You can add your children after registration.",
    fullName: "Parent's Full Name",
    fullNamePlaceholder: "Enter your full name",
    email: "Email Address",
    emailPlaceholder: "Enter your email",
    phone: "Phone Number",
    phonePlaceholder: "Enter your phone number",
    phoneHint: "Enter a valid 10-digit phone number",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    passwordHint: "At least 8 characters",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm your password",
    showPassword: "Show",
    hidePassword: "Hide",
    acceptTerms: "I agree to the Terms of Use and have read the Privacy Policy.",
    receiveNews: "I would like to receive course and activity updates (optional).",
    createAccount: "Create Parent Account",
    alreadyMember: "Already a member?",
    login: "Log in →",
    nameError: "Please enter your full name.",
    emailRequired: "Please enter your email address.",
    emailInvalid: "Please enter a valid email address.",
    emailExists: "This email is already registered and cannot be used again.",
    forgotPassword: "Forgot password?",
    loginNow: "Log in",
    resetSending: "Sending link...",
    resetSent: "A password reset link has been sent to your email.",
    resetError: "Unable to send the reset link. Please try again.",
    phoneRequired: "Please enter your phone number.",
    phoneError: "Phone number must contain exactly 10 digits.",
    passwordRequired: "Please enter a password.",
    passwordError: "Password must be at least 8 characters.",
    confirmPasswordRequired: "Please confirm your password.",
    mismatchError: "Passwords do not match.",
    termsError: "Please accept the Terms of Use and Privacy Policy.",
    signupSuccess:
      "Registration successful! Please check your email and click the confirmation link before logging in.",
    signupError: "Unable to create your account. Please try again.",
    signupLoading: "Creating account...",
  },

  zh: {
    badge: "SMALL IDEAS, BIG POSSIBILITIES",
    heroTitle: "每一个小小的想法\n都从这里开始",
    heroDescription: "在一个平台管理孩子的学习进度、预约课程并查看他们的创作。",
    schoolDescription: "DigiWorld Phuket · Coding & Creative Learning",
    footerNote: "Digiworld · Coding & Creative Learning",
    formTitle: "开始使用 Digiworld",
    formDescription: "创建家长账户，注册后即可添加孩子的信息。",
    fullName: "家长姓名",
    fullNamePlaceholder: "请输入姓名",
    email: "电子邮箱",
    emailPlaceholder: "请输入电子邮箱",
    phone: "电话号码",
    phonePlaceholder: "请输入电话号码",
    phoneHint: "请输入10位电话号码",
    password: "密码",
    passwordPlaceholder: "请输入密码",
    passwordHint: "至少8个字符",
    confirmPassword: "确认密码",
    confirmPasswordPlaceholder: "请再次输入密码",
    showPassword: "显示",
    hidePassword: "隐藏",
    acceptTerms: "我同意使用条款并已阅读隐私政策。",
    receiveNews: "我希望接收课程和活动资讯（选填）。",
    createAccount: "创建家长账户",
    alreadyMember: "已经是会员？",
    login: "登录 →",
    nameError: "请输入家长姓名。",
    emailRequired: "请输入电子邮箱。",
    emailInvalid: "电子邮箱格式不正确。",
    emailExists: "该电子邮箱已注册，无法重复注册。",
    forgotPassword: "忘记密码？",
    loginNow: "登录",
    resetSending: "正在发送链接...",
    resetSent: "密码重置链接已发送到您的电子邮箱。",
    resetError: "无法发送重置链接，请重试。",
    phoneRequired: "请输入电话号码。",
    phoneError: "电话号码必须为10位数字。",
    passwordRequired: "请输入密码。",
    passwordError: "密码至少需要8个字符。",
    confirmPasswordRequired: "请确认密码。",
    mismatchError: "两次输入的密码不一致。",
    termsError: "请接受使用条款并阅读隐私政策。",
    signupSuccess: "注册成功！请检查您的电子邮件并点击确认链接，然后再登录。",
    signupError: "无法创建账户，请重试。",
    signupLoading: "正在创建账户...",
  },

  ru: {
    badge: "SMALL IDEAS, BIG POSSIBILITIES",
    heroTitle: "Каждая маленькая идея\nначинается здесь",
    heroDescription:
      "Управляйте обучением ребёнка, записывайтесь на занятия и следите за его проектами в одном месте.",
    schoolDescription: "DigiWorld Phuket · Coding & Creative Learning",
    footerNote: "Digiworld · Coding & Creative Learning",
    formTitle: "Начните с Digiworld",
    formDescription:
      "Создайте аккаунт родителя. Добавить детей можно после регистрации.",
    fullName: "Полное имя родителя",
    fullNamePlaceholder: "Введите полное имя",
    email: "Электронная почта",
    emailPlaceholder: "Введите электронную почту",
    phone: "Номер телефона",
    phonePlaceholder: "Введите номер телефона",
    phoneHint: "Введите номер из 10 цифр",
    password: "Пароль",
    passwordPlaceholder: "Введите пароль",
    passwordHint: "Не менее 8 символов",
    confirmPassword: "Подтвердите пароль",
    confirmPasswordPlaceholder: "Повторите пароль",
    showPassword: "Показать",
    hidePassword: "Скрыть",
    acceptTerms:
      "Я принимаю условия использования и ознакомился(-ась) с политикой конфиденциальности.",
    receiveNews:
      "Я хочу получать новости о курсах и мероприятиях (необязательно).",
    createAccount: "Создать аккаунт родителя",
    alreadyMember: "Уже есть аккаунт?",
    login: "Войти →",
    nameError: "Пожалуйста, введите полное имя.",
    emailRequired: "Пожалуйста, введите электронную почту.",
    emailInvalid: "Неверный формат электронной почты.",
    emailExists: "Эта почта уже зарегистрирована, повторная регистрация невозможна.",
    forgotPassword: "Забыли пароль?",
    loginNow: "Войти",
    resetSending: "Отправка ссылки...",
    resetSent: "Ссылка для сброса пароля отправлена на вашу почту.",
    resetError: "Не удалось отправить ссылку. Попробуйте ещё раз.",
    phoneRequired: "Пожалуйста, введите номер телефона.",
    phoneError: "Номер телефона должен содержать 10 цифр.",
    passwordRequired: "Пожалуйста, введите пароль.",
    passwordError: "Пароль должен содержать не менее 8 символов.",
    confirmPasswordRequired: "Пожалуйста, подтвердите пароль.",
    mismatchError: "Пароли не совпадают.",
    termsError:
      "Пожалуйста, примите условия использования и политику конфиденциальности.",
    signupSuccess:
      "Регистрация прошла успешно! Проверьте электронную почту и перейдите по ссылке подтверждения перед входом.",
    signupError: "Не удалось создать аккаунт. Попробуйте ещё раз.",
    signupLoading: "Создание аккаунта...",
  },
};

function Register() {
  const navigate = useNavigate();

  // ================= LANGUAGE =================

  const [language, setLanguage] = useLanguage();
  const t = translations[language];

  // ================= FORM STATE =================

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [receiveNews, setReceiveNews] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // อีเมลนี้มีบัญชีอยู่แล้ว → แสดงปุ่มลืมรหัสผ่านใต้ช่องอีเมล
  const [emailExists, setEmailExists] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // ================= LANGUAGE CHANGE =================

  const handleLanguageChange = (code) => {
    setLanguage(code);
    setErrors({});
    setMessage("");
    setEmailExists(false);
  };

  // ================= CLEAR FIELD ERROR =================

  const clearError = (field) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setMessage("");
  };

  // ================= VALIDATION =================

  const validateForm = () => {
    const newErrors = {};

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const digitsOnly = phone.replace(/\D/g, "");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      newErrors.fullName = t.nameError;
    }

    if (!trimmedEmail) {
      newErrors.email = t.emailRequired;
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = t.emailInvalid;
    }

    if (!digitsOnly) {
      newErrors.phone = t.phoneRequired;
    } else if (digitsOnly.length !== 10) {
      newErrors.phone = t.phoneError;
    }

    if (!password) {
      newErrors.password = t.passwordRequired;
    } else if (password.length < 8) {
      newErrors.password = t.passwordError;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t.confirmPasswordRequired;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t.mismatchError;
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = t.termsError;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ================= EMAIL ALREADY REGISTERED =================

  const showEmailExists = () => {
    setErrors((prev) => ({ ...prev, email: t.emailExists }));
    setEmailExists(true);
  };

  // ================= FORGOT PASSWORD =================

  const handleForgotPassword = async () => {
    if (isSendingReset) return;

    setIsSendingReset(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/login`,
        }
      );

      setMessage(error ? t.resetError : t.resetSent);
      setMessageType(error ? "error" : "info");
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage(t.resetError);
      setMessageType("error");
    } finally {
      setIsSendingReset(false);
    }
  };

  // ================= SUBMIT FORM =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setMessage("");
    setEmailExists(false);

    // ถ้ามีช่องไหนไม่ผ่าน (รวมถึงอีเมลว่าง) จะหยุดตรงนี้ ไม่ส่งไป Supabase
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName.trim(),
            phone: phone.replace(/\D/g, ""),
            receive_news: receiveNews,
            accepted_terms: acceptTerms,
          },
        },
      });

      if (error) {
        console.error("Supabase signup error:", error);

        // กรณี Supabase ส่ง error ว่ามีอีเมลนี้อยู่แล้ว (ตอนปิด Confirm email)
        const alreadyRegistered =
          error.code === "user_already_exists" ||
          /already.*registered/i.test(error.message || "");

        if (alreadyRegistered) {
          showEmailExists();
          return;
        }

        setMessage(error.message || t.signupError);
        setMessageType("error");
        return;
      }

      // กรณีเปิด Confirm email: อีเมลซ้ำจะไม่มี error แต่ identities จะเป็นอาร์เรย์ว่าง
      if (
        data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        showEmailExists();
        return;
      }

      if (data.user) {
        navigate("/register-success", {
          state: {
            email: email.trim().toLowerCase(),
            language: language,
          },
        });
      } else {
        setMessage(t.signupError);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage(error.message || t.signupError);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= RENDER =================

  return (
    <div className="register-page">
      <SiteHeader language={language} onLanguageChange={handleLanguageChange} />

      {/* ================= MAIN ================= */}

      <main className="register-main">
        {/* ================= INTRO SECTION ================= */}

        <section className="intro-section">
          <div className="intro-badge">{t.badge}</div>

          <h1 className="intro-title">
            {t.heroTitle.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index === 0 && <br />}
              </React.Fragment>
            ))}
          </h1>

          <p className="intro-description">{t.heroDescription}</p>

          <img
            className="intro-image"
            src={introPhoto}
            alt="Digiworld Coding and Creative Learning"
          />

          <p className="intro-footer-text">
            {t.schoolDescription}
            <br />
            {t.footerNote}
          </p>
        </section>

        {/* ================= REGISTER FORM ================= */}

        <section className="form-card">
          <h2 className="form-title">{t.formTitle}</h2>

          <p className="form-description">{t.formDescription}</p>

          <form onSubmit={handleSubmit} noValidate>
            {/* FULL NAME */}

            <div className="form-group">
              <label htmlFor="fullName">{t.fullName} *</label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                placeholder={t.fullNamePlaceholder}
                autoComplete="name"
                className={errors.fullName ? "input-error" : ""}
                aria-invalid={Boolean(errors.fullName)}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearError("fullName");
                }}
              />

              {errors.fullName && (
                <p className="field-error">{errors.fullName}</p>
              )}
            </div>

            {/* EMAIL */}

            <div className="form-group">
              <label htmlFor="email">{t.email} *</label>

              <input
                id="email"
                type="email"
                value={email}
                placeholder={t.emailPlaceholder}
                autoComplete="email"
                className={errors.email ? "input-error" : ""}
                aria-invalid={Boolean(errors.email)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailExists(false);
                  clearError("email");
                }}
              />

              {errors.email && <p className="field-error">{errors.email}</p>}

              {emailExists && (
                <div className="email-exists-actions">
                  <button
                    type="button"
                    className="inline-link-button"
                    onClick={handleForgotPassword}
                    disabled={isSendingReset}
                  >
                    {isSendingReset ? t.resetSending : t.forgotPassword}
                  </button>

                  <span>•</span>

                  <a href="/login">{t.loginNow}</a>
                </div>
              )}
            </div>

            {/* PHONE */}

            <div className="form-group">
              <label htmlFor="phone">{t.phone} *</label>

              <input
                id="phone"
                type="tel"
                value={phone}
                placeholder={t.phonePlaceholder}
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                className={errors.phone ? "input-error" : ""}
                aria-invalid={Boolean(errors.phone)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);

                  setPhone(value);
                  clearError("phone");
                }}
              />

              {errors.phone && <p className="field-error">{errors.phone}</p>}

              <p className="field-hint">{t.phoneHint}</p>
            </div>

            {/* PASSWORD */}

            <div className="form-group">
              <label htmlFor="password">{t.password} *</label>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder={t.passwordPlaceholder}
                  autoComplete="new-password"
                  className={errors.password ? "input-error" : ""}
                  aria-invalid={Boolean(errors.password)}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? t.hidePassword : t.showPassword}
                </button>
              </div>

              {errors.password && (
                <p className="field-error">{errors.password}</p>
              )}

              <p className="field-hint">{t.passwordHint}</p>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="form-group">
              <label htmlFor="confirmPassword">{t.confirmPassword} *</label>

              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  placeholder={t.confirmPasswordPlaceholder}
                  autoComplete="new-password"
                  className={errors.confirmPassword ? "input-error" : ""}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError("confirmPassword");
                  }}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? t.hidePassword : t.showPassword}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="field-error">{errors.confirmPassword}</p>
              )}
            </div>

            {/* ACCEPT TERMS */}

            <div className="checkbox-group">
              <label
                className={
                  errors.acceptTerms
                    ? "checkbox-label checkbox-error"
                    : "checkbox-label"
                }
              >
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    clearError("acceptTerms");
                  }}
                />

                <span>{t.acceptTerms} *</span>
              </label>

              {errors.acceptTerms && (
                <p className="field-error">{errors.acceptTerms}</p>
              )}
            </div>

            {/* RECEIVE NEWS */}

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={receiveNews}
                  onChange={(e) => setReceiveNews(e.target.checked)}
                />

                <span>{t.receiveNews}</span>
              </label>
            </div>

            {/* MESSAGE */}

            {message && (
              <div
                className={`form-message ${messageType}`}
                role="alert"
                aria-live="polite"
              >
                {message}
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="form-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? t.signupLoading : t.createAccount}
            </button>

            {/* LOGIN */}

            <p className="login-link">
              {t.alreadyMember} <a href="/login">{t.login}</a>
            </p>
          </form>
        </section>
      </main>

      <SiteFooter language={language} />
    </div>
  );
}

export default Register;