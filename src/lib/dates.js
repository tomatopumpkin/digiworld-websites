// ทุกอย่างคิดตามเวลาไทย (UTC+7) ไม่ขึ้นกับเขตเวลาของเครื่อง
const TZ = 7 * 3600 * 1000;
const DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสฯ', 'ศุกร์', 'เสาร์'];
const MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

const parts = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d, dow: new Date(`${s}T00:00:00Z`).getUTCDay() };
};

export const bangkokDate = (d = new Date()) => new Date(d.getTime() + TZ).toISOString().slice(0, 10);
export const addDays = (s, n) => {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const dayRange = (s) => [`${s}T00:00:00+07:00`, `${addDays(s, 1)}T00:00:00+07:00`];

export const fmtThaiDate = (s) => { const p = parts(s); return `${DAYS[p.dow]} ${p.d} ${MONTHS[p.m - 1]} ${p.y}`; };
export const fmtShort = (s) => { const p = parts(s); return `${p.d} ${MONTHS_SHORT[p.m - 1]}`; };
export const fmtShortYear = (s) => `${fmtShort(s)} ${parts(s).y}`;
export const fmtTime = (iso) => new Date(new Date(iso).getTime() + TZ).toISOString().slice(11, 16);
export const fmtStamp = (iso) => {
  const s = new Date(new Date(iso).getTime() + TZ).toISOString();
  return `${fmtShort(s.slice(0, 10))} ${s.slice(11, 16)}`;
};
export const toLocalInput = (iso) => new Date(new Date(iso).getTime() + TZ).toISOString().slice(0, 16);
export const fromLocalInput = (v) => new Date(`${v}:00+07:00`).toISOString();
