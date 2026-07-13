import React from 'react';
import { useVan } from '../context/VanContext';
import { Truck } from 'lucide-react';

export const AdminVansView: React.FC = () => {
  const { vans } = useVan();

  const totalVans = vans.length;
  const vipVans = vans.filter(v => v.vanType.toLowerCase().includes('vip')).length;
  const standardVans = totalVans - vipVans;

  return (
    <div className="flex flex-col gap-4 animate-slide-in">
      {/* Fleet Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card" style={{ padding: '16px', background: 'var(--primary-light)' }}>
          <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>🚐 รถตู้ทั้งหมด</h4>
          <span style={{ fontSize: '24px', fontWeight: 700 }}>{totalVans} คัน</span>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ที่ลงทะเบียนในระบบ</p>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <h4>✨ รุ่น Premium VIP</h4>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{vipVans} คัน</span>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>เบาะกว้างนั่งสบายพิเศษ</p>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <h4>standard รุ่นปกติ</h4>
          <span style={{ fontSize: '24px', fontWeight: 700 }}>{standardVans} คัน</span>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ขนาดความจุมาตรฐาน 13 ที่นั่ง</p>
        </div>
      </div>

      {/* Vans Table */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={20} color="var(--primary)" />
          <span>รายชื่อรถตู้ลงทะเบียนทั้งหมดในระบบ EveryVan</span>
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
              <th style={{ padding: '12px 8px' }}>ป้ายทะเบียน</th>
              <th style={{ padding: '12px 8px' }}>ลักษณะรถ / รุ่น</th>
              <th style={{ padding: '12px 8px' }}>ความจุผู้โดยสาร</th>
              {/* <th style={{ padding: '12px 8px' }}>คนขับประจำรถ</th> */}
              <th style={{ padding: '12px 8px' }}>เส้นทางล่าสุด</th>
              <th style={{ padding: '12px 8px' }}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {vans.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  ไม่มีข้อมูลรถตู้ในระบบ
                </td>
              </tr>
            ) : (
              vans.map((v) => {
                // const driver = drivers.find(d => d.id === v.driverId);
                return (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{v.plateNo}</td>
                    <td style={{ padding: '12px 8px' }}>{v.vanType}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>{v.capacity} ที่นั่ง</td>
                    {/* <td style={{ padding: '12px 8px' }}>
                      {driver ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img 
                            src={driver.avatar} 
                            alt={driver.name} 
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
                          <span>{driver.name.split(' (')[0]}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--danger)' }}>ไม่ได้มอบหมาย</span>
                      )}
                    </td> */}
                    <td style={{ padding: '12px 8px' }}>{v.destination}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className={`badge ${v.status === 'Waiting' ? 'badge-warning' :
                        v.status === 'Travelling' ? 'badge-info' :
                          v.status === 'Departed' ? 'badge-success' : 'badge-danger'
                        }`}>
                        {v.status === 'Waiting' ? 'จอดรอคิว' :
                          v.status === 'Travelling' ? 'กำลังเดินทาง' :
                            v.status === 'Departed' ? 'ออกจากคิวแล้ว' : 'เกิดอุบัติเหตุ/ขัดข้อง'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
