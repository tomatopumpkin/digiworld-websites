import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import "../styles/LogoutDialog.css";

const translations = {
  th: {
    account: "บัญชีครอบครัว",
    title: "ต้องการออกจากระบบ?",
    text: "การจอง แพ็กเกจ และรายงานของบุตรหลานยังถูกเก็บไว้ คุณสามารถเข้าสู่ระบบอีกครั้งเพื่อดูข้อมูลได้ การออกจากระบบไม่ยกเลิกคลาสที่จอง",
    stay: "อยู่ในระบบต่อ",
    confirm: "ยืนยันออกจากระบบ",
    confirming: "กำลังออกจากระบบ...",
    error: "ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง",
  },
  en: {
    account: "Family account",
    title: "Log out?",
    text: "Your child's bookings, packages and reports are kept. You can log in again anytime to see them. Logging out does not cancel booked classes.",
    stay: "Stay logged in",
    confirm: "Log out",
    confirming: "Logging out...",
    error: "Couldn't log out. Please try again.",
  },
  zh: {
    account: "家庭账户",
    title: "确定要退出登录吗？",
    text: "孩子的预约、课时包和报告都会保留。您可以随时重新登录查看。退出登录不会取消已预约的课程。",
    stay: "继续保持登录",
    confirm: "确认退出",
    confirming: "正在退出...",
    error: "退出失败，请重试。",
  },
  ru: {
    account: "Семейный аккаунт",
    title: "Выйти из аккаунта?",
    text: "Записи, пакеты и отчёты вашего ребёнка сохранятся. Вы можете войти снова в любое время. Выход не отменяет забронированные занятия.",
    stay: "Остаться в аккаунте",
    confirm: "Выйти",
    confirming: "Выход...",
    error: "Не удалось выйти. Попробуйте ещё раз.",
  },
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function LogoutDialog({
  open,
  language,
  name,
  loading = false,
  error = false,
  onCancel,
  onConfirm,
}) {
  const t = translations[language] || translations.en;
  const dialogRef = useRef(null);
  const stayRef = useRef(null);
  const lastFocused = useRef(null);

  // เปิด: ล็อกการเลื่อนหน้า, โฟกัสปุ่ม "อยู่ในระบบต่อ" (ปุ่มที่ปลอดภัยกว่า), ปิด: คืนโฟกัสให้ปุ่มเดิม
  useEffect(() => {
    if (!open) return undefined;

    lastFocused.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    stayRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      lastFocused.current?.focus?.();
    };
  }, [open]);

  // กด Esc เพื่อปิด + ให้ Tab วนอยู่ในหน้าต่างนี้ (ระหว่างกำลังออกจากระบบจะปิดไม่ได้)
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== "Tab") return;

      const items = dialogRef.current?.querySelectorAll(FOCUSABLE);
      if (!items || !items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="ld-overlay"
      onMouseDown={(event) => {
        // คลิกพื้นหลังมืดเพื่อปิด (ไม่ปิดถ้ากำลังออกจากระบบ)
        if (event.target === event.currentTarget && !loading) onCancel();
      }}
    >
      <div
        className="ld-dialog"
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ld-title"
        aria-describedby="ld-text"
      >
        <span className="ld-badge">
          {t.account}
          {name ? ` · ${name}` : ""}
        </span>

        <h2 id="ld-title">{t.title}</h2>
        <p id="ld-text">{t.text}</p>

        {error && (
          <p className="ld-error" role="alert">
            {t.error}
          </p>
        )}

        <div className="ld-actions">
          <button
            type="button"
            ref={stayRef}
            className="ld-outline"
            onClick={onCancel}
            disabled={loading}
          >
            {t.stay}
          </button>
          <button
            type="button"
            className="ld-primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? t.confirming : t.confirm}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default LogoutDialog;

/* =====================================================================
   วิธีใช้ใน SiteHeader.jsx
   =====================================================================

   // 1) import
   import { useState } from "react";
   import { useNavigate } from "react-router-dom";
   import LogoutDialog from "./LogoutDialog";
   import { supabase } from "../lib/supabase";

   // 2) ใน component SiteHeader
   const navigate = useNavigate();
   const [logoutOpen, setLogoutOpen] = useState(false);
   const [loggingOut, setLoggingOut] = useState(false);
   const [logoutError, setLogoutError] = useState(false);

   const confirmLogout = async () => {
     setLoggingOut(true);
     setLogoutError(false);
     // scope: "local" = ออกจากระบบเฉพาะเครื่องนี้ (ค่าเริ่มต้นคือออกทุกเครื่อง)
     const { error } = await supabase.auth.signOut({ scope: "local" });
     setLoggingOut(false);
     if (error) {
       setLogoutError(true);
       return;
     }
     setLogoutOpen(false);
     navigate("/", { replace: true });
   };

   // 3) ปุ่ม "ออกจากระบบ" เดิม เปลี่ยนให้แค่เปิดหน้าต่างยืนยัน
   <button type="button" onClick={() => setLogoutOpen(true)}>
     ออกจากระบบ
   </button>

   // 4) วางไว้ท้าย JSX ของ header (name = ชื่อที่ header แสดงอยู่แล้ว)
   <LogoutDialog
     open={logoutOpen}
     language={language}
     name={displayName}
     loading={loggingOut}
     error={logoutError}
     onCancel={() => setLogoutOpen(false)}
     onConfirm={confirmLogout}
   />
   ===================================================================== */
