// EveryVan Mock API Service Layer
// Easily swappable with a real HTTP client (fetch/axios) connecting to a backend REST API.

import type { UserProfile, Booking, Van, Driver, Transaction, DriverReview } from '../context/VanContext';

// Helper to simulate network latency
const delay = (ms: number = 400) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for local database keys
const KEYS = {
  USERS: 'everyvan_db_users',
  VANS: 'everyvan_db_vans',
  BOOKINGS: 'everyvan_db_bookings',
  TRANSACTIONS: 'everyvan_db_transactions',
  DRIVERS: 'everyvan_db_drivers',
  SESSION: 'everyvan_session_user'
};

// Initial database seeding if empty
const seedDatabase = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    // Seed standard accounts
    localStorage.setItem(KEYS.USERS, JSON.stringify([
      {
        username: 'pax',
        password: 'pax',
        role: 'passenger',
        profile: {
          name: 'รัชพล ทองอินทร์',
          dob: '1998-04-12',
          phone: '082-999-8877',
          email: 'ratchapol.pax@everyvan.com',
          thaiId: '1234567890123'
        }
      },
      {
        username: 'admin',
        password: 'admin',
        role: 'admin',
        profile: {
          name: 'ภูดาเนตร ศิลาอาจ',
          dob: '1992-10-15',
          phone: '085-111-2233',
          email: 'admin.phudanet@everyvan.com',
          thaiId: '3200100445588'
        }
      },
      {
        username: 'driver',
        password: 'driver',
        role: 'driver',
        profile: {
          name: 'Somchai Srichai (สมชาย ศรีชัย)',
          dob: '1982-08-20',
          phone: '081-234-5678',
          email: 'somchai.driver@everyvan.com',
          thaiId: '3100500112233'
        }
      }
    ]));
  }
};

seedDatabase();

// In-Memory fallback getters / setters that read/write to localStorage DB
const db = {
  getUsers: () => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  setUsers: (users: any) => localStorage.setItem(KEYS.USERS, JSON.stringify(users)),
  getVans: () => JSON.parse(localStorage.getItem('everyvan_vans') || '[]'),
  setVans: (vans: Van[]) => localStorage.setItem('everyvan_vans', JSON.stringify(vans)),
  getBookings: () => JSON.parse(localStorage.getItem('everyvan_bookings') || '[]'),
  setBookings: (bookings: Booking[]) => localStorage.setItem('everyvan_bookings', JSON.stringify(bookings)),
  getTransactions: () => JSON.parse(localStorage.getItem('everyvan_transactions') || '[]'),
  setTransactions: (txns: Transaction[]) => localStorage.setItem('everyvan_transactions', JSON.stringify(txns)),
  getDrivers: () => JSON.parse(localStorage.getItem('everyvan_drivers') || '[]'),
  setDrivers: (drivers: Driver[]) => localStorage.setItem('everyvan_drivers', JSON.stringify(drivers))
};

export const api = {
  auth: {
    // POST /api/auth/login
    login: async (username: string, password: string): Promise<{ token: string; user: { username: string; role: 'passenger' | 'admin' | 'driver'; profile: UserProfile } }> => {
      await delay(500);
      const users = db.getUsers();
      const user = users.find((u: any) => u.username === username && u.password === password);
      
      if (!user) {
        throw new Error('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      }
      
      const session = {
        token: `mock-jwt-token-${Math.random().toString(36).substr(2)}`,
        user: {
          username: user.username,
          role: user.role,
          profile: user.profile
        }
      };
      
      localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
      return session;
    },

    // POST /api/auth/register
    register: async (userData: { username: string; password: string; role: 'passenger' | 'admin' | 'driver'; profile: UserProfile }): Promise<{ success: boolean }> => {
      await delay(600);
      const users = db.getUsers();
      
      if (users.some((u: any) => u.username === userData.username)) {
        throw new Error('ชื่อผู้ใช้นี้ถูกใช้งานไปแล้ว');
      }

      // Check Thai ID uniqueness/format
      if (!/^\d{13}$/.test(userData.profile.thaiId)) {
        throw new Error('รหัสบัตรประชาชนต้องเป็นตัวเลข 13 หลัก');
      }
      
      users.push(userData);
      db.setUsers(users);
      return { success: true };
    },

    // GET /api/auth/session
    getSession: async (): Promise<{ token: string; user: { username: string; role: 'passenger' | 'admin' | 'driver'; profile: UserProfile } } | null> => {
      const saved = localStorage.getItem(KEYS.SESSION);
      return saved ? JSON.parse(saved) : null;
    },

    // POST /api/auth/logout
    logout: async (): Promise<void> => {
      await delay(200);
      localStorage.removeItem(KEYS.SESSION);
    },

    // PUT /api/auth/profile
    updateProfile: async (username: string, updatedProfile: UserProfile): Promise<UserProfile> => {
      await delay(400);
      const users = db.getUsers();
      const idx = users.findIndex((u: any) => u.username === username);
      if (idx === -1) throw new Error('ไม่พบข้อมูลผู้ใช้ในระบบ');
      
      users[idx].profile = updatedProfile;
      db.setUsers(users);

      // Update active session too if matching
      const currentSession = localStorage.getItem(KEYS.SESSION);
      if (currentSession) {
        const session = JSON.parse(currentSession);
        if (session.user.username === username) {
          session.user.profile = updatedProfile;
          localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
        }
      }
      return updatedProfile;
    }
  },

  bookings: {
    // GET /api/bookings
    list: async (): Promise<Booking[]> => {
      await delay(300);
      return db.getBookings();
    },

    // POST /api/bookings
    create: async (vanId: string, seatNo: number, boardingPoint: string, date: string, profile: UserProfile): Promise<Booking> => {
      await delay(600);
      const vans = db.getVans();
      const targetVan = vans.find((v: Van) => v.id === vanId);
      
      if (!targetVan) throw new Error('ไม่พบข้อมูลรถตู้ในระบบ');
      if (targetVan.occupiedSeats.includes(seatNo)) throw new Error('ที่นั่งนี้ถูกจองไปแล้ว');

      // Update van seats in db
      targetVan.occupiedSeats.push(seatNo);
      db.setVans(vans);

      const bookings = db.getBookings();
      const bookingId = 'EV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const now = Date.now();
      const expiry = now + 5 * 60 * 1000; // 5 minutes

      const newBooking: Booking = {
        id: bookingId,
        vanId,
        passengerName: profile.name,
        passengerPhone: profile.phone,
        seatNo,
        date,
        timeSlot: `${targetVan.departureTime} (จุดขึ้นรถ: ${boardingPoint})`,
        status: 'Pending Payment',
        createdAt: now,
        unpaidExpiresAt: expiry
      };

      bookings.unshift(newBooking);
      db.setBookings(bookings);

      // Add corresponding pending transaction
      const txns = db.getTransactions();
      const tid = 'txn-' + Math.random().toString(36).substr(2, 9);
      const newTxn: Transaction = {
        id: tid,
        bookingId,
        passengerName: profile.name,
        amount: targetVan.price,
        status: 'Pending',
        date: new Date().toLocaleDateString('th-TH'),
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      };
      txns.unshift(newTxn);
      db.setTransactions(txns);

      return newBooking;
    },

    // POST /api/bookings/:id/pay
    pay: async (bookingId: string): Promise<Booking> => {
      await delay(400);
      const bookings = db.getBookings();
      const bookingIdx = bookings.findIndex((b: Booking) => b.id === bookingId);
      if (bookingIdx === -1) throw new Error('ไม่พบรหัสการจองตั๋ว');

      bookings[bookingIdx].status = 'Paid';
      bookings[bookingIdx].paymentSlipUrl = `/slips/${bookingId}.png`;
      db.setBookings(bookings);

      // Update transactions
      const txns = db.getTransactions();
      const txnIdx = txns.findIndex((t: Transaction) => t.bookingId === bookingId);
      const receiptNo = 'REC-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      if (txnIdx !== -1) {
        txns[txnIdx].status = 'Success';
        txns[txnIdx].receiptNo = receiptNo;
        db.setTransactions(txns);
      }

      return bookings[bookingIdx];
    },

    // POST /api/bookings/:id/cancel
    cancel: async (bookingId: string): Promise<Booking> => {
      await delay(400);
      const bookings = db.getBookings();
      const bIdx = bookings.findIndex((b: Booking) => b.id === bookingId);
      if (bIdx === -1) throw new Error('ไม่พบข้อมูลการจอง');

      const booking = bookings[bIdx];
      booking.status = 'Cancelled';
      db.setBookings(bookings);

      // Release seat on van
      const vans = db.getVans();
      const vanIdx = vans.findIndex((v: Van) => v.id === booking.vanId);
      if (vanIdx !== -1) {
        vans[vanIdx].occupiedSeats = vans[vanIdx].occupiedSeats.filter((s: number) => s !== booking.seatNo);
        db.setVans(vans);
      }

      // Update transaction status
      const txns = db.getTransactions();
      const tIdx = txns.findIndex((t: Transaction) => t.bookingId === bookingId);
      if (tIdx !== -1) {
        txns[tIdx].status = 'Cancelled';
        db.setTransactions(txns);
      }

      return booking;
    },

    // POST /api/bookings/:id/board
    board: async (bookingId: string): Promise<Booking> => {
      await delay(300);
      const bookings = db.getBookings();
      const idx = bookings.findIndex((b: Booking) => b.id === bookingId);
      if (idx === -1) throw new Error('ไม่พบรหัสการจองตั๋ว');
      if (bookings[idx].status !== 'Paid') throw new Error('ตั๋วนี้ยังไม่ชำระเงินหรือถูกยกเลิกแล้ว');

      bookings[idx].status = 'Boarded';
      bookings[idx].checkedInAt = Date.now();
      db.setBookings(bookings);
      return bookings[idx];
    }
  },

  vans: {
    // GET /api/vans
    list: async (): Promise<Van[]> => {
      await delay(300);
      return db.getVans();
    },

    // PUT /api/vans/:id/status
    updateStatus: async (vanId: string, status: Van['status'], report?: string): Promise<Van> => {
      await delay(400);
      const vans = db.getVans();
      const idx = vans.findIndex((v: Van) => v.id === vanId);
      if (idx === -1) throw new Error('ไม่พบข้อมูลรถตู้');

      vans[idx].status = status;
      if (report !== undefined) {
        vans[idx].accidentReport = report;
      }
      db.setVans(vans);
      return vans[idx];
    },

    // PUT /api/vans/:id/departure-time
    updateDepartureTime: async (vanId: string, newTime: string): Promise<Van> => {
      await delay(400);
      const vans = db.getVans();
      const idx = vans.findIndex((v: Van) => v.id === vanId);
      if (idx === -1) throw new Error('ไม่พบข้อมูลรถตู้');

      vans[idx].departureTime = newTime;
      db.setVans(vans);
      return vans[idx];
    },

    // POST /api/vans/:id/complete-trip
    completeTrip: async (vanId: string): Promise<Van> => {
      await delay(500);
      const vans = db.getVans();
      const idx = vans.findIndex((v: Van) => v.id === vanId);
      if (idx === -1) throw new Error('ไม่พบข้อมูลรถตู้');

      vans[idx].status = 'Waiting';
      vans[idx].occupiedSeats = [];
      db.setVans(vans);

      // Complete all boarded bookings
      const bookings = db.getBookings();
      const updatedBookings = bookings.map((b: Booking) => {
        if (b.vanId === vanId && (b.status === 'Boarded' || b.status === 'Paid')) {
          return { ...b, status: 'Completed' as const };
        }
        return b;
      });
      db.setBookings(updatedBookings);

      return vans[idx];
    }
  },

  drivers: {
    // GET /api/drivers
    list: async (): Promise<Driver[]> => {
      await delay(300);
      return db.getDrivers();
    },

    // POST /api/drivers/:id/reviews
    submitReview: async (driverId: string, rating: number, comment: string, passengerName: string): Promise<Driver> => {
      await delay(400);
      const drivers = db.getDrivers();
      const idx = drivers.findIndex((d: Driver) => d.id === driverId);
      if (idx === -1) throw new Error('ไม่พบพนักงานขับรถ');

      const review: DriverReview = {
        rating,
        comment,
        date: new Date().toISOString().split('T')[0],
        passengerName
      };

      drivers[idx].reviews.unshift(review);
      const reviews = drivers[idx].reviews;
      drivers[idx].rating = Number((reviews.reduce((sum: number, r: DriverReview) => sum + r.rating, 0) / reviews.length).toFixed(1));
      db.setDrivers(drivers);

      return drivers[idx];
    }
  },

  transactions: {
    // GET /api/transactions
    list: async (): Promise<Transaction[]> => {
      await delay(300);
      return db.getTransactions();
    }
  }
};
