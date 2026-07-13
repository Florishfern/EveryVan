import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

// Interfaces
export interface DriverReview {
  rating: number;
  comment: string;
  date: string;
  passengerName: string;
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  licenseNo: string;
  phone: string;
  rating: number;
  reviews: DriverReview[];
}

export interface Van {
  id: string;
  plateNo: string;
  vanType: string;
  capacity: number;
  status: 'Waiting' | 'Travelling' | 'Departed' | 'Accident';
  destination: string;
  departureTime: string;
  price: number;
  driverId: string;
  occupiedSeats: number[];
  accidentReport?: string;
}

export interface Booking {
  id: string;
  vanId: string;
  passengerName: string;
  passengerPhone: string;
  seatNo: number;
  date: string;
  timeSlot: string;
  status: 'Pending Payment' | 'Paid' | 'Boarded' | 'Completed' | 'Cancelled';
  createdAt: number;
  unpaidExpiresAt: number;
  paymentSlipUrl?: string;
  checkedInAt?: number;
}

export interface Transaction {
  id: string;
  bookingId: string;
  passengerName: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Cancelled';
  date: string;
  time: string;
  receiptNo?: string;
}

export interface UserProfile {
  name: string;
  dob: string;
  phone: string;
  email: string;
  thaiId: string;
}

export interface SystemNotification {
  id: string;
  message: string;
  type: 'departure' | 'schedule_change' | 'accident' | 'payment_status';
  timestamp: string;
  isRead: boolean;
}

export const BOARDING_POINTS = [
  'สถานีขนส่งผู้โดยสารกรุงเทพฯ (หมอชิต 2)',
  'สถานีขนส่งเอกมัย (Ekkamai)',
  'สถานีขนส่งผู้โดยสารสายใต้ใหม่ (Southern Bus Terminal)',
  'จุดจอดรถตู้รังสิต (Rangsit)'
];

interface SessionUser {
  username: string;
  role: 'passenger' | 'admin' | 'driver';
  profile: UserProfile;
}

interface VanContextType {
  // Session Auth State
  currentUser: SessionUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerUser: (username: string, password: string, role: SessionUser['role'], profile: UserProfile) => Promise<void>;
  updateUserProfile: (updatedProfile: UserProfile) => Promise<void>;
  
  // Database States
  drivers: Driver[];
  vans: Van[];
  bookings: Booking[];
  transactions: Transaction[];
  notifications: SystemNotification[];
  boardingPoints: string[];
  
  // Utility Actions
  addNotification: (message: string, type: SystemNotification['type']) => void;
  markNotificationsAsRead: () => void;
  bookTicket: (vanId: string, seatNo: number, boardingPoint: string, date: string) => Promise<Booking>;
  confirmPayment: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  updateVanStatus: (vanId: string, status: Van['status'], report?: string) => Promise<void>;
  updateDepartureTime: (vanId: string, newTime: string) => Promise<void>;
  addReview: (driverId: string, rating: number, comment: string) => Promise<void>;
  boardPassenger: (bookingId: string) => Promise<boolean>;
  completeTrip: (vanId: string) => Promise<void>;
  fastForwardTime: (minutes: number) => void;
}

const VanContext = createContext<VanContextType | undefined>(undefined);

export const VanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // DB replication state
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vans, setVans] = useState<Van[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('everyvan_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif-0',
        message: 'ยินดีต้อนรับสู่ EveryVan แอพจองตั๋วรถตู้เดินทางยุคใหม่!',
        type: 'payment_status',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      }
    ];
  });

  // Sync Notifications
  useEffect(() => {
    localStorage.setItem('everyvan_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Load session & initial DB data
  const refreshDatabase = async () => {
    try {
      const v = await api.vans.list();
      const b = await api.bookings.list();
      const t = await api.transactions.list();
      const d = await api.drivers.list();
      
      setVans(v);
      setBookings(b);
      setTransactions(t);
      setDrivers(d);
    } catch (err) {
      console.error('Failed to sync API database states', err);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const session = await api.auth.getSession();
      if (session) {
        setToken(session.token);
        setCurrentUser(session.user);
      }
      await refreshDatabase();
    };
    checkSession();
  }, []);

  // Expiry checks: runs auto-cancel cleaner locally (synced via API wrapper calls)
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      let updated = false;

      const activeBookings = await api.bookings.list();
      for (const b of activeBookings) {
        if (b.status === 'Pending Payment' && now > b.unpaidExpiresAt) {
          try {
            await api.bookings.cancel(b.id);
            updated = true;
          } catch (err) {
            console.error('Failed to auto-cancel expired booking', b.id, err);
          }
        }
      }

      if (updated) {
        await refreshDatabase();
        addNotification('การจองตั๋วบางรายการถูกยกเลิกโดยอัตโนมัติเนื่องจากไม่ได้รับการชำระเงินภายใน 5 นาที', 'payment_status');
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const addNotification = (message: string, type: SystemNotification['type']) => {
    const newNotif: SystemNotification = {
      id: 'notif-' + Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Auth Operations
  const login = async (username: string, password: string) => {
    const res = await api.auth.login(username, password);
    setToken(res.token);
    setCurrentUser(res.user);
    await refreshDatabase();
    addNotification(`เข้าสู่ระบบในชื่อคุณ ${res.user.profile.name} สำเร็จ`, 'payment_status');
  };

  const logout = async () => {
    await api.auth.logout();
    setToken(null);
    setCurrentUser(null);
    addNotification('ออกจากระบบเรียบร้อยแล้ว', 'payment_status');
  };

  const registerUser = async (username: string, password: string, role: SessionUser['role'], profile: UserProfile) => {
    await api.auth.register({ username, password, role, profile });
    addNotification(`สมัครสมาชิกบัญชีผู้ใช้ใหม่สำเร็จ! กรุณาเข้าสู่ระบบ`, 'payment_status');
  };

  const updateUserProfile = async (updatedProfile: UserProfile) => {
    if (!currentUser) return;
    const res = await api.auth.updateProfile(currentUser.username, updatedProfile);
    setCurrentUser(prev => prev ? { ...prev, profile: res } : null);
    addNotification('ปรับปรุงข้อมูลส่วนตัวเรียบร้อยแล้ว', 'payment_status');
  };

  // Ticket Booking Operations
  const bookTicket = async (vanId: string, seatNo: number, boardingPoint: string, date: string) => {
    if (!currentUser) throw new Error('กรุณาเข้าสู่ระบบก่อนทำการจอง');
    const newBooking = await api.bookings.create(vanId, seatNo, boardingPoint, date, currentUser.profile);
    await refreshDatabase();

    const van = vans.find(v => v.id === vanId);
    setTimeout(() => {
      addNotification(`รถตู้สาย ${van?.destination} ใกล้ถึงเวลาออกเดินทางแล้ว! จุดขึ้นรถ: ${boardingPoint}`, 'departure');
    }, 15000);

    return newBooking;
  };

  const confirmPayment = async (bookingId: string) => {
    await api.bookings.pay(bookingId);
    await refreshDatabase();

    const b = bookings.find(item => item.id === bookingId);
    const van = vans.find(v => v.id === b?.vanId);
    addNotification(`ยืนยันการจ่ายเงินของตั๋ว ${bookingId} ปลายทาง ${van?.destination || ''} เรียบร้อย`, 'payment_status');
  };

  const cancelBooking = async (bookingId: string) => {
    await api.bookings.cancel(bookingId);
    await refreshDatabase();
    addNotification(`ยกเลิกการจองตั๋ว ${bookingId} สำเร็จ`, 'payment_status');
  };

  const updateVanStatus = async (vanId: string, status: Van['status'], report?: string) => {
    await api.vans.updateStatus(vanId, status, report);
    await refreshDatabase();

    const van = vans.find(v => v.id === vanId);
    if (!van) return;
    if (status === 'Accident') {
      addNotification(`[แจ้งด่วน] รถตู้ทะเบียน ${van.plateNo} เกิดเหตุขัดข้อง: ${report}`, 'accident');
    } else {
      addNotification(`รถตู้ทะเบียน ${van.plateNo} อัปเดตสถานะเป็น: ${status}`, 'schedule_change');
    }
  };

  const updateDepartureTime = async (vanId: string, newTime: string) => {
    await api.vans.updateDepartureTime(vanId, newTime);
    await refreshDatabase();

    const van = vans.find(v => v.id === vanId);
    if (van) {
      addNotification(`[ปรับเปลี่ยนตารางเวลา] รถตู้ทะเบียน ${van.plateNo} ปลายทาง ${van.destination} เลื่อนเวลาเดินทางเป็น ${newTime} น.`, 'schedule_change');
    }
  };

  const addReview = async (driverId: string, rating: number, comment: string) => {
    if (!currentUser) return;
    await api.drivers.submitReview(driverId, rating, comment, currentUser.profile.name);
    await refreshDatabase();
    addNotification('ส่งข้อมูลรีวิวและให้คะแนนเสร็จสิ้น', 'payment_status');
  };

  const boardPassenger = async (bookingId: string): Promise<boolean> => {
    try {
      await api.bookings.board(bookingId);
      await refreshDatabase();
      const b = bookings.find(item => item.id === bookingId);
      if (b) {
        addNotification(`ผู้โดยสาร ${b.passengerName} เช็คอินขึ้นรถเรียบร้อยแล้ว`, 'departure');
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const completeTrip = async (vanId: string) => {
    await api.vans.completeTrip(vanId);
    await refreshDatabase();
    const van = vans.find(v => v.id === vanId);
    if (van) {
      addNotification(`รถตู้ทะเบียน ${van.plateNo} เสร็จสิ้นเส้นทางเดินรถและส่งผู้โดยสารปลายทางแล้ว`, 'departure');
    }
  };

  const fastForwardTime = (minutes: number) => {
    // Fast forward LocalStorage timers for testing timeout
    const msToSubtract = minutes * 60 * 1000;
    const bList = JSON.parse(localStorage.getItem('everyvan_bookings') || '[]');
    const updated = bList.map((b: Booking) => {
      if (b.status === 'Pending Payment') {
        return {
          ...b,
          unpaidExpiresAt: b.unpaidExpiresAt - msToSubtract
        };
      }
      return b;
    });
    localStorage.setItem('everyvan_bookings', JSON.stringify(updated));
    refreshDatabase();
    addNotification(`เร่งเวลาจำลองไปข้างหน้า ${minutes} นาที`, 'payment_status');
  };

  return (
    <VanContext.Provider value={{
      currentUser, token, login, logout, registerUser, updateUserProfile,
      drivers, vans, bookings, transactions, notifications, boardingPoints: BOARDING_POINTS,
      addNotification, markNotificationsAsRead,
      bookTicket, confirmPayment, cancelBooking,
      updateVanStatus, updateDepartureTime,
      addReview, boardPassenger, completeTrip, fastForwardTime
    }}>
      {children}
    </VanContext.Provider>
  );
};

export const useVan = () => {
  const context = useContext(VanContext);
  if (context === undefined) {
    throw new Error('useVan must be used within a VanProvider');
  }
  return context;
};
