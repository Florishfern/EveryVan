import React, { useState } from 'react';
import { useVan } from '../context/VanContext';
import type { Booking } from '../context/VanContext';
import { Users, AlertTriangle, Scan } from 'lucide-react';

interface DriverViewProps { activeNav: string; }

export const DriverView: React.FC<DriverViewProps> = ({ activeNav: _activeNav }) => {
  const { currentUser, vans, bookings, boardPassenger, completeTrip, updateVanStatus, drivers, confirmPayment } = useVan();

  const currentDriver = drivers.find(d => d.name === currentUser?.profile.name) || drivers[0];
  const driverId = currentDriver?.id || 'drv-01';

  const myVans = vans.filter(v => v.driverId === driverId);

  // Active Van selection
  const [selectedVanId, setSelectedVanId] = useState<string>('');

  // Sync selected van
  React.useEffect(() => {
    if (myVans.length > 0 && !selectedVanId) {
      setSelectedVanId(myVans[0].id);
    }
  }, [myVans, selectedVanId]);

  const activeVan = vans.find(v => v.id === selectedVanId);

  // Boarding scanner simulation
  const [boardingScannerOpen, setBoardingScannerOpen] = useState(false);
  const [selectedBoardingBookingId, setSelectedBoardingBookingId] = useState('');
  const [boardingStatusMessage, setBoardingStatusMessage] = useState({ text: '', type: '' });

  // Ticket verification + QR scan simulation
  const [showScanner, setShowScanner] = useState(false);
  const [selectedScanBookingId, setSelectedScanBookingId] = useState('');
  const [scanResult, setScanResult] = useState<Booking | null>(null);
  const [scanMessage, setScanMessage] = useState({ text: '', type: '' });

  // Accident reporting
  const [accidentText, setAccidentText] = useState('');
  const [showAccidentForm, setShowAccidentForm] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Filter bookings for this van
  const vanBookings = bookings.filter(b => b.vanId === selectedVanId && (b.status === 'Paid' || b.status === 'Boarded' || b.status === 'Completed'));
  const totalBooked = vanBookings.length;
  const totalBoarded = vanBookings.filter(b => b.status === 'Boarded').length;

  const handleSimulateBoarding = async () => {
    if (!selectedBoardingBookingId) return;
    const success = await boardPassenger(selectedBoardingBookingId);
    if (success) {
      setBoardingStatusMessage({ text: '✓ เช็คอินขึ้นรถสำเร็จ! ยินดีต้อนรับผู้โดยสาร', type: 'success' });
      setSelectedBoardingBookingId('');
    } else {
      const b = bookings.find(item => item.id === selectedBoardingBookingId);
      if (b && b.status === 'Pending Payment') {
        setBoardingStatusMessage({ text: '❌ ขึ้นรถไม่สำเร็จ: ผู้โดยสารยังไม่ชำระเงิน กรุณาตรวจสอบกับคนจัดคิว', type: 'danger' });
      } else {
        setBoardingStatusMessage({ text: 'ไม่สามารถเช็คอินผู้โดยสารรายนี้ได้', type: 'danger' });
      }
    }
  };

  const handleSimulateScan = () => {
    if (!selectedScanBookingId) return;
    const booking = bookings.find(b => b.id === selectedScanBookingId);
    if (booking) {
      setScanResult(booking);
      if (booking.status === 'Paid') {
        setScanMessage({ text: '✓ สแกนสำเร็จ: ชำระเงินเรียบร้อยแล้ว และได้รับอนุญาตให้ขึ้นรถ', type: 'success' });
      } else if (booking.status === 'Pending Payment') {
        setScanMessage({ text: '⚠️ สแกนสำเร็จ: ผู้โดยสารยังไม่ได้ชำระเงิน กรุณาตรวจสอบก่อนขึ้นรถ', type: 'warning' });
      } else if (booking.status === 'Boarded') {
        setScanMessage({ text: 'ℹ️ สแกนสำเร็จ: ผู้โดยสารรายนี้เช็คอินขึ้นรถเรียบร้อยแล้ว', type: 'info' });
      } else if (booking.status === 'Cancelled') {
        setScanMessage({ text: '❌ สแกนสำเร็จ: ตั๋วถูกยกเลิกหรือหมดอายุการจองแล้ว', type: 'danger' });
      } else if (booking.status === 'Completed') {
        setScanMessage({ text: '✓ สแกนสำเร็จ: การเดินทางเสร็จสิ้นแล้ว', type: 'success' });
      }
    } else {
      setScanResult(null);
      setScanMessage({ text: 'ไม่พบตั๋วจากการสแกน QR', type: 'danger' });
    }
  };

  const handleConfirmScannerPayment = (bookingId: string) => {
    confirmPayment(bookingId);
    const updated = bookings.find(b => b.id === bookingId);
    if (updated) {
      setScanResult({ ...updated, status: 'Paid' });
      setScanMessage({ text: '✓ ยืนยันชำระเงินสำเร็จแล้ว', type: 'success' });
    }
  };

  const handleSendAccidentReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accidentText || !activeVan) return;
    await updateVanStatus(activeVan.id, 'Accident', accidentText);
    setAccidentText('');
    setShowAccidentForm(false);
    setReportSuccess(true);
    setTimeout(() => setReportSuccess(false), 4000);
  };

  return (
    <div className="grid grid-cols-3 gap-4 animate-slide-in">
      
      {/* Column 1: Driver Info & Trip Schedule */}
      <div className="flex flex-col gap-4">
        
        {/* Driver Profile */}
        <div className="card flex items-center gap-4">
          {currentDriver && (
            <>
              <img 
                src={currentDriver.avatar} 
                alt={currentDriver.name} 
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--warning)' }} 
              />
              <div>
                <h3 style={{ fontSize: '16px' }}>{currentDriver.name}</h3>
                <p style={{ fontSize: '12px' }}>ใบขับขี่: {currentDriver.licenseNo}</p>
                <span className="badge badge-warning" style={{ fontSize: '11px', marginTop: '4px' }}>⭐ คะแนนรีวิว {currentDriver.rating}</span>
              </div>
            </>
          )}
        </div>

        {/* Running schedule */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>🕒 ตารางเดินรถของฉันประจำวันนี้</h3>
          <div className="flex flex-col gap-2">
            {myVans.map(v => (
              <button 
                key={v.id}
                onClick={() => { setSelectedVanId(v.id); setBoardingScannerOpen(false); setBoardingStatusMessage({ text: '', type: '' }); }}
                className={`card ${selectedVanId === v.id ? 'primary-border' : ''}`}
                style={{ 
                  padding: '12px', 
                  cursor: 'pointer', 
                  textAlign: 'left',
                  border: selectedVanId === v.id ? '2px solid var(--warning)' : '1px solid var(--border-color)',
                  background: selectedVanId === v.id ? 'var(--primary-light)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>สาย {v.destination}</span>
                  <span className="badge badge-info" style={{ fontSize: '10px' }}>{v.departureTime} น.</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  ทะเบียน: {v.plateNo} | ที่นั่งจองแล้ว: {v.occupiedSeats.length} ที่นั่ง
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Columns 2-3: Active Van Management Console */}
      <div className="card grid-cols-2" style={{ gridColumn: 'span 2' }}>
        {activeVan ? (
          <div className="flex flex-col gap-4">
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h2>ระบบควบคุมประจำรถทะเบียน {activeVan.plateNo}</h2>
                <p style={{ fontSize: '13px' }}>เส้นทาง: {activeVan.destination} | รอบเวลาออกเดินทาง: {activeVan.departureTime} น.</p>
              </div>
              <span className={`badge ${
                activeVan.status === 'Waiting' ? 'badge-warning' : 
                activeVan.status === 'Travelling' ? 'badge-info' : 
                activeVan.status === 'Departed' ? 'badge-success' : 'badge-danger'
              }`} style={{ padding: '8px 16px', fontSize: '13px' }}>
                {activeVan.status === 'Waiting' ? 'กำลังรอคิว' : 
                 activeVan.status === 'Travelling' ? 'กำลังเดินทาง' : 
                 activeVan.status === 'Departed' ? 'ออกจากคิวแล้ว' : 'เกิดอุบัติเหตุ/ขัดข้อง'}
              </span>
            </div>

            {/* Emergency Alerts if Reported */}
            {activeVan.status === 'Accident' && (
              <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '12px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <AlertTriangle size={18} />
                  <span>รายงานข้อผิดพลาด: {activeVan.accidentReport || 'ไม่ได้ระบุสาเหตุ'}</span>
                </p>
              </div>
            )}

            {reportSuccess && (
              <div className="card" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px 16px', textAlign: 'center' }}>
                แจ้งสถานะการขัดข้องไปยังศูนย์จัดการคิว EveryVan เรียบร้อยแล้ว!
              </div>
            )}

            {/* Counts & Statistics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="card" style={{ padding: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 700 }}>{totalBooked} คน</span>
                <p style={{ fontSize: '11px' }}>จำนวนผู้โดยสารทั้งหมด</p>
              </div>
              <div className="card" style={{ padding: '12px', textAlign: 'center', borderLeft: '2px solid var(--success)' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>{totalBoarded} คน</span>
                <p style={{ fontSize: '11px' }}>ขึ้นรถแล้ว (Boarded)</p>
              </div>
              <div className="card" style={{ padding: '12px', textAlign: 'center', borderLeft: '2px solid var(--warning)' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--warning)' }}>
                  {totalBooked - totalBoarded} คน
                </span>
                <p style={{ fontSize: '11px' }}>ยังไม่ขึ้นรถ (Paid)</p>
              </div>
            </div>

            {/* Ticket verification + QR scan panel */}
            <div className="card" style={{ border: '1px solid var(--primary)', padding: '16px', background: 'rgba(79, 70, 229, 0.04)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}><Scan size={16} /> ตรวจสอบตั๋วและสแกน QR Code</h3>
                <button
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => { setShowScanner(!showScanner); setScanResult(null); setScanMessage({ text: '', type: '' }); setSelectedScanBookingId(''); }}
                >
                  {showScanner ? 'ปิดสแกนเนอร์' : 'เปิดเครื่องสแกน QR'}
                </button>
              </div>

              {showScanner && (
                <div className="card" style={{ background: 'var(--bg-app)', marginBottom: '16px', padding: '12px' }}>
                  <label className="label" style={{ fontSize: '12px' }}>เลือกตั๋วเพื่อจำลองการสแกน QR Code ของผู้โดยสารก่อนขึ้นรถ:</label>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    <select
                      value={selectedScanBookingId}
                      onChange={(e) => setSelectedScanBookingId(e.target.value)}
                      style={{ padding: '8px', fontSize: '13px', flex: 1, minWidth: '220px' }}
                    >
                      <option value="">-- เลือกตั๋วโดยสาร --</option>
                      {vanBookings.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.id} | {b.passengerName} (ที่นั่ง {b.seatNo}) | สถานะ: {b.status}
                        </option>
                      ))}
                    </select>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={handleSimulateScan}>
                      สแกน QR Code
                    </button>
                  </div>
                  {scanMessage.text && (
                    <div className={`badge ${scanMessage.type === 'success' ? 'badge-success' : scanMessage.type === 'warning' ? 'badge-warning' : scanMessage.type === 'info' ? 'badge-info' : 'badge-danger'}`} style={{ marginTop: '8px', fontSize: '12px' }}>
                      {scanMessage.text}
                    </div>
                  )}
                </div>
              )}

              {scanResult ? (
                <div className="card" style={{ background: 'var(--bg-app)', padding: '12px' }}>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <strong>เลขตั๋ว:</strong> {scanResult.id} <br />
                    <strong>ชื่อผู้โดยสาร:</strong> {scanResult.passengerName} <br />
                    <strong>เบอร์โทรศัพท์:</strong> {scanResult.passengerPhone} <br />
                    <strong>เลขที่นั่ง:</strong> Seat {scanResult.seatNo} <br />
                    <strong>เส้นทาง/เวลา:</strong> {vans.find(v => v.id === scanResult.vanId)?.destination} ({scanResult.timeSlot} น.)
                  </div>
                  {scanResult.status === 'Pending Payment' && (
                    <button className="btn btn-success" style={{ marginTop: '10px', padding: '8px 14px', fontSize: '13px' }} onClick={() => handleConfirmScannerPayment(scanResult.id)}>
                      ✓ ยืนยันชำระเงินและอนุญาตขึ้นรถ
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ padding: '8px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  รอการสแกน QR Code เพื่อเช็คสถานะตั๋วและอนุญาตให้ขึ้นรถ
                </div>
              )}
            </div>

            {/* Boarding Simulator Panel */}
            <div className="card" style={{ border: '1px dashed var(--border-color)', padding: '16px' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} /> รายชื่อผู้โดยสารตรวจตั๋ว</h3>
                <button 
                  className="btn btn-outline" 
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => { setBoardingScannerOpen(!boardingScannerOpen); setBoardingStatusMessage({ text: '', type: '' }); setSelectedBoardingBookingId(''); }}
                >
                  <Scan size={14} /> {boardingScannerOpen ? 'ปิดสแกนเนอร์' : 'จำลองสแกนบอร์ดดิ้งการ์ด'}
                </button>
              </div>

              {boardingScannerOpen && (
                <div className="card" style={{ background: 'var(--bg-app)', marginBottom: '16px', padding: '12px' }}>
                  <label className="label" style={{ fontSize: '12px' }}>จำลองการสแกนบอร์ดดิ้งตั๋วผู้โดยสารก่อนขึ้นรถ:</label>
                  <div className="flex gap-2">
                    <select 
                      value={selectedBoardingBookingId} 
                      onChange={(e) => setSelectedBoardingBookingId(e.target.value)}
                      style={{ padding: '8px', fontSize: '13px' }}
                    >
                      <option value="">-- เลือกบัตรขึ้นรถ --</option>
                      {vanBookings.filter(b => b.status === 'Paid').map(b => (
                        <option key={b.id} value={b.id}>
                          {b.id} | {b.passengerName} (ที่นั่ง {b.seatNo})
                        </option>
                      ))}
                    </select>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={handleSimulateBoarding}>
                      ยืนยันบอร์ดดิ้งตั๋ว
                    </button>
                  </div>
                  {boardingStatusMessage.text && (
                    <div className={`badge ${boardingStatusMessage.type === 'success' ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: '8px', fontSize: '12px' }}>
                      {boardingStatusMessage.text}
                    </div>
                  )}
                </div>
              )}

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 4px' }}>เลขที่นั่ง</th>
                    <th style={{ padding: '8px 4px' }}>ตั๋วโดยสาร</th>
                    <th style={{ padding: '8px 4px' }}>ชื่อผู้โดยสาร</th>
                    <th style={{ padding: '8px 4px' }}>เบอร์โทรศัพท์</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>สถานะขึ้นรถ</th>
                  </tr>
                </thead>
                <tbody>
                  {vanBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)' }}>ยังไม่มีข้อมูลผู้โดยสารจองคิวรถรอบนี้</td>
                    </tr>
                  ) : (
                    vanBookings.map((b) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 4px', fontWeight: 700 }}>Seat {b.seatNo}</td>
                        <td style={{ padding: '8px 4px', fontFamily: 'monospace' }}>{b.id}</td>
                        <td style={{ padding: '8px 4px' }}>{b.passengerName}</td>
                        <td style={{ padding: '8px 4px' }}>{b.passengerPhone}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                          <span className={`badge ${
                            b.status === 'Boarded' ? 'badge-success' : 
                            b.status === 'Completed' ? 'badge-info' : 'badge-warning'
                          }`} style={{ fontSize: '11px' }}>
                            {b.status === 'Paid' ? 'รอขึ้นรถ' : b.status === 'Boarded' ? 'ขึ้นรถแล้ว' : 'สำเร็จ'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                disabled={activeVan.status === 'Travelling'}
                onClick={() => updateVanStatus(activeVan.id, 'Travelling')}
              >
                🚀 เริ่มออกเดินทาง (Depart Station)
              </button>
              
              <button 
                className="btn btn-success" 
                style={{ flex: 1 }}
                disabled={activeVan.status === 'Waiting'}
                onClick={() => completeTrip(activeVan.id)}
              >
                🏁 ส่งผู้โดยสารเสร็จสิ้น (Finish Trip)
              </button>

              <button 
                className="btn btn-danger" 
                style={{ flex: 1 }}
                onClick={() => setShowAccidentForm(!showAccidentForm)}
              >
                ⚠️ แจ้งเหตุฉุกเฉิน / อุบัติเหตุ
              </button>
            </div>

            {/* Accident input popup form */}
            {showAccidentForm && (
              <form onSubmit={handleSendAccidentReport} className="card flex flex-col gap-2" style={{ border: '2px solid var(--danger)', marginTop: '12px' }}>
                <h4>รายงานอุบัติเหตุหรือเหตุขัดข้อง</h4>
                <textarea 
                  className="input" 
                  rows={3} 
                  placeholder="กรุณากรอกรายละเอียดของอุบัติเหตุ สถานที่ หรือปัญหาทางเทคนิคของรถ..."
                  value={accidentText}
                  onChange={(e) => setAccidentText(e.target.value)}
                  required
                />
                <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => setShowAccidentForm(false)}>ยกเลิก</button>
                  <button type="submit" className="btn btn-danger" style={{ padding: '6px 12px' }}>ส่งรายงานด่วน</button>
                </div>
              </form>
            )}

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>คุณไม่มีรถตู้ประจำการในวันนี้</p>
          </div>
        )}
      </div>

    </div>
  );
};
