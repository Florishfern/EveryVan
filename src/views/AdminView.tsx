import React from 'react';
import { DispatcherView } from './DispatcherView';
import { AccountantView } from './AccountantView';

interface AdminViewProps { activeNav: string; }

export const AdminView: React.FC<AdminViewProps> = ({ activeNav }) => {
  const adminTab = activeNav === 'accountant' ? 'accountant' : 'dispatcher';

  return (
    <div className="animate-slide-in">
      <div>
        {adminTab === 'dispatcher' ? <DispatcherView /> : <AccountantView />}
      </div>
    </div>
  );
};
