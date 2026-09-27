'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'bootstrap'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError('بيانات الدخول غير صحيحة.');
      return;
    }
    router.push('/admin');
  }

  async function handleBootstrap(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr) {
      setLoading(false);
      setError(signUpErr.message);
      return;
    }
    // signUp may or may not auto-create a session depending on email-confirmation settings
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        setLoading(false);
        setError('تم إنشاء الحساب، لكن يلزم تأكيد البريد الإلكتروني قبل تسجيل الدخول.');
        return;
      }
    }

    const { error: rpcErr } = await supabase.rpc('bootstrap_first_admin', { p_full_name: fullName });
    setLoading(false);
    if (rpcErr) {
      setError('تعذّر إنشاء حساب المالك. من المحتمل أن يكون هناك حساب مالك بالفعل.');
      return;
    }
    router.push('/admin');
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-display text-2xl font-bold mb-6 text-center">لوحة تحكم هديّتك</h1>

      <div className="flex gap-2 mb-6 text-sm">
        <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-full font-bold ${mode === 'login' ? 'bg-rose text-white' : 'bg-blush'}`}>تسجيل الدخول</button>
        <button onClick={() => setMode('bootstrap')} className={`flex-1 py-2 rounded-full font-bold ${mode === 'bootstrap' ? 'bg-rose text-white' : 'bg-blush'}`}>أول حساب مالك</button>
      </div>

      <form onSubmit={mode === 'login' ? handleLogin : handleBootstrap} className="space-y-4">
        {mode === 'bootstrap' && (
          <div>
            <label className="block text-sm font-bold mb-1">الاسم</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-blush" />
          </div>
        )}
        <div>
          <label className="block text-sm font-bold mb-1">البريد الإلكتروني</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-blush" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">كلمة المرور</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2 rounded-lg border border-blush" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-rose text-white font-bold py-3 rounded-full disabled:opacity-50">
          {loading ? 'جاري التحميل...' : mode === 'login' ? 'دخول' : 'إنشاء حساب المالك'}
        </button>
      </form>
    </div>
  );
}
