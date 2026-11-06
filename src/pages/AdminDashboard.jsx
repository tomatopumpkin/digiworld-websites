import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { useAdminData } from '../hooks/useAdminData';
import AdjustPanel from '../components/AdjustPanel';
import { CourseModal, SessionModal } from '../components/AdminModals';
import { Btn, Card, Pill, font, t } from '../components/ui';
import { addDays, bangkokDate, fmtShort, fmtShortYear, fmtThaiDate, fmtTime } from '../lib/dates';

const NAV = [
  { label: 'ภาพรวมโรงเรียน', to: 'top' },
  { label: 'ครอบครัว & นักเรียน' },
  { label: 'คอร์ส / ราคา / แพ็กเกจ', to: 'courses' },
  { label: 'ตาราง & ความจุ', to: 'schedule' },
  { label: 'การจองและรายชื่อ' },
  { label: 'ปรับจำนวนครั้ง', to: 'adjust' },
  { label: 'รายงานการเรียน', to: 'report' },
];

const SCHEDULE_COLS = '64px minmax(160px,1.6fr) minmax(110px,1fr) 90px 100px 130px';
const REPORT_COLS = 'minmax(140px,1.4fr) minmax(160px,1.6fr) 80px 90px 80px 120px';
const th = { fontSize: 12, fontWeight: 600, color: t.muted };
const headRow = (cols) => ({ display: 'grid', gridTemplateColumns: cols, gap: 16, padding: 12,
  background: t.bg, borderRadius: 10, alignItems: 'center' });
const bodyRow = (cols) => ({ display: 'grid', gridTemplateColumns: cols, gap: 16, padding: 12,
  borderBottom: `1px solid ${t.line}`, alignItems: 'center', fontSize: 13 });
const linkBtn = { border: 0, background: 'none', color: t.blue, cursor: 'pointer', fontFamily: 'inherit',
  fontSize: 12, padding: 0, textAlign: 'left' };

const booked = (s) => s.bookings.filter((b) => b.status !== 'cancelled').length;

function seatPill(free) {
  if (free <= 0) return <Pill bg={t.greenBg} color={t.green}>เต็มแล้ว</Pill>;
  if (free <= 2) return <Pill bg={t.yellowBg}>{free} ที่นั่ง</Pill>;
  return <Pill bg={t.greenBg} color={t.green}>{free} ที่นั่ง</Pill>;
}

function Stat({ label, value, pill }) {
  return (
    <div style={{ padding: 24, background: 'white', borderRadius: 24, border: `1px solid ${t.line}`,
      display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
      <div style={{ fontSize: 14, color: t.muted }}>{label}</div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 34, fontWeight: 700, lineHeight: 1.5 }}>{value}</div>
      {pill}
    </div>
  );
}

async function exportCsv() {
  const { data, error } = await supabase.from('enrollment_report').select('*').order('student_name');
  if (error) return alert(error.message);
  const head = ['นักเรียน', 'ผู้ปกครอง', 'คอร์ส', 'เรียนแล้ว', 'จองล่วงหน้า', 'คงเหลือ', 'หมดอายุ'];
  const rows = data.map((r) => [r.student_name, r.guardian_name ?? '', r.course_name, r.attended,
    r.booked_ahead, r.sessions_remaining, r.expires_at ?? '']);
  const esc = (v) => {
    let s = String(v);
    if (/^[=+\-@]/.test(s)) s = `'${s}`;           // กัน CSV injection
    return `"${s.replaceAll('"', '""')}"`;
  };
  const csv = '\uFEFF' + [head, ...rows].map((r) => r.map(esc).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = `digiworld-report-${bangkokDate()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const { profile, session, signOut } = useAuth();
  const navigate = useNavigate();
  const today = bangkokDate();
  const tomorrow = addDays(today, 1);
  const [date, setDate] = useState(tomorrow);
  const [modal, setModal] = useState(null); // { type: 'course' | 'session', item? }
  const d = useAdminData(date, tomorrow);

  const tm = useMemo(() => {
    const cap = d.tomorrowSessions.reduce((n, s) => n + s.capacity, 0);
    const bk = d.tomorrowSessions.reduce((n, s) => n + booked(s), 0);
    return {
      classes: d.tomorrowSessions.length,
      teachers: new Set(d.tomorrowSessions.map((s) => s.teacher_id)).size,
      cap, bk, free: cap - bk, rate: cap ? Math.round((bk / cap) * 100) : 0,
    };
  }, [d.tomorrowSessions]);

  const { present, total } = d.attendance;
  const displayName = profile?.full_name || session?.user?.email || 'แอดมิน';
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const closeModal = () => setModal(null);
  const saved = () => { setModal(null); d.refresh(); };
  const logout = async () => { await signOut(); navigate('/admin/login', { replace: true }); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: font, color: t.ink }}>
      <aside style={{ width: 248, flexShrink: 0, background: 'white', borderRight: `1px solid ${t.line}`,
        padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 26,
        position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div aria-hidden style={{ width: 40, height: 40, borderRadius: 14, background: t.blue, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>∞</div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 19 }}>digiworld</span>
        </div>
        <div><Pill>ADMIN WORKSPACE</Pill></div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {NAV.map((item, i) => (
            <button key={item.label} type="button" disabled={!item.to} onClick={() => go(item.to)}
              title={item.to ? undefined : 'กำลังพัฒนา'}
              style={{ padding: 13, borderRadius: 10, border: 0, textAlign: 'left', fontFamily: font, fontSize: 13,
                background: i === 0 ? t.soft : 'white', color: i === 0 ? t.blue : t.ink,
                cursor: item.to ? 'pointer' : 'not-allowed', opacity: item.to ? 1 : 0.45 }}>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: 16, background: t.soft, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 14 }}>สิทธิ์แอดมิน</div>
          <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.55 }}>จัดการคอร์ส ตาราง ครอบครัว และปรับจำนวนครั้ง</div>
          <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.55 }}>ไม่รวมเช็กชื่อ บันทึกพัฒนาการ และงานที่ครูต้องดำเนินการ</div>
        </div>
        <div style={{ fontSize: 12, color: t.muted }}>DigiWorld Phuket (Robotic) · ภูเก็ต</div>
      </aside>

      <main id="top" style={{ flex: 1, minWidth: 0, padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 400, lineHeight: 1.55 }}>ภาพรวมโรงเรียน</h1>
            <div style={{ fontSize: 13, color: t.muted }}>
              {fmtThaiDate(today)} · อัปเดตล่าสุด {fmtTime(new Date().toISOString())}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ height: 38, padding: '0 16px', background: t.blue, color: 'white', borderRadius: 100,
              display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>แอดมิน ✓</span>
            <Btn onClick={logout}>ออกจากระบบ</Btn>
            <span title={displayName} aria-label={displayName} style={{ width: 38, height: 38, borderRadius: 100,
              background: t.purpleBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              {displayName.trim().charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        {d.error && (
          <div role="alert" style={{ padding: 14, borderRadius: 12, background: '#FDECEA', color: t.red, fontSize: 13 }}>
            โหลดข้อมูลไม่สำเร็จ: {d.error} (ตรวจว่ารัน supabase/02_schema.sql แล้ว)
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
          <Stat label="คลาสวันพรุ่งนี้" value={tm.classes}
            pill={<Pill>{fmtShort(tomorrow)} · ครู {tm.teachers} คน</Pill>} />
          <Stat label="การจองยืนยันแล้ว" value={tm.bk}
            pill={<Pill bg={t.greenBg} color={t.green}>จากความจุ {tm.cap} ที่นั่ง</Pill>} />
          <Stat label="อัตราการจอง" value={`${tm.rate}%`}
            pill={<Pill bg={t.purpleBg}>ว่างอีก {tm.free} ที่นั่ง</Pill>} />
          <Stat label="รายการรอตรวจสอบ" value={d.pending}
            pill={<Pill bg={t.yellowBg}>เหตุผลปรับครั้ง {d.pending} รายการ</Pill>} />
        </div>

        <Card id="schedule">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 23, fontWeight: 400, lineHeight: 1.55 }}>ตารางวันพรุ่งนี้ &amp; ความจุ</h2>
              <div style={{ fontSize: 12, color: t.muted }}>{fmtThaiDate(date)} · แสดง {d.sessions.length} คลาส</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="date" aria-label="เลือกวัน" value={date}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                style={{ height: 38, padding: '0 16px', borderRadius: 100, border: `1px solid ${t.line}`,
                  fontFamily: font, fontSize: 13, fontWeight: 600, color: t.ink, background: 'white' }} />
              <Btn primary onClick={() => setModal({ type: 'session' })}>＋ เพิ่มรอบเรียน</Btn>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 700 }}>
              <div style={headRow(SCHEDULE_COLS)}>
                {['เวลา', 'คอร์ส', 'ครู / ห้อง', 'จอง / ความจุ', 'ที่นั่งว่าง', 'จัดการ'].map((h) => <div key={h} style={th}>{h}</div>)}
              </div>
              {d.sessions.length === 0 && !d.loading && (
                <p style={{ margin: 0, padding: 20, fontSize: 13, color: t.muted }}>
                  ยังไม่มีรอบเรียนในวันนี้ กด “เพิ่มรอบเรียน” เพื่อสร้างรอบแรก
                </p>
              )}
              {d.sessions.map((s) => {
                const bk = booked(s);
                return (
                  <div key={s.id} style={bodyRow(SCHEDULE_COLS)}>
                    <div>{fmtTime(s.starts_at)}</div>
                    <div>{s.courses?.name}</div>
                    <div style={{ fontSize: 12, color: t.muted }}>{s.teachers?.name}{s.room ? ` · ${s.room}` : ''}</div>
                    <div>{bk} / {s.capacity}</div>
                    <div>{seatPill(s.capacity - bk)}</div>
                    <button type="button" style={linkBtn} onClick={() => setModal({ type: 'session', item: s })}>แก้ไข / รายชื่อ</button>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ fontSize: 12, color: t.muted }}>
            รอบเต็มปิดรับจอง • ไม่ลดความจุต่ำกว่าจำนวนที่จองแล้ว • ตรวจจำนวนที่นั่งซ้ำก่อนยืนยันการจอง
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Card id="courses" style={{ flex: '1 1 360px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 23, fontWeight: 400, lineHeight: 1.55 }}>จัดการคอร์ส</h2>
              <Pill>แอดมินเท่านั้น</Pill>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {d.courses.length === 0 && !d.loading && (
                <p style={{ margin: 0, fontSize: 13, color: t.muted }}>ยังไม่มีคอร์ส กด “เพิ่มคอร์สใหม่” เพื่อเริ่มต้น</p>
              )}
              {d.courses.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                  background: t.bg, border: `1px solid ${t.line}`, borderRadius: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: t.muted }}>
                      {c.sessions_total} ครั้ง · {c.duration_min} นาที · ฿{Number(c.price).toLocaleString('th-TH')} ·{' '}
                      {c.expires_days ? `หมดอายุ ${c.expires_days} วัน` : 'ไม่มีหมดอายุ'}
                    </div>
                  </div>
                  <Btn onClick={() => setModal({ type: 'course', item: c })}>แก้ไข</Btn>
                </div>
              ))}
            </div>
            <Btn primary onClick={() => setModal({ type: 'course' })} style={{ width: '100%' }}>เพิ่มคอร์สใหม่</Btn>
          </Card>

          <AdjustPanel enrollments={d.enrollments} onDone={d.refresh} />
        </div>

        <Card id="report">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 23, fontWeight: 400, lineHeight: 1.55 }}>รายงานการเรียน &amp; ครั้งคงเหลือ</h2>
              <div style={{ fontSize: 12, color: t.muted }}>
                {total
                  ? `เข้าเรียนสัปดาห์ล่าสุด ${present} / ${total} คน · ${Math.round((present / total) * 100)}% · นักเรียนใช้งาน ${d.activeStudents} คน`
                  : `ยังไม่มีข้อมูลเข้าเรียนในสัปดาห์ล่าสุด · นักเรียนใช้งาน ${d.activeStudents} คน`}
              </div>
            </div>
            <Btn onClick={exportCsv}>ส่งออก CSV ↓</Btn>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 720 }}>
              <div style={headRow(REPORT_COLS)}>
                {['นักเรียน / ผู้ปกครอง', 'คอร์ส', 'เรียนแล้ว', 'จองล่วงหน้า', 'คงเหลือ', 'หมดอายุ'].map((h) => (
                  <div key={h} style={{ ...th, fontWeight: 400 }}>{h}</div>
                ))}
              </div>
              {d.report.length === 0 && !d.loading && (
                <p style={{ margin: 0, padding: 20, fontSize: 13, color: t.muted }}>ยังไม่มีข้อมูลนักเรียนในรายงาน</p>
              )}
              {d.report.map((r) => (
                <div key={r.enrollment_id} style={bodyRow(REPORT_COLS)}>
                  <div>{r.student_name}{r.guardian_name ? ` / ${r.guardian_name}` : ''}</div>
                  <div>{r.course_name}</div>
                  <div>{r.attended}</div>
                  <div>{r.booked_ahead}</div>
                  <div style={{ fontSize: 16, color: r.sessions_remaining <= 2 ? t.amber : t.blue }}>{r.sessions_remaining}</div>
                  <div style={{ fontSize: 12 }}>{r.expires_at ? fmtShortYear(r.expires_at) : 'ไม่มีหมดอายุ'}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 12, color: t.muted }}>
            แสดง {d.report.length} จาก {d.reportTotal} แพ็กเกจ • “คงเหลือ” หักครั้งที่จองล่วงหน้าแล้ว และแยกการเข้าเรียนออกจากการใช้ครั้ง • ส่งออก CSV ได้ทั้งหมด
          </div>
        </Card>

        <div style={{ fontSize: 12, color: t.muted }}>DigiWorld Phuket (Robotic)</div>
      </main>

      {modal?.type === 'course' && <CourseModal course={modal.item} onClose={closeModal} onSaved={saved} />}
      {modal?.type === 'session' && (
        <SessionModal session={modal.item} date={date} courses={d.courses} teachers={d.teachers}
          onClose={closeModal} onSaved={saved} />
      )}
    </div>
  );
}
