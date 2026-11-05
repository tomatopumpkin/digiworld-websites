import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.jpeg";
import { languages, siteText } from "../lib/siteText";
import { supabase } from "../lib/supabase";
import useSession from "../lib/useSession";
import LogoutDialog from "./LogoutDialog";

// protected: true = ต้องล็อกอินก่อนถึงจะเข้าได้
const navItems = [
  { to: "/", key: "home" },
  { to: "/courses", key: "courses" },
  { to: "/parent-portal", key: "parentPortal", protected: true },
  { to: "/booking", key: "booking", protected: true },
];

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const IconUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...iconProps}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </svg>
);

export default function SiteHeader({ language, onLanguageChange }) {
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { session, loading } = useSession();

  const t = siteText[language] || siteText.th;
  const current = languages.find((l) => l.code === language) || languages[0];

  // ล็อกเฉพาะตอนเช็กเสร็จแล้วและยังไม่ได้ล็อกอิน (กันกระพริบตอนโหลด)
  const isGuest = !loading && !session;

  // ชื่อที่แสดงในป้ายของหน้าต่างยืนยัน (ถ้าไม่มีชื่อจะไม่แสดง)
  const meta = session?.user?.user_metadata || {};
  const displayName = meta.full_name || meta.name || "";

  const closeLogout = () => {
    setLogoutOpen(false);
    setLogoutError(false);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    setLogoutError(false);
    // scope: "local" = ออกจากระบบเฉพาะเครื่องนี้
    const { error } = await supabase.auth.signOut({ scope: "local" });
    setLoggingOut(false);
    if (error) {
      setLogoutError(true);
      return;
    }
    setLogoutOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <header className="sl-header">
      <Link to="/" className="sl-brand">
        <img className="sl-logo" src={logo} alt="Digiworld Logo" />
        <div>
          <span className="sl-brand-name">Digiworld</span>
          <span className="sl-brand-tag">CODING &amp; CREATIVE LEARNING</span>
        </div>
      </Link>

      <nav className="sl-nav">
        {navItems.map((item) => {
          const locked = item.protected && isGuest;

          if (locked) {
            return (
              <Link
                key={item.to}
                to="/login"
                state={{ from: item.to }}
                className="is-locked"
                title={t.loginRequired}
              >
                <IconLock />
                {t[item.key]}
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={pathname === item.to ? "is-active" : ""}
            >
              {t[item.key]}
            </Link>
          );
        })}
      </nav>

      <div className="sl-actions">
        <Link
          to={isGuest ? "/login" : "/booking"}
          state={isGuest ? { from: "/booking" } : undefined}
          className="sl-btn"
        >
          {t.freeTrial}
        </Link>

        {session ? (
          <button
            type="button"
            className="sl-login"
            onClick={() => setLogoutOpen(true)}
          >
            <IconUser />
            {t.logout}
          </button>
        ) : (
          <Link to="/login" className="sl-login">
            <IconUser />
            {t.login}
          </Link>
        )}

        <div className="sl-lang-wrap">
          <button
            type="button"
            className="sl-lang"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <small>{current.short}</small>
            <span>{current.label}</span>
            <span className="sl-lang-arrow">⌄</span>
          </button>

          {open && (
            <div className="sl-lang-menu">
              {languages.map((l) => (
                <button
                  type="button"
                  key={l.code}
                  className={
                    language === l.code
                      ? "sl-lang-option is-active"
                      : "sl-lang-option"
                  }
                  onClick={() => {
                    onLanguageChange(l.code);
                    setOpen(false);
                  }}
                >
                  <small>{l.short}</small>
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <LogoutDialog
        open={logoutOpen}
        language={language}
        name={displayName}
        loading={loggingOut}
        error={logoutError}
        onCancel={closeLogout}
        onConfirm={confirmLogout}
      />
    </header>
  );
}
