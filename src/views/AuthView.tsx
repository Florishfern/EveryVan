import React, { useState } from 'react';
import { useVan } from '../context/VanContext';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, registerUser } = useVan();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Login
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regRole, setRegRole] = useState<'passenger' | 'admin' | 'driver'>('passenger');
  const [regName, setRegName] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regThaiId, setRegThaiId] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(loginUser, loginPass);
    } catch (err: any) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!regUser || !regPass || !regName || !regDob || !regPhone || !regEmail || !regThaiId) {
      setError('กรุณากรอกข้อมูลทุกช่อง'); return;
    }
    if (!/^\d{13}$/.test(regThaiId)) {
      setError('เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก'); return;
    }
    try {
      await registerUser(regUser, regPass, regRole, { name: regName, dob: regDob, phone: regPhone, email: regEmail, thaiId: regThaiId });
      setSuccess('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      setActiveTab('login');
      setLoginUser(regUser); setLoginPass(regPass);
    } catch (err: any) {
      setError(err.message || 'สมัครสมาชิกไม่สำเร็จ');
    }
  };

  const quickLogin = async (u: string) => {
    setError('');
    try { await login(u, u); } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="auth-page">
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', width: '100%', maxWidth: '960px', padding: '24px' }}>

        {/* Left: Brand */}
        <div style={{ flex: 1, paddingTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '48px', height: '48px', background: 'var(--primary)',
              borderRadius: '14px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '24px'
            }}>🚐</div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>EveryVan</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3, marginBottom: '12px' }}>
            ระบบจัดการรถตู้<br />โดยสารอัจฉริยะ
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '340px' }}>
            จองตั๋ว เลือกที่นั่ง ติดตามสถานะรถ และจัดการคิวรถตู้ทั้งหมดในที่เดียว
          </p>

          {/* Features */}
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['📍 เลือกจุดขึ้นรถและจุดหมายปลายทาง', '🎫 ตั๋วอิเล็กทรอนิกส์พร้อม QR Code', '🔔 แจ้งเตือนเวลาออกรถแบบเรียลไทม์', '💼 แผงจัดการสำหรับ Admin และคนขับ'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Auth Card */}
        <div style={{ width: '400px', flexShrink: 0 }}>
          <div className="card" style={{ padding: '28px' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '22px' }}>
              {(['login', 'register'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setError(''); setSuccess(''); }}
                  style={{
                    flex: 1, padding: '10px 4px', border: 'none', background: 'transparent',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                </button>
              ))}
            </div>

            {/* Error / Success */}
            {error && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertCircle size={15} color="var(--danger)" />
                <span style={{ fontSize: '13px', color: 'var(--danger)' }}>{error}</span>
              </div>
            )}
            {success && (
              <div style={{ padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: 'var(--success)' }}>
                {success}
              </div>
            )}

            {/* LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="label">ชื่อผู้ใช้งาน (Username)</label>
                  <input type="text" className="input" placeholder="username" value={loginUser} onChange={e => setLoginUser(e.target.value)} />
                </div>
                <div>
                  <label className="label">รหัสผ่าน (Password)</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} className="input" style={{ paddingRight: '40px' }} placeholder="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
                    <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '11px', width: '100%', fontSize: '14px', fontWeight: 600, borderRadius: '10px', marginTop: '4px' }}>
                  เข้าสู่ระบบ
                </button>
              </form>
            )}

            {/* REGISTER */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                <div className="grid grid-cols-2" style={{ gap: '10px' }}>
                  <div>
                    <label className="label">Username</label>
                    <input type="text" className="input" placeholder="username" value={regUser} onChange={e => setRegUser(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <input type="password" className="input" placeholder="password" value={regPass} onChange={e => setRegPass(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">ประเภทผู้ใช้งาน (Role)</label>
                  <select value={regRole} onChange={e => setRegRole(e.target.value as any)}>
                    <option value="passenger">👤 ผู้โดยสาร (Passenger)</option>
                    <option value="driver">👨‍✈️ คนขับรถ (Driver)</option>
                    <option value="admin">💼 Admin / เจ้าหน้าที่</option>
                  </select>
                </div>
                <div>
                  <label className="label">ชื่อ-นามสกุล</label>
                  <input type="text" className="input" placeholder="เช่น นายรัชพล ทองอินทร์" value={regName} onChange={e => setRegName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2" style={{ gap: '10px' }}>
                  <div>
                    <label className="label">วัน/เดือน/ปีเกิด</label>
                    <input type="date" className="input" value={regDob} onChange={e => setRegDob(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">เบอร์โทรศัพท์</label>
                    <input type="tel" className="input" placeholder="08X-XXX-XXXX" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">อีเมล</label>
                  <input type="email" className="input" placeholder="email@example.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                </div>
                <div>
                  <label className="label">เลขบัตรประชาชน 13 หลัก (Thai ID)</label>
                  <input type="text" className="input" maxLength={13} placeholder="1234567890123" value={regThaiId} onChange={e => setRegThaiId(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-success" style={{ padding: '11px', width: '100%', fontWeight: 600, borderRadius: '10px' }}>
                  สมัครสมาชิก
                </button>
              </form>
            )}

            {/* Quick Access */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🔑 ทดสอบด่วน (Quick Demo)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { user: 'pax', label: '👤 ผู้โดยสาร', sub: 'pax / pax' },
                  { user: 'driver', label: '👨‍✈️ คนขับรถ', sub: 'driver / driver' },
                  { user: 'admin', label: '💼 Admin', sub: 'admin / admin' }
                ].map(item => (
                  <button
                    key={item.user}
                    onClick={() => quickLogin(item.user)}
                    style={{
                      padding: '8px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-color)',
                      borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-light)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-app)')}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>{item.label}</span>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
