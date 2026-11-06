import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";

// Import Pages
import GuestHome from "./pages/GuestHome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterSuccess from "./pages/RegisterSuccess";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MemberHome from "./pages/MemberHome";
import Courses from "./pages/Courses";
import TrialBooking from "./pages/TrialBooking";
import BookClass from "./pages/BookClass";
import ParentPortal from "./pages/ParentPortal";
import AddChild from "./pages/AddChild";

// Admin
import { AuthProvider } from "./auth/AuthProvider";
import RequireAdmin from "./auth/RequireAdmin";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

// Shared components
import ProtectedRoute from "./components/ProtectedRoute";
import useSession from "./lib/useSession";
import { supabase } from "./lib/supabase";

// เปิดเว็บมาจากลิงก์รีเซ็ตรหัสผ่านหรือไม่ (เช็กตั้งแต่โหลดไฟล์ ก่อน Supabase ลบ hash ออก)
const STARTED_AS_RECOVERY =
  typeof window !== "undefined" &&
  window.location.hash.includes("type=recovery");

// พาไปหน้าตั้งรหัสผ่านใหม่เมื่อ Supabase แจ้งว่าเป็นลิงก์รีเซ็ตรหัสผ่าน
function RecoveryRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const goToReset = () => {
      if (window.location.pathname !== "/reset-password") {
        navigate(
          { pathname: "/reset-password", hash: window.location.hash },
          { replace: true }
        );
      }
    };

    if (STARTED_AS_RECOVERY) goToReset();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") goToReset();
    });

    return () => data.subscription.unsubscribe();
  }, [navigate]);

  return null;
}

// หน้าแรก: ล็อกอินแล้วเห็น MemberHome / ยังไม่ล็อกอินเห็น GuestHome
function HomeRoute() {
  const { session, loading } = useSession();

  if (loading) return null; // รอเช็ก session ก่อน กันหน้ากระพริบ

  return session ? <MemberHome /> : <GuestHome />;
}

function App() {
  return (
    <BrowserRouter>
      <RecoveryRedirect />

      <Routes>
        {/* หน้าแรก: ล็อกอินแล้ว = MemberHome / ยังไม่ล็อกอิน = GuestHome */}
        <Route path="/" element={<HomeRoute />} />

        {/* หน้าสมัครสมาชิก */}
        <Route path="/register" element={<Register />} />

        {/* หน้าสมัครสมาชิกสำเร็จ */}
        <Route path="/register-success" element={<RegisterSuccess />} />

        {/* หน้าเข้าสู่ระบบ */}
        <Route path="/login" element={<Login />} />

        {/* หน้าลืมรหัสผ่าน (ขอลิงก์ทางอีเมล) */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* หน้าตั้งรหัสผ่านใหม่ (เปิดจากลิงก์ในอีเมล) */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* หน้าคอร์สเรียน (เปิดให้ทุกคนดูได้) */}
        <Route path="/courses" element={<Courses />} />

        {/* หน้าจองทดลองเรียน (ต้องล็อกอิน) */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <TrialBooking />
            </ProtectedRoute>
          }
        />

        {/* หน้าจองคลาสเรียนด้วยแพ็กเกจ (ต้องล็อกอิน) */}
        <Route
          path="/book-class"
          element={
            <ProtectedRoute>
              <BookClass />
            </ProtectedRoute>
          }
        />

        {/* หน้าพื้นที่ผู้ปกครอง: บุตรหลานของฉัน (ต้องล็อกอิน) */}
        <Route
          path="/parent-portal"
          element={
            <ProtectedRoute>
              <ParentPortal />
            </ProtectedRoute>
          }
        />

        {/* หน้าเพิ่มโปรไฟล์บุตรหลาน (ต้องล็อกอิน) */}
        <Route
          path="/add-child"
          element={
            <ProtectedRoute>
              <AddChild />
            </ProtectedRoute>
          }
        />

        {/* ฝั่งแอดมิน: ครอบ AuthProvider เฉพาะ /admin ไม่กระทบหน้าสมาชิก */}
        <Route
          path="/admin"
          element={
            <AuthProvider>
              <Outlet />
            </AuthProvider>
          }
        >
          <Route path="login" element={<AdminLogin />} />
          <Route
            index
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
        </Route>

        {/* หน้าที่ไม่พบ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
