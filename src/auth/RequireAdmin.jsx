import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

// ครอบทุกหน้าของฝั่งแอดมิน
// หมายเหตุ: นี่คือการซ่อนหน้าเท่านั้น ความปลอดภัยจริงอยู่ที่ RLS (is_admin()) ในฐานข้อมูล
export default function RequireAdmin({ children }) {
  const { session, loading, isAdmin, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 40, color: '#6b7a90' }}>กำลังตรวจสอบสิทธิ์...</div>;
  }
  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (!isAdmin) {
    return (
      <div style={{ padding: 40 }}>
        <p>บัญชีนี้ไม่มีสิทธิ์เข้าฝั่งแอดมิน</p>
        <button onClick={signOut} style={{ marginTop: 12, color: '#2563d9' }}>
          ออกจากระบบ
        </button>
      </div>
    );
  }
  return children;
}
