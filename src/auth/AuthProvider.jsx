import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [profileState, setProfileState] = useState(null); // { uid, data }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const uid = session?.user?.id;

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    supabase
      .from('admin_users')
      .select('user_id, full_name')
      .eq('user_id', uid)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfileState({ uid, data });
      });
    return () => { cancelled = true; };
  }, [uid]);

  const profile = uid && profileState?.uid === uid ? profileState.data : null;
  const loading = !sessionChecked || (!!uid && profileState?.uid !== uid);

  const value = {
    session,
    profile,
    loading,
    isAdmin: !!profile,
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
