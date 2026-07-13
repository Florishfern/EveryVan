import React, { useState } from 'react';
import { useVan } from '../context/VanContext';
import {
  MapPin, Ticket, User, LayoutDashboard, ClipboardList,
  BadgeDollarSign, Truck, Bell, Moon, Sun, LogOut, ChevronRight, AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeNav, onNavChange }) => {
  const { currentUser, logout } = useVan();
  const role = currentUser?.role || 'passenger';
  const [confirmLogout, setConfirmLogout] = useState(false);

  const passengerNav = [
    { id: 'book', label: 'จองตั๋วรถตู้', icon: <MapPin size={18} /> },
    { id: 'tickets', label: 'ตั๋วของฉัน', icon: <Ticket size={18} /> },
    { id: 'profile', label: 'ข้อมูลสมาชิก', icon: <User size={18} /> },
  ];

  const driverNav = [
    { id: 'schedule', label: 'ตารางเดินรถ', icon: <LayoutDashboard size={18} /> },
    { id: 'boarding', label: 'ตรวจตั๋วผู้โดยสาร', icon: <Truck size={18} /> },
  ];

  const adminNav = [
    { id: 'dispatcher', label: 'จัดการคิวรถตู้', icon: <ClipboardList size={18} /> },
    { id: 'accountant', label: 'รายงานการเงิน', icon: <BadgeDollarSign size={18} /> },
  ];

  const navItems = role === 'passenger' ? passengerNav : role === 'driver' ? driverNav : adminNav;

  const roleLabel =
    role === 'passenger' ? 'ผู้โดยสาร' : role === 'driver' ? 'คนขับรถ' : 'Admin / เจ้าหน้าที่';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🚐</div>
        <span className="sidebar-logo-text">EveryVan</span>
      </div>

      <div className="sidebar-nav">
        <div className="sidebar-section-label">{roleLabel}</div>

        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activeNav === item.id ? 'active' : ''}`}
            onClick={() => onNavChange(item.id)}
          >
            <span className="item-icon">{item.icon}</span>
            {item.label}
            {activeNav === item.id && (
              <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
            )}
          </button>
        ))}
      </div>

      <div className="sidebar-bottom">
        {confirmLogout ? (
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={13} color="var(--warning)" />
              ยืนยันออกจากระบบ?
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={async () => { setConfirmLogout(false); await logout(); }}
                style={{
                  flex: 1, padding: '7px', borderRadius: '8px', border: 'none',
                  background: 'var(--danger)', color: 'white', fontSize: '12.5px',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                ออกจากระบบ
              </button>
              <button
                onClick={() => setConfirmLogout(false)}
                style={{
                  flex: 1, padding: '7px', borderRadius: '8px',
                  border: '1px solid var(--border-color)', background: 'transparent',
                  fontSize: '12.5px', fontWeight: 500, cursor: 'pointer',
                  color: 'var(--text-main)'
                }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        ) : (
          <button className="sidebar-logout" onClick={() => setConfirmLogout(true)}>
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        )}
      </div>
    </aside>
  );
};

/* ─────────────────────────────────────────
   TOPBAR
───────────────────────────────────────── */
interface TopbarProps {
  title: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title }) => {
  const { currentUser, notifications, markNotificationsAsRead, logout } = useVan();
  const [showNotif, setShowNotif] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const unread = notifications.filter(n => !n.isRead).length;

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const profile = currentUser?.profile;

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>

      <div className="topbar-right">
        <button className="topbar-icon-btn" onClick={toggleTheme} title="สลับธีม">
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        <button
          className="topbar-icon-btn"
          onClick={handleLogout}
          title="ออกจากระบบ"
          style={{ width: 'auto', padding: '0 12px', borderRadius: '999px', gap: '8px', color: 'var(--danger)', background: 'var(--danger-light)' }}
        >
          <LogOut size={16} />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Logout</span>
        </button>

        {/* Notification */}
        <div style={{ position: 'relative' }}>
          <button
            className="topbar-icon-btn"
            onClick={() => { setShowNotif(v => !v); markNotificationsAsRead(); }}
          >
            <Bell size={17} />
            {unread > 0 && <span className="topbar-badge">{unread > 9 ? '9+' : unread}</span>}
          </button>

          {showNotif && (
            <div className="notif-dropdown animate-slide-in">
              <div className="notif-header">การแจ้งเตือน ({notifications.length})</div>
              {notifications.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  ไม่มีการแจ้งเตือน
                </div>
              ) : notifications.map(n => (
                <div key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-main)' }}>
                      {n.type === 'accident' ? '⚠️ เหตุขัดข้อง' :
                       n.type === 'schedule_change' ? '🕒 เลื่อนเวลา' :
                       n.type === 'departure' ? '🚐 เดินทาง' : 'ℹ️ ระบบ'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.timestamp}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div className="topbar-user">
          <div className="topbar-avatar">{profile?.name?.charAt(0) ?? 'U'}</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{profile?.name}</span>
            <span className="topbar-user-role">{profile?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
