import React, { useState } from 'react';
import { VanProvider, useVan } from './context/VanContext';
import { Sidebar, Topbar } from './components/Layout';
import { AuthView } from './views/AuthView';
import { PassengerView } from './views/PassengerView';
import { DriverView } from './views/DriverView';
import { AdminView } from './views/AdminView';

const PAGE_TITLES: Record<string, Record<string, string>> = {
  passenger: { book: 'จองตั๋วรถตู้', tickets: 'ตั๋วของฉัน', profile: 'ข้อมูลสมาชิก' },
  driver:    { schedule: 'ตารางเดินรถ', boarding: 'ตรวจตั๋วผู้โดยสาร' },
  admin:     { dispatcher: 'จัดการคิวรถตู้', accountant: 'รายงานการเงิน' },
};

const MainAppContent: React.FC = () => {
  const { currentUser } = useVan();

  const role = currentUser?.role ?? 'passenger';

  const defaultNav: Record<string, string> = {
    passenger: 'book',
    driver: 'schedule',
    admin: 'dispatcher',
  };

  const [activeNav, setActiveNav] = useState(defaultNav[role] ?? 'book');

  if (!currentUser) return <AuthView />;

  const pageTitle = PAGE_TITLES[role]?.[activeNav] ?? 'EveryVan';

  return (
    <div className="app-shell">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <div className="main-area">
        <Topbar title={pageTitle} />

        <div className="page-content animate-slide-in">
          {role === 'passenger' && (
            <PassengerView activeNav={activeNav} onNavChange={setActiveNav} />
          )}
          {role === 'driver' && (
            <DriverView activeNav={activeNav} />
          )}
          {role === 'admin' && (
            <AdminView activeNav={activeNav} />
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <VanProvider>
      <MainAppContent />
    </VanProvider>
  );
}

export default App;
