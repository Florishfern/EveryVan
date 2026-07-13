import React, { useState } from 'react';
import { useVan } from '../context/VanContext';
import type { Transaction } from '../context/VanContext';
import { Clock, Download, FileText, CheckCircle, Eye } from 'lucide-react';

export const AccountantView: React.FC = () => {
  const { transactions, bookings, vans, fastForwardTime, confirmPayment } = useVan();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Success' | 'Pending' | 'Cancelled'>('All');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  // Filter transactions
  const filteredTxns = transactions.filter(t => {
    if (activeFilter === 'All') return true;
    return t.status === activeFilter;
  });

  // Calculate finance metrics
  const totalRevenue = transactions
    .filter(t => t.status === 'Success')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingRevenue = transactions
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const successCount = transactions.filter(t => t.status === 'Success').length;
  const pendingCount = transactions.filter(t => t.status === 'Pending').length;
  const cancelledCount = transactions.filter(t => t.status === 'Cancelled').length;

  const handleFastForward = () => {
    fastForwardTime(5);
  };

  const handleForcePay = (bookingId: string) => {
    confirmPayment(bookingId);
    if (selectedTxn && selectedTxn.bookingId === bookingId) {
      setSelectedTxn(prev => prev ? { ...prev, status: 'Success', receiptNo: 'REC-' + Math.random().toString(36).substr(2, 6).toUpperCase() } : null);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-slide-in">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="card" style={{ padding: '16px', background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)', color: 'white' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>ยอดชำระเงินสำเร็จ (Total Revenue)</span>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginTop: '6px' }}>฿{totalRevenue.toLocaleString()}</h2>
          <p style={{ fontSize: '11px', color: 'white', opacity: 0.8, marginTop: '4px' }}>ทำรายการสำเร็จ {successCount} รายการ</p>
        </div>

        {/* KPI 2 */}
        <div className="card" style={{ padding: '16px', background: 'var(--bg-card)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>ยอดเงินอยู่ระหว่างรอดำเนินการ</span>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px' }}>฿{pendingRevenue.toLocaleString()}</h2>
          <p style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 600, marginTop: '4px' }}>รอยืนยันสลิป {pendingCount} รายการ</p>
        </div>

        {/* KPI 3 */}
        <div className="card" style={{ padding: '16px', background: 'var(--bg-card)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>การยกเลิก/หมดอายุการจอง</span>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger)', marginTop: '6px' }}>{cancelledCount} รายการ</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>ยกเลิกอัตโนมัติภายใน 5 นาที</p>
        </div>

        {/* KPI 4: Unpaid Timeout Controller */}
        <div className="card" style={{ padding: '16px', border: '1px solid var(--warning)', background: 'rgba(245, 158, 11, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
            <Clock size={16} style={{ color: 'var(--warning)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700 }}>ล้างการจองตั๋วที่ค้างชำระ</span>
          </div>
          <button className="btn btn-secondary" style={{ padding: '8px', fontSize: '12px', width: '100%' }} onClick={handleFastForward}>
            ⏩ เร่งเวลา 5 นาที (Simulate Expire)
          </button>
        </div>

      </div>

      <div className="grid grid-cols-3 gap-4" style={{ alignItems: 'start' }}>
        
        {/* Ledgers and Filter */}
        <div className="card grid-cols-2" style={{ gridColumn: 'span 2' }}>
          
          <div className="flex justify-between items-center" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3>รายการธุรกรรมของระบบ (System Ledgers)</h3>
            
            {/* Filter buttons */}
            <div className="flex gap-2">
              {(['All', 'Success', 'Pending', 'Cancelled'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`btn`}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    borderRadius: '8px',
                    backgroundColor: activeFilter === filter ? 'var(--primary)' : 'transparent',
                    color: activeFilter === filter ? 'white' : 'var(--text-main)',
                    border: `1px solid ${activeFilter === filter ? 'var(--primary)' : 'var(--border-color)'}`
                  }}
                >
                  {filter === 'All' ? 'ทั้งหมด' : 
                   filter === 'Success' ? 'สำเร็จ' : 
                   filter === 'Pending' ? 'ค้างชำrate' : 'ยกเลิก'}
                </button>
              ))}
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 4px' }}>รหัสการจอง</th>
                <th style={{ padding: '10px 4px' }}>ผู้โดยสาร</th>
                <th style={{ padding: '10px 4px' }}>วัน-เวลา</th>
                <th style={{ padding: '10px 4px' }}>ยอดชำระ</th>
                <th style={{ padding: '10px 4px' }}>สถานะ</th>
                <th style={{ padding: '10px 4px', textAlign: 'right' }}>เอกสาร</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>ไม่มีข้อมูลรายการธุรกรรม</td>
                </tr>
              ) : (
                filteredTxns.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>{t.bookingId}</td>
                    <td style={{ padding: '10px 4px' }}>{t.passengerName}</td>
                    <td style={{ padding: '10px 4px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{t.date}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.time}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 4px', fontWeight: 700 }}>฿{t.amount}</td>
                    <td style={{ padding: '10px 4px' }}>
                      <span className={`badge ${
                        t.status === 'Success' ? 'badge-success' : 
                        t.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                      }`} style={{ fontSize: '11px' }}>
                        {t.status === 'Success' ? 'สำเร็จ' : t.status === 'Pending' ? 'ค้างจ่าย' : 'ยกเลิกแล้ว'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '4px 8px', fontSize: '11.5px', borderRadius: '6px' }}
                        onClick={() => setSelectedTxn(t)}
                      >
                        <Eye size={12} /> เรียกดู
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        </div>

        {/* Column 2: Slip Viewer & Detailed Receipt Generator */}
        <div className="card">
          {selectedTxn ? (
            <div className="flex flex-col gap-4 animate-slide-in">
              <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} /> ใบเสร็จรับเงินอิเล็กทรอนิกส์ (Receipt Summary)
              </h3>

              {/* Receipt Visual Sheet */}
              <div className="card" style={{ 
                background: 'white', 
                color: '#1e293b', 
                fontFamily: 'monospace', 
                fontSize: '12px',
                lineHeight: '1.6',
                border: '1px solid #cbd5e1',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #94a3b8', paddingBottom: '12px', marginBottom: '12px' }}>
                  <h4 style={{ color: 'var(--primary)', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>EVERYVAN (CO., LTD)</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '10px' }}>สถานีขนส่งผู้โดยสารกรุงเทพฯ (หมอชิต 2)</p>
                  <p style={{ margin: 0, fontSize: '10px' }}>TAX ID: 0105569998877</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', borderBottom: '1px dashed #94a3b8', paddingBottom: '12px' }}>
                  <span><strong>RECEIPT NO:</strong> {selectedTxn.receiptNo || 'N/A (รอชำระ)'}</span>
                  <span><strong>DATE/TIME:</strong> {selectedTxn.date} {selectedTxn.time}</span>
                  <span><strong>BOOKING REF:</strong> {selectedTxn.bookingId}</span>
                  <span><strong>PASSENGER:</strong> {selectedTxn.passengerName}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>รายการเดินทาง</span>
                    <span>จำนวนเงิน</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>ตั๋วโดยสารรถตู้ VIP 1 ที่นั่ง</span>
                    <span>฿{selectedTxn.amount}.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                    <span>- ปลายทาง: {vans.find(v => v.id === bookings.find(b => b.id === selectedTxn.bookingId)?.vanId)?.destination}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                    <span>- ที่นั่ง: Seat {bookings.find(b => b.id === selectedTxn.bookingId)?.seatNo}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                  <span>ราคาก่อนภาษีมูลค่าเพิ่ม: ฿{(selectedTxn.amount * 0.93).toFixed(2)}</span>
                  <span>ภาษีมูลค่าเพิ่ม (7%): ฿{(selectedTxn.amount * 0.07).toFixed(2)}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', borderTop: '2px double #cbd5e1', width: '100%', textAlign: 'right', paddingTop: '4px', marginTop: '4px' }}>
                    ยอดรวมสุทธิ: ฿{selectedTxn.amount}.00
                  </span>
                </div>

                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '10px', color: '#64748b', borderTop: '1px dashed #94a3b8', paddingTop: '10px' }}>
                  <p>ขอบคุณที่ใช้บริการ EveryVan 🚐</p>
                  <p>เดินทางปลอดภัยในทุกเส้นทาง</p>
                </div>
              </div>

              {selectedTxn.status === 'Pending' && (
                <button 
                  className="btn btn-success" 
                  style={{ width: '100%' }}
                  onClick={() => handleForcePay(selectedTxn.bookingId)}
                >
                  <CheckCircle size={16} /> บันทึกและสแกนยืนยันการรับเงิน
                </button>
              )}
              
              <button 
                className="btn btn-outline" 
                style={{ width: '100%' }}
                onClick={() => alert('ดาวน์โหลดใบเสร็จรับเงินสำเร็จ (PDF Mockup)')}
              >
                <Download size={16} /> ดาวน์โหลดใบเสร็จรับเงิน (PDF)
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <FileText size={40} style={{ color: 'var(--border-color)', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px' }}>เลือกรายการธุรกรรมจากตารางด้านซ้ายเพื่อเรียกดูใบเสร็จรับเงินอัตโนมัติ</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
