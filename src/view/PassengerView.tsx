import React, { useState, useEffect } from 'react';
import { useVan } from '../context/VanContext';
import type { Booking } from '../context/VanContext';
import { SeatMap } from '../components/SeatMap';
import { CreditCard, Ticket, AlertCircle, Edit, Save, ArrowRight, CheckCircle, Star } from 'lucide-react';

interface PassengerViewProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

export const PassengerView: React.FC<PassengerViewProps> = ({ activeNav, onNavChange }) => {
  const { 
    currentUser, updateUserProfile, vans, bookings, bookTicket, confirmPayment, cancelBooking, drivers, addReview, boardingPoints 
  } = useVan();

  const activeTab = activeNav as 'book' | 'tickets' | 'profile';
  const setActiveTab = onNavChange;

  // Active profile details
  const profile = currentUser?.profile || {
    name: '',
    dob: '',
    phone: '',
    email: '',
    thaiId: ''
  };

  // Booking Form State
  const [selectedVanId, setSelectedVanId] = useState<string>('');
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [checkoutBooking, setCheckoutBooking] = useState<Booking | null>(null);

  // Profile Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(profile);
  const [profileError, setProfileError] = useState('');

  // Review State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewTargetDriverId, setReviewTargetDriverId] = useState<string>('');
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  // Sync profileForm when currentUser details change or editing is triggered
  useEffect(() => {
    if (currentUser) {
      setProfileForm(currentUser.profile);
    }
  }, [currentUser, isEditingProfile]);

  // Set default boarding point
  useEffect(() => {
    if (boardingPoints.length > 0 && !selectedBoardingPoint) {
      setSelectedBoardingPoint(boardingPoints[0]);
    }
  }, [boardingPoints]);

  // Get active van details
  const selectedVan = vans.find(v => v.id === selectedVanId);

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.phone || !profileForm.email || !profileForm.dob || !profileForm.thaiId) {
      setProfileError('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
      return;
    }
    // Thai ID validation (13 digits)
    const idRegex = /^\d{13}$/;
    if (!idRegex.test(profileForm.thaiId.replace(/\s/g, ''))) {
      setProfileError('รหัสบัตรประชาชนไม่ถูกต้อง (ต้องเป็นตัวเลข 13 หลัก)');
      return;
    }
    try {
      setProfileError('');
      await updateUserProfile({
        ...profileForm,
        thaiId: profileForm.thaiId.replace(/\s/g, '')
      });
      setIsEditingProfile(false);
    } catch (err: any) {
      setProfileError(err.message || 'บันทึกข้อมูลส่วนตัวไม่สำเร็จ');
    }
  };

  // Start booking steps
  const handleStartBooking = () => {
    if (!selectedVanId || !selectedBoardingPoint) return;
    setBookingStep(2); // Go to seat selection
  };

  const handleConfirmSeatSelection = () => {
    if (selectedSeat === null) return;
    setBookingStep(3); // Go to checkout/profile review
  };

  const handleFinalBooking = async () => {
    try {
      const newBooking = await bookTicket(selectedVanId, selectedSeat!, selectedBoardingPoint, bookingDate);
      setCheckoutBooking(newBooking);
      setBookingStep(4); // Go to payment page
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการจอง');
    }
  };

  const handlePaymentCompleted = async (bookingId: string) => {
    try {
      await confirmPayment(bookingId);
      setBookingStep(5); // Payment Success Confirmation screen
    } catch (err: any) {
      alert(err.message || 'การชำระเงินขัดข้อง');
    }
  };

  const resetBookingFlow = () => {
    setSelectedVanId('');
    setSelectedSeat(null);
    setBookingStep(1);
    setCheckoutBooking(null);
  };

  const handleReviewSubmit = async (e: React.FormEvent, driverId: string) => {
    e.preventDefault();
    if (!reviewComment) return;
    try {
      await addReview(driverId, reviewRating, reviewComment);
      setReviewComment('');
      setReviewRating(5);
      setReviewTargetDriverId('');
      setShowReviewSuccess(true);
      setTimeout(() => setShowReviewSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'ส่งรีวิวไม่สำเร็จ');
    }
  };

  const myBookings = bookings.filter(b => b.passengerPhone === profile.phone);

  return (
    <div className="animate-slide-in">
      <div className="card" style={{ minHeight: '550px' }}>
        
        {/* BOOK TICKET TAB */}
        {activeTab === 'book' && (
          <div>
            <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚐 จองตั๋วรถตู้ EveryVan</span>
              <span className="live-indicator"></span>
            </h2>

            {/* STEP 1: Select Route, Boarding Point and Van */}
            {bookingStep === 1 && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">จุดหมายปลายทางที่ต้องการเดินทาง</label>
                    <select 
                      value={selectedVanId} 
                      onChange={(e) => setSelectedVanId(e.target.value)}
                    >
                      <option value="">-- กรุณาเลือกจุดหมาย --</option>
                      {vans.filter(v => v.status === 'Waiting').map(v => (
                        <option key={v.id} value={v.id}>
                          {v.destination} | รอบ {v.departureTime} น. ({v.plateNo})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">จุดขึ้นรถตู้โดยสาร (Boarding Point)</label>
                    <select 
                      value={selectedBoardingPoint} 
                      onChange={(e) => setSelectedBoardingPoint(e.target.value)}
                    >
                      <option value="">-- เลือกจุดขึ้นรถ --</option>
                      {boardingPoints.map(point => (
                        <option key={point} value={point}>{point}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">วันที่เดินทาง</label>
                    <input 
                      type="date" 
                      className="input"
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingDate(e.target.value)}
                    />
                  </div>
                </div>

                {selectedVan && (
                  <div className="card" style={{ background: 'var(--primary-light)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>รายละเอียดรถตู้</span>
                      <span className="badge badge-info">{selectedVan.vanType}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-main)' }}>
                      <strong>ทะเบียน:</strong> {selectedVan.plateNo} <br />
                      <strong>พนักงานขับรถ:</strong> {drivers.find(d => d.id === selectedVan.driverId)?.name} <br />
                      <strong>เวลาเดินทาง:</strong> {selectedVan.departureTime} น. <br />
                      <strong>จุดขึ้นรถที่เลือก:</strong> <span style={{ textDecoration: 'underline', fontWeight: 600 }}>{selectedBoardingPoint}</span> <br />
                      <strong>ราคาค่าโดยสาร:</strong> <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{selectedVan.price} THB</span>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <AlertCircle size={16} />
                      <span>กรุณาเดินทางถึงจุดขึ้นรถ 15 นาทีก่อนเวลาเดินทางจริง</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button 
                    className="btn btn-primary" 
                    disabled={!selectedVanId || !selectedBoardingPoint} 
                    onClick={handleStartBooking}
                  >
                    เลือกที่นั่งว่าง <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Choose Seat */}
            {bookingStep === 2 && selectedVan && (
              <div className="flex flex-col gap-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>เลือกตำแหน่งที่นั่งของคุณ (สาย {selectedVan.destination})</h3>
                  <span className="badge badge-info">ที่นั่งว่าง: {selectedVan.capacity - selectedVan.occupiedSeats.length} / {selectedVan.capacity}</span>
                </div>

                <div style={{ margin: '20px 0' }}>
                  <SeatMap 
                    occupiedSeats={selectedVan.occupiedSeats} 
                    selectedSeat={selectedSeat} 
                    onSelectSeat={(seatNo) => setSelectedSeat(seatNo)} 
                  />
                </div>

                <div className="flex justify-between" style={{ marginTop: '16px' }}>
                  <button className="btn btn-outline" onClick={() => setBookingStep(1)}>ย้อนกลับ</button>
                  <button className="btn btn-primary" disabled={selectedSeat === null} onClick={handleConfirmSeatSelection}>
                    ยืนยันที่นั่งและหน้าชำระเงิน <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Confirm Profile Details & Confirm Reservation */}
            {bookingStep === 3 && selectedVan && selectedSeat && (
              <div className="flex flex-col gap-4">
                <h3>ตรวจสอบข้อมูลผู้โดยสารและการจอง</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="card" style={{ padding: '16px' }}>
                    <h4 style={{ marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      📋 ข้อมูลผู้ติดต่อ (ข้อมูลคุณ)
                    </h4>
                    <p style={{ fontSize: '14px', lineHeight: '1.8' }}>
                      <strong>ชื่อ-นามสกุล:</strong> {profile.name} <br />
                      <strong>วัน/เดือน/ปีเกิด:</strong> {profile.dob ? new Date(profile.dob).toLocaleDateString('th-TH') : ''} <br />
                      <strong>เบอร์โทรศัพท์:</strong> {profile.phone} <br />
                      <strong>อีเมล:</strong> {profile.email} <br />
                      <strong>บัตรประชาชน (Thai ID):</strong> {profile.thaiId}
                    </p>
                    <div style={{ marginTop: '12px' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '6px 12px', fontSize: '12.5px' }}
                        onClick={() => { setActiveTab('profile'); setIsEditingProfile(true); }}
                      >
                        <Edit size={14} /> แก้ไขข้อมูลโปรไฟล์ก่อนจอง
                      </button>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '16px' }}>
                    <h4 style={{ marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      🎫 รายละเอียดการเดินทาง
                    </h4>
                    <p style={{ fontSize: '14px', lineHeight: '1.8' }}>
                      <strong>จุดหมายปลายทาง:</strong> {selectedVan.destination} <br />
                      <strong>จุดขึ้นรถตู้โดยสาร:</strong> {selectedBoardingPoint} <br />
                      <strong>วันที่เดินทาง:</strong> {bookingDate} <br />
                      <strong>รอบรถตู้:</strong> {selectedVan.departureTime} น. <br />
                      <strong>ตำแหน่งที่นั่ง:</strong> Seat {selectedSeat} <br />
                      <strong>ยอดรวมการชำระเงิน:</strong> <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>{selectedVan.price} บาท</span>
                    </p>
                  </div>
                </div>

                <div className="card" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', padding: '12px 16px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} style={{ color: 'var(--warning)' }} />
                    <span><strong>คำเตือน:</strong> หลังจากยืนยันการจองตั๋ว ท่านจะต้องชำระเงินภายใน <strong>5 นาที</strong> มิฉะนั้นระบบจะยกเลิกการจองโดยอัตโนมัติ</span>
                  </p>
                </div>

                <div className="flex justify-between" style={{ marginTop: '16px' }}>
                  <button className="btn btn-outline" onClick={() => setBookingStep(2)}>ย้อนกลับ</button>
                  <button className="btn btn-success" onClick={handleFinalBooking}>
                    <CheckCircle size={18} /> ยืนยันการจองตั๋ว (Confirm Booking)
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Payment Simulation Screen */}
            {bookingStep === 4 && checkoutBooking && (
              <div className="flex flex-col items-center gap-4" style={{ textAlign: 'center' }}>
                <div className="badge badge-warning" style={{ fontSize: '14px', padding: '8px 16px' }}>
                  🕒 รอการชำระเงิน (Pending Payment)
                </div>

                <h3>ชำระเงินค่าโดยสาร EveryVan</h3>
                <p style={{ fontSize: '14px', maxWidth: '500px' }}>
                  กรุณาสแกน QR Code ด้านล่างเพื่อชำระเงินค่าตั๋วโดยสาร จำนวน <strong>{selectedVan?.price} บาท</strong> 
                  (การจองจะหมดอายุในเวลา {new Date(checkoutBooking.unpaidExpiresAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
                </p>

                {/* QR Code Container with scan lines */}
                <div style={{ margin: '16px' }}>
                  <div className="qr-container">
                    <div className="qr-scanner-line"></div>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=EVERYVAN-PAYMENT-${checkoutBooking.id}-AMT-${selectedVan?.price}`} 
                      alt="Payment QR Code" 
                      style={{ width: '180px', height: '180px', display: 'block' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn btn-danger" 
                    onClick={async () => { await cancelBooking(checkoutBooking.id); resetBookingFlow(); }}
                  >
                    ยกเลิกการจองตั๋ว
                  </button>
                  <button 
                    className="btn btn-success" 
                    onClick={() => handlePaymentCompleted(checkoutBooking.id)}
                  >
                    <CreditCard size={18} /> จำลองการชำระเงินสำเร็จ (จ่ายเงิน)
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Payment Success / Confirmed Ticket */}
            {bookingStep === 5 && checkoutBooking && (
              <div className="flex flex-col items-center gap-4" style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
                  marginBottom: '12px'
                }}>
                  <CheckCircle size={36} />
                </div>

                <h3>ชำระเงินสำเร็จเรียบร้อย!</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  ระบบได้บันทึกการจองและชำระเงินของท่านแล้ว ตั๋วอิเล็กทรอนิกส์ (E-Ticket) ถูกออกเรียบร้อยแล้ว
                </p>

                <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '16px', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>TICKET ID: {checkoutBooking.id}</span>
                    <span className="badge badge-success">ชำระเงินแล้ว</span>
                  </div>
                  <div style={{ textAlign: 'left', marginTop: '12px', fontSize: '14px', lineHeight: '1.8' }}>
                    <strong>ชื่อผู้โดยสาร:</strong> {checkoutBooking.passengerName} <br />
                    <strong>ตำแหน่งที่นั่ง:</strong> Seat {checkoutBooking.seatNo} <br />
                    <strong>จุดขึ้นรถตู้:</strong> {selectedBoardingPoint} <br />
                    <strong>สายการเดินทาง:</strong> {selectedVan?.destination} <br />
                    <strong>รอบรถ/เวลาออก:</strong> {selectedVan?.departureTime} น. <br />
                    <strong>ทะเบียนรถตู้:</strong> {selectedVan?.plateNo}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button className="btn btn-outline" onClick={resetBookingFlow}>กลับหน้าจองตั๋ว</button>
                  <button className="btn btn-primary" onClick={() => { setActiveTab('tickets'); resetBookingFlow(); }}>
                    <Ticket size={18} /> ดูตั๋วอิเล็กทรอนิกส์ทั้งหมด
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MY TICKETS TAB */}
        {activeTab === 'tickets' && (
          <div>
            <h2 style={{ marginBottom: '20px' }}>🎫 ตั๋วอิเล็กทรอนิกส์ของฉัน (My E-Tickets)</h2>

            {myBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Ticket size={48} style={{ color: 'var(--border-color)', marginBottom: '12px' }} />
                <p>คุณยังไม่มีประวัติการจองตั๋วรถตู้ในระบบ</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => setActiveTab('book')}>
                  เริ่มจองตั๋วตู้ใบแรก
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {myBookings.map((b) => {
                  const van = vans.find(v => v.id === b.vanId);
                  const driver = van ? drivers.find(d => d.id === van.driverId) : null;
                  
                  return (
                    <div key={b.id} className="card" style={{ 
                      padding: '0', 
                      overflow: 'hidden', 
                      borderRadius: '16px', 
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-md)'
                    }}>
                      
                      {/* Ticket Header */}
                      <div style={{ 
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                        color: 'white',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase' }}>
                            EveryVan E-Ticket
                          </span>
                          <h4 style={{ color: 'white', margin: '2px 0 0 0', fontSize: '16px' }}>
                            {van?.destination || 'ปลายทาง'}
                          </h4>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className={`badge ${
                            b.status === 'Paid' ? 'badge-success' : 
                            b.status === 'Boarded' ? 'badge-info' : 
                            b.status === 'Completed' ? 'badge-success' : 'badge-danger'
                          }`} style={{ border: '1px solid white' }}>
                            {b.status === 'Pending Payment' ? 'รอชำระเงิน' : 
                             b.status === 'Paid' ? 'ชำระเงินแล้ว' : 
                             b.status === 'Boarded' ? 'ขึ้นรถแล้ว' : 
                             b.status === 'Completed' ? 'เสร็จสิ้นการเดินทาง' : 'ยกเลิก'}
                          </span>
                        </div>
                      </div>

                      {/* Ticket Body Layout */}
                      <div className="grid grid-cols-3 gap-4" style={{ padding: '20px' }}>
                        
                        {/* Column 1: Trip & Passenger Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ผู้โดยสาร</span>
                            <p style={{ fontSize: '14px', fontWeight: 600 }}>{b.passengerName}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>วันที่ & รอบเดินทาง</span>
                            <p style={{ fontSize: '14px', fontWeight: 600 }}>{b.date} | {b.timeSlot}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>รถและเลขทะเบียน</span>
                            <p style={{ fontSize: '13px', fontWeight: 500 }}>{van?.vanType} ({van?.plateNo})</p>
                          </div>
                        </div>

                        {/* Column 2: Driver Details */}
                        <div style={{ borderLeft: '1px dashed var(--border-color)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>พนักงานขับรถ</span>
                          {driver ? (
                            <div className="flex items-center gap-2" style={{ marginTop: '4px' }}>
                              <img 
                                src={driver.avatar} 
                                alt={driver.name} 
                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }} 
                              />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>{driver.name.split(' ')[0]}</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ใบอนุญาต: {driver.licenseNo}</span>
                                <span style={{ fontSize: '12px', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                                  ⭐ {driver.rating}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px' }}>ไม่มีข้อมูล</span>
                          )}
                        </div>

                        {/* Column 3: Seat, QR verification & review */}
                        <div style={{ borderLeft: '1px dashed var(--border-color)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>เลขที่นั่ง</span>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>{b.seatNo.toString().padStart(2, '0')}</div>
                          </div>
                          
                          {/* QR ticket boarding scanner */}
                          {b.status === 'Paid' && (
                            <div style={{ textAlign: 'center' }}>
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=TICKET-BOARDING-${b.id}`} 
                                alt="Boarding QR" 
                                style={{ width: '70px', height: '70px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                              />
                              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>สแกนเพื่อขึ้นรถ</div>
                            </div>
                          )}

                          {b.status === 'Pending Payment' && (
                            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => { setSelectedVanId(b.vanId); setSelectedSeat(b.seatNo); setCheckoutBooking(b); setBookingStep(4); setActiveTab('book'); }}>
                              ชำระเงินเลย
                            </button>
                          )}
                        </div>

                      </div>

                      {/* Ticket Footer / Driver Review Section (If trip completed) */}
                      {b.status === 'Completed' && driver && (
                        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '12px 20px', borderTop: '1px solid var(--border-color)' }}>
                          {reviewTargetDriverId === driver.id ? (
                            <form onSubmit={(e) => handleReviewSubmit(e, driver.id)} className="flex flex-col gap-2">
                              <span style={{ fontSize: '13px', fontWeight: 600 }}>ให้คะแนนรีวิวคุณ {driver.name.split(' ')[0]}</span>
                              <div className="flex gap-4 items-center">
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      size={18} 
                                      style={{ cursor: 'pointer', fill: star <= reviewRating ? 'var(--warning)' : 'none', stroke: 'var(--warning)' }}
                                      onClick={() => setReviewRating(star)}
                                    />
                                  ))}
                                </div>
                                <input 
                                  type="text" 
                                  className="input" 
                                  style={{ padding: '6px 12px' }} 
                                  placeholder="เขียนแสดงความเห็นการขับขี่รถ..." 
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  required
                                />
                                <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>ส่งรีวิว</button>
                                <button type="button" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => setReviewTargetDriverId('')}>ยกเลิก</button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex justify-between items-center">
                              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>การเดินทางสำเร็จเรียบร้อยแล้ว</span>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                onClick={() => { setReviewTargetDriverId(driver.id); setReviewRating(5); }}
                              >
                                ⭐ รีวิวคนขับรถ (Review Driver)
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}

                {showReviewSuccess && (
                  <div className="card" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px 16px', textAlign: 'center' }}>
                    บันทึกการส่งคะแนนและรีวิวเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div>
            <h2 style={{ marginBottom: '20px' }}>👤 ข้อมูลสมาชิก & การยืนยันตนด้วยบัตรประชาชน (Thai ID)</h2>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">ชื่อ-นามสกุล (Name)</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">วัน/เดือน/ปีเกิด (Date of Birth)</label>
                    <input 
                      type="date" 
                      className="input" 
                      value={profileForm.dob}
                      onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">เบอร์โทรศัพท์มือถือ (Phone)</label>
                    <input 
                      type="tel" 
                      className="input" 
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">อีเมลติดต่อ (Email)</label>
                    <input 
                      type="email" 
                      className="input" 
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="label">เลขประจำตัวประชาชน 13 หลัก (Thai ID Card Number)</label>
                    <input 
                      type="text" 
                      maxLength={13}
                      placeholder="เช่น 1234567890123"
                      className="input" 
                      value={profileForm.thaiId}
                      onChange={(e) => setProfileForm({ ...profileForm, thaiId: e.target.value })}
                    />
                  </div>
                </div>

                {profileError && (
                  <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px 16px' }}>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <AlertCircle size={16} />
                      <span>{profileError}</span>
                    </p>
                  </div>
                )}

                <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsEditingProfile(false)}>ยกเลิก</button>
                  <button type="submit" className="btn btn-success">
                    <Save size={16} /> บันทึกการเปลี่ยนแปลง (Save Profile)
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="card" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 700
                  }}>
                    {profile.name ? profile.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h3>{profile.name}</h3>
                    <p>{profile.email}</p>
                    <span className="badge badge-success" style={{ marginTop: '8px' }}>✓ ยืนยันตัวตนแล้วด้วย Thai ID</span>
                  </div>
                </div>

                <div className="card" style={{ padding: '16px' }}>
                  <h4 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    ข้อมูลโปรไฟล์
                  </h4>
                  <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--text-muted)', width: '200px' }}>วัน/เดือน/ปีเกิด</td>
                        <td style={{ padding: '10px 0', color: 'var(--text-main)' }}>{profile.dob ? new Date(profile.dob).toLocaleDateString('th-TH') : ''}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--text-muted)' }}>เบอร์โทรศัพท์</td>
                        <td style={{ padding: '10px 0', color: 'var(--text-main)' }}>{profile.phone}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--text-muted)' }}>อีเมล</td>
                        <td style={{ padding: '10px 0', color: 'var(--text-main)' }}>{profile.email}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--text-muted)' }}>เลขประจำตัวประชาชน (Thai ID)</td>
                        <td style={{ padding: '10px 0', color: 'var(--text-main)', letterSpacing: '1px' }}>
                          {profile.thaiId ? `${profile.thaiId.substring(0,1)}-${profile.thaiId.substring(1,5)}-${profile.thaiId.substring(5,10)}-${profile.thaiId.substring(10,12)}-${profile.thaiId.substring(12,13)}` : ''}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button className="btn btn-primary" onClick={() => { setProfileForm(profile); setIsEditingProfile(true); }}>
                    <Edit size={16} /> แก้ไขข้อมูลโปรไฟล์
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
