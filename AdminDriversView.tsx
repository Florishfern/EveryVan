import React, { useState } from 'react';
import { useVan } from '../context/VanContext';
import { User, Star, MessageSquare } from 'lucide-react';

export const AdminDriversView: React.FC = () => {
  const { drivers } = useVan();
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);

  return (
    <div className="flex flex-col gap-4 animate-slide-in">
      {/* Drivers List Card */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} color="var(--primary)" />
          <span>รายชื่อคนขับรถตู้ที่ลงทะเบียนทั้งหมด</span>
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
              <th style={{ padding: '12px 8px' }}>รูปภาพ</th>
              <th style={{ padding: '12px 8px' }}>ชื่อ-นามสกุล</th>
              <th style={{ padding: '12px 8px' }}>เบอร์โทรศัพท์</th>
              <th style={{ padding: '12px 8px' }}>เลขที่ใบอนุญาต</th>
              <th style={{ padding: '12px 8px' }}>คะแนนเรตติ้ง</th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>ความคิดเห็นผู้โดยสาร</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  ไม่มีข้อมูลคนขับในระบบ
                </td>
              </tr>
            ) : (
              drivers.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px' }}>
                    <img 
                      src={d.avatar} 
                      alt={d.name} 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} 
                    />
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{d.name}</td>
                  <td style={{ padding: '12px 8px' }}>{d.phone}</td>
                  <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>{d.licenseNo}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#f59e0b' }}>
                      <Star size={16} fill="#f59e0b" />
                      <span>{d.rating}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>({d.reviews.length} รีวิว)</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '6px 12px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => setSelectedDriverId(d.id)}
                    >
                      <MessageSquare size={14} />
                      ดูรีวิวทั้งหมด
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Driver Reviews Modal */}
      {selectedDriver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            width: '500px',
            maxWidth: '95%',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            background: 'var(--card-bg, #fff)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={selectedDriver.avatar} 
                  alt={selectedDriver.name} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>รีวิวของ {selectedDriver.name.split(' (')[0]}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                    <Star size={13} fill="#f59e0b" />
                    <span>{selectedDriver.rating} / 5.0 ({selectedDriver.reviews.length} ความคิดเห็น)</span>
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-outline" 
                style={{ padding: '4px 8px', minWidth: 'auto', borderRadius: '50%' }}
                onClick={() => setSelectedDriverId(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
              {selectedDriver.reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                  ยังไม่มีผู้โดยสารรีวิวพนักงานขับรถท่านนี้
                </div>
              ) : (
                selectedDriver.reviews.map((r, idx) => (
                  <div key={idx} style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-color, #f9fafb)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>คุณ {r.passengerName}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', margin: '2px 0' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          fill={i < Math.floor(r.rating) ? "#f59e0b" : "none"} 
                          color="#f59e0b" 
                        />
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)' }}>"{r.comment}"</p>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={() => setSelectedDriverId(null)}>
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
