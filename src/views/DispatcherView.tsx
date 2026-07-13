import React, { useState } from 'react';
import { useVan } from '../context/VanContext';
import { Edit, Save } from 'lucide-react';

export const DispatcherView: React.FC = () => {
  const { 
    vans, updateDepartureTime, updateVanStatus, drivers 
  } = useVan();

  const [editingVanId, setEditingVanId] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');

  const handleEditTime = (vanId: string, currentTime: string) => {
    setEditingVanId(vanId);
    setNewTime(currentTime);
  };

  const handleSaveTime = (vanId: string) => {
    if (!newTime) return;
    updateDepartureTime(vanId, newTime);
    setEditingVanId('');
  };

  return (
    <div className="flex flex-col gap-4 animate-slide-in">
      
      {/* Upper Widgets */}
      <div className="grid grid-cols-3 gap-4">
        
        {/* Widget 1: Fleet summary */}
        <div className="card" style={{ padding: '16px', background: 'var(--primary-light)' }}>
          <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>🚐 ข้อมูลสรุปคิวรถตู้</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <div>
              <span style={{ fontSize: '24px', fontWeight: 700 }}>{vans.length} คัน</span>
              <p style={{ fontSize: '12px' }}>จำนวนรถในระบบ</p>
            </div>
            <div>
              <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>
                {vans.filter(v => v.status === 'Travelling').length} คัน
              </span>
              <p style={{ fontSize: '12px' }}>กำลังเดินทาง</p>
            </div>
            <div>
              <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning)' }}>
                {vans.filter(v => v.status === 'Waiting').length} คัน
              </span>
              <p style={{ fontSize: '12px' }}>จอดรอคิวในสถานี</p>
            </div>
          </div>
        </div>

        {/* Widget 3: Live updates */}
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4>🕒 แจ้งเตือนสัญญานสด</h4>
          <p style={{ fontSize: '12px' }}>มีสถานะการเลื่อนเวลาและแจ้งข้อติดขัดแบบเรียลไทม์</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span className="live-indicator"></span>
            <span style={{ fontWeight: 600 }}>เชื่อมต่อระบบ EveryVan Live แล้ว</span>
          </div>
        </div>

      </div>

      {/* Fleet & Schedule Management */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>📋 รายการรถตู้และตารางการเดินรถประจำสถานี</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
              <th style={{ padding: '12px 8px' }}>ทะเบียนรถ</th>
              <th style={{ padding: '12px 8px' }}>ลักษณะรถ / ความจุ</th>
              <th style={{ padding: '12px 8px' }}>จุดหมายปลายทาง</th>
              <th style={{ padding: '12px 8px' }}>เวลาออกเดินทาง</th>
              <th style={{ padding: '12px 8px' }}>ที่นั่งว่าง</th>
              <th style={{ padding: '12px 8px' }}>สถานะรถตู้</th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>การจัดการการเดินรถ</th>
            </tr>
          </thead>
          <tbody>
            {vans.map((v) => {
              const totalSeats = v.capacity;
              const bookedSeatsCount = v.occupiedSeats.length;
              const freeSeatsCount = totalSeats - bookedSeatsCount;
              const driver = drivers.find(d => d.id === v.driverId);
              
              return (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{v.plateNo}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{v.vanType}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>คนขับ: {driver?.name.split(' ')[0]}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px' }}>{v.destination}</td>
                  <td style={{ padding: '12px 8px' }}>
                    {editingVanId === v.id ? (
                      <div className="flex gap-2 items-center">
                        <input 
                          type="time" 
                          className="input" 
                          style={{ padding: '4px 8px', width: '90px' }} 
                          value={newTime} 
                          onChange={(e) => setNewTime(e.target.value)} 
                        />
                        <button className="btn btn-primary" style={{ padding: '4px 8px' }} onClick={() => handleSaveTime(v.id)}>
                          <Save size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <span>{v.departureTime} น.</span>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '3px 6px', borderRadius: '4px' }} 
                          onClick={() => handleEditTime(v.id, v.departureTime)}
                          title="ปรับเปลี่ยนเวลาออกรถ"
                        >
                          <Edit size={12} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: 700, color: freeSeatsCount > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {freeSeatsCount} ที่นั่งว่าง
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className={`badge ${
                      v.status === 'Waiting' ? 'badge-warning' : 
                      v.status === 'Travelling' ? 'badge-info' : 
                      v.status === 'Departed' ? 'badge-success' : 'badge-danger'
                    }`}>
                      {v.status === 'Waiting' ? 'กำลังรอคิว' : 
                       v.status === 'Travelling' ? 'กำลังเดินทาง' : 
                       v.status === 'Departed' ? 'ออกจากสถานีแล้ว' : 'ขัดข้อง/อุบัติเหตุ'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <select 
                        value={v.status} 
                        onChange={(e) => updateVanStatus(v.id, e.target.value as any)}
                        style={{ padding: '6px 10px', fontSize: '12.5px', width: 'auto', display: 'inline-block' }}
                      >
                        <option value="Waiting">คิวปกติ</option>
                        <option value="Travelling">เดินทาง</option>
                        <option value="Departed">ออกรถ</option>
                        <option value="Accident">ขัดข้อง</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
