import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useSession from "../lib/useSession";

// ครอบหน้าที่ต้องล็อกอิน ถ้ายังไม่ล็อกอินจะส่งไป /login
// แล้วจำหน้าเดิมไว้ใน state.from เพื่อเด้งกลับหลังล็อกอิน
export default function ProtectedRoute({ children }) {
  const { session, loading } = useSession();
  const location = useLocation();

  if (loading) return null;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
