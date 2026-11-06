import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { dayRange } from '../lib/dates';

const SESSION_SELECT =
  'id, starts_at, capacity, room, course_id, teacher_id, courses(name), teachers(name), bookings(id, status)';

const fetchDay = (day) => {
  const [from, to] = dayRange(day);
  return supabase.from('class_sessions').select(SESSION_SELECT)
    .gte('starts_at', from).lt('starts_at', to).order('starts_at');
};

const EMPTY = {
  loading: true, error: '', sessions: [], tomorrowSessions: [], courses: [], teachers: [],
  enrollments: [], report: [], reportTotal: 0, pending: 0, activeStudents: 0,
  attendance: { present: 0, total: 0 },
};

export function useAdminData(date, tomorrow) {
  const [data, setData] = useState(EMPTY);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
      const res = await Promise.all([
        fetchDay(date),
        fetchDay(tomorrow),
        supabase.from('courses').select('*').eq('active', true).order('created_at'),
        supabase.from('teachers').select('id, name').order('name'),
        supabase.from('enrollments')
          .select('id, sessions_remaining, students(name), courses(name, sessions_total)').order('created_at'),
        supabase.from('enrollment_report').select('*', { count: 'exact' }).order('student_name').limit(20),
        supabase.from('session_adjustments').select('id', { count: 'exact', head: true })
          .eq('source', 'admin').is('reviewed_at', null),
        supabase.from('bookings').select('status, class_sessions!inner(starts_at)')
          .in('status', ['attended', 'absent']).gte('class_sessions.starts_at', weekAgo),
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('active', true),
      ]);
      if (cancelled) return;
      const [ses, tom, courses, teachers, enr, rep, pend, att, stu] = res;
      const failed = res.find((r) => r.error);
      const attRows = att.data ?? [];
      setData({
        loading: false,
        error: failed ? failed.error.message : '',
        sessions: ses.data ?? [],
        tomorrowSessions: tom.data ?? [],
        courses: courses.data ?? [],
        teachers: teachers.data ?? [],
        enrollments: enr.data ?? [],
        report: rep.data ?? [],
        reportTotal: rep.count ?? 0,
        pending: pend.count ?? 0,
        activeStudents: stu.count ?? 0,
        attendance: { present: attRows.filter((b) => b.status === 'attended').length, total: attRows.length },
      });
    })();
    return () => { cancelled = true; };
  }, [date, tomorrow, tick]);

  return { ...data, refresh };
}
