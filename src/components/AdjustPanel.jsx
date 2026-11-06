import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Btn, Card, Field, Pill, inputStyle, t } from './ui';
import { fmtStamp } from '../lib/dates';

export default function AdjustPanel({ enrollments, onDone }) {
  const [pick, setPick] = useState('');
  const [delta, setDelta] = useState('1');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [history, setHistory] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [tick, setTick] = useState(0);

  const cur = enrollments.find((e) => e.id === pick) ?? enrollments[0];
  const curId = cur?.id;
  const n = Number.parseInt(delta, 10);
  const change = Number.isFinite(n) ? n : 0;
  const before = cur?.sessions_remaining ?? 0;
  const after = before + change;
  const canSave = !!cur && change !== 0 && reason.trim().length > 0 && after >= 0 && !busy;

  useEffect(() => {
    if (!curId) { setHistory([]); return; }
    let off = false;
    supabase.from('session_adjustments')
      .select('id, created_at, source, delta, before_count, after_count, reason, reviewed_at, profiles(full_name)')
      .eq('enrollment_id', curId).order('created_at', { ascending: false }).limit(showAll ? 50 : 3)
      .then(({ data }) => { if (!off) setHistory(data ?? []); });
    return () => { off = true; };
  }, [curId, showAll, tick]);

  async function save() {
    setBusy(true); setMsg(null);
    const { error } = await supabase.rpc('admin_adjust_sessions',
      { p_enrollment_id: curId, p_delta: change, p_reason: reason.trim() });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setReason('');
    setMsg({ ok: true, text: `บันทึกแล้ว: ${before} → ${after} ครั้ง` });
    setTick((x) => x + 1);
    onDone();
  }

  async function markReviewed(id) {
    await supabase.from('session_adjustments').update({ reviewed_at: new Date().toISOString() }).eq('id', id);
    setTick((x) => x + 1);
    onDone();
  }

  const label = (e) => `${e.students?.name} · ${e.courses?.name} · ${e.courses?.sessions_total} ครั้ง`;

  return (
    <Card id="adjust" style={{ width: 420, maxWidth: '100%', gap: 16, border: `1px solid ${t.line}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 400 }}>ปรับจำนวนครั้ง</h2>
        <Pill bg={t.yellowBg}>แอดมินเท่านั้น</Pill>
      </div>

      {!cur ? (
        <p style={{ margin: 0, fontSize: 13, color: t.muted }}>ยังไม่มีแพ็กเกจนักเรียนให้ปรับ</p>
      ) : (
        <>
          <Field label="นักเรียน / แพ็กเกจ">
            <select style={inputStyle} value={curId} onChange={(e) => { setPick(e.target.value); setMsg(null); }}>
              {enrollments.map((e) => <option key={e.id} value={e.id}>{label(e)}</option>)}
            </select>
          </Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="คงเหลือปัจจุบัน" style={{ flex: 1 }}>
              <input style={inputStyle} readOnly value={`${before} ครั้ง`} />
            </Field>
            <Field label="จำนวนที่ปรับ (+ เพิ่ม / − ลด)" style={{ flex: 1 }}>
              <input type="number" step="1" style={inputStyle} value={delta} onChange={(e) => setDelta(e.target.value)} />
            </Field>
          </div>
          <Field label="เหตุผล * (จำเป็น)">
            <input style={inputStyle} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="เช่น ชดเชยคลาสเริ่มล่าช้า" />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14,
            background: t.soft, borderRadius: 16 }}>
            <span style={{ fontSize: 13 }}>ยอดหลังบันทึก</span>
            <span style={{ fontSize: 20, color: after < 0 ? t.red : t.blue }}>{before} → {after} ครั้ง</span>
          </div>
          <Btn primary onClick={save} disabled={!canSave} style={{ width: '100%' }}>บันทึกพร้อมเหตุผล</Btn>
          {after < 0 && <p role="alert" style={{ margin: 0, fontSize: 12, color: t.red }}>ยอดคงเหลือต้องไม่ติดลบ</p>}
          {msg && <p role={msg.ok ? 'status' : 'alert'} style={{ margin: 0, fontSize: 12, color: msg.ok ? t.green : t.red }}>{msg.text}</p>}
          <p style={{ margin: 0, fontSize: 11, color: t.muted, lineHeight: 1.55 }}>
            ไม่บันทึกหากไม่ระบุเหตุผล ทุกการปรับมีผู้ดำเนินการ เวลา และยอดก่อน / หลัง
          </p>

          <div style={{ height: 1, background: t.line }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 400 }}>ประวัติการเปลี่ยนยอด · {cur.students?.name}</h3>
          {history.length === 0 && <p style={{ margin: 0, fontSize: 12, color: t.muted }}>ยังไม่มีประวัติ</p>}
          {history.map((h) => (
            <div key={h.id} style={{ fontSize: 12, lineHeight: 1.55 }}>
              {fmtStamp(h.created_at)} · {h.source === 'system' ? 'ระบบ' : h.profiles?.full_name || 'แอดมิน'} ·{' '}
              {h.before_count} → {h.after_count} ({h.delta > 0 ? '+' : '−'}{Math.abs(h.delta)})
              <br />{h.reason}
              {h.source === 'admin' && !h.reviewed_at && (
                <>{' '}<button type="button" onClick={() => markReviewed(h.id)}
                  style={{ border: 0, background: 'none', color: t.blue, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, padding: 0 }}>
                  ตรวจแล้ว</button></>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setShowAll((v) => !v)}
            style={{ border: 0, background: 'none', color: t.blue, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, padding: 0, textAlign: 'left' }}>
            {showAll ? 'แสดงเฉพาะล่าสุด' : 'เปิดบันทึกตรวจสอบทั้งหมด'}
          </button>
        </>
      )}
    </Card>
  );
}
