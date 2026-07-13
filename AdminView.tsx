import React from 'react';
import { DispatcherView } from './DispatcherView';
import { AccountantView } from './AccountantView';
import { AdminVansView } from './AdminVansView';
import { AdminDriversView } from './AdminDriversView';

interface AdminViewProps { activeNav: string; }

export const AdminView: React.FC<AdminViewProps> = ({ activeNav }) => {
  return (
    <div className="animate-slide-in">
      <div>
        {activeNav === 'dispatcher' && <DispatcherView />}
        {activeNav === 'vans' && <AdminVansView />}
        {activeNav === 'drivers' && <AdminDriversView />}
        {activeNav === 'accountant' && <AccountantView />}
      </div>
    </div>
  );
};
