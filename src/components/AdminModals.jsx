import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Btn, Field, Modal, inputStyle, t } from './ui';
import { fromLocalInput, toLocalInput } from '../lib/dates';

export function CourseModal({ course, onClose, onSaved }) {
  const [f, setF] = useState({
    name: course?.name ?? '', sessions_total: course?.sessions_total ?? 8,
    duration_min: course?.duration_min ?? 90, price: course?.price ?? '', expires_days: course?.expires_days ?? '',
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function save() {
    const payload = {
      name: f.name.trim(), sessions_total: Number(f.sessions_total), duration_min: Number(f.duration_min),
      price: Number(f.price), expires_days: f.expires_days === '' ? null : Number(f.expires_days),
    };
    if (!payload.name) return setErr('กรุณาใส่ชื่อคอร์ส');
    if (f.price === '' || !(payload.sessions_total > 0 && payload.duration_min > 0 && payload.price >= 0))
      return setErr('ตรวจสอบจำนวนครั้ง ระยะเวลา และราคาอีกครั้ง');
    setBusy(true);
    const { error } = course
      ? await supabase.from('courses').update(payload).eq('id', course.id)
      : await supabase.from('courses').insert(payload);
    setBusy(false);
    if (error) return setErr(error.message);
    onSaved();
  }

  async function hide() {
    setBusy(true);
    const { error } = await supabase.from('courses').update({ active: false }).eq('id', course.id);
    setBusy(false);
    if (error) return setErr(error.message);
    onSaved();
  }

  return (
    <Modal title={course ? 'แก้ไขคอร์ส' : 'เพิ่มคอร์สใหม่'} onClose={onClose}>
      <Field label="ชื่อคอร์ส"><input style={inputStyle} value={f.name} onChange={set('name')} /></Field>
      <div style={{ display: 'flex', gap: 12 }}>
        <Field label="จำนวนครั้ง" style={{ flex: 1 }}>
          <input type="number" min="1" style={inputStyle} value={f.sessions_total} onChange={set('sessions_total')} />
        </Field>
        <Field label="นาทีต่อครั้ง" style={{ flex: 1 }}>
          <input type="number" min="1" style={inputStyle} value={f.duration_min} onChange={set('duration_min')} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Field label="ราคา (บาท)" style={{ flex: 1 }}>
          <input type="number" min="0" style={inputStyle} value={f.price} onChange={set('price')} />
        </Field>
        <Field label="หมดอายุหลัง (วัน)" style={{ flex: 1 }}>
          <input type="number" min="1" placeholder="เว้นว่าง = ไม่หมดอายุ" style={inputStyle}
            value={f.expires_days} onChange={set('expires_days')} />
        </Field>
      </div>
      {err && <p role="alert" style={{ margin: 0, fontSize: 13, color: t.red }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        {course ? <Btn onClick={hide} disabled={busy}>ซ่อนคอร์ส</Btn> : <span />}
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onClose}>ยกเลิก</Btn>
          <Btn primary onClick={save} disabled={busy}>บันทึกคอร์ส</Btn>
        </div>
      </div>
    </Modal>
  );
}

export function SessionModal({ session, date, courses, teachers, onClose, onSaved }) {
  const booked = session ? session.bookings.filter((b) => b.status !== 'cancelled').length : 0;
  const [f, setF] = useState({
    course_id: session?.course_id ?? courses[0]?.id ?? '',
    teacher_id: session?.teacher_id ?? teachers[0]?.id ?? '',
    room: session?.room ?? '',
    starts: session ? toLocalInput(session.starts_at) : `${date}T10:00`,
    capacity: session?.capacity ?? 6,
  });
  const [roster, setRoster] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    if (!session) return;
    supabase.from('bookings').select('code, status, students(name)')
      .eq('class_session_id', session.id).neq('status', 'cancelled').order('created_at')
      .then(({ data }) => setRoster(data ?? []));
  }, [session]);

  async function save() {
    const capacity = Number(f.capacity);
    if (!f.course_id || !f.teacher_id) return setErr('กรุณาเลือกคอร์สและครู');
    if (!f.starts) return setErr('กรุณาเลือกวันและเวลา');
    if (!(capacity > 0)) return setErr('ความจุต้องมากกว่า 0');
    if (capacity < booked) return setErr(`ลดความจุต่ำกว่าจำนวนที่จองแล้วไม่ได้ (จองแล้ว ${booked} ที่นั่ง)`);
    const payload = { course_id: f.course_id, teacher_id: f.teacher_id, room: f.room.trim() || null,
      starts_at: fromLocalInput(f.starts), capacity };
    setBusy(true);
    const { error } = session
      ? await supabase.from('class_sessions').update(payload).eq('id', session.id)
      : await supabase.from('class_sessions').insert(payload);
    setBusy(false);
    if (error) return setErr(error.message);
    onSaved();
  }

  if (!courses.length || !teachers.length) {
    return (
      <Modal title="เพิ่มรอบเรียน" onClose={onClose}>
        <p style={{ margin: 0, fontSize: 14 }}>ต้องมีอย่างน้อย 1 คอร์สและ 1 ครู (ตาราง teachers) ก่อนสร้างรอบเรียน</p>
        <Btn onClick={onClose}>ปิด</Btn>
      </Modal>
    );
  }

  return (
    <Modal title={session ? 'แก้ไขรอบเรียน / รายชื่อ' : 'เพิ่มรอบเรียน'} onClose={onClose}>
      <Field label="คอร์ส">
        <select style={inputStyle} value={f.course_id} onChange={set('course_id')}>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <div style={{ display: 'flex', gap: 12 }}>
        <Field label="ครู" style={{ flex: 1 }}>
          <select style={inputStyle} value={f.teacher_id} onChange={set('teacher_id')}>
            {teachers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </Field>
        <Field label="ห้อง" style={{ flex: 1 }}>
          <input style={inputStyle} value={f.room} onChange={set('room')} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Field label="วันและเวลา (เวลาไทย)" style={{ flex: 2 }}>
          <input type="datetime-local" style={inputStyle} value={f.starts} onChange={set('starts')} />
        </Field>
        <Field label={`ความจุ${session ? ` (จองแล้ว ${booked})` : ''}`} style={{ flex: 1 }}>
          <input type="number" min={Math.max(1, booked)} style={inputStyle} value={f.capacity} onChange={set('capacity')} />
        </Field>
      </div>

      {session && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.muted, marginBottom: 6 }}>รายชื่อ ({roster.length})</div>
          {roster.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: t.muted }}>ยังไม่มีผู้จอง</p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13 }}>
              {roster.map((r) => (
                <li key={r.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                  borderBottom: `1px solid ${t.line}` }}>
                  <span>{r.students?.name}</span><span style={{ color: t.muted }}>{r.code}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {err && <p role="alert" style={{ margin: 0, fontSize: 13, color: t.red }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn onClick={onClose}>ยกเลิก</Btn>
        <Btn primary onClick={save} disabled={busy}>บันทึกรอบเรียน</Btn>
      </div>
    </Modal>
  );
}
