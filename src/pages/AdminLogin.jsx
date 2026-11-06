import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Btn, Field, Pill, font, inputStyle, t } from '../components/ui';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleLogin() {
    setError('');
    setBusy(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authError) {
      setBusy(false);
      const msg = authError.message || '';
      if (/not confirmed/i.test(msg)) setError('อีเมลนี้ยังไม่ได้ยืนยัน');
      else if (/invalid login/i.test(msg)) setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      else setError(`เข้าสู่ระบบไม่สำเร็จ: ${msg}`);
      return;
    }

    // ตรวจบทบาทจากฐานข้อมูล ไม่ใช่จากอีเมลที่พิมพ์
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (!adminRow) {
      await supabase.auth.signOut();
      setBusy(false);
      setError('บัญชีนี้ไม่มีสิทธิ์แอดมิน');
      return;
    }

    navigate(redirectTo, { replace: true });
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: t.bg, padding: 16, fontFamily: font, color: t.ink }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'white', borderRadius: 24,
        border: `1px solid ${t.line}`, padding: 32, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div aria-hidden style={{ width: 40, height: 40, borderRadius: 14, background: t.blue, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>∞</div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 19 }}>digiworld</span>
        </div>
        <div style={{ marginTop: 16 }}><Pill>ADMIN WORKSPACE</Pill></div>

        <h1 style={{ margin: '24px 0 4px', fontSize: 24, fontWeight: 400 }}>เข้าสู่ระบบแอดมิน</h1>
        <p style={{ margin: 0, fontSize: 14, color: t.muted }}>ใช้อีเมลและรหัสผ่านของผู้ดูแลระบบ</p>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
          onKeyDown={(e) => e.key === 'Enter' && !busy && handleLogin()}>
          <Field label="อีเมล">
            <input type="email" autoComplete="username" style={inputStyle}
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="รหัสผ่าน">
            <input type="password" autoComplete="current-password" style={inputStyle}
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>

          {error && <p role="alert" style={{ margin: 0, fontSize: 13, color: t.red }}>{error}</p>}

          <Btn primary onClick={handleLogin} disabled={busy || !email || !password}
            style={{ width: '100%', height: 44 }}>
            {busy ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
