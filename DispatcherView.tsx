import React, { useState } from 'react';
import { useVan } from '../context/VanContext';
import { Edit, Save, Plus } from 'lucide-react';

export const DispatcherView: React.FC = () => {
  const {
    vans, updateDepartureTime, updateVanStatus, drivers, createVanSchedule
  } = useVan();

  const [editingVanId, setEditingVanId] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');

  // Modal & Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [destination, setDestination] = useState('พัทยา (Pattaya)');
  const [customDestination, setCustomDestination] = useState('');
  const [selectedVanPlate, setSelectedVanPlate] = useState('10-2345 กรุงเทพฯ');
  const [customVanPlate, setCustomVanPlate] = useState('');
  const [vanType, setVanType] = useState('Toyota Commuter (Standard)');
  const [capacity] = useState(13);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [price, setPrice] = useState(150);

  // Filter States
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterTime, setFilterTime] = useState<string>('');
  const [filterDestination, setFilterDestination] = useState<string>('');

  const uniqueDates = Array.from(new Set(vans.map(v => v.date || new Date().toISOString().split('T')[0]))).sort();
  const uniqueTimes = Array.from(new Set(vans.map(v => v.departureTime))).sort();
  const uniqueDestinations = Array.from(new Set(vans.map(v => v.destination))).sort();

  const filteredVans = vans.filter(v => {
    const vanDate = v.date || new Date().toISOString().split('T')[0];
    const matchDate = !filterDate || vanDate === filterDate;
    const matchTime = !filterTime || v.departureTime === filterTime;
    const matchDest = !filterDestination || v.destination === filterDestination;
    return matchDate && matchTime && matchDest;
  });

  React.useEffect(() => {
    if (drivers.length > 0 && !selectedDriverId) {
      setSelectedDriverId(drivers[0].id);
    }
  }, [drivers, selectedDriverId]);

  const handleEditTime = (vanId: string, currentTime: string) => {
    setEditingVanId(vanId);
    setNewTime(currentTime);
  };

  const handleSaveTime = (vanId: string) => {
    if (!newTime) return;
    updateDepartureTime(vanId, newTime);
    setEditingVanId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDestination = destination === 'custom' ? customDestination : destination;
    const finalPlateNo = selectedVanPlate === 'custom' ? customVanPlate : selectedVanPlate;
    const finalCapacity = selectedVanPlate === 'custom' ? capacity : 13;

    if (!finalDestination || !finalPlateNo || !selectedDriverId) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      await createVanSchedule({
        plateNo: finalPlateNo,
        vanType: vanType,
        capacity: finalCapacity,
        destination: finalDestination,
        departureTime: time,
        price: price,
        driverId: selectedDriverId,
        date: date
      });
      setShowAddModal(false);
      setCustomDestination('');
      setCustomVanPlate('');
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกตารางเดินรถ');
    }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>📋 รายการรถตู้และตารางการเดินรถประจำสถานี</h3>
          <button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            <span>เพิ่มตารางเดินรถ</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '20px',
          padding: '12px',
          background: 'var(--bg-color, #f9fafb)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div>
            <label className="label" style={{ fontSize: '12px', marginBottom: '4px', display: 'block', fontWeight: 600 }}>📅 วันเดินทาง</label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '13px', width: '100%', borderRadius: '6px' }}
            >
              <option value="">ทั้งหมด</option>
              {uniqueDates.map(d => (
                <option key={d} value={d}>
                  {new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" style={{ fontSize: '12px', marginBottom: '4px', display: 'block', fontWeight: 600 }}>🕒 เวลาออกเดินทาง</label>
            <select
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '13px', width: '100%', borderRadius: '6px' }}
            >
              <option value="">ทั้งหมด</option>
              {uniqueTimes.map(t => (
                <option key={t} value={t}>{t} น.</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" style={{ fontSize: '12px', marginBottom: '4px', display: 'block', fontWeight: 600 }}>📍 จุดหมายปลายทาง</label>
            <select
              value={filterDestination}
              onChange={(e) => setFilterDestination(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '13px', width: '100%', borderRadius: '6px' }}
            >
              <option value="">ทั้งหมด</option>
              {uniqueDestinations.map(dest => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-outline"
              style={{ width: '100%', padding: '8px', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', height: '36px' }}
              onClick={() => {
                setFilterDate('');
                setFilterTime('');
                setFilterDestination('');
              }}
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
              <th style={{ padding: '12px 8px' }}>ทะเบียนรถ</th>
              <th style={{ padding: '12px 8px' }}>ลักษณะรถ / ความจุ</th>
              <th style={{ padding: '12px 8px' }}>จุดหมายปลายทาง</th>
              <th style={{ padding: '12px 8px' }}>วันเดินทาง</th>
              <th style={{ padding: '12px 8px' }}>เวลาออกเดินทาง</th>
              <th style={{ padding: '12px 8px' }}>ที่นั่งว่าง</th>
              <th style={{ padding: '12px 8px' }}>สถานะรถตู้</th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>การจัดการการเดินรถ</th>
            </tr>
          </thead>
          <tbody>
            {filteredVans.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  🚫 ไม่พบตารางการเดินรถตามตัวกรองที่เลือก
                </td>
              </tr>
            ) : (
              filteredVans.map((v) => {
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
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                      {v.date ? new Date(v.date).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
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
                      <span className={`badge ${v.status === 'Waiting' ? 'badge-warning' :
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
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {showAddModal && (
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
          zIndex: 1000,
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
              <h3 style={{ margin: 0, color: 'var(--text-color)' }}>➕ เพิ่มตารางเดินรถตู้</h3>
              <button
                className="btn btn-outline"
                style={{ padding: '4px 8px', minWidth: 'auto', borderRadius: '50%' }}
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3">

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">วันที่เดินทาง</label>
                    <input
                      type="date"
                      className="input"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">เวลาออกเดินทาง</label>
                    <input
                      type="time"
                      className="input"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <label className="label">จุดหมายปลายทาง</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    style={{ marginBottom: destination === 'custom' ? '8px' : '0' }}
                  >
                    <option value="พัทยา (Pattaya)">พัทยา (Pattaya)</option>
                    <option value="หัวหิน (Hua Hin)">หัวหิน (Hua Hin)</option>
                    <option value="ระยอง (Rayong)">ระยอง (Rayong)</option>
                    <option value="จันทบุรี (Chanthaburi)">จันทบุรี (Chanthaburi)</option>
                    <option value="ชลบุรี (Chonburi)">ชลบุรี (Chonburi)</option>
                    <option value="custom">กำหนดเอง...</option>
                  </select>
                  {destination === 'custom' && (
                    <input
                      type="text"
                      className="input"
                      placeholder="ระบุจุดหมายปลายทางใหม่..."
                      value={customDestination}
                      onChange={(e) => setCustomDestination(e.target.value)}
                      required
                    />
                  )}
                </div>

                {/* Van Selection */}
                <div>
                  <label className="label">เลือกรถตู้</label>
                  <select
                    value={selectedVanPlate}
                    onChange={(e) => {
                      setSelectedVanPlate(e.target.value);
                      if (e.target.value === '10-5678 ชลบุรี') {
                        setVanType('Toyota Commuter Premium (VIP)');
                      } else if (e.target.value !== 'custom') {
                        setVanType('Toyota Commuter (Standard)');
                      }
                    }}
                    style={{ marginBottom: selectedVanPlate === 'custom' ? '8px' : '0' }}
                  >
                    <option value="10-2345 กรุงเทพฯ">10-2345 กรุงเทพฯ (Standard)</option>
                    <option value="10-5678 ชลบุรี">10-5678 ชลบุรี (Premium VIP)</option>
                    <option value="10-9999 นนทบุรี">10-9999 นนทบุรี (Standard)</option>
                    <option value="10-1111 สมุทรปราการ">10-1111 สมุทรปราการ (Standard)</option>
                    <option value="custom">เพิ่มรถตู้คันใหม่...</option>
                  </select>

                  {selectedVanPlate === 'custom' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <input
                          type="text"
                          className="input"
                          placeholder="ทะเบียนรถ (เช่น 10-1234 กรุงเทพฯ)"
                          value={customVanPlate}
                          onChange={(e) => setCustomVanPlate(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <select value={vanType} onChange={(e) => setVanType(e.target.value)}>
                          <option value="Toyota Commuter (Standard)">Standard</option>
                          <option value="Toyota Commuter Premium (VIP)">Premium VIP</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Driver and Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">พนักงานขับรถ</label>
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      required
                    >
                      <option value="">-- เลือกคนขับ --</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name.split(' (')[0]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">ราคาตั๋วโดยสาร (บาท)</label>
                    <input
                      type="number"
                      className="input"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      min={0}
                      required
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    บันทึกตารางเดินรถ
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
