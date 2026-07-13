import React, { useState } from 'react';
import { useVan } from '../context/VanContext';
import { Bell, Moon, Sun, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { notifications, markNotificationsAsRead, currentUser, logout } = useVan();
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markNotificationsAsRead();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const profile = currentUser?.profile || {
    name: 'Guest User',
    phone: '',
    email: ''
  };

  const getRoleLabel = (role: string) => {
    if (role === 'passenger') return '👤 ผู้โดยสาร (Passenger)';
    if (role === 'driver') return '👨‍✈️ คนขับรถ (Driver)';
    if (role === 'admin') return '💼 ผู้ดูแลระบบ (Admin/Staff)';
    return '';
  };

  return (
    <header className="card" style={{ 
      borderRadius: '0 0 16px 16px', 
      padding: '16px 24px', 
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 50,
      position: 'sticky',
      top: 0
    }}>
      <div className="flex items-center gap-4">
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          color: 'white',
          padding: '10px 14px',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '20px',
          boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
        }}>
          EveryVan 🚐
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ระบบจัดตารางเดินรถ
          </span>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>
            สิทธิ์: {getRoleLabel(currentUser?.role || '')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4" style={{ position: 'relative' }}>
        <button 
          className="btn btn-outline" 
          onClick={toggleTheme} 
          style={{ padding: '8px 12px', borderRadius: '10px' }}
          title="สลับธีม สว่าง/มืด"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div style={{ position: 'relative' }}>
          <button 
            className="btn btn-outline" 
            onClick={handleNotificationClick}
            style={{ padding: '8px 12px', borderRadius: '10px', position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--danger)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '9999px',
                border: '2px solid var(--bg-card)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="card animate-slide-in" style={{
              position: 'absolute',
              right: 0,
              top: '45px',
              width: '320px',
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '16px',
              zIndex: 100,
              boxShadow: 'var(--shadow-lg)',
              background: 'var(--bg-card-hover)'
            }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <h4 style={{ fontSize: '15px' }}>การแจ้งเตือนระบบ</h4>
                {unreadCount > 0 && <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>อ่านหมดแล้ว</span>}
              </div>
              <div className="flex flex-col gap-2">
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>ไม่มีการแจ้งเตือน</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: n.isRead ? 'transparent' : 'var(--primary-light)',
                      borderLeft: `3px solid ${
                        n.type === 'accident' ? 'var(--danger)' : 
                        n.type === 'schedule_change' ? 'var(--warning)' : 
                        n.type === 'payment_status' ? 'var(--success)' : 'var(--primary)'
                      }`,
                      fontSize: '13px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {n.type === 'accident' ? '⚠️ ข้อมูลเดินรถ' : n.type === 'schedule_change' ? '🕒 เลื่อนเวลา' : 'ℹ️ ระบบ'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.timestamp}</span>
                      </div>
                      <p style={{ color: 'var(--text-main)', fontSize: '12.5px', marginTop: '2px' }}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile card & Logout */}
        <div className="flex items-center gap-3" style={{ paddingLeft: '8px', borderLeft: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '14px',
              marginRight: '6px'
            }}>
              {profile.name ? profile.name.charAt(0) : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }} className="hidden-mobile">
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{profile.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{profile.phone}</span>
            </div>
          </div>
          <button 
            className="btn btn-outline" 
            onClick={handleLogout}
            style={{ padding: '8px 10px', borderRadius: '10px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
            title="ออกจากระบบ"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
